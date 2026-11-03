Enforced: true
Red: 11
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones" | red | failure: expected '# Example. Copy into the repo and own…' to contain 'name: bkit-cloud-context (${{ github.…' |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix" | red | failure: expected '[bkit-install] core: .bkit/authoring.…' to contain 'Trivy / trivy' |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one" | red | failure: expected '# Example. Copy into the repo and own…' to contain 'name: bkit-cloud-context (' |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > rewrites the old health stub in a custom bkit.testing.ciWorkflow file" | red | failure: expected 'name: CI\njobs:\n a:\n steps:\n …' to contain '.bkit/templates/.github/workflows/bki…' |
| 9 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second check-name migration writes nothing" | red | failure: expected '# Example Trivy scan. Copy it to `.gi…' to match /^name: bkit-trivy$/m |
| 9 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a dry-run check-name migration writes and moves nothing" | red | failure: expected '[bkit-upgrade] Running upgrade (dry-r…' to contain 'bkit-trivy.yml' |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House" | red | failure: expected true to be false // Object.is equality |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files" | red | failure: expected '# Example. Copy into the repo and own…' to contain 'Bkit.Filler = NO' |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House" | red | failure: ENOENT: no such file or directory, open '.vale/styles/Bkit/Filler.yml' |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini" | red | failure: expected true to be false // Object.is equality |
| 10 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second Vale migration and a dry run write nothing" | red | failure: expected false to be true // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/modules/core.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/modules/core.integration.test.ts

```

## Runner output — `.bkit/core/engine/install/modules/core.integration.test.ts`

````

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/modules/core.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > force-overwrites the package .bkit/*.md docs into the consumer's .bkit/, rendered
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > keeps install tokens literal in the docs, resolving only the managed marker
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > writes .bkit/LICENSE.md with the full MIT text and copyright notice
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > mirrors the docs into the repo's own .bkit/ in dogfood too
[test] [dry-run] core: .bkit/templates.md
[test] [dry-run] core: .bkit/workflows.md
[test] [dry-run] core: .bkit/README.md

stderr | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > mirrors the docs into the repo's own .bkit/ in dogfood too
[test] [dry-run] core: .husky/pre-push:363 still runs the old script name "graph"; rename it to "bkit:graph" by hand
[test] [dry-run] core: .github/workflows/bkit-ci.yml:527 still runs the old script name "graph"; rename it to "bkit:graph" by hand

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > is idempotent: a second core run writes none of the docs again
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > overwrites a consumer-tampered doc (bkit owns canonical content)
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > core package.json scripts — bkit:gate:* names, add-if-missing > an existing gate value is never touched; missing gate names are added
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:min, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > core package.json scripts — bkit:gate:* names, add-if-missing > a second install writes nothing once every gate name is present
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > core package.json scripts — bkit:gate:* names, add-if-missing > a missing gate name is a write in dry-run, so `bkit check` reports it
[bkit-install] [dry-run] Running core payload pass
[bkit-install] [dry-run] core: .agents/context.md
[bkit-install] [dry-run] core: .agents/docs.md
[bkit-install] [dry-run] core: .agents/rules.md
[bkit-install] [dry-run] core: .agents/skills.md
[bkit-install] [dry-run] core: AGENTS.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-install] [dry-run] core: docs/templates/bkit-plan.md
[bkit-install] [dry-run] core: .gitignore
[bkit-install] [dry-run] core: .gitattributes
[bkit-install] [dry-run] core: docs/architecture.md
[bkit-install] [dry-run] core: docs/data-schema.md
[bkit-install] [dry-run] core: docs/deployments.md
[bkit-install] [dry-run] core: docs/design.md
[bkit-install] [dry-run] core: docs/noise.md
[bkit-install] [dry-run] core: docs/observability.md
[bkit-install] [dry-run] core: docs/security.md
[bkit-install] [dry-run] core: docs/setup.md
[bkit-install] [dry-run] core: docs/technology.md
[bkit-install] [dry-run] core: docs/testing.md
[bkit-install] [dry-run] Running bkit docs pass
[bkit-install] [dry-run] core: .bkit/authoring.md
[bkit-install] [dry-run] core: .bkit/cloud.md
[bkit-install] [dry-run] core: .bkit/cli.md
[bkit-install] [dry-run] core: .bkit/comparison.md
[bkit-install] [dry-run] core: .bkit/install.md
[bkit-install] [dry-run] core: .bkit/jsonl.md
[bkit-install] [dry-run] core: .bkit/LICENSE.md
[bkit-install] [dry-run] core: .bkit/pipeline.md
[bkit-install] [dry-run] core: .bkit/providers.md
[bkit-install] [dry-run] core: .bkit/prompts.md
[bkit-install] [dry-run] core: .bkit/router.md
[bkit-install] [dry-run] core: .bkit/templates.md
[bkit-install] [dry-run] core: .bkit/trackers.md
[bkit-install] [dry-run] core: .bkit/workflows.md
[bkit-install] [dry-run] core: .bkit/README.md
[bkit-install] [dry-run] Running template copies pass
[bkit-install] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-install] [dry-run] template added: .bkit/templates/.envrc
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-install] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-install] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-install] [dry-run] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-install] [dry-run] template added: .bkit/templates/.prettierignore
[bkit-install] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-install] [dry-run] payload link: .bkit/core
[bkit-install] [dry-run] payload link: .bkit/shared
[bkit-install] [dry-run] core: .bkit/allowlist.json
[bkit-install] [dry-run] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] [dry-run] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedScriptNames (via seedCorePackageJsonScripts) > renames old bkit script keys and keeps custom values
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json script names branded [lint:prose, slop:delta, graph, graph:check, graph:rollup]
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedScriptNames (via seedCorePackageJsonScripts) > rewrites old script tokens in values and default gate chains
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json script names branded
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedScriptNames (via seedCorePackageJsonScripts) > leaves a foreign graph script under its own name
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json script names branded
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedScriptNames (via seedCorePackageJsonScripts) > warns on an old script name the rewrite cannot reach
[bkit-install] core: package.json script names branded [lint:prose]

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > detectGateAdvisories — gate advisories point at .bkit/templates.md > runs in check (dry run) as well as install, with the same findings
[bkit-install] [dry-run] Running core payload pass
[bkit-install] [dry-run] core: .agents/context.md
[bkit-install] [dry-run] core: .agents/docs.md
[bkit-install] [dry-run] core: .agents/rules.md
[bkit-install] [dry-run] core: .agents/skills.md
[bkit-install] [dry-run] core: AGENTS.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-install] [dry-run] core: docs/templates/bkit-plan.md
[bkit-install] [dry-run] core: .gitignore
[bkit-install] [dry-run] core: .gitattributes
[bkit-install] [dry-run] core: docs/architecture.md
[bkit-install] [dry-run] core: docs/data-schema.md
[bkit-install] [dry-run] core: docs/deployments.md
[bkit-install] [dry-run] core: docs/design.md
[bkit-install] [dry-run] core: docs/noise.md
[bkit-install] [dry-run] core: docs/observability.md
[bkit-install] [dry-run] core: docs/security.md
[bkit-install] [dry-run] core: docs/setup.md
[bkit-install] [dry-run] core: docs/technology.md
[bkit-install] [dry-run] core: docs/testing.md
[bkit-install] [dry-run] Running bkit docs pass
[bkit-install] [dry-run] core: .bkit/authoring.md
[bkit-install] [dry-run] core: .bkit/cloud.md
[bkit-install] [dry-run] core: .bkit/cli.md
[bkit-install] [dry-run] core: .bkit/comparison.md
[bkit-install] [dry-run] core: .bkit/install.md
[bkit-install] [dry-run] core: .bkit/jsonl.md
[bkit-install] [dry-run] core: .bkit/LICENSE.md
[bkit-install] [dry-run] core: .bkit/pipeline.md
[bkit-install] [dry-run] core: .bkit/providers.md
[bkit-install] [dry-run] core: .bkit/prompts.md
[bkit-install] [dry-run] core: .bkit/router.md
[bkit-install] [dry-run] core: .bkit/templates.md
[bkit-install] [dry-run] core: .bkit/trackers.md
[bkit-install] [dry-run] core: .bkit/workflows.md
[bkit-install] [dry-run] core: .bkit/README.md
[bkit-install] [dry-run] Running template copies pass
[bkit-install] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-install] [dry-run] template added: .bkit/templates/.envrc
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-install] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-install] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-install] [dry-run] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-install] [dry-run] template added: .bkit/templates/.prettierignore
[bkit-install] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-install] [dry-run] payload link: .bkit/core
[bkit-install] [dry-run] payload link: .bkit/shared
[bkit-install] [dry-run] core: .bkit/allowlist.json
[bkit-install] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > detectNoopGates — bkit check warns on a gate that checks nothing > runs in check (dry run) as well as install, as an advisory
[bkit-install] [dry-run] Running core payload pass
[bkit-install] [dry-run] core: .agents/context.md
[bkit-install] [dry-run] core: .agents/docs.md
[bkit-install] [dry-run] core: .agents/rules.md
[bkit-install] [dry-run] core: .agents/skills.md
[bkit-install] [dry-run] core: AGENTS.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-adoption.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-agents.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-analytics.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-annotations.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-app-store.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-architecture.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-config.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-cost.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-coverage.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-database.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-issues.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-llm.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-logs.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-models.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-privacy.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-prompts.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-red-team.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-reliability.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-repo.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-security.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-slop.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-testing.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-usability.md
[bkit-install] [dry-run] core: docs/templates/bkit-plan.md
[bkit-install] [dry-run] core: .gitignore
[bkit-install] [dry-run] core: .gitattributes
[bkit-install] [dry-run] core: docs/architecture.md
[bkit-install] [dry-run] core: docs/data-schema.md
[bkit-install] [dry-run] core: docs/deployments.md
[bkit-install] [dry-run] core: docs/design.md
[bkit-install] [dry-run] core: docs/noise.md
[bkit-install] [dry-run] core: docs/observability.md
[bkit-install] [dry-run] core: docs/security.md
[bkit-install] [dry-run] core: docs/setup.md
[bkit-install] [dry-run] core: docs/technology.md
[bkit-install] [dry-run] core: docs/testing.md
[bkit-install] [dry-run] Running bkit docs pass
[bkit-install] [dry-run] core: .bkit/authoring.md
[bkit-install] [dry-run] core: .bkit/cloud.md
[bkit-install] [dry-run] core: .bkit/cli.md
[bkit-install] [dry-run] core: .bkit/comparison.md
[bkit-install] [dry-run] core: .bkit/install.md
[bkit-install] [dry-run] core: .bkit/jsonl.md
[bkit-install] [dry-run] core: .bkit/LICENSE.md
[bkit-install] [dry-run] core: .bkit/pipeline.md
[bkit-install] [dry-run] core: .bkit/providers.md
[bkit-install] [dry-run] core: .bkit/prompts.md
[bkit-install] [dry-run] core: .bkit/router.md
[bkit-install] [dry-run] core: .bkit/templates.md
[bkit-install] [dry-run] core: .bkit/trackers.md
[bkit-install] [dry-run] core: .bkit/workflows.md
[bkit-install] [dry-run] core: .bkit/README.md
[bkit-install] [dry-run] Running template copies pass
[bkit-install] [dry-run] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/environment.json
[bkit-install] [dry-run] template added: .bkit/templates/.cursor/settings.json
[bkit-install] [dry-run] template added: .bkit/templates/.envrc
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/renovate.json5
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] [dry-run] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] [dry-run] template added: .bkit/templates/.graphifyignore
[bkit-install] [dry-run] template added: .bkit/templates/.husky/pre-commit
[bkit-install] [dry-run] template added: .bkit/templates/.husky/pre-push
[bkit-install] [dry-run] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] [dry-run] template added: .bkit/templates/.oxlintrc.json
[bkit-install] [dry-run] template added: .bkit/templates/.prettierignore
[bkit-install] [dry-run] template added: .bkit/templates/.serena/project.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] [dry-run] template added: .bkit/templates/.vale.ini
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-github.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] [dry-run] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] [dry-run] template added: .bkit/templates/docs/capabilities.md
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] [dry-run] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] [dry-run] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] [dry-run] template added: .bkit/templates/slop-scan.config.json
[bkit-install] [dry-run] payload link: .bkit/core
[bkit-install] [dry-run] payload link: .bkit/shared
[bkit-install] [dry-run] core: .bkit/allowlist.json
[bkit-install] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > MED-5: first-install advisory block has no broken backslash-escape sequences > advisories emitted on first install contain no literal \$ sequence (backslash-dollar)
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > MED-5: first-install advisory block has no broken backslash-escape sequences > advisory action for first-install is plain text (copy-paste safety)
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > .bkit-version first-run signal extra-logging > first install (no .bkit-version) emits post-install setup in advisories
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > .bkit-version first-run signal extra-logging > second install (.bkit-version present at current version) suppresses first-run extra logging
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > .bkit/version canonicalHashes — install prunes entries for absent paths > drops a stale entry a retired or renamed managed file left behind
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit-source `.agents/{rules,docs,skills}.md` must not leak to consumers > first install matches the template (no out-of-block content from bkit's source rules.md)
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit-source `.agents/{rules,docs,skills}.md` must not leak to consumers > rules.md is reachable via the templates pass — no additive leak path
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > .agents/context.md — bkit owns the managed block, the consumer owns the rest > install rewrites a stale block and keeps everything below bkit:end byte-identical
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > .agents/skills.md — bkit owns the managed block, the consumer owns the rest > install rewrites a stale block and keeps everything below bkit:end byte-identical
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)
[bkit-install] Running core payload pass
[bkit-install] core: .agents/skills.md
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLinearTeamKey (via seedCorePackageJsonScripts) > moves a 5.4.x bkit.linearTeam to bkit.linear.team, keeping the file's indent
[bkit-install] core: moved bkit.linearTeam to bkit.linear.team in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLinearTeamKey (via seedCorePackageJsonScripts) > keeps an existing bkit.linear.team and the other linear keys, and drops a blank old key
[bkit-install] core: moved bkit.linearTeam to bkit.linear.team in package.json
[bkit-install] core: moved bkit.linearTeam to bkit.linear.team in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLinearTeamKey (via seedCorePackageJsonScripts) > under dry-run records the same write and leaves the file
[bkit-install] [dry-run] core: moved bkit.linearTeam to bkit.linear.team in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLinearTeamKey (via seedCorePackageJsonScripts) > is idempotent, and runs on every install through the core module
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: moved bkit.linearTeam to bkit.linear.team in package.json
[bkit-install] core: moved bkit.linear -> bkit.tracker.linear in package.json
[bkit-install] core: added bkit.tracker.default, bkit.tracker.github, bkit.tracker.linear.project, bkit.tracker.linear.progress, bkit.tracker.linear.review, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > writes every bkit setting when missing, creating the bkit block, keeping the indent
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > reads back as the same config as an empty bkit block
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > fills missing keys inside a present block and never touches a value already set
[bkit-install] core: added bkit.tracker.github.progress, bkit.tracker.github.review, bkit.tracker.linear, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing.ciWorkflow, bkit.testing.ciCapstone, bkit.testing.ciRequired, bkit.testing.ciSkipPaths, bkit.testing.ciGenerated, bkit.workflows.minFreeGb, bkit.workflows.worktree.install, bkit.workflows.tasks, bkit.workflows.design, bkit.workflows.build.verify.maxAttempts, bkit.workflows.build.challenge, bkit.workflows.build.tests, bkit.workflows.build.publish, bkit.workflows.debug, bkit.workflows.ship, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > install writes tasks when missing and keeps a set value
[bkit-install] core: added bkit.tracker, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows.minFreeGb, bkit.workflows.worktree, bkit.workflows.tasks.maxTestsPerGroup, bkit.workflows.tasks.maxTestFilesPerTask, bkit.workflows.design, bkit.workflows.build, bkit.workflows.debug, bkit.workflows.ship, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > seeds build.publish on install
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > keeps an existing publish.local false on upgrade
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows.minFreeGb, bkit.workflows.worktree, bkit.workflows.tasks, bkit.workflows.design, bkit.workflows.build.verify, bkit.workflows.build.challenge, bkit.workflows.build.tests, bkit.workflows.build.publish.remote, bkit.workflows.debug, bkit.workflows.ship, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > seeds publish without dropping the ask blocks
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > seeds publish when the bkit block has no build
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows.worktree, bkit.workflows.tasks, bkit.workflows.design, bkit.workflows.build, bkit.workflows.debug, bkit.workflows.ship, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > leaves a non-object nested block alone
[bkit-install] core: added bkit.tracker.default, bkit.tracker.linear, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > sets dependencies.updater to the one updater whose config is present
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] core: set bkit.dependencies.updater to "renovate" (its config is present)
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.advisories to package.json
[bkit-install] core: set bkit.dependencies.updater to "renovate" (its config is present)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > never overwrites a set dependencies.updater, and leaves it empty when both configs are present
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.advisories to package.json
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > under dry-run records the updater write and leaves the file
[bkit-install] [dry-run] core: set bkit.dependencies.updater to "dependabot" (its config is present)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > under dry-run records the same write and leaves the file, so `bkit check` reports it
[bkit-install] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > seedBkitDefaults (via seedCorePackageJsonScripts) > is idempotent, and runs on every install through the core module
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateGithubProjectKey (via seedCorePackageJsonScripts) > moves a 5.5.x template board to bkit.github.project, keeping the file's indent
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateGithubProjectKey (via seedCorePackageJsonScripts) > keeps the opt-out as bkit.github.project false
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateGithubProjectKey (via seedCorePackageJsonScripts) > keeps an existing bkit.github.project and drops a malformed old key
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateGithubProjectKey (via seedCorePackageJsonScripts) > under dry-run records the same write and leaves the file
[bkit-install] [dry-run] core: moved bkit.githubProject to bkit.github in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateGithubProjectKey (via seedCorePackageJsonScripts) > is idempotent, and runs on every install through the core module
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json
[bkit-install] core: moved bkit.github -> bkit.tracker.github in package.json
[bkit-install] core: added bkit.tracker.default, bkit.tracker.github.progress, bkit.tracker.github.review, bkit.tracker.linear, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBkitLayout (via seedCorePackageJsonScripts) > moves every flat 5.5.x key to its section, keeping the file's indent
[bkit-install] core: moved bkit.issueTracker -> bkit.tracker.default, bkit.linear -> bkit.tracker.linear, bkit.cloudAgents -> bkit.cloud.agent, bkit.opencodeProvider -> bkit.providers.opencode.default, bkit.opencodeProviders -> bkit.providers.opencode.installed, bkit.minPushPaths -> bkit.testing.minPushPaths, bkit.capstoneJob -> bkit.testing.ciCapstone, bkit.ciWorkflow -> bkit.testing.ciWorkflow, bkit.shipGateRequiredLanes -> bkit.testing.ciRequired, bkit.disk.minFreeGb -> bkit.workflows.minFreeGb, bkit.worktree -> bkit.workflows.worktree, bkit.tasks -> bkit.workflows.tasks, bkit.roadmapNext -> bkit.prompts.roadmapNext, bkit.depUpdater -> bkit.dependencies.updater, bkit.ignoreAdvisories -> bkit.advisories.ignore in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBkitLayout (via seedCorePackageJsonScripts) > moves a 6.0.0 testing.shipGate to testing.ciRequired, and a ciRequired already set wins
[bkit-install] core: moved bkit.testing.shipGate -> bkit.testing.ciRequired in package.json
[bkit-install] core: moved bkit.testing.shipGate -> bkit.testing.ciRequired in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBkitLayout (via seedCorePackageJsonScripts) > a value already at the new path wins; two blocks merge key by key
[bkit-install] core: moved bkit.issueTracker -> bkit.tracker.default, bkit.github -> bkit.tracker.github, bkit.ciWorkflow -> bkit.testing.ciWorkflow in package.json
[bkit-install] core: moved bkit.linear -> bkit.tracker.linear in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBkitLayout (via seedCorePackageJsonScripts) > turns loopPause into ask on every point, keeping an ask already set
[bkit-install] core: moved bkit.loopPause -> bkit.workflows.<workflow>.<point>.ask in package.json
[bkit-install] core: moved bkit.loopPause -> bkit.workflows.<workflow>.<point>.ask in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBkitLayout (via seedCorePackageJsonScripts) > under dry-run records the same write and leaves the file
[bkit-install] [dry-run] core: moved bkit.issueTracker -> bkit.tracker.default in package.json

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBkitLayout (via seedCorePackageJsonScripts) > is idempotent, and runs on every install through the core module
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: moved bkit.issueTracker -> bkit.tracker.default, bkit.disk.minFreeGb -> bkit.workflows.minFreeGb, bkit.loopPause -> bkit.workflows.<workflow>.<point>.ask in package.json
[bkit-install] core: added bkit.tracker.github, bkit.tracker.linear, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows.worktree, bkit.workflows.tasks, bkit.workflows.design.grill.maxTurns, bkit.workflows.build.verify.maxAttempts, bkit.workflows.build.challenge.maxAttempts, bkit.workflows.build.tests.maxAttempts, bkit.workflows.build.publish, bkit.workflows.debug.fix.maxAttempts, bkit.workflows.debug.soak.maxAttempts, bkit.workflows.ship.merge.maxAttempts, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > pruneMinPushPaths (via seedCorePackageJsonScripts) > drops what bkit always allows and what ciSkipPaths already names, keeping the rest
[bkit-install] core: dropped [.bkit/*.jsonl, docs/plans/**, docs/*.jsonl, CHANGELOG.md, README.md] from bkit.testing.minPushPaths in package.json — bkit always allows what it writes, and ciSkipPaths counts

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > pruneMinPushPaths (via seedCorePackageJsonScripts) > a 6.0.x seed becomes []; a dry run writes nothing; a list it cannot shorten is left alone
[bkit-install] [dry-run] core: dropped [docs/plans/**, docs/*.jsonl, .bkit/*.jsonl] from bkit.testing.minPushPaths in package.json — bkit always allows what it writes, and ciSkipPaths counts
[bkit-install] core: dropped [docs/plans/**, docs/*.jsonl, .bkit/*.jsonl] from bkit.testing.minPushPaths in package.json — bkit always allows what it writes, and ciSkipPaths counts

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredDevLock (via runBkitDocs) > deletes a 5.3.x dev lock left behind and records the delete
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
[bkit-install] core: removed .bkit/.dev.lock (the dev lock is gone)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredDevLock (via runBkitDocs) > under dry-run records the same delete and leaves the file
[bkit-install] [dry-run] core: .bkit/authoring.md
[bkit-install] [dry-run] core: .bkit/cloud.md
[bkit-install] [dry-run] core: .bkit/cli.md
[bkit-install] [dry-run] core: .bkit/comparison.md
[bkit-install] [dry-run] core: .bkit/install.md
[bkit-install] [dry-run] core: .bkit/jsonl.md
[bkit-install] [dry-run] core: .bkit/LICENSE.md
[bkit-install] [dry-run] core: .bkit/pipeline.md
[bkit-install] [dry-run] core: .bkit/providers.md
[bkit-install] [dry-run] core: .bkit/prompts.md
[bkit-install] [dry-run] core: .bkit/router.md
[bkit-install] [dry-run] core: .bkit/templates.md
[bkit-install] [dry-run] core: .bkit/trackers.md
[bkit-install] [dry-run] core: .bkit/workflows.md
[bkit-install] [dry-run] core: .bkit/README.md
[bkit-install] [dry-run] core: removed .bkit/.dev.lock (the dev lock is gone)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredDevLock (via runBkitDocs) > is idempotent, and never removes a directory at that path
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
[bkit-install] core: removed .bkit/.dev.lock (the dev lock is gone)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateTemplateNotes (via runBkitDocs) > removes the old note above the block and records the write
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
[bkit-install] core: docs/templates/bkit-plan.md — removed bkit's old note above `<!-- bkit:start -->` (it now sits inside the block)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLedgerSchema (via runBkitDocs) > rewrites a 5.5.x ledger row to schema 2 and records the write
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
[bkit-install] core: docs/deferrals.jsonl — 1 row(s) rewritten to schema 2

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLedgerSchema (via runBkitDocs) > under dry-run records the same write and leaves the file
[bkit-install] [dry-run] core: .bkit/authoring.md
[bkit-install] [dry-run] core: .bkit/cloud.md
[bkit-install] [dry-run] core: .bkit/cli.md
[bkit-install] [dry-run] core: .bkit/comparison.md
[bkit-install] [dry-run] core: .bkit/install.md
[bkit-install] [dry-run] core: .bkit/jsonl.md
[bkit-install] [dry-run] core: .bkit/LICENSE.md
[bkit-install] [dry-run] core: .bkit/pipeline.md
[bkit-install] [dry-run] core: .bkit/providers.md
[bkit-install] [dry-run] core: .bkit/prompts.md
[bkit-install] [dry-run] core: .bkit/router.md
[bkit-install] [dry-run] core: .bkit/templates.md
[bkit-install] [dry-run] core: .bkit/trackers.md
[bkit-install] [dry-run] core: .bkit/workflows.md
[bkit-install] [dry-run] core: .bkit/README.md
[bkit-install] [dry-run] core: docs/deferrals.jsonl — 1 row(s) rewritten to schema 2

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateLedgerSchema (via runBkitDocs) > is idempotent
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
[bkit-install] core: docs/deferrals.jsonl — 1 row(s) rewritten to schema 2

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > strips the managed block and keeps consumer lines
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
[bkit-install] core: retired .bkit/lite.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > deletes .bkit/lite.md when it holds only the seeded heading
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
[bkit-install] core: retired .bkit/lite.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > merges .agents/shortcuts.md consumer lines into the stub
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
[bkit-install] core: retired .bkit/lite.md
[bkit-install] core: retired .agents/shortcuts.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > creates the stub when the shortcuts merge finds no lite.md
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
[bkit-install] core: retired .bkit/lite.md
[bkit-install] core: retired .agents/shortcuts.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > leaves a blockless or two-block lite.md untouched and logs
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

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > logs no fix and writes nothing on a second install over its own stub
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
[bkit-install] core: retired .bkit/lite.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > is idempotent across a second install
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
[bkit-install] core: retired .bkit/lite.md
[bkit-install] core: retired .agents/shortcuts.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > records the same write set in a dry run
[bkit-install] [dry-run] core: .bkit/authoring.md
[bkit-install] [dry-run] core: .bkit/cloud.md
[bkit-install] [dry-run] core: .bkit/cli.md
[bkit-install] [dry-run] core: .bkit/comparison.md
[bkit-install] [dry-run] core: .bkit/install.md
[bkit-install] [dry-run] core: .bkit/jsonl.md
[bkit-install] [dry-run] core: .bkit/LICENSE.md
[bkit-install] [dry-run] core: .bkit/pipeline.md
[bkit-install] [dry-run] core: .bkit/providers.md
[bkit-install] [dry-run] core: .bkit/prompts.md
[bkit-install] [dry-run] core: .bkit/router.md
[bkit-install] [dry-run] core: .bkit/templates.md
[bkit-install] [dry-run] core: .bkit/trackers.md
[bkit-install] [dry-run] core: .bkit/workflows.md
[bkit-install] [dry-run] core: .bkit/README.md
[bkit-install] [dry-run] core: retired .bkit/lite.md
[bkit-install] [dry-run] core: retired .agents/shortcuts.md
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
[bkit-install] core: retired .bkit/lite.md
[bkit-install] core: retired .agents/shortcuts.md

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > installs no lite.md and still mirrors every other canonical doc
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.0.0)

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts (127 tests | 8 failed) 1960ms
   ✓ bkit canonical docs pass (runBkitDocs, #218) (6)
     ✓ force-overwrites the package .bkit/*.md docs into the consumer's .bkit/, rendered 77ms
     ✓ keeps install tokens literal in the docs, resolving only the managed marker 41ms
     ✓ writes .bkit/LICENSE.md with the full MIT text and copyright notice 40ms
     ✓ mirrors the docs into the repo's own .bkit/ in dogfood too 38ms
     ✓ is idempotent: a second core run writes none of the docs again 60ms
     ✓ overwrites a consumer-tampered doc (bkit owns canonical content) 38ms
   ✓ core package.json scripts — bkit:gate:* names, add-if-missing (3)
     ✓ an existing gate value is never touched; missing gate names are added 43ms
     ✓ a second install writes nothing once every gate name is present 62ms
     ✓ a missing gate name is a write in dry-run, so `bkit check` reports it 10ms
   ✓ migrateBrandedScriptNames (via seedCorePackageJsonScripts) (6)
     ✓ renames old bkit script keys and keeps custom values 40ms
     ✓ rewrites old script tokens in values and default gate chains 40ms
     ✓ leaves the old key when the new key exists 1ms
     ✓ leaves a foreign graph script under its own name 38ms
     ✓ warns on an old script name the rewrite cannot reach 1ms
     ✓ leaves package.json untouched when it is not valid JSON 1ms
   ✓ detectGateAdvisories — gate advisories point at .bkit/templates.md (14)
     ✓ names the tool scripts a default gate chains that package.json lacks 1ms
     ✓ stays silent about a gate the consumer rewrote 0ms
     ✓ hands over the gate line for a declared test tier no gate runs 1ms
     ✓ names a script the commit gate runs that the push gate runs again 1ms
     ✓ stays silent when the commit gate only formats staged files 1ms
     ✓ advises declaring bkit:test:file until package.json has it, with the contract inline 1ms
     ✓ advises declaring bkit:lint:file once bkit:test:file is declared without it 1ms
     ✓ returns nothing for an absent or malformed package.json 1ms
     ✓ judges a gate name install has yet to seed at its default value 1ms
     ✓ every gate advisory restates what a gate may run, which bkit cannot check 1ms
     ✓ tells a repo without bkit:gate:changed how to declare it, and what bkit passes it 0ms
     ✓ stays silent once bkit:gate:changed is declared 0ms
     ✓ stays silent when bkit.advisories.ignore names gate-changed-script-missing 0ms
     ✓ runs in check (dry run) as well as install, with the same findings 44ms
   ✓ detectNoopGates — bkit check warns on a gate that checks nothing (17)
     ✓ "" is a no-op 1ms
     ✓ "   " is a no-op 0ms
     ✓ "true" is a no-op 0ms
     ✓ ":" is a no-op 0ms
     ✓ "exit 0" is a no-op 0ms
     ✓ "echo ok" is a no-op 0ms
     ✓ "echo \"skipped\"" is a no-op 0ms
     ✓ "echo ok && true" is a no-op 0ms
     ✓ "true; :" is a no-op 0ms
     ✓ "pnpm test" can fail 0ms
     ✓ "echo start && pnpm test" can fail 0ms
     ✓ "exit 1" can fail 0ms
     ✓ "false" can fail 0ms
     ✓ "tsc" can fail 0ms
     ✓ names every empty or no-op bkit:gate script, and only those 1ms
     ✓ is silent when every gate runs something, and for an absent or malformed package.json 1ms
     ✓ runs in check (dry run) as well as install, as an advisory 44ms
   ✓ MED-5: first-install advisory block has no broken backslash-escape sequences (2)
     ✓ advisories emitted on first install contain no literal \$ sequence (backslash-dollar) 38ms
     ✓ advisory action for first-install is plain text (copy-paste safety) 38ms
   ✓ .bkit-version first-run signal extra-logging (2)
     ✓ first install (no .bkit-version) emits post-install setup in advisories 38ms
     ✓ second install (.bkit-version present at current version) suppresses first-run extra logging 59ms
   ✓ .bkit/version canonicalHashes — install prunes entries for absent paths (1)
     ✓ drops a stale entry a retired or renamed managed file left behind 38ms
   ✓ bkit-source `.agents/{rules,docs,skills}.md` must not leak to consumers (2)
     ✓ first install matches the template (no out-of-block content from bkit's source rules.md) 39ms
     ✓ rules.md is reachable via the templates pass — no additive leak path 38ms
   ✓ .agents/context.md — bkit owns the managed block, the consumer owns the rest (1)
     ✓ install rewrites a stale block and keeps everything below bkit:end byte-identical 58ms
   ✓ .agents/skills.md — bkit owns the managed block, the consumer owns the rest (1)
     ✓ install rewrites a stale block and keeps everything below bkit:end byte-identical 58ms
   ✓ migrateLinearTeamKey (via seedCorePackageJsonScripts) (5)
     ✓ moves a 5.4.x bkit.linearTeam to bkit.linear.team, keeping the file's indent 1ms
     ✓ keeps an existing bkit.linear.team and the other linear keys, and drops a blank old key 1ms
     ✓ leaves a jira config alone: no write, bkit.jira untouched 1ms
     ✓ under dry-run records the same write and leaves the file 1ms
     ✓ is idempotent, and runs on every install through the core module 39ms
   ✓ seedBkitDefaults (via seedCorePackageJsonScripts) (16)
     ✓ writes every bkit setting when missing, creating the bkit block, keeping the indent 1ms
     ✓ writes defaults where a key has one and an empty value only for a choice not made 1ms
     ✓ reads back as the same config as an empty bkit block 1ms
     ✓ fills missing keys inside a present block and never touches a value already set 1ms
     ✓ install writes tasks when missing and keeps a set value 1ms
     ✓ seeds build.publish on install 1ms
     ✓ keeps an existing publish.local false on upgrade 1ms
     ✓ seeds publish without dropping the ask blocks 1ms
     ✓ seeds publish when the bkit block has no build 1ms
     ✓ leaves a non-object nested block alone 0ms
     ✓ leaves a non-object bkit value alone 0ms
     ✓ sets dependencies.updater to the one updater whose config is present 1ms
     ✓ never overwrites a set dependencies.updater, and leaves it empty when both configs are present 1ms
     ✓ under dry-run records the updater write and leaves the file 1ms
     ✓ under dry-run records the same write and leaves the file, so `bkit check` reports it 0ms
     ✓ is idempotent, and runs on every install through the core module 63ms
   ✓ migrateGithubProjectKey (via seedCorePackageJsonScripts) (7)
     ✓ moves a 5.5.x template board to bkit.github.project, keeping the file's indent 1ms
     ✓ keeps the opt-out as bkit.github.project false 1ms
     ✓ leaves the defaults for option ids it cannot name, and says which to set 1ms
     ✓ keeps an existing bkit.github.project and drops a malformed old key 1ms
     ✓ leaves a config without the old key alone 0ms
     ✓ under dry-run records the same write and leaves the file 1ms
     ✓ is idempotent, and runs on every install through the core module 38ms
   ✓ migrateBkitLayout (via seedCorePackageJsonScripts) (8)
     ✓ moves every flat 5.5.x key to its section, keeping the file's indent 1ms
     ✓ moves a 6.0.0 testing.shipGate to testing.ciRequired, and a ciRequired already set wins 1ms
     ✓ a value already at the new path wins; two blocks merge key by key 1ms
     ✓ turns loopPause into ask on every point, keeping an ask already set 1ms
     ✓ leaves an old key in place when a non-object holds its new section 0ms
     ✓ leaves a config already in the new layout alone 0ms
     ✓ under dry-run records the same write and leaves the file 1ms
     ✓ is idempotent, and runs on every install through the core module 40ms
   ✓ pruneMinPushPaths (via seedCorePackageJsonScripts) (2)
     ✓ drops what bkit always allows and what ciSkipPaths already names, keeping the rest 1ms
     ✓ a 6.0.x seed becomes []; a dry run writes nothing; a list it cannot shorten is left alone 1ms
   ✓ migrateRetiredDevLock (via runBkitDocs) (3)
     ✓ deletes a 5.3.x dev lock left behind and records the delete 6ms
     ✓ under dry-run records the same delete and leaves the file 4ms
     ✓ is idempotent, and never removes a directory at that path 15ms
   ✓ migrateTemplateNotes (via runBkitDocs) (1)
     ✓ removes the old note above the block and records the write 7ms
   ✓ migrateJiraKeyName (via runBkitDocs) (3)
     ✓ renames BKIT_JIRA_API_TOKEN to BKIT_JIRA_API_KEY in .bkit/.env, value kept, never logged or hashed 6ms
     ✓ dry-run leaves the file; a second run and an already-renamed file change nothing 14ms
     ✓ leaves both lines alone when the new name is already set 7ms
   ✓ migrateModelOverrideAgentNames (via runBkitDocs) (4)
     ✓ renames an old agent's override row in place, provider and model kept, and records the update 8ms
     ✓ dry-run computes the same write but leaves the file; a second run changes nothing 15ms
     ✓ leaves the old row alone when a row already names the new agent 7ms
     ✓ never touches a row inside the managed block, and does nothing without a Model Overrides section 6ms
   ✓ migrateLedgerSchema (via runBkitDocs) (3)
     ✓ rewrites a 5.5.x ledger row to schema 2 and records the write 7ms
     ✓ under dry-run records the same write and leaves the file 4ms
     ✓ is idempotent 12ms
   ✓ migrateRetiredLite (via runBkitDocs) (9)
     ✓ strips the managed block and keeps consumer lines 21ms
     ✓ deletes .bkit/lite.md when it holds only the seeded heading 18ms
     ✓ merges .agents/shortcuts.md consumer lines into the stub 18ms
     ✓ creates the stub when the shortcuts merge finds no lite.md 19ms
     ✓ leaves a blockless or two-block lite.md untouched and logs 23ms
     ✓ logs no fix and writes nothing on a second install over its own stub 23ms
     ✓ is idempotent across a second install 24ms
     ✓ records the same write set in a dry run 22ms
     ✓ installs no lite.md and still mirrors every other canonical doc 51ms
   ✓ migrateBrandedFileTokens (via runBkitDocs) (1)
     ✓ rewrites old script tokens in husky hooks and the CI workflow 8ms
   ✓ migrateBrandedTemplateFiles (via runBkitDocs) (2)
     ✓ moves shipped CI script units to bkit- names and rewrites their paths 41ms
     ✓ leaves an edited or already-renamed unit and logs the manual move 30ms
   ❯ migrateBrandedCheckNames (via runBkitDocs) (4)
     × rewrites shipped old workflow names and leaves customised ones 36ms
     × logs each renamed check name with the branch-protection fix 23ms
     × inserts no job name when the renovate or trivy job already has one 34ms
     × rewrites the old health stub in a custom bkit.testing.ciWorkflow file 22ms
   ❯ migrateValeHouseStyle (via runBkitDocs) (4)
     × moves shipped Vale rules to Bkit and keeps own and edited rules in House 52ms
     × names Bkit rules in .vale.ini and lists both styles while House keeps files 54ms
     × moves every House rule and removes House 48ms
     × moves rules without a .vale.ini 38ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones
AssertionError: expected '# Example. Copy into the repo and own…' to contain 'name: bkit-cloud-context (${{ github.…'

- Expected
+ Received

- name: bkit-cloud-context (${{ github.event_name }})
+ # Example. Copy into the repo and own it.
+ # bkit install does not write this file and does not overwrite a copy.
+ name: bkit-cloud
+
+ # Phase-routed cloud-agent workflow. One `context` job resolves the phase and its
+ # argument, then TWO dispatch jobs — `claude` (via claude-code-action@v1) and `opencode`
+ # (via the opencode CLI `run` subcommand) — run the same `/bkit-auto <phase> <arg>`
+ # orchestrator against the committed `.claude/` / `.opencode/` config respectively.
+ #
+ # RUNTIME GATING — credential-presence auto-detect (in the context job):
+ #   - ANTHROPIC_API_KEY secret set, OR both ANTHROPIC_FEDERATION_RULE_ID and
+ #     ANTHROPIC_ORGANIZATION_ID repo variables set → claude job runs.
+ #   - OPENCODE_PROVIDER_KEY set → opencode job runs.
+ #   Both can run on one event (additive); a missing credential skips that job (zero
+ #   billable runner minutes).
+ #
+ # Trigger surfaces:
+ #   - workflow_run (CI completion on feat/**): success -> ship, failure -> debug
+ #   - workflow_run (CI completion on dev): success -> no-op (regression check passed),
+ #     failure -> /bkit-debug {FID} (FID recovered from squash-merge commit scope;
+ #     capped at debug fix + soak maxAttempts dispatches). [skip ci] close commits never trigger CI.
+ #   - workflow_dispatch: pick ANY phase (ship|debug|design|plan|build) for an issue.
+ #     design/plan/build have no tracker-event trigger; they run only via dispatch.
+ #
+ # Required credentials (claude job): Claude GitHub App (one-time `/install-github-app`;
+ #   claude-code-action@v1 authenticates as the App via `id-token: write` OIDC) + ONE of:
+ #   - ANTHROPIC_API_KEY repo secret, or
+ #   - workload identity federation (keyless): ANTHROPIC_FEDERATION_RULE_ID +
+ #     ANTHROPIC_ORGANIZATION_ID repo variables (+ optional ANTHROPIC_SERVICE_ACCOUNT_ID /
+ #     ANTHROPIC_WORKSPACE_ID) from a Claude Console federation rule. A set
+ #     ANTHROPIC_API_KEY secret wins over federation — delete it when switching.
+ # Required secrets (opencode job): OPENCODE_PROVIDER_KEY (any provider key the
+ #   committed .opencode/opencode.json references; fan-out maps it to known env var names).
+ # Required tracker label on the issue: `bkit:auto` (opt-in) for the CI-driven path.
+ # Docs: bkit's cloud.md § Post-CI auto-routing.
+
+ on:
+   workflow_run:
+     workflows: [bkit-ci]
+     branches: ['feat/**', 'dev']
+     types: [completed]
+   workflow_dispatch:
+     inputs:
+       phase:
+         description: 'bkit phase to run'
+         required: true
+         type: choice
+         options:
+           - ship
+           - debug
+           - design
+           - plan
+           - build
+       issue:
+         description: 'Tracker issue number/id supplying the brief'
+         required: true
+         type: string
+
+ # Dynamic run name (shown in the Actions runs list). Dispatched runs render
+ # `bkit auto <phase>(<issue>)`; CI-driven runs echo the triggering commit subject
+ # (`head_commit.message` — already `{type}({scope}): {message}`) prefixed with `bkit auto`.
+ run-name: >-
+   ${{ inputs.phase
+       && format('bkit auto {0}({1})', inputs.phase, inputs.issue)
+       || format('bkit auto {0}', github.event.workflow_run.head_commit.message) }}
+
+ concurrency:
+   # Serialises concurrent runs WITHIN each trigger surface:
+   #   - dispatch path  keys on inputs.issue     (e.g. bkit-auto-141)
+   #   - CI-completion  keys on head_branch       (e.g. bkit-auto-feat/141-cloud-app)
+   # The two keys never match for one FID, so a dispatched build and the auto-ship it
+   # triggers do not share a group; the orchestrator stale-run guard + the per-feature
+   # workflow lock (`bkit locks acquire`, `logs/{FID}/.lock`) handle that race (not this
+   # concurrency key).
+   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
+   # dev: queue, not cancel. With cancel-in-progress: false, GHA queues at most one
+   # pending run per group (older pendings are cancelled as newer ones arrive); the
+   # queued run re-evaluates the dispatch cap at its ctx step when it starts.
+   # feat/** cancels (latest wins). `bkit-auto-dev` is ONE group shared by ALL FIDs
+   # (concurrency.group resolves from the trigger payload, before the ctx step derives
+   # the FID): if two DIFFERENT FIDs' dev CI runs fail near-simultaneously, the older
+   # pending run can be dropped. The ctx step's stale-run guard then writes a
+   # `dev-dispatch-dropped` row to the job summary + a `::warning::`.
+   cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
+
+ jobs:
+   # ---------------------------------------------------------------------------
+   # context job — checks which runner secrets are set and resolves phase + arg ONCE
+   # for both runner jobs. CI-driven runs fire only on terminal CI conclusions (skip
+   # cancelled / skipped). Free-tier gate: CI-driven runs additionally require
+   # 'bkit [auto route]' in the head commit message — zero runner minutes if the marker
+   # is absent (no opted-in close-workflow HEAD). Dispatched runs always proceed. When
+   # this job is skipped, both runner jobs are skipped with it.
+   # ---------------------------------------------------------------------------
+   context:
+     name: context (${{ github.event_name }})
+     if: >-
+       github.event_name == 'workflow_dispatch'
+       || (
+       github.event.workflow_run.head_repository.full_name == github.repository
+       && (github.event.workflow_run.conclusion == 'success' || github.event.workflow_run.conclusion == 'failure')
+       && contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')
+       && !(github.event.workflow_run.head_branch == 'dev' && github.event.workflow_run.conclusion == 'success')
+       )
+     runs-on: {{CLOUD_RUNNER}}
+     permissions:
+       # contents: write — the dev arm commits its dispatch-cap counter row to dev.
+       contents: write
+       pull-requests: read
+       issues: read
+       actions: read
+     outputs:
+       claude: ${{ steps.gate.outputs.claude }}
+       opencode: ${{ steps.gate.outputs.opencode }}
+       skip: ${{ steps.ctx.outputs.skip }}
+       phase: ${{ steps.ctx.outputs.phase }}
+       arg: ${{ steps.ctx.outputs.arg }}
+     steps:
+       # A runner job whose credential is missing is a no-op; with neither job enabled,
+       # nothing below runs (no counter row, no checkout).
+       - name: Check runner credentials
+         id: gate
+         env:
+           ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+           ANTHROPIC_FEDERATION_RULE_ID: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
+           ANTHROPIC_ORGANIZATION_ID: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
+           OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+         run: |
+           claude=false
+           opencode=false
+           if [ -n "$ANTHROPIC_API_KEY" ]; then
+             claude=true
+           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ] && [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
+             claude=true
+           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ]; then
+             echo "::notice::ANTHROPIC_ORGANIZATION_ID repo variable not set — federation needs it alongside ANTHROPIC_FEDERATION_RULE_ID; claude job no-op."
+           elif [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
+             echo "::notice::ANTHROPIC_FEDERATION_RULE_ID repo variable not set — federation needs it alongside ANTHROPIC_ORGANIZATION_ID; claude job no-op."
+           else
+             echo "::notice::Neither the ANTHROPIC_API_KEY secret nor the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables are set — claude job no-op."
+           fi
+           if [ -n "$OPENCODE_PROVIDER_KEY" ]; then
+             opencode=true
+           else
+             echo "::notice::OPENCODE_PROVIDER_KEY not set — opencode job no-op."
+           fi
+           enabled=false
+           if [ "$claude" = true ] || [ "$opencode" = true ]; then enabled=true; fi
+           {
+             echo "claude=$claude"
+             echo "opencode=$opencode"
+             echo "enabled=$enabled"
+           } >> "$GITHUB_OUTPUT"
+
+       # SHA pins in this file — your updater refreshes them in your copy (keep this file out
+       # of renovate.json5 `ignorePaths`); `bkit upgrade` lists this template when bkit's pins move.
+       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+         if: steps.gate.outputs.enabled == 'true'
+         with:
+           # `dev` at the workspace root: the dev arm's dispatch-cap counter row is
+           # committed to dev's `status.jsonl`; the feat/** arm reads the branch's
+           # `status.jsonl` from origin.
+           ref: dev
+           fetch-depth: 0
+           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
+           token: ${{ github.token }}
+
+       - name: Configure git user
+         if: steps.gate.outputs.enabled == 'true'
+         run: |
+           git config user.name 'bkit-auto[bot]'
+           git config user.email 'bkit-auto@users.noreply.github.com'
+
+       - name: Resolve phase + brief context
+         id: ctx
+         if: steps.gate.outputs.enabled == 'true'
+         env:
+           GH_TOKEN: ${{ github.token }}
+           EVENT: ${{ github.event_name }}
+           IN_PHASE: ${{ inputs.phase }}
+           IN_ISSUE: ${{ inputs.issue }}
+           CONCLUSION: ${{ github.event.workflow_run.conclusion }}
+           BRANCH: ${{ github.event.workflow_run.head_branch }}
+           COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}
+           HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
+         run: |
+           set -euo pipefail
+           # Cloud runs serve the GitHub tracker only: Linear cloud runs start from Cursor's
+           # Linear integration, and Jira runs locally only. Unset tracker → continue.
+           TRACKER=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
+           if [ -n "$TRACKER" ] && [ "$TRACKER" != "github" ]; then
+             echo "::notice::bkit.tracker.default is '$TRACKER' — bkit-cloud.yml serves the GitHub tracker only; no-op exit."
+             echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+           fi
+           if [ "$EVENT" = "workflow_dispatch" ]; then
+             # Dispatched: phase + issue come straight from inputs.
+             PHASE="$IN_PHASE"
+             ARG="$IN_ISSUE"
+             FID="$IN_ISSUE"
+           else
+             # CI-driven: success -> ship, failure -> debug; route by branch + conclusion.
+             case "$CONCLUSION" in
+               success) PHASE=ship ;;
+               failure) PHASE=debug ;;
+               *) echo "::notice::Non-terminal CI conclusion '$CONCLUSION' — no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0 ;;
+             esac
+
+             # SHARED-DERIV: FID/ISSUE recovery + dispatch-cap machinery for both
+             # CI-driven trigger surfaces (feat/** pre-merge, dev post-merge).
+
+             # bkit_dev_dispatch_guard <FID> <HEAD_SHA> — cap-check +
+             # counter-write + fail-closed-verify for the post-merge debug
+             # surface (dev CI failure). One post-feat/** debug budget per FID.
+             # Returns 1 (caller must skip) once the FID has DEBUG_CAP distinct
+             # failed-CI SHAs recorded — DEBUG_CAP = package.json
+             # bkit.workflows.debug fix + soak maxAttempts (2 each when unset or
+             # not a whole number of 1 or more; the engine falls back the same
+             # way) — every debug run makes at least one attempt, so more
+             # dispatches could never run one — or if the counter row
+             # cannot be durably landed on origin/dev (fail-closed: one push
+             # retry against a re-fetched dev, then VERIFY landing before
+             # proceeding). Returns 0 to proceed to dispatch.
+             bkit_dev_dispatch_guard() {
+               local guard_fid="$1" guard_head_sha="$2"
+               # assert the FID against the same slug allowlist the dev arm
+               # already enforces BEFORE it's used to build any path (find -path /
+               # mkdir -p / git commit -m). Defence-in-depth re-check for the
+               # PR-body marker path (bkit:fid=<anything up to whitespace/'>'>
+               # admits '/', '.', '..').
+               if ! [[ "$guard_fid" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 echo "::notice::Invalid FID '$guard_fid' — refusing to write dev-dispatch counter (fail-closed)."
+                 return 1
+               fi
+               # The caller invokes this function as `... || { skip }`, which
+               # suppresses `set -e` for the whole body. An explicit test, not
+               # `${VAR:?}`: the `:?` expansion exits the whole shell even from
+               # inside a `|| {}`-guarded function. Fail closed when the cap
+               # cannot be read as a whole number.
+               local debug_cap
+               debug_cap=$(jq -r 'def lim($p): ((if ($p | type) == "object" then $p.maxAttempts else null end) // 2) | if type == "number" and . >= 1 and floor == . then . else 2 end;
+                 (.bkit.workflows.debug // {}) as $d | lim($d.fix // {}) + lim($d.soak // {})' package.json 2>/dev/null || true)
+               case "${debug_cap:-}" in
+                 '' | *[!0-9]*)
+                   echo "::notice::package.json bkit.workflows.debug limits are unreadable — refusing to dispatch uncounted (fail-closed)."
+                   return 1
+                   ;;
+               esac
+               local status_dir status_file dev_count parent_sha landed
+               # `sort` makes the month-bucket choice deterministic.
+               status_dir=$(find docs/plans -mindepth 3 -maxdepth 3 -type d -path "docs/plans/*/logs/$guard_fid" 2>/dev/null | sort | head -1 || true)
+               [ -n "$status_dir" ] && status_dir="${status_dir}/"
+               if [ -z "$status_dir" ]; then
+                 status_dir="docs/plans/$(date -u +%Y%m)/logs/$guard_fid/"
+               fi
+               mkdir -p "$status_dir"
+               status_file="${status_dir}status.jsonl"
+               dev_count=0
+               # distinguish "no rows" from "cannot parse" — a truncated
+               # line, stray non-JSON row, or merge=union conflict artefact in the
+               # shared status.jsonl must NOT silently degrade to dev_count=0.
+               # Only an absent file is a legitimate zero.
+               if [ -f "$status_file" ]; then
+                 if ! dev_count=$(jq -s --arg f "$guard_fid" \
+                   '[.[] | select(.type=="dev-dispatch" and .fid==$f) | .headSha] | unique | length' \
+                   "$status_file" 2>/dev/null); then
+                   echo "::notice::$status_file is unparseable — refusing to dispatch for $guard_fid uncounted (fail-closed)."
+                   return 1
+                 fi
+               fi
+               if [ "$dev_count" -ge "$debug_cap" ]; then
+                 echo "::notice::FID $guard_fid exhausted $debug_cap dev-triggered debug dispatches — operator review required (delete dev-dispatch rows in status.jsonl to reset)."
+                 return 1
+               fi
+               parent_sha=$(git -C "$GITHUB_WORKSPACE" rev-parse origin/dev 2>/dev/null || echo "")
+               jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$guard_fid" --arg h "$guard_head_sha" --arg p "$parent_sha" \
+                 '{type:"dev-dispatch", workflow:"auto", at:$t, fid:$f, headSha:$h, parentSha:$p}' \
+                 >> "$status_file"
+               git -C "$GITHUB_WORKSPACE" add -- "$status_file"
+               git -C "$GITHUB_WORKSPACE" commit -m "docs($guard_fid): dev-dispatch telemetry [skip ci]" -- "$status_file"
+               if ! git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null; then
+                 git -C "$GITHUB_WORKSPACE" fetch origin dev
+                 git -C "$GITHUB_WORKSPACE" rebase origin/dev || { git -C "$GITHUB_WORKSPACE" rebase --abort || true; }
+                 git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null || true
+               fi
+               git -C "$GITHUB_WORKSPACE" fetch origin dev
+               # `git show` has its own `|| true` so a missing file does not trip
+               # pipefail across `| jq`.
+               landed=$( (git -C "$GITHUB_WORKSPACE" show "origin/dev:${status_file}" 2>/dev/null || true) \
+                 | jq -s --arg f "$guard_fid" --arg h "$guard_head_sha" \
+                     '[.[] | select(.type=="dev-dispatch" and .fid==$f and .headSha==$h)] | length' 2>/dev/null || echo 0)
+               if [ "${landed:-0}" -lt 1 ]; then
+                 echo "::notice::dev-dispatch row for $guard_fid @ $guard_head_sha is not on origin/dev after retry — refusing to dispatch uncounted (fail-closed). Resolve the dev push contention and re-run via workflow_dispatch."
+                 return 1
+               fi
+               return 0
+             }
+
+             if [ "$BRANCH" = "dev" ]; then
+               # Post-merge dev CI — no open PR. Recover FID from squash-merge commit
+               # scope. dev success = regression check passed = no-op (the merge
+               # already happened).
+               if [ "$PHASE" = "ship" ]; then
+                 echo "::notice::dev CI passed — post-merge regression check OK, no-op exit."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # PHASE=debug below.
+               # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
+               # Shape-tolerant: the regex accepts BOTH GitHub
+               # (363-slug) and Linear (bar-123-slug) FID SHAPES, mirroring the
+               # alternation the feat/** fallback below uses. The kill switch
+               # below (`gh issue view "$ISSUE"`) is GitHub-Issues-only, so a
+               # Linear FID no-ops there (empty labels -> bkit:auto absent).
+               # `head -1` FIRST — head_commit.message is subject+body and
+               # grep's `^` anchors per line, so without it a squash body line
+               # (GitHub's default body is the list of source commit subjects)
+               # like "feat(999-other): ..." would win and key the cap counter,
+               # status path and /bkit-debug dispatch to an unrelated feature.
+               FID=$(printf '%s' "$COMMIT_MSG" | head -1 | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
+               if [ -z "$FID" ]; then
+                 # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
+                 # filter to same-repo MERGED PRs (the endpoint also returns OPEN
+                 # fork PRs at this SHA).
+                 PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
+                   --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
+                 FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
+               fi
+               if [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # `|| true` is load-bearing under `set -euo pipefail` —
+               # this runs BEFORE the slug allowlist, so a non-FID branch
+               # (Renovate, a hand-named hotfix) yields no match,
+               # pipefail propagates grep's exit 1, and the step dies red
+               # instead of reaching the designed no-op exit just below.
+               ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+               ARG="$FID"
+               # Kill switch: re-check bkit:auto on the issue (live revocation).
+               # exact label match, not substring. MUST precede the stale-run
+               # guard and the dispatch-cap guard below; it needs nothing they set.
+               if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
+                 echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # Stale-run guard: HEAD_SHA is current iff it is the headSha of the
+               # most recent COMPLETED CI run on dev ([skip ci] close commits never
+               # appear in gh run list). --workflow bkit-ci.yml (filename), not `bkit-ci`
+               # (display name).
+               LATEST_CI_SHA=$(gh run list --branch dev --workflow bkit-ci.yml --status completed --limit 10 \
+                 --json headSha --jq '.[0].headSha // empty' 2>/dev/null || echo "")
+               # an empty LATEST_CI_SHA disables the staleness check (fail-open)
+               # and emits a ::warning:: naming the bkit-ci.yml filename requirement.
+               if [ -z "$LATEST_CI_SHA" ]; then
+                 echo "::warning::gh run list --branch dev --workflow bkit-ci.yml returned no completed runs — stale-run guard disabled for this dispatch (proceeding, fail-open). If this persists, verify the consumer CI workflow file is named bkit-ci.yml (\`gh workflow view ci.yml\`)."
+               fi
+               if [ -n "$LATEST_CI_SHA" ] && [ "$HEAD_SHA" != "$LATEST_CI_SHA" ]; then
+                 # A DIFFERENT FID's dev CI failure may have superseded this run
+                 # in the shared `bkit-auto-dev` concurrency group; this FID's
+                 # post-merge failure is dropped here. The drop is recorded in the
+                 # RUN SUMMARY, never as a committed status.jsonl row (dev already
+                 # advanced).
+                 DROP_ROW=$(jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$FID" --arg h "$HEAD_SHA" --arg latest "$LATEST_CI_SHA" \
+                   '{type:"dev-dispatch-dropped", workflow:"auto", at:$t, fid:$f, headSha:$h, latestSha:$latest}')
+                 {
+                   echo "### bkit dev-dispatch dropped"
+                   echo ""
+                   echo "FID \`$FID\` had a post-merge \`dev\` CI failure that was superseded before dispatch."
+                   echo ""
+                   echo '```json'
+                   echo "$DROP_ROW"
+                   echo '```'
+                 } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
+                 echo "::warning::Stale dev CI (head_sha=$HEAD_SHA, latest completed dev CI head=$LATEST_CI_SHA) for FID $FID — no-op exit. This FID's post-merge CI failure may have been superseded by a DIFFERENT FID's dev push under the shared bkit-auto-dev concurrency group; see this run's job summary (dev-dispatch-dropped) if this FID does not otherwise recover."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # Loop cap + counter write (fail-closed).
+               bkit_dev_dispatch_guard "$FID" "$HEAD_SHA" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
+             else
+               # feat/** pre-merge path (PR-backed FID recovery).
+               PR_NUMBER=$(gh pr list --head "$BRANCH" --base dev --state open --json number --jq '.[0].number // empty')
+               if [ -z "$PR_NUMBER" ]; then
+                 echo "::notice::No open PR for branch $BRANCH — no-op exit."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"
+                 exit 0
+               fi
+               ARG="$PR_NUMBER"
+
+               # PRIMARY: parse the bkit:issue / bkit:fid markers shipped in every
+               # bkit-build PR body. Also assert the marker-derived FID
+               # against the slug allowlist here — bkit:fid=[^[:space:]>]+ admits
+               # '/', '.', '..' and glob metacharacters, so an unvalidated match
+               # falls through to path construction (find -path / mkdir -p / git
+               # commit) in bkit_dev_dispatch_guard below. A mismatch falls through
+               # to the branch fallback exactly like an empty/missing marker.
+               PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
+               ISSUE=$(echo "$PR_BODY" | grep -oE 'bkit:issue=#[0-9]+' | sed 's/bkit:issue=#//' | head -1 || true)
+               FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
+               if [ -z "$ISSUE" ] || [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 # FALLBACK: extract FID from the branch name (feat/{FID}) when the
+                 # PR body carries no usable bkit:fid= marker.
+                 # keep the FULL slug (do NOT collapse to the leading
+                 # numeric/alpha id, e.g. '363' instead of
+                 # '363-widen-bkit-cloud-trigger'). ISSUE (short
+                 # numeric/alpha prefix, used only for `gh issue view`) is derived
+                 # FROM the full FID, not the other way round. NOTE the '#' sed
+                 # delimiter: with '|' the alternation would need escaping and is
+                 # ambiguous under -E.
+                 FID=$(echo "$BRANCH" | sed -E 's#^feat/##')
+                 # `|| true` is load-bearing under `set -euo pipefail` —
+               # this runs BEFORE the slug allowlist, so a non-FID branch
+               # (Renovate, a hand-named hotfix) yields no match,
+               # pipefail propagates grep's exit 1, and the step dies red
+               # instead of reaching the designed no-op exit just below.
+               ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+               fi
+               if [ -z "$FID" ] || [ -z "$ISSUE" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"
+                 exit 0
+               fi
+
+               # Cheap-tier kill switch: re-check bkit:auto on the issue (live revocation).
+               # exact label match, not substring.
+               if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
+                 echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"
+                 exit 0
+               fi
+
+               # A build still writing this branch owns it: no-op exit. "Still
+               # running" = the branch's status.jsonl has a build workflow-started
+               # with no later workflow-done / workflow-failed AND its newest build
+               # row is under 30 min old (the lock-staleness window — older means
+               # abandoned). Unreadable status fails open: dispatch.
+               git fetch -q origin "$BRANCH" 2>/dev/null || true
+               BUILD_STATUS=$(git ls-tree -r --name-only "origin/$BRANCH" -- docs/plans 2>/dev/null | grep -E "/logs/$FID/status\.jsonl$" | sort | tail -1 || true)
+               if [ -n "$BUILD_STATUS" ]; then
+                 BUILD_AGE=$(git show "origin/$BRANCH:$BUILD_STATUS" 2>/dev/null | jq -rs '[.[] | select(.workflow=="build")] | sort_by(.at) as $r | ($r | map(select(.type=="workflow-started" or .type=="workflow-done" or .type=="workflow-failed")) | last | .type) as $t | if $t=="workflow-started" then (now - ($r | last | .at | fromdateiso8601) | floor) else empty end' 2>/dev/null || true)
+                 if [ -n "$BUILD_AGE" ] && [ "$BUILD_AGE" -lt 1800 ]; then
+                   echo "::notice::Build for $FID still running on $BRANCH (last row ${BUILD_AGE}s ago) — no-op exit; the build owns the branch."
+                   echo "skip=true" >> "$GITHUB_OUTPUT"
+                   exit 0
+                 fi
+               fi
+
+               # feat/** is NOT capped here: pre-merge, PR-scoped, bounded by
+               # the debug workflow's fix and soak limits, which count across
+               # every debug run of the FID. The dev arm above is the only
+               # capped surface.
+             fi
+           fi
+           # Guard: arg must be alphanumeric/dash/dot/slash (numeric PR/issue ids + FIDs like
+           # 245-opencode-provider-host). workflow_dispatch inputs.issue flows unsanitized into
+           # both runner jobs' model prompt — reject anything else (prompt-injection guard).
+           if ! [[ "$ARG" =~ ^[0-9A-Za-z._/-]+$ ]]; then
+             echo "::error::Invalid arg value '${ARG}' — aborting." >&2
+             exit 1
+           fi
+           {
+             echo "skip=false"
+             echo "phase=$PHASE"
+             echo "arg=$ARG"
+           } >> "$GITHUB_OUTPUT"
+
+   # ---------------------------------------------------------------------------
+   # claude job — dispatch via claude-code-action@v1 (ANTHROPIC_API_KEY or federation).
+   # Runs only when the context job found a claude credential and resolved a phase.
+   # OIDC auth via Claude GitHub App (id-token: write); requires one-time
+   # `/install-github-app` in the consumer repo.
+   # ---------------------------------------------------------------------------
+   run:
+     name: claude (${{ github.event_name }})
+     needs: context
+     if: needs.context.outputs.claude == 'true' && needs.context.outputs.skip != 'true'
+     runs-on: {{CLOUD_RUNNER}}
+     permissions:
+       contents: write
+       pull-requests: write
+       issues: write
+       actions: read
+       # id-token: write — required for claude-code-action@v1 to authenticate as the
+       # Claude GitHub App via OIDC (getOidcToken), and for the federation token exchange.
+       id-token: write
+     steps:
+       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+         with:
+           # Check out `dev` at the workspace root: the cloud orchestrator writes its own
+           # `cloud` run to dev's `status.jsonl`, and the dispatched phase skill creates its
+           # own `feat/{FID}` worktree under `.worktrees/`. ship/debug then read+write
+           # their branch-local `status.jsonl` on `feat/{FID}` (worktree-prefer at Step 1);
+           # design/plan/build start from dev. NDJSON + `*.jsonl merge=union` keeps it merge-safe.
+           ref: dev
+           fetch-depth: 0
+           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
+           token: ${{ github.token }}
+
+       # Installs the vale binary for bkit-cloud-bootstrap.sh's `vale sync` and the dispatched
+       # phase's lint:prose (as the cloud.md web env's setup script does). Pinned tarball +
+       # SHA mirror bkit-ci.yml.
+       - name: Install vale
+         env:
+           # renovate: datasource=github-releases depName=errata-ai/vale
+           VALE_VERSION: "3.9.1"
+           VALE_SHA256: "fbc2eb47d0b8c50220ed1a2c5c611fbe0904ed567d638143d482016a18fd2db0"
+         run: |
+           curl -fsSL --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -o "$RUNNER_TEMP/vale.tar.gz"
+           echo "${VALE_SHA256}  $RUNNER_TEMP/vale.tar.gz" | sha256sum -c -
+           tar -xzf "$RUNNER_TEMP/vale.tar.gz" -C "$RUNNER_TEMP" vale
+           echo "$RUNNER_TEMP" >> "$GITHUB_PATH"
+
+       - name: Configure git user
+         run: |
+           git config user.name 'bkit-auto[bot]'
+           git config user.email 'bkit-auto@users.noreply.github.com'
+
+       - name: Dispatch /bkit-auto on Claude Code runner
+         uses: anthropics/claude-code-action@1d6de8cb0c237e7c15e9e1bdf973826ebae490cc # v1.0.248
+         with:
+           # Orchestrator contract: `/bkit-auto <phase> <arg>` where <arg> is the open
+           # PR number (ship/debug) or the tracker issue number/id (design/plan/build).
+           # The context job validated arg against its allowlist.
+           prompt: "/bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"
+           # Lock the runner-side session to the same tool surface bkit grants the local
+           # orchestrator. GitHub MCP surface is always available; this workflow is
+           # GitHub-tracker only (cloud=claude requires tracker=github).
+           claude_args: "--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__github__*"
+           # Workload identity federation: the action exchanges this job's GitHub OIDC token
+           # for a short-lived Claude API token. Unset variables pass empty; a set
+           # ANTHROPIC_API_KEY secret takes precedence.
+           anthropic_federation_rule_id: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
+           anthropic_organization_id: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
+           anthropic_service_account_id: ${{ vars.ANTHROPIC_SERVICE_ACCOUNT_ID }}
+           anthropic_workspace_id: ${{ vars.ANTHROPIC_WORKSPACE_ID }}
+         env:
+           ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+           GH_TOKEN: ${{ github.token }}
+
+   # ---------------------------------------------------------------------------
+   # opencode job — dispatch via `opencode run` CLI (OPENCODE_PROVIDER_KEY required).
+   # Runs only when the context job found OPENCODE_PROVIDER_KEY set and resolved a phase.
+   # The committed .opencode/opencode.json provides provider config + model pins —
+   # no model is hard-coded in this YAML. No OIDC / Claude identity.
+   # OPENCODE_PROVIDER_KEY is fanned out to all known provider env var names so the
+   # opencode.json ${VAR} reference resolves regardless of which provider is installed.
+   # ---------------------------------------------------------------------------
+   opencode:
+     name: opencode (${{ github.event_name }})
+     needs: context
+     if: needs.context.outputs.opencode == 'true' && needs.context.outputs.skip != 'true'
+     runs-on: {{CLOUD_RUNNER}}
+     permissions:
+       contents: write
+       pull-requests: write
+       issues: write
+       actions: read
+     steps:
+       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+         with:
+           ref: dev
+           fetch-depth: 0
+           token: ${{ github.token }}
+
+       - name: Configure git user
+         run: |
+           git config user.name 'bkit-auto[bot]'
+           git config user.email 'bkit-auto@users.noreply.github.com'
+
+       - name: Install opencode
+         run: |
+           # Version-pinned. No updater bumps this pin: take the new version from bkit's
+           # template when `bkit upgrade` lists this file, or bump it by hand.
+           # 2.0.x ships ONLY on npm as `@opencode/cli` — there is no 2.x GitHub release (latest
+           # is v1.19.0), so the curl installer (https://opencode.ai/install downloads GitHub
+           # release binaries) cannot fetch 2.0.26. npm's postinstall selects the runner's
+           # platform binary.
+           # renovate: datasource=npm depName=@opencode/cli
+           npm install -g @opencode/cli@2.0.26
+           echo "$(npm prefix -g)/bin" >> "$GITHUB_PATH"
+
+       - name: Dispatch /bkit-auto on opencode runner
+         env:
+           GH_TOKEN: ${{ github.token }}
+           # Fan out the single OPENCODE_PROVIDER_KEY secret to every supported cloud provider's
+           # env var name, so the committed .opencode/opencode.json {env:VAR} reference resolves
+           # regardless of which provider the consumer installed (openrouter/ollama/opencode).
+           # `opencode` (the opencode-native Zen gateway) reads BKIT_OPENCODE_API_KEY. No Claude
+           # identity leak — ANTHROPIC_API_KEY is absent.
+           BKIT_OPENROUTER_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           BKIT_OLLAMA_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           BKIT_OPENCODE_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           # Pass phase/arg via env to avoid ${{ }} expansion in run: shell string (injection guard).
+           BKIT_PHASE: ${{ needs.context.outputs.phase }}
+           BKIT_ARG: ${{ needs.context.outputs.arg }}
+         run: |
+           opencode run "/bkit-auto $BKIT_PHASE $BKIT_ARG"
+

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:1898:19
    1896|
    1897|     const cloud = fs.readFileSync(path.join(WF, "bkit-cloud.yml"), "ut…
    1898|     expect(cloud).toContain("name: bkit-cloud-context (${{ github.even…
       |                   ^
    1899|     expect(cloud).toContain("name: bkit-cloud-claude (${{ github.event…
    1900|     expect(cloud).toContain("name: bkit-cloud-opencode (${{ github.eve…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix
AssertionError: expected '[bkit-install] core: .bkit/authoring.…' to contain 'Trivy / trivy'

- Expected
+ Received

- Trivy / trivy
+ [bkit-install] core: .bkit/authoring.md
+ [bkit-install] core: .bkit/cloud.md
+ [bkit-install] core: .bkit/cli.md
+ [bkit-install] core: .bkit/comparison.md
+ [bkit-install] core: .bkit/install.md
+ [bkit-install] core: .bkit/jsonl.md
+ [bkit-install] core: .bkit/LICENSE.md
+ [bkit-install] core: .bkit/pipeline.md
+ [bkit-install] core: .bkit/providers.md
+ [bkit-install] core: .bkit/prompts.md
+ [bkit-install] core: .bkit/router.md
+ [bkit-install] core: .bkit/templates.md
+ [bkit-install] core: .bkit/trackers.md
+ [bkit-install] core: .bkit/workflows.md
+ [bkit-install] core: .bkit/README.md

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:1916:18
    1914|     run();
    1915|     const text = out();
    1916|     expect(text).toContain("Trivy / trivy");
       |                  ^
    1917|     expect(text).toContain("bkit-trivy / bkit-trivy");
    1918|     expect(text).toContain("Renovate / renovate");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one
AssertionError: expected '# Example. Copy into the repo and own…' to contain 'name: bkit-cloud-context ('

- Expected
+ Received

- name: bkit-cloud-context (
+ # Example. Copy into the repo and own it.
+ # bkit install does not write this file and does not overwrite a copy.
+ name: bkit-cloud
+
+ # Phase-routed cloud-agent workflow. One `context` job resolves the phase and its
+ # argument, then TWO dispatch jobs — `claude` (via claude-code-action@v1) and `opencode`
+ # (via the opencode CLI `run` subcommand) — run the same `/bkit-auto <phase> <arg>`
+ # orchestrator against the committed `.claude/` / `.opencode/` config respectively.
+ #
+ # RUNTIME GATING — credential-presence auto-detect (in the context job):
+ #   - ANTHROPIC_API_KEY secret set, OR both ANTHROPIC_FEDERATION_RULE_ID and
+ #     ANTHROPIC_ORGANIZATION_ID repo variables set → claude job runs.
+ #   - OPENCODE_PROVIDER_KEY set → opencode job runs.
+ #   Both can run on one event (additive); a missing credential skips that job (zero
+ #   billable runner minutes).
+ #
+ # Trigger surfaces:
+ #   - workflow_run (CI completion on feat/**): success -> ship, failure -> debug
+ #   - workflow_run (CI completion on dev): success -> no-op (regression check passed),
+ #     failure -> /bkit-debug {FID} (FID recovered from squash-merge commit scope;
+ #     capped at debug fix + soak maxAttempts dispatches). [skip ci] close commits never trigger CI.
+ #   - workflow_dispatch: pick ANY phase (ship|debug|design|plan|build) for an issue.
+ #     design/plan/build have no tracker-event trigger; they run only via dispatch.
+ #
+ # Required credentials (claude job): Claude GitHub App (one-time `/install-github-app`;
+ #   claude-code-action@v1 authenticates as the App via `id-token: write` OIDC) + ONE of:
+ #   - ANTHROPIC_API_KEY repo secret, or
+ #   - workload identity federation (keyless): ANTHROPIC_FEDERATION_RULE_ID +
+ #     ANTHROPIC_ORGANIZATION_ID repo variables (+ optional ANTHROPIC_SERVICE_ACCOUNT_ID /
+ #     ANTHROPIC_WORKSPACE_ID) from a Claude Console federation rule. A set
+ #     ANTHROPIC_API_KEY secret wins over federation — delete it when switching.
+ # Required secrets (opencode job): OPENCODE_PROVIDER_KEY (any provider key the
+ #   committed .opencode/opencode.json references; fan-out maps it to known env var names).
+ # Required tracker label on the issue: `bkit:auto` (opt-in) for the CI-driven path.
+ # Docs: bkit's cloud.md § Post-CI auto-routing.
+
+ on:
+   workflow_run:
+     workflows: [bkit-ci]
+     branches: ['feat/**', 'dev']
+     types: [completed]
+   workflow_dispatch:
+     inputs:
+       phase:
+         description: 'bkit phase to run'
+         required: true
+         type: choice
+         options:
+           - ship
+           - debug
+           - design
+           - plan
+           - build
+       issue:
+         description: 'Tracker issue number/id supplying the brief'
+         required: true
+         type: string
+
+ # Dynamic run name (shown in the Actions runs list). Dispatched runs render
+ # `bkit auto <phase>(<issue>)`; CI-driven runs echo the triggering commit subject
+ # (`head_commit.message` — already `{type}({scope}): {message}`) prefixed with `bkit auto`.
+ run-name: >-
+   ${{ inputs.phase
+       && format('bkit auto {0}({1})', inputs.phase, inputs.issue)
+       || format('bkit auto {0}', github.event.workflow_run.head_commit.message) }}
+
+ concurrency:
+   # Serialises concurrent runs WITHIN each trigger surface:
+   #   - dispatch path  keys on inputs.issue     (e.g. bkit-auto-141)
+   #   - CI-completion  keys on head_branch       (e.g. bkit-auto-feat/141-cloud-app)
+   # The two keys never match for one FID, so a dispatched build and the auto-ship it
+   # triggers do not share a group; the orchestrator stale-run guard + the per-feature
+   # workflow lock (`bkit locks acquire`, `logs/{FID}/.lock`) handle that race (not this
+   # concurrency key).
+   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
+   # dev: queue, not cancel. With cancel-in-progress: false, GHA queues at most one
+   # pending run per group (older pendings are cancelled as newer ones arrive); the
+   # queued run re-evaluates the dispatch cap at its ctx step when it starts.
+   # feat/** cancels (latest wins). `bkit-auto-dev` is ONE group shared by ALL FIDs
+   # (concurrency.group resolves from the trigger payload, before the ctx step derives
+   # the FID): if two DIFFERENT FIDs' dev CI runs fail near-simultaneously, the older
+   # pending run can be dropped. The ctx step's stale-run guard then writes a
+   # `dev-dispatch-dropped` row to the job summary + a `::warning::`.
+   cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
+
+ jobs:
+   # ---------------------------------------------------------------------------
+   # context job — checks which runner secrets are set and resolves phase + arg ONCE
+   # for both runner jobs. CI-driven runs fire only on terminal CI conclusions (skip
+   # cancelled / skipped). Free-tier gate: CI-driven runs additionally require
+   # 'bkit [auto route]' in the head commit message — zero runner minutes if the marker
+   # is absent (no opted-in close-workflow HEAD). Dispatched runs always proceed. When
+   # this job is skipped, both runner jobs are skipped with it.
+   # ---------------------------------------------------------------------------
+   context:
+     name: context (${{ github.event_name }})
+     if: >-
+       github.event_name == 'workflow_dispatch'
+       || (
+       github.event.workflow_run.head_repository.full_name == github.repository
+       && (github.event.workflow_run.conclusion == 'success' || github.event.workflow_run.conclusion == 'failure')
+       && contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')
+       && !(github.event.workflow_run.head_branch == 'dev' && github.event.workflow_run.conclusion == 'success')
+       )
+     runs-on: {{CLOUD_RUNNER}}
+     permissions:
+       # contents: write — the dev arm commits its dispatch-cap counter row to dev.
+       contents: write
+       pull-requests: read
+       issues: read
+       actions: read
+     outputs:
+       claude: ${{ steps.gate.outputs.claude }}
+       opencode: ${{ steps.gate.outputs.opencode }}
+       skip: ${{ steps.ctx.outputs.skip }}
+       phase: ${{ steps.ctx.outputs.phase }}
+       arg: ${{ steps.ctx.outputs.arg }}
+     steps:
+       # A runner job whose credential is missing is a no-op; with neither job enabled,
+       # nothing below runs (no counter row, no checkout).
+       - name: Check runner credentials
+         id: gate
+         env:
+           ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+           ANTHROPIC_FEDERATION_RULE_ID: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
+           ANTHROPIC_ORGANIZATION_ID: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
+           OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+         run: |
+           claude=false
+           opencode=false
+           if [ -n "$ANTHROPIC_API_KEY" ]; then
+             claude=true
+           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ] && [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
+             claude=true
+           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ]; then
+             echo "::notice::ANTHROPIC_ORGANIZATION_ID repo variable not set — federation needs it alongside ANTHROPIC_FEDERATION_RULE_ID; claude job no-op."
+           elif [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
+             echo "::notice::ANTHROPIC_FEDERATION_RULE_ID repo variable not set — federation needs it alongside ANTHROPIC_ORGANIZATION_ID; claude job no-op."
+           else
+             echo "::notice::Neither the ANTHROPIC_API_KEY secret nor the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables are set — claude job no-op."
+           fi
+           if [ -n "$OPENCODE_PROVIDER_KEY" ]; then
+             opencode=true
+           else
+             echo "::notice::OPENCODE_PROVIDER_KEY not set — opencode job no-op."
+           fi
+           enabled=false
+           if [ "$claude" = true ] || [ "$opencode" = true ]; then enabled=true; fi
+           {
+             echo "claude=$claude"
+             echo "opencode=$opencode"
+             echo "enabled=$enabled"
+           } >> "$GITHUB_OUTPUT"
+
+       # SHA pins in this file — your updater refreshes them in your copy (keep this file out
+       # of renovate.json5 `ignorePaths`); `bkit upgrade` lists this template when bkit's pins move.
+       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+         if: steps.gate.outputs.enabled == 'true'
+         with:
+           # `dev` at the workspace root: the dev arm's dispatch-cap counter row is
+           # committed to dev's `status.jsonl`; the feat/** arm reads the branch's
+           # `status.jsonl` from origin.
+           ref: dev
+           fetch-depth: 0
+           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
+           token: ${{ github.token }}
+
+       - name: Configure git user
+         if: steps.gate.outputs.enabled == 'true'
+         run: |
+           git config user.name 'bkit-auto[bot]'
+           git config user.email 'bkit-auto@users.noreply.github.com'
+
+       - name: Resolve phase + brief context
+         id: ctx
+         if: steps.gate.outputs.enabled == 'true'
+         env:
+           GH_TOKEN: ${{ github.token }}
+           EVENT: ${{ github.event_name }}
+           IN_PHASE: ${{ inputs.phase }}
+           IN_ISSUE: ${{ inputs.issue }}
+           CONCLUSION: ${{ github.event.workflow_run.conclusion }}
+           BRANCH: ${{ github.event.workflow_run.head_branch }}
+           COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}
+           HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
+         run: |
+           set -euo pipefail
+           # Cloud runs serve the GitHub tracker only: Linear cloud runs start from Cursor's
+           # Linear integration, and Jira runs locally only. Unset tracker → continue.
+           TRACKER=$(jq -r '.bkit.tracker.default // empty | strings' package.json 2>/dev/null || true)
+           if [ -n "$TRACKER" ] && [ "$TRACKER" != "github" ]; then
+             echo "::notice::bkit.tracker.default is '$TRACKER' — bkit-cloud.yml serves the GitHub tracker only; no-op exit."
+             echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+           fi
+           if [ "$EVENT" = "workflow_dispatch" ]; then
+             # Dispatched: phase + issue come straight from inputs.
+             PHASE="$IN_PHASE"
+             ARG="$IN_ISSUE"
+             FID="$IN_ISSUE"
+           else
+             # CI-driven: success -> ship, failure -> debug; route by branch + conclusion.
+             case "$CONCLUSION" in
+               success) PHASE=ship ;;
+               failure) PHASE=debug ;;
+               *) echo "::notice::Non-terminal CI conclusion '$CONCLUSION' — no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0 ;;
+             esac
+
+             # SHARED-DERIV: FID/ISSUE recovery + dispatch-cap machinery for both
+             # CI-driven trigger surfaces (feat/** pre-merge, dev post-merge).
+
+             # bkit_dev_dispatch_guard <FID> <HEAD_SHA> — cap-check +
+             # counter-write + fail-closed-verify for the post-merge debug
+             # surface (dev CI failure). One post-feat/** debug budget per FID.
+             # Returns 1 (caller must skip) once the FID has DEBUG_CAP distinct
+             # failed-CI SHAs recorded — DEBUG_CAP = package.json
+             # bkit.workflows.debug fix + soak maxAttempts (2 each when unset or
+             # not a whole number of 1 or more; the engine falls back the same
+             # way) — every debug run makes at least one attempt, so more
+             # dispatches could never run one — or if the counter row
+             # cannot be durably landed on origin/dev (fail-closed: one push
+             # retry against a re-fetched dev, then VERIFY landing before
+             # proceeding). Returns 0 to proceed to dispatch.
+             bkit_dev_dispatch_guard() {
+               local guard_fid="$1" guard_head_sha="$2"
+               # assert the FID against the same slug allowlist the dev arm
+               # already enforces BEFORE it's used to build any path (find -path /
+               # mkdir -p / git commit -m). Defence-in-depth re-check for the
+               # PR-body marker path (bkit:fid=<anything up to whitespace/'>'>
+               # admits '/', '.', '..').
+               if ! [[ "$guard_fid" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 echo "::notice::Invalid FID '$guard_fid' — refusing to write dev-dispatch counter (fail-closed)."
+                 return 1
+               fi
+               # The caller invokes this function as `... || { skip }`, which
+               # suppresses `set -e` for the whole body. An explicit test, not
+               # `${VAR:?}`: the `:?` expansion exits the whole shell even from
+               # inside a `|| {}`-guarded function. Fail closed when the cap
+               # cannot be read as a whole number.
+               local debug_cap
+               debug_cap=$(jq -r 'def lim($p): ((if ($p | type) == "object" then $p.maxAttempts else null end) // 2) | if type == "number" and . >= 1 and floor == . then . else 2 end;
+                 (.bkit.workflows.debug // {}) as $d | lim($d.fix // {}) + lim($d.soak // {})' package.json 2>/dev/null || true)
+               case "${debug_cap:-}" in
+                 '' | *[!0-9]*)
+                   echo "::notice::package.json bkit.workflows.debug limits are unreadable — refusing to dispatch uncounted (fail-closed)."
+                   return 1
+                   ;;
+               esac
+               local status_dir status_file dev_count parent_sha landed
+               # `sort` makes the month-bucket choice deterministic.
+               status_dir=$(find docs/plans -mindepth 3 -maxdepth 3 -type d -path "docs/plans/*/logs/$guard_fid" 2>/dev/null | sort | head -1 || true)
+               [ -n "$status_dir" ] && status_dir="${status_dir}/"
+               if [ -z "$status_dir" ]; then
+                 status_dir="docs/plans/$(date -u +%Y%m)/logs/$guard_fid/"
+               fi
+               mkdir -p "$status_dir"
+               status_file="${status_dir}status.jsonl"
+               dev_count=0
+               # distinguish "no rows" from "cannot parse" — a truncated
+               # line, stray non-JSON row, or merge=union conflict artefact in the
+               # shared status.jsonl must NOT silently degrade to dev_count=0.
+               # Only an absent file is a legitimate zero.
+               if [ -f "$status_file" ]; then
+                 if ! dev_count=$(jq -s --arg f "$guard_fid" \
+                   '[.[] | select(.type=="dev-dispatch" and .fid==$f) | .headSha] | unique | length' \
+                   "$status_file" 2>/dev/null); then
+                   echo "::notice::$status_file is unparseable — refusing to dispatch for $guard_fid uncounted (fail-closed)."
+                   return 1
+                 fi
+               fi
+               if [ "$dev_count" -ge "$debug_cap" ]; then
+                 echo "::notice::FID $guard_fid exhausted $debug_cap dev-triggered debug dispatches — operator review required (delete dev-dispatch rows in status.jsonl to reset)."
+                 return 1
+               fi
+               parent_sha=$(git -C "$GITHUB_WORKSPACE" rev-parse origin/dev 2>/dev/null || echo "")
+               jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$guard_fid" --arg h "$guard_head_sha" --arg p "$parent_sha" \
+                 '{type:"dev-dispatch", workflow:"auto", at:$t, fid:$f, headSha:$h, parentSha:$p}' \
+                 >> "$status_file"
+               git -C "$GITHUB_WORKSPACE" add -- "$status_file"
+               git -C "$GITHUB_WORKSPACE" commit -m "docs($guard_fid): dev-dispatch telemetry [skip ci]" -- "$status_file"
+               if ! git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null; then
+                 git -C "$GITHUB_WORKSPACE" fetch origin dev
+                 git -C "$GITHUB_WORKSPACE" rebase origin/dev || { git -C "$GITHUB_WORKSPACE" rebase --abort || true; }
+                 git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null || true
+               fi
+               git -C "$GITHUB_WORKSPACE" fetch origin dev
+               # `git show` has its own `|| true` so a missing file does not trip
+               # pipefail across `| jq`.
+               landed=$( (git -C "$GITHUB_WORKSPACE" show "origin/dev:${status_file}" 2>/dev/null || true) \
+                 | jq -s --arg f "$guard_fid" --arg h "$guard_head_sha" \
+                     '[.[] | select(.type=="dev-dispatch" and .fid==$f and .headSha==$h)] | length' 2>/dev/null || echo 0)
+               if [ "${landed:-0}" -lt 1 ]; then
+                 echo "::notice::dev-dispatch row for $guard_fid @ $guard_head_sha is not on origin/dev after retry — refusing to dispatch uncounted (fail-closed). Resolve the dev push contention and re-run via workflow_dispatch."
+                 return 1
+               fi
+               return 0
+             }
+
+             if [ "$BRANCH" = "dev" ]; then
+               # Post-merge dev CI — no open PR. Recover FID from squash-merge commit
+               # scope. dev success = regression check passed = no-op (the merge
+               # already happened).
+               if [ "$PHASE" = "ship" ]; then
+                 echo "::notice::dev CI passed — post-merge regression check OK, no-op exit."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # PHASE=debug below.
+               # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
+               # Shape-tolerant: the regex accepts BOTH GitHub
+               # (363-slug) and Linear (bar-123-slug) FID SHAPES, mirroring the
+               # alternation the feat/** fallback below uses. The kill switch
+               # below (`gh issue view "$ISSUE"`) is GitHub-Issues-only, so a
+               # Linear FID no-ops there (empty labels -> bkit:auto absent).
+               # `head -1` FIRST — head_commit.message is subject+body and
+               # grep's `^` anchors per line, so without it a squash body line
+               # (GitHub's default body is the list of source commit subjects)
+               # like "feat(999-other): ..." would win and key the cap counter,
+               # status path and /bkit-debug dispatch to an unrelated feature.
+               FID=$(printf '%s' "$COMMIT_MSG" | head -1 | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
+               if [ -z "$FID" ]; then
+                 # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
+                 # filter to same-repo MERGED PRs (the endpoint also returns OPEN
+                 # fork PRs at this SHA).
+                 PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" \
+                   --jq '[.[] | select(.head.repo.full_name == env.GITHUB_REPOSITORY and .merged_at != null)] | .[0].body // empty' 2>/dev/null || echo "")
+                 FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
+               fi
+               if [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # `|| true` is load-bearing under `set -euo pipefail` —
+               # this runs BEFORE the slug allowlist, so a non-FID branch
+               # (Renovate, a hand-named hotfix) yields no match,
+               # pipefail propagates grep's exit 1, and the step dies red
+               # instead of reaching the designed no-op exit just below.
+               ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+               ARG="$FID"
+               # Kill switch: re-check bkit:auto on the issue (live revocation).
+               # exact label match, not substring. MUST precede the stale-run
+               # guard and the dispatch-cap guard below; it needs nothing they set.
+               if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
+                 echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # Stale-run guard: HEAD_SHA is current iff it is the headSha of the
+               # most recent COMPLETED CI run on dev ([skip ci] close commits never
+               # appear in gh run list). --workflow bkit-ci.yml (filename), not `bkit-ci`
+               # (display name).
+               LATEST_CI_SHA=$(gh run list --branch dev --workflow bkit-ci.yml --status completed --limit 10 \
+                 --json headSha --jq '.[0].headSha // empty' 2>/dev/null || echo "")
+               # an empty LATEST_CI_SHA disables the staleness check (fail-open)
+               # and emits a ::warning:: naming the bkit-ci.yml filename requirement.
+               if [ -z "$LATEST_CI_SHA" ]; then
+                 echo "::warning::gh run list --branch dev --workflow bkit-ci.yml returned no completed runs — stale-run guard disabled for this dispatch (proceeding, fail-open). If this persists, verify the consumer CI workflow file is named bkit-ci.yml (\`gh workflow view ci.yml\`)."
+               fi
+               if [ -n "$LATEST_CI_SHA" ] && [ "$HEAD_SHA" != "$LATEST_CI_SHA" ]; then
+                 # A DIFFERENT FID's dev CI failure may have superseded this run
+                 # in the shared `bkit-auto-dev` concurrency group; this FID's
+                 # post-merge failure is dropped here. The drop is recorded in the
+                 # RUN SUMMARY, never as a committed status.jsonl row (dev already
+                 # advanced).
+                 DROP_ROW=$(jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$FID" --arg h "$HEAD_SHA" --arg latest "$LATEST_CI_SHA" \
+                   '{type:"dev-dispatch-dropped", workflow:"auto", at:$t, fid:$f, headSha:$h, latestSha:$latest}')
+                 {
+                   echo "### bkit dev-dispatch dropped"
+                   echo ""
+                   echo "FID \`$FID\` had a post-merge \`dev\` CI failure that was superseded before dispatch."
+                   echo ""
+                   echo '```json'
+                   echo "$DROP_ROW"
+                   echo '```'
+                 } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
+                 echo "::warning::Stale dev CI (head_sha=$HEAD_SHA, latest completed dev CI head=$LATEST_CI_SHA) for FID $FID — no-op exit. This FID's post-merge CI failure may have been superseded by a DIFFERENT FID's dev push under the shared bkit-auto-dev concurrency group; see this run's job summary (dev-dispatch-dropped) if this FID does not otherwise recover."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
+               fi
+               # Loop cap + counter write (fail-closed).
+               bkit_dev_dispatch_guard "$FID" "$HEAD_SHA" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
+             else
+               # feat/** pre-merge path (PR-backed FID recovery).
+               PR_NUMBER=$(gh pr list --head "$BRANCH" --base dev --state open --json number --jq '.[0].number // empty')
+               if [ -z "$PR_NUMBER" ]; then
+                 echo "::notice::No open PR for branch $BRANCH — no-op exit."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"
+                 exit 0
+               fi
+               ARG="$PR_NUMBER"
+
+               # PRIMARY: parse the bkit:issue / bkit:fid markers shipped in every
+               # bkit-build PR body. Also assert the marker-derived FID
+               # against the slug allowlist here — bkit:fid=[^[:space:]>]+ admits
+               # '/', '.', '..' and glob metacharacters, so an unvalidated match
+               # falls through to path construction (find -path / mkdir -p / git
+               # commit) in bkit_dev_dispatch_guard below. A mismatch falls through
+               # to the branch fallback exactly like an empty/missing marker.
+               PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
+               ISSUE=$(echo "$PR_BODY" | grep -oE 'bkit:issue=#[0-9]+' | sed 's/bkit:issue=#//' | head -1 || true)
+               FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
+               if [ -z "$ISSUE" ] || [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 # FALLBACK: extract FID from the branch name (feat/{FID}) when the
+                 # PR body carries no usable bkit:fid= marker.
+                 # keep the FULL slug (do NOT collapse to the leading
+                 # numeric/alpha id, e.g. '363' instead of
+                 # '363-widen-bkit-cloud-trigger'). ISSUE (short
+                 # numeric/alpha prefix, used only for `gh issue view`) is derived
+                 # FROM the full FID, not the other way round. NOTE the '#' sed
+                 # delimiter: with '|' the alternation would need escaping and is
+                 # ambiguous under -E.
+                 FID=$(echo "$BRANCH" | sed -E 's#^feat/##')
+                 # `|| true` is load-bearing under `set -euo pipefail` —
+               # this runs BEFORE the slug allowlist, so a non-FID branch
+               # (Renovate, a hand-named hotfix) yields no match,
+               # pipefail propagates grep's exit 1, and the step dies red
+               # instead of reaching the designed no-op exit just below.
+               ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1 || true)
+               fi
+               if [ -z "$FID" ] || [ -z "$ISSUE" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
+                 echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"
+                 exit 0
+               fi
+
+               # Cheap-tier kill switch: re-check bkit:auto on the issue (live revocation).
+               # exact label match, not substring.
+               if ! gh issue view "$ISSUE" --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto'; then
+                 echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
+                 echo "skip=true" >> "$GITHUB_OUTPUT"
+                 exit 0
+               fi
+
+               # A build still writing this branch owns it: no-op exit. "Still
+               # running" = the branch's status.jsonl has a build workflow-started
+               # with no later workflow-done / workflow-failed AND its newest build
+               # row is under 30 min old (the lock-staleness window — older means
+               # abandoned). Unreadable status fails open: dispatch.
+               git fetch -q origin "$BRANCH" 2>/dev/null || true
+               BUILD_STATUS=$(git ls-tree -r --name-only "origin/$BRANCH" -- docs/plans 2>/dev/null | grep -E "/logs/$FID/status\.jsonl$" | sort | tail -1 || true)
+               if [ -n "$BUILD_STATUS" ]; then
+                 BUILD_AGE=$(git show "origin/$BRANCH:$BUILD_STATUS" 2>/dev/null | jq -rs '[.[] | select(.workflow=="build")] | sort_by(.at) as $r | ($r | map(select(.type=="workflow-started" or .type=="workflow-done" or .type=="workflow-failed")) | last | .type) as $t | if $t=="workflow-started" then (now - ($r | last | .at | fromdateiso8601) | floor) else empty end' 2>/dev/null || true)
+                 if [ -n "$BUILD_AGE" ] && [ "$BUILD_AGE" -lt 1800 ]; then
+                   echo "::notice::Build for $FID still running on $BRANCH (last row ${BUILD_AGE}s ago) — no-op exit; the build owns the branch."
+                   echo "skip=true" >> "$GITHUB_OUTPUT"
+                   exit 0
+                 fi
+               fi
+
+               # feat/** is NOT capped here: pre-merge, PR-scoped, bounded by
+               # the debug workflow's fix and soak limits, which count across
+               # every debug run of the FID. The dev arm above is the only
+               # capped surface.
+             fi
+           fi
+           # Guard: arg must be alphanumeric/dash/dot/slash (numeric PR/issue ids + FIDs like
+           # 245-opencode-provider-host). workflow_dispatch inputs.issue flows unsanitized into
+           # both runner jobs' model prompt — reject anything else (prompt-injection guard).
+           if ! [[ "$ARG" =~ ^[0-9A-Za-z._/-]+$ ]]; then
+             echo "::error::Invalid arg value '${ARG}' — aborting." >&2
+             exit 1
+           fi
+           {
+             echo "skip=false"
+             echo "phase=$PHASE"
+             echo "arg=$ARG"
+           } >> "$GITHUB_OUTPUT"
+
+   # ---------------------------------------------------------------------------
+   # claude job — dispatch via claude-code-action@v1 (ANTHROPIC_API_KEY or federation).
+   # Runs only when the context job found a claude credential and resolved a phase.
+   # OIDC auth via Claude GitHub App (id-token: write); requires one-time
+   # `/install-github-app` in the consumer repo.
+   # ---------------------------------------------------------------------------
+   run:
+     name: claude (${{ github.event_name }})
+     needs: context
+     if: needs.context.outputs.claude == 'true' && needs.context.outputs.skip != 'true'
+     runs-on: {{CLOUD_RUNNER}}
+     permissions:
+       contents: write
+       pull-requests: write
+       issues: write
+       actions: read
+       # id-token: write — required for claude-code-action@v1 to authenticate as the
+       # Claude GitHub App via OIDC (getOidcToken), and for the federation token exchange.
+       id-token: write
+     steps:
+       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+         with:
+           # Check out `dev` at the workspace root: the cloud orchestrator writes its own
+           # `cloud` run to dev's `status.jsonl`, and the dispatched phase skill creates its
+           # own `feat/{FID}` worktree under `.worktrees/`. ship/debug then read+write
+           # their branch-local `status.jsonl` on `feat/{FID}` (worktree-prefer at Step 1);
+           # design/plan/build start from dev. NDJSON + `*.jsonl merge=union` keeps it merge-safe.
+           ref: dev
+           fetch-depth: 0
+           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
+           token: ${{ github.token }}
+
+       # Installs the vale binary for bkit-cloud-bootstrap.sh's `vale sync` and the dispatched
+       # phase's lint:prose (as the cloud.md web env's setup script does). Pinned tarball +
+       # SHA mirror bkit-ci.yml.
+       - name: Install vale
+         env:
+           # renovate: datasource=github-releases depName=errata-ai/vale
+           VALE_VERSION: "3.9.1"
+           VALE_SHA256: "fbc2eb47d0b8c50220ed1a2c5c611fbe0904ed567d638143d482016a18fd2db0"
+         run: |
+           curl -fsSL --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -o "$RUNNER_TEMP/vale.tar.gz"
+           echo "${VALE_SHA256}  $RUNNER_TEMP/vale.tar.gz" | sha256sum -c -
+           tar -xzf "$RUNNER_TEMP/vale.tar.gz" -C "$RUNNER_TEMP" vale
+           echo "$RUNNER_TEMP" >> "$GITHUB_PATH"
+
+       - name: Configure git user
+         run: |
+           git config user.name 'bkit-auto[bot]'
+           git config user.email 'bkit-auto@users.noreply.github.com'
+
+       - name: Dispatch /bkit-auto on Claude Code runner
+         uses: anthropics/claude-code-action@1d6de8cb0c237e7c15e9e1bdf973826ebae490cc # v1.0.248
+         with:
+           # Orchestrator contract: `/bkit-auto <phase> <arg>` where <arg> is the open
+           # PR number (ship/debug) or the tracker issue number/id (design/plan/build).
+           # The context job validated arg against its allowlist.
+           prompt: "/bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"
+           # Lock the runner-side session to the same tool surface bkit grants the local
+           # orchestrator. GitHub MCP surface is always available; this workflow is
+           # GitHub-tracker only (cloud=claude requires tracker=github).
+           claude_args: "--allowed-tools=Bash,Edit,Write,Read,Grep,Glob,WebFetch,Skill,mcp__github__*"
+           # Workload identity federation: the action exchanges this job's GitHub OIDC token
+           # for a short-lived Claude API token. Unset variables pass empty; a set
+           # ANTHROPIC_API_KEY secret takes precedence.
+           anthropic_federation_rule_id: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
+           anthropic_organization_id: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
+           anthropic_service_account_id: ${{ vars.ANTHROPIC_SERVICE_ACCOUNT_ID }}
+           anthropic_workspace_id: ${{ vars.ANTHROPIC_WORKSPACE_ID }}
+         env:
+           ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+           GH_TOKEN: ${{ github.token }}
+
+   # ---------------------------------------------------------------------------
+   # opencode job — dispatch via `opencode run` CLI (OPENCODE_PROVIDER_KEY required).
+   # Runs only when the context job found OPENCODE_PROVIDER_KEY set and resolved a phase.
+   # The committed .opencode/opencode.json provides provider config + model pins —
+   # no model is hard-coded in this YAML. No OIDC / Claude identity.
+   # OPENCODE_PROVIDER_KEY is fanned out to all known provider env var names so the
+   # opencode.json ${VAR} reference resolves regardless of which provider is installed.
+   # ---------------------------------------------------------------------------
+   opencode:
+     name: opencode (${{ github.event_name }})
+     needs: context
+     if: needs.context.outputs.opencode == 'true' && needs.context.outputs.skip != 'true'
+     runs-on: {{CLOUD_RUNNER}}
+     permissions:
+       contents: write
+       pull-requests: write
+       issues: write
+       actions: read
+     steps:
+       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
+         with:
+           ref: dev
+           fetch-depth: 0
+           token: ${{ github.token }}
+
+       - name: Configure git user
+         run: |
+           git config user.name 'bkit-auto[bot]'
+           git config user.email 'bkit-auto@users.noreply.github.com'
+
+       - name: Install opencode
+         run: |
+           # Version-pinned. No updater bumps this pin: take the new version from bkit's
+           # template when `bkit upgrade` lists this file, or bump it by hand.
+           # 2.0.x ships ONLY on npm as `@opencode/cli` — there is no 2.x GitHub release (latest
+           # is v1.19.0), so the curl installer (https://opencode.ai/install downloads GitHub
+           # release binaries) cannot fetch 2.0.26. npm's postinstall selects the runner's
+           # platform binary.
+           # renovate: datasource=npm depName=@opencode/cli
+           npm install -g @opencode/cli@2.0.26
+           echo "$(npm prefix -g)/bin" >> "$GITHUB_PATH"
+
+       - name: Dispatch /bkit-auto on opencode runner
+         env:
+           GH_TOKEN: ${{ github.token }}
+           # Fan out the single OPENCODE_PROVIDER_KEY secret to every supported cloud provider's
+           # env var name, so the committed .opencode/opencode.json {env:VAR} reference resolves
+           # regardless of which provider the consumer installed (openrouter/ollama/opencode).
+           # `opencode` (the opencode-native Zen gateway) reads BKIT_OPENCODE_API_KEY. No Claude
+           # identity leak — ANTHROPIC_API_KEY is absent.
+           BKIT_OPENROUTER_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           BKIT_OLLAMA_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           BKIT_OPENCODE_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+           # Pass phase/arg via env to avoid ${{ }} expansion in run: shell string (injection guard).
+           BKIT_PHASE: ${{ needs.context.outputs.phase }}
+           BKIT_ARG: ${{ needs.context.outputs.arg }}
+         run: |
+           opencode run "/bkit-auto $BKIT_PHASE $BKIT_ARG"
+

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:1933:71
    1931|     put(path.join(WF, "bkit-cloud.yml"), shippedAtV6(".github/workflow…
    1932|     run();
    1933|     expect(fs.readFileSync(path.join(WF, "bkit-cloud.yml"), "utf-8")).…
       |                                                                       ^
    1934|       "name: bkit-cloud-context (",
    1935|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedCheckNames (via runBkitDocs) > rewrites the old health stub in a custom bkit.testing.ciWorkflow file
AssertionError: expected 'name: CI\njobs:\n  a:\n    steps:\n  …' to contain '.bkit/templates/.github/workflows/bki…'

- Expected
+ Received

- .bkit/templates/.github/workflows/bkit-health.yml
+ name: CI
+ jobs:
+   a:
+     steps:
+       - run: true
+ # === JOB 6 ===
+ # bkit-stub:health — copy into .github/workflows/health.yml. workflow_run cannot share a file with
+ # push / pull_request. WHEN: you have a live URL to smoke after CI. Trigger on CI completed, default
+ # branch only, if the CI run succeeded. Then hit the health URL of the deployment this SHA promoted.
+ # e.g. poll the host until that deployment is ready, then GET /health. Not a required check.
+ # DROP if you have no deployed health URL.
+ # tail
+

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:1968:19
    1966|     run();
    1967|     const after = fs.readFileSync(path.join(WF, "ci.yml"), "utf-8");
    1968|     expect(after).toContain(".bkit/templates/.github/workflows/bkit-he…
       |                   ^
    1969|     expect(after).not.toContain("copy into .github/workflows/health.ym…
    1970|     expect(after).toContain("# tail\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:2016:59
    2014|
    2015|     for (const r of ["Filler", "LLMSlop", "Verbose"]) {
    2016|       expect(fs.existsSync(path.join(HOUSE, `${r}.yml`))).toBe(false);
       |                                                           ^
    2017|       expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).to…
    2018|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files
AssertionError: expected '# Example. Copy into the repo and own…' to contain 'Bkit.Filler = NO'

- Expected
+ Received

- Bkit.Filler = NO
+ # Example. Copy into the repo and own it.
+ # bkit install does not write this file and does not overwrite a copy.
+ StylesPath = .vale/styles
+ MinAlertLevel = warning
+ Packages = write-good
+
+ [.agents/**]
+ BasedOnStyles = House
+
+ # Vendored skill content — third-party docs loaded under multiple paths
+ # depending on harness. Each path needs its own scope block.
+ [**/.agents/skills/**/*.md]
+ House.LLMSlop = NO
+ House.Hedging = NO
+ House.Filler = NO
+ House.Verbose = NO
+
+ [**/.claude/skills/**/*.md]
+ House.LLMSlop = NO
+ House.Hedging = NO
+ House.Filler = NO
+ House.Verbose = NO
+
+ [**/.cursor/skills/**/*.md]
+ House.LLMSlop = NO
+ House.Hedging = NO
+ House.Filler = NO
+ House.Verbose = NO
+
+ # Meta-prompt about prose compression: enumerates hedging/verbose phrases
+ # verbatim as examples of what to strip, so House rules self-trigger.
+ [**/bkit-utility-compress-markdown.md]
+ House.LLMSlop = NO
+ House.Hedging = NO
+ House.Filler = NO
+ House.Verbose = NO
+
+ [*.md]
+ BasedOnStyles = write-good, House
+ write-good.ThereIs = warning
+ write-good.Passive = NO
+ write-good.TooWordy = NO
+ write-good.Weasel = NO
+
+ # Plan/working artefacts (docs/plans/YYYYMM/** + nested logs/) intentionally
+ # quote LLM-slop tokens, hedging examples, and conjunction-opener prose as
+ # documentation of what to avoid — linting them produces only false positives.
+ # Vale's empty `BasedOnStyles =` INHERITS from less-specific scopes rather than
+ # disabling, so each rule must be turned off explicitly. Leading `**/` so
+ # lint-staged's absolute paths also match.
+ [**/docs/plans/**/*.md]
+ House.LLMSlop = NO
+ House.Hedging = NO
+ House.Filler = NO
+ House.Verbose = NO
+ write-good.ThereIs = NO
+ write-good.So = NO
+
+ # bkit's reference copies of its templates (.bkit/templates/) — refreshed by
+ # `bkit upgrade`, not this repo's prose. Every rule off, as for docs/plans above.
+ [**/.bkit/templates/**/*.md]
+ House.LLMSlop = NO
+ House.Hedging = NO
+ House.Filler = NO
+ House.Verbose = NO
+ write-good.ThereIs = NO
+ write-good.So = NO
+

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:2033:17
    2031|     run();
    2032|     const ini = fs.readFileSync(".vale.ini", "utf-8");
    2033|     expect(ini).toContain("Bkit.Filler = NO");
       |                 ^
    2034|     expect(ini).toContain("Bkit.LLMSlop = NO");
    2035|     expect(ini).toContain("Bkit.Verbose = NO");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House
Error: ENOENT: no such file or directory, open '.vale/styles/Bkit/Filler.yml'
 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:2052:17
    2050|     run();
    2051|     for (const r of RULES) {
    2052|       expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).to…
       |                 ^
    2053|     }
    2054|     expect(fs.existsSync(HOUSE)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:2066:59
    2064|     const ctx = run();
    2065|     for (const r of RULES) {
    2066|       expect(fs.existsSync(path.join(HOUSE, `${r}.yml`))).toBe(false);
       |                                                           ^
    2067|       expect(fs.readFileSync(path.join(BKIT, `${r}.yml`), "utf-8")).to…
    2068|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 119 passed (127)
   Start at  14:36:23
   Duration  2.10s (tests 97%, transform 1%, import 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5iboOh/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

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

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (63 tests | 3 failed) 37246ms
   ✓ P4.T7 — upgrade integration: heavy-customised-consumer scenario (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 3ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 1ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 2ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 2ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 243ms
     ✓ install --claude does not write Serena or graphify examples 356ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 203ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 210ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 203ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 667ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 649ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 652ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 1159ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 1163ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 1171ms
     ✓ malformed .mcp.json fails install instead of being overwritten 392ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 1002ms
     ✓ an adopted copy of every template survives upgrade and check 1162ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1162ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1157ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 418ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 1521ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 948ms
   ❯ #255 — upgrade does not force-create uninstalled host/tooling modules (11)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 936ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 1262ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 990ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 892ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1408ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1020ms
     ✓ a dry-run hook and CI token migration writes nothing 483ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1328ms
     × a second check-name migration writes nothing 731ms
     × a dry-run check-name migration writes and moves nothing 526ms
     × a second Vale migration and a dry run write nothing 893ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 904ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 871ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 937ms
   ✓ upgrade-preservation (9)
     ✓ upgrade preserves consumer content outside the bkit block (markered-text) (4)
       ✓ .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case) 2ms
       ✓ .gitattributes — consumer custom attributes outside the block survive 1ms
       ✓ docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected) 2ms
       ✓ dest has NO bkit markers — block is appended at EOF, all consumer content preserved 1ms
     ✓ upgrade preserves consumer keys (json deep-merge) (1)
       ✓ .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case) 2ms
     ✓ upgrade is idempotent for block-merge formats (1)
       ✓ records the merged on-disk hash and skips on the second run 2ms
     ✓ upgrade of an owned whole-file candidate (2)
       ✓ auto-updates when there is no consumer drift 1ms
       ✓ honors contentOverride — writes rendered content, never the raw template 1ms
     ✓ upgrade substitutes template tokens (#129 §2) (1)
       ✓ seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal 1ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 664ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 616ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 623ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 619ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 635ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 617ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 621ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 770ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 901ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 898ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 488ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 135ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 140ms
     ✓ passes -w when the consumer is a pnpm workspace root 140ms
     ✓ starts the package runner for the install and the re-exec 594ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 148ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 994ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #255 — upgrade does not force-create uninstalled host/tooling modules > a second check-name migration writes nothing
AssertionError: expected '# Example Trivy scan. Copy it to `.gi…' to match /^name: bkit-trivy$/m

- Expected:
/^name: bkit-trivy$/m

+ Received:
"# Example Trivy scan. Copy it to `.github/workflows/bkit-trivy.yml` and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# Fails on a HIGH or CRITICAL finding in any lockfile (every language Trivy reads), in
# config files (Dockerfile, Terraform, Kubernetes, Helm, CloudFormation) and in secrets
# committed to tracked files. Accept a finding in `.trivyignore.yaml`, each entry with a
# `statement` (why) and an `expired_at` (when it comes back). See
# `.bkit/templates.md` § Trivy.
#
# Runs the official image pinned by tag AND digest. Never reference
# `aquasecurity/trivy-action` or `setup-trivy` by tag: in March 2026 their tags were
# re-pointed at a credential stealer. This file is yours, so Renovate bumps the tag and
# digest together. Do NOT add this path to renovate.json5 `ignorePaths`.
name: Trivy

on:
  workflow_dispatch:
  push:
    branches: [{{DEFAULT_BRANCH}}, dev]
  pull_request:
    branches: [{{DEFAULT_BRANCH}}, dev]
  schedule:
    # New advisories land without a code change; the daily run catches them.
    - cron: \"41 5 * * *\"

# The scan reads the checkout and needs no secret and no write scope.
permissions:
  contents: read

concurrency:
  group: trivy-${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.ref }}
  cancel-in-progress: true

jobs:
  trivy:
    runs-on: ubuntu-latest # Edit this label in your copy.
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      # `scripts/ci/check-dependency-audit.mjs` (bkit-ci.yml `Check Dependency Audit`)
      # already gates pnpm-lock.yaml against `accepted-advisories.json`; scanning it here
      # too would need every acceptance twice. Without that gate, Trivy owns the lockfile.
      - name: Plan Scan
        id: plan
        run: |
          args=\"\"
          if [ -f scripts/ci/check-dependency-audit.mjs ]; then
            args=\"$args --skip-files pnpm-lock.yaml\"
          fi
          if [ -f .trivyignore.yaml ]; then
            args=\"$args --ignorefile .trivyignore.yaml\"
          fi
          echo \"args=$args\" >> \"$GITHUB_OUTPUT\"

      # --include-dev-deps: without it Trivy drops every dev dependency from npm, yarn
      # and pnpm lockfiles, and a repo of dev tooling scans zero packages and passes.
      # --skip-dirs .bkit/templates: bkit rewrites those files; your adopted copies are
      # scanned where they live.
      - name: Run Trivy
        uses: docker://ghcr.io/aquasecurity/trivy:0.75.0@sha256:af6acf9a6b85dfe389a1941505c0ce9efef52a4719635e1a962f022a3d855daa
        with:
          args: >-
            fs --scanners vuln,misconfig,secret --severity HIGH,CRITICAL --exit-code 1
            --include-dev-deps --skip-dirs .bkit/templates ${{ steps.plan.outputs.args }} .
"

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:1190:19
    1188|       "utf-8",
    1189|     );
    1190|     expect(trivy).toMatch(/^name: bkit-trivy$/m);
       |                   ^
    1191|     expect(trivy).toMatch(/^ {2}trivy:\n {4}name: bkit-trivy\n/m);
    1192|     const renovate = fs.readFileSync(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #255 — upgrade does not force-create uninstalled host/tooling modules > a dry-run check-name migration writes and moves nothing
AssertionError: expected '[bkit-upgrade] Running upgrade (dry-r…' to contain 'bkit-trivy.yml'

- Expected
+ Received

- bkit-trivy.yml
+ [bkit-upgrade] Running upgrade (dry-run)
+ [bkit-upgrade] [dry-run] core: .husky/pre-push — branded script and path names rewritten
+ [bkit-upgrade] [dry-run] core: .github/workflows/bkit-ci.yml — branded script and path names rewritten
+ [bkit-upgrade] [dry-run] core: package.json script names branded [lint:prose, slop:delta]
+ [bkit-upgrade] [dry-run] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
+ [bkit-upgrade] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
+ [bkit-upgrade] Done. updated: 0, skipped: 60, conflicts: 0, re-rendered: 3
+
+

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:1220:33
    1218|     );
    1219|     expect(trivy).toMatch(/^name: Trivy$/m);
    1220|     expect(combinedOutput(dry)).toContain("bkit-trivy.yml");
       |                                 ^
    1221|   });
    1222|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #255 — upgrade does not force-create uninstalled host/tooling modules > a second Vale migration and a dry run write nothing
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:1243:87
    1241|     const upgrade = runCli(["upgrade", "--auto-apply"]);
    1242|     expect(upgrade.status, combinedOutput(upgrade)).toBe(0);
    1243|     expect(fs.existsSync(path.join(tmpDir, ".vale", "styles", "Bkit", …
       |                                                                                       ^
    1244|     expect(fs.existsSync(path.join(house, "Filler.yml"))).toBe(false);
    1245|     expect(fs.readFileSync(path.join(tmpDir, ".vale.ini"), "utf-8")).t…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 60 passed (63)
   Start at  14:36:26
   Duration  37.39s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7aRZtC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
