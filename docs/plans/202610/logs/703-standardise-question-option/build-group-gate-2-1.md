
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs


0/148 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

✔ 0 errors, 0 warnings and 0 suggestions in 147 files.
passed: true
skipped: null
files: 147

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> bkit ci slop

[bkit-ci] base 443a20a9aadc0fc9017a66afc34c52d0ca986ccb (443a20a9aadc0fc9017a66afc34c52d0ca986ccb) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 443a20a9aadc0fc9017a66afc34c52d0ca986ccb
base: 443a20a9aadc0fc9017a66afc34c52d0ca986ccb
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/703-standardise-question-option
      Coverage enabled with v8

 ❯ .bkit/core/engine/audits/templates/templates.test.ts (250 tests | 2 failed) 36ms
   ❯ audit templates — managed block plus consumer stub (109)
     ✓ ships the finished audit set 1ms
     ✓ docs/templates/bkit-audit-accessibility.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-adoption.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-agents.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-analytics.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-annotations.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-app-performance.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-app-store.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-architecture.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-config.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-cost.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-coverage.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-database.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-dead-code.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-deferrals.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-dependencies.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-documentation.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-duplication.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-failures.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-flakes.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-gates.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-issues.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-llm.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-logs.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-models.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-privacy.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-prompts.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-red-team.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-reliability.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-repo.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-security.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-slop.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-testing.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-usability.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-accessibility.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-adoption.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-agents.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-analytics.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-annotations.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-app-performance.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-app-store.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-architecture.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-config.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-cost.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-coverage.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-database.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-dead-code.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-deferrals.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-dependencies.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-documentation.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-duplication.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-failures.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-flakes.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-gates.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-issues.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-llm.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-logs.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-models.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-privacy.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-prompts.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-red-team.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-reliability.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-repo.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-security.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-slop.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-testing.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-usability.md bkit doc anchors resolve to shipped headings 0ms
     ✓ every shipped doc section is named by an audit, or listed with a reason 4ms
     ✓ every templates.md Contract row is covered by an audit 1ms
     ✓ docs/templates/bkit-audit-accessibility.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-adoption.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-agents.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-analytics.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-annotations.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-app-performance.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-app-store.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-architecture.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-config.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-cost.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-coverage.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-database.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-dead-code.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-deferrals.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-dependencies.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-documentation.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-duplication.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-failures.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-flakes.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-gates.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-issues.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-llm.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-logs.md dogfood managed block differs only by the managed-version stamp 0ms
     × docs/templates/bkit-audit-models.md dogfood managed block differs only by the managed-version stamp 5ms
     ✓ docs/templates/bkit-audit-privacy.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-prompts.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-red-team.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-reliability.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-repo.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-security.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-slop.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-testing.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-usability.md dogfood managed block differs only by the managed-version stamp 0ms
     × docs/templates/bkit-plan.md dogfood matches the template but for the managed-version stamp 1ms
   ✓ Group A templates — html-comment markers (md/mdc files) (129)
     ✓ AGENTS.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ AGENTS.md: bkit:start appears before bkit:end 0ms
     ✓ AGENTS.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ CLAUDE.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ CLAUDE.md: bkit:start appears before bkit:end 0ms
     ✓ CLAUDE.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .agents/rules.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .agents/rules.md: bkit:start appears before bkit:end 0ms
     ✓ .agents/rules.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .agents/docs.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .agents/docs.md: bkit:start appears before bkit:end 0ms
     ✓ .agents/docs.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .agents/skills.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .agents/skills.md: bkit:start appears before bkit:end 0ms
     ✓ .agents/skills.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .bkit/lite.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .bkit/lite.md: bkit:start appears before bkit:end 0ms
     ✓ .bkit/lite.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-plan.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-plan.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-plan.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-accessibility.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-accessibility.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-accessibility.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-adoption.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-adoption.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-adoption.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-agents.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-agents.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-agents.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-analytics.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-analytics.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-analytics.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-annotations.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-annotations.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-annotations.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-app-performance.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-app-performance.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-app-performance.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-app-store.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-app-store.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-app-store.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-architecture.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-architecture.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-architecture.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-config.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-config.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-config.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-cost.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-cost.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-cost.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-coverage.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-coverage.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-coverage.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-database.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-database.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-database.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-dead-code.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-dead-code.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-dead-code.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-deferrals.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-deferrals.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-deferrals.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-dependencies.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-dependencies.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-dependencies.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-documentation.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-documentation.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-documentation.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-duplication.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-duplication.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-duplication.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-failures.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-failures.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-failures.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-flakes.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-flakes.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-flakes.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-gates.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-gates.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-gates.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-issues.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-issues.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-issues.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-llm.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-llm.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-llm.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-logs.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-logs.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-logs.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-models.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-models.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-models.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-privacy.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-privacy.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-privacy.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-prompts.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-prompts.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-prompts.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-red-team.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-red-team.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-red-team.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-reliability.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-reliability.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-reliability.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-repo.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-repo.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-repo.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-security.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-security.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-security.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-slop.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-slop.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-slop.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-testing.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-testing.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-testing.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-usability.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-usability.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-usability.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .cursor/rules/bkit-rules.mdc: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .cursor/rules/bkit-rules.mdc: bkit:start appears before bkit:end 0ms
     ✓ .cursor/rules/bkit-rules.mdc: extractManagedBlock returns non-null non-empty content 0ms
   ✓ Group B templates — bkit-ci.yml (2)
     ✓ bkit-ci.yml bkit-tests-static job-level env carries the verbose-CI wiring 1ms
     ✓ bkit-ci.yml install step runs a plain pnpm install (no GH Packages auth) 0ms
   ✓ Group B templates — .vale.ini (1)
     ✓ .vale.ini sets StylesPath, Packages and MinAlertLevel and enables House on .agents/** 0ms
   ✓ slop-scan.config.json — required core rules (JSON deep-containment) (5)
     ✓ template contains all 12 required rule keys 0ms
     ✓ all required rules have enabled: true 0ms
     ✓ comments.placeholder-comments has weight: 1.5 0ms
     ✓ template has exactly 12 required rules (no extra bkit-mandated rules beyond the twelve) 0ms
     ✓ wires the boundary plugin so boundary/type-suppression can load (#263) 0ms
   ✓ husky templates — no bkit markers in template content (4)
     ✓ .husky/pre-push contains NO bkit:start/bkit:end markers 0ms
     ✓ .husky/pre-commit contains NO bkit:start/bkit:end markers 0ms
     ✓ .husky/pre-push template still invokes pnpm at the script level 0ms
     ✓ .husky/pre-commit template still invokes pnpm at the script level 0ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 12451ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 518ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1275ms
     ✓ resolves config from the repo root when run from a subdirectory 939ms
     ✓ exits 6 when the PUT fails 1003ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1015ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1035ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1010ms
     ✓ asks a human to log in when gh is not authenticated 1021ms
     ✓ exits 3 when gh repo view names no repository 1005ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1050ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1037ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 961ms
     ✓ exits 6 when the api answer is not JSON 550ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 19597ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 956ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1189ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 638ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 991ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1116ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1052ms
     ✓ fetches the issue and its comments as GitHub returns them 1038ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 849ms
     ✓ a recent identical comment counts as done (the final close comment) 965ms
     ✓ a failed post reports done false with the reason and never leaks a token 1114ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1333ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 665ms
     ✓ a board the token cannot see is scope 818ms
     ✓ an HTTP 403 from gh is scope 1071ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 972ms
     ✓ github: no block, no blockers and no further reads 1133ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1000ms
     ✓ a different marker hash posts 830ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 842ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 14224ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1471ms
       ✓ falls back to event.before when gh prints unparseable output 1192ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2331ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 875ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1948ms
         ✓ tests ancestry against --head, not HEAD 3338ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 3066ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 27166ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 683ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1182ms
     ✓ CI=true -> GITHUB_ACTION 843ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 998ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 1119ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 941ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 1125ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 1023ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 926ms
     ✓ LOCAL -> runtimeHeadless=false 1119ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 954ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 971ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 657ms
     ✓ UNKNOWN -> runtimeHeadless=false 848ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1101ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1230ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 952ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 969ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 765ms
     ✓ re-derives per call: one run's answer does not leak into the next 838ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1060ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1822ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1515ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1514ms
     ✓ --file into a missing directory is refused, not created 1538ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (132 tests) 31724ms
   ✓ bkit workflows handover (22)
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 459ms
     ✓ --flush carries the named worktree's logs into the dev commit 401ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1708ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 508ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 688ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 555ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 665ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 460ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 465ms
     ✓ --push on dev never carries a row whose references name another feature 471ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 380ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 706ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1616ms
     ✓ --push commits in the named worktree, not the checkout it runs from 353ms
   ✓ bkit workflows close --flush (ship) (6)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 666ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 496ms
     ✓ a close that landed releases the lock 526ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3718ms
       ✓ closePr refuses when the PR base is unknown 3305ms
     ✓ leaves a worktree no workflow created, and its branch, in place 383ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 333ms
     ✓ record is present after workflows close and before the push 409ms
     ✓ failed handover from dev removes the record and keeps recorded paths 468ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (42 tests) 35705ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1295ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 953ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 635ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 980ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1119ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 971ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1078ms
     ✓ counts commits behind origin/dev and the divergence age 897ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1000ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1174ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1243ms
     ✓ from a worktree, still names the main checkout and its outbox 665ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 689ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 795ms
   ✓ bkit repo info — where the wired tracker's issues live (10)
     ✓ prints the Linear team and project under linear 1089ms
     ✓ prints the Jira site and project under jira 1257ms
     ✓ prints the board under github 1285ms
     ✓ prints the github progress and review states, defaults for a key left unset 674ms
     ✓ prints the linear progress and review states, defaults for a key left unset 758ms
     ✓ prints the jira progress and review states, defaults for a key left unset 865ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1353ms
     ✓ prints null progress and review states under none 1615ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1905ms
     ✓ prints nulls under github without a board, and for keys left unset 1198ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 1816ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1032ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1292ms
     ✓ an unpinned repo reports nulls and asks no registry 1081ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1069ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1146ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1088ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1245ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (87 tests) 9060ms
   ✓ bkit steps done (18)
     ✓ reports a failed commit with exit 8 after writing the row 1414ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ a hook-refused own-path commit exits without staging a recorded path 1113ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 9821ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 1381ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 1062ms
     ✓ treats regex characters in a skill name literally 1389ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1082ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1158ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1102ms
     ✓ runs from the checkout top even when called from a subfolder 1360ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1272ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (62 tests) 7497ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 339ms
     ✓ a new run of the same FID rewrites startSha 396ms
     ✓ a resume of the same FID reuses the record 363ms
     ✓ a stale record without a lock is replaced 325ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 331ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (104 tests) 40756ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 822ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 981ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 841ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 994ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1031ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1054ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1007ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1019ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1019ms
     ✓ PASS is 0 failures with or without reports 1133ms
     ✓ clears a previous attempt's reports before the gate runs 947ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 975ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 706ms
     ✓ a log under the outbox is named main-checkout relative in the record 824ms
     ✓ a log small enough is copied whole: not clamped, raw null 1071ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1232ms
   ✓ bkit tests red / green (25)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 1110ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no row 746ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 894ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 1021ms
     ✓ a script that cannot run is exit 4, not a rejected red 1818ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1450ms
     ✓ green: --group audits only that group's tasks 1498ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1817ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1048ms
     ✓ green: red recorded, test unchanged, named test passing -> no gaps 1360ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1091ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 1089ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 1153ms
     ✓ green: every test a task names needs its own red and its own pass 1097ms
     ✓ test order (7)
       ✓ green finds the code commit for DONE — TASK N 1571ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1162ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 963ms
       ✓ a test file that only gained lines since its red is no gap; the diff stays in the report 1354ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1135ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (210 tests) 8117ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 472ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (73 tests) 8463ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 349ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ a recorded ledger commits only the rows the run appended 306ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 456ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 409ms
 ✓ .bkit/core/engine/commands/land.test.ts (25 tests) 7102ms
   ✓ pushToDev (13)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 330ms
     ✓ never pushes local dev commits missing from origin/dev 331ms
     ✓ dev moved: rebuilds on the new dev and pushes again 679ms
     ✓ dev moved before every push: exhausted, nothing landed 1104ms
     ✓ any other refusal is returned, not retried 1180ms
     ✓ pushToDev replays a commit range onto origin/dev 679ms
     ✓ a replay retries on the new dev when dev moved 789ms
     ✓ pushToDev log line names what it lands 369ms
     ✓ runs no git hooks in the throwaway checkout, and says so 415ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 398ms
     ✓ a push that fails without a server answer is returned once, never retried 333ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 3432ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 889ms
     ✓ is null when pnpm fails or prints something that is not a version 2508ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 4285ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1192ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (47 tests) 30166ms
   ✓ bkit ci slop — gate decision (6)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1379ms
     ✓ fails on a net score rise with no net count change 1571ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1918ms
     ✓ treats a net score at or below 0.001 as float noise 1110ms
     ✓ passes when the change only resolves findings 1879ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1045ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1356ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1112ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1168ms
     ✓ exits 4 on a dropped net field instead of silently passing 1092ms
     ✓ exits 4 on no summary instead of silently passing 1063ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1360ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1314ms
   ✓ bkit ci slop — real slop-scan (3)
     ✓ a genuinely new finding fails the gate 477ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 396ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 376ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1562ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 1355ms
     ✓ fails (exit 1) when vale reports alerts 751ms
     ✓ exits 6 on a vale runtime error 1160ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1102ms
     ✓ falls back to vale sync when the main worktree has none 1434ms
     ✓ skips loudly with exit 0 when vale sync cannot restore it either 1079ms
   ✓ bkit ci min-push (8)
     ✓ checks every --ref: one code ref among min-push refs fails the push 308ms
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:62693) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 14144ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/lanes/resolve-push-base.test.mjs passes when run on its own 13289ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (40 tests) 3463ms
   ✓ bkit roadmap mirror (6)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 595ms
     ✓ never touches the main checkout and never pushes its local dev commits 534ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 526ms
     ✓ a refused dev push is logged, never fails the close 1094ms
     ✓ an unreachable remote is logged, never fails the close 334ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 5546ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 354ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 357ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 337ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 317ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 1684ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (31 tests) 2207ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 336ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 644ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 53892ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 452ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1308ms
     ✓ always writes the marker, even with no plan 885ms
     ✓ writes the linear marker shape, taking the tracker from package.json 634ms
     ✓ writes the jira marker shape, taking the tracker from package.json 979ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1125ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1059ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1056ms
     ✓ exits 5 when the open-PR probe errors 979ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1047ms
     ✓ prs open still opens against any other base 903ms
     ✓ exits 6 when the created PR's base is not --base 967ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 655ms
     ✓ exits 1 with found=false when there is none 843ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1109ms
     ✓ --number reads one PR, mergeable included 1221ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 984ms
     ✓ exits 4 when gh errors and 80 when it needs auth 994ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 744ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1216ms
     ✓ drops the force-build marker from the title subject 1786ms
     ✓ takes an explicit --subject 1502ms
     ✓ runs no merge when the PR is already MERGED 1513ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1604ms
     ✓ prs merge refuses a PR whose base is main 1431ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1374ms
     ✓ prs merge refuses when the PR base is unknown 1096ms
     ✓ prs merge reads the base from the one pr view it already makes 1076ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1175ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1049ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1367ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1288ms
     ✓ never reads dev's required checks without --only-if-required 917ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1306ms
     ✓ updates when a dev ruleset requires status checks 806ms
     ✓ updates when dev's branch protection requires status checks 1364ms
     ✓ ignores dev rulesets that require no checks 1244ms
     ✓ updates when the repo cannot be resolved 721ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1277ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1199ms
     ✓ is not green when a check failed, naming it (exit 1) 1290ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1121ms
     ✓ is not green on an empty rollup (total 0) 897ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1200ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1280ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 383ms
     ✓ is a no-op when the title already says so 501ms
     ✓ strips the marker, with or without its bkit prefix 356ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 552ms
 ✓ .bkit/core/engine/commands/lib.test.ts (62 tests) 2056ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 796ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 698ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (159 tests) 55046ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 944ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1029ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1970ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1033ms
     ✓ CLI: a failed gh workflow run exits 5 1023ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2054ms
   ✓ bkit runs dispatch (14)
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 379ms
     ✓ CLI: verdict JSON, body scan, exit codes 1190ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 1297ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1452ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 635ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 685ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 569ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1754ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 1241ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 1708ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 1072ms
     ✓ --snapshot without --repo leaves its run list unscoped 1818ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1028ms
     ✓ a refused capstone records FAIL with its reason 1430ms
     ✓ an unreadable PR is an API error (20) with no head 914ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 1222ms
       ✓ without --repo no call gains a --repo flag 1124ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 1022ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 2542ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1640ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2167ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1266ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 661ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 1197ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 1294ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 1354ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 1128ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 2056ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 995ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 1173ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 724ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 736ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 724ms
     ✓ --file and --step go together 653ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (26 tests) 2070ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 1769ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 435ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 379ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (97 tests) 6409ms
   ✓ bkit context clamp — per-context profiles (#697) (4)
     ✓ keeps each context's own section header and drops every other context's 346ms
     ✓ keeps each context's own section banner and drops every other context's 959ms
   ✓ bkit context run-block / finalise (#427 T4) (15)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 342ms
   ✓ bkit context diff (10)
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 327ms
     ✓ --reset-log empties the step's clamp log before the record lands 430ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 1010ms
   ✓ .bkit/templates/context/ (74)
     ✓ install copies them into .bkit/templates/context/ 333ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (40 tests) 1483ms
   ✓ runLines (5)
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 448ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (27 tests) 1394ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (19 tests) 820ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 793ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Iqx3vD/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 667ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 646ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RoCvxe/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (49 tests) 678ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (51 tests) 922ms
   ✓ bkit counters route --point (4)
     ✓ takes each point's default limit and asks when nothing is set 340ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-KcdbYM/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (265 tests) 509ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-pQwe3V/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-hzSKQ1/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-gCQLAS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 551ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 4657ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 4646ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > never writes Codex's `.agents/skills/`
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (22 tests) 614ms
   ✓ the repo (7)
     ✓ has no coverage findings 458ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/commands/workflow/status.test.ts (55 tests) 476ms
 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 247ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (13 tests) 469ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 628ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 622ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/context.md
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/skills.md
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > strips bkit's block, managed marker included, from docs/*.md and keeps the consumer's content
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after strip): docs/security.md
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: docs/testing.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > deletes the owned docs/templates/bkit-*.md and keeps the consumer's own templates
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] delete: docs/templates/bkit-audit-security.md
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > prunes docs/templates when only bkit's files were in it
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md
[bkit-uninstall-test] prune empty dir: docs/templates

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves docs/ alone on a targeted (non-core) uninstall, and on a dry run
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | skip-absent            | file not found — nothing to do
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
docs/architecture.md                             | skip-absent            | file not found — nothing to do
docs/data-schema.md                              | skip-absent            | file not found — nothing to do
docs/deployments.md                              | skip-absent            | file not found — nothing to do
docs/design.md                                   | skip-absent            | file not found — nothing to do
docs/noise.md                                    | skip-absent            | file not found — nothing to do
docs/observability.md                            | skip-absent            | file not found — nothing to do
docs/security.md                                 | skip-absent            | file not found — nothing to do
docs/setup.md                                    | skip-absent            | file not found — nothing to do
docs/technology.md                               | skip-absent            | file not found — nothing to do
docs/testing.md                                  | strip-block            | markered-text — strip bkit block, preserve consumer content
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > formatDecisionTable — P2.T7 > dry-run snapshot: decision table is printed, nothing deleted
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | strip-block            | json (deep-containment) — strip bkit-owned scope, preserve consumer keys
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
docs/architecture.md                             | skip-absent            | file not found — nothing to do
docs/data-schema.md                              | skip-absent            | file not found — nothing to do
docs/deployments.md                              | skip-absent            | file not found — nothing to do
docs/design.md                                   | skip-absent            | file not found — nothing to do
docs/noise.md                                    | skip-absent            | file not found — nothing to do
docs/observability.md                            | skip-absent            | file not found — nothing to do
docs/security.md                                 | skip-absent            | file not found — nothing to do
docs/setup.md                                    | skip-absent            | file not found — nothing to do
docs/technology.md                               | skip-absent            | file not found — nothing to do
docs/testing.md                                  | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > strips bkit block from markered-text file, preserving consumer content
[bkit-uninstall-test] strip-block: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > deletes markered-text file when stripping leaves only whitespace
[bkit-uninstall-test] delete (empty after strip): AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves markered-text file when no bkit markers present (100% consumer)
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash unknown
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it))

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > reclaims an unedited owned byte-equal file via canonicalHashes
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash mismatches (consumer modified)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's linear entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's jira entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's github entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's linear entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's jira entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (73 tests) 122ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after strip): .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude/hooks
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves a markered-text file when the consumer added content outside the block
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json on full uninstall (renders @@sentinel@@ keys before strip-scope)
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json holding every provider block and tracker entry earlier installs left
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a github tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a linear tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a jira tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves opencode.json when the consumer added their own key
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > prunes deleted paths from .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete mirror: .claude/agents/bkit-foo.md
[bkit-uninstall-test] prune empty dir: .claude/agents
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > leaves .bkit/version byte-identical on a targeted uninstall that prunes nothing
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > does not rewrite .bkit/version on a targeted dry-run (no writes)
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do

[bkit-uninstall-test] [dry-run] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (github)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (linear)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (jira)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (github)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (linear)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (jira)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

 ✓ .bkit/core/engine/checks/before/index.test.ts (15 tests) 225ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (87 tests) 237ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 246ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (50 tests) 168ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (81 tests) 108ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 340ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (94 tests) 101ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 185ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 171ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-rhnr7Q/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 193ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 114ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 150ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (277 tests) 80ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-6sINNc/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > the shipped hook template upgrades to its generated form: shared parts spliced into the block
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: auto-applies non-conflicting changes
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: does NOT overwrite consumer drift (conflict preserved)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 98ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 87ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 61ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 90ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 99ms
 ✓ .bkit/core/engine/shared/settings.test.ts (26 tests) 85ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (228 tests) 211ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (22 tests) 70ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 61ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 86ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (6 tests) 48ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 93ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (96 tests) 89ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (11 tests) 104ms
 ✓ .bkit/core/engine/render/hosts.test.ts (115 tests) 42ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 59ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 82ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (24 tests) 60ms
 ✓ .bkit/core/engine/install/manifest.test.ts (47 tests) 39ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (33 tests) 48ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (21 tests) 47ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 60ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 90ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 114ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (65 tests) 71ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 39ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 95ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 109ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (64 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (35 tests) 61ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 31ms
 ✓ .bkit/core/engine/commands/workflow/workstreams.test.ts (9 tests) 26ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 24ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 34ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 29ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 23ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 43ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793005225488.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793005225490.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793005225491.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793005225501.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 21ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (21 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 25ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 18ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

# bkit stats

This repo only: `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Written by `bkit stats`; workflow closes append the rows.

## Rows

<!-- prettier-ignore -->
| Kind | Rows |
| --- | --- |
| outcome | 1 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Run durations

No outcome row records a duration.

## Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

## Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/commands/stats.test.ts (8 tests) 18ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (25 tests) 17ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (17 tests) 14ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 13ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 16ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 17ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (23 tests | 1 skipped) 29ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 24ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 6ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (20 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (6 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 23ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 4ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 14566ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 6874ms
     ✓ every fence parses under zsh -n 7656ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 31553ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 23398ms
     ✓ sync has nothing left to rewrite 6970ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 676ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (171 tests) 74581ms
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 367ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1324ms
     ✓ produces byte-identical output to merge=union 372ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 321ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1294ms
     ✓ refuses a lockfile whose regenerate command fails 1109ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 304ms
   ✓ branches push (17)
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1279ms
     ✓ runs exactly one git push 1437ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 448ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1002ms
     ✓ --mode=abort pushes when the branch has no open PR 1445ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1305ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 542ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 472ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 499ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2890ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 400ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2231ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2069ms
     ✓ a rewritten branch is refused, never forced 308ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 424ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 324ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 381ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 346ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 493ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 514ms
   ✓ branches scan-diff (8)
     ✓ --marker finds an added line carrying the marker outside docs/plans 317ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 345ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1544ms
     ✓ a title that already carries the marker is left alone 1266ms
     ✓ with no open PR: pushes the marker commit and edits no title 1345ms
     ✓ a re-run is deduped: no second marker commit 1575ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1636ms
     ✓ --title-set skips gh entirely 369ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 360ms
     ✓ Path B once dev moved; --head checks a given commit 581ms
     ✓ --merge-docs merges dev when docs/ is behind 591ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 690ms
     ✓ --merge-docs never merges on dev itself 558ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 628ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 659ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 613ms
     ✓ refuses --merge-docs with --head, and an unknown --head 315ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 589ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1834ms
     ✓ a failed install stops ship (16) 1652ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 763ms
     ✓ exits 10 when the fetch fails 608ms
   ✓ branches land (21)
     ✓ refuses a workflow other than design or plan 325ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 463ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1581ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1647ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1779ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1767ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3365ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1964ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 338ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1068ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 890ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 720ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 604ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 916ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 725ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 539ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 897ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 727ms
     ✓ landPr refuses a main-based PR without retrying 535ms
     ✓ landPr refuses when the PR base is unknown 547ms
     ✓ PR not open (closed): stops (17) at once, no retry 594ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/templates.test.ts > audit templates — managed block plus consumer stub > docs/templates/bkit-audit-models.md dogfood managed block differs only by the managed-version stamp
AssertionError: docs/templates/bkit-audit-models.md: expected '<!-- Note: Reports live at `docs/audi…' to be '<!-- Note: Reports live at `docs/audi…' // Object.is equality

- Expected
+ Received

@@ -84,11 +84,11 @@
  - [ ] **Step 4 — Call Sites:** Derive each call site's requirements from code this run: modality, tools, and tool choice, structured output, reasoning, output cap, timeout. Do not copy a requirements table forward. Language-server references on each wrapper and each exported chain → every task routing through it; re-run empty results, corroborate with text search. Empty is inconclusive. Task added since previous report appears here only. **Done when:** `Call Sites` row per site: task · wrapper · requirements · chain · `file:line` · how derived.
  - [ ] **Step 5 — Lifecycle:** Hard filters on every listed id and candidate vs Step 3 pull + maker page. (a) Retention call sends (e.g. zero-retention): no matching endpoint → reject (id does not route). (b) `expiration_date` + maker deprecation page; reject id expiring before next refresh; reject preview, experimental, free-tier variants. (c) Tool-calling candidate whose reasoning cannot be switched off → reject (reasoning tokens exhaust the output budget, the model returns no tool call, and the wrapper surfaces a truncation error). (d) Alias or dated snapshot, and which canonical id it resolved to on the pull date. Prefer dated snapshots. An alias whose canonical id differs from the previous report = a model change: name `bkit-audit-llm`; do not run the eval here. (e) Model card URL, knowledge cutoff, open-weight licence, training-on-data policy, maker terms for products serving minors, hosting region for retention-satisfying endpoints. Children's data crossing borders → `bkit-audit-privacy`. **Done when:** `Lifecycle` row per id: filters · canonical id · card · verdict.
  - [ ] **Step 6 — Endpoints:** Model-level summary can pass Step 5 while no single endpoint does. Query endpoints, not summary. Require >=1, ideally 2, satisfying retention constraint and every parameter call site sends (tools, tool choice including required value, file, structured output — as Step 4's table requires). Record whether call sets flag stopping router sending a parameter to provider that ignores it (e.g. `require_parameters`). Absent → propose in `Proposal`. Open weights: quantization per endpoint; propose pin or order where quality differs. Compare each endpoint's context length and max completion with largest measured input for that task (ledger when it has task; say when not). No output cap on tool-calling path = defect in current list; propose value per task. Latency and throughput per endpoint vs call timeout. Catalogue price = fitness comment on proposed row. Blended spend and fallback-rate dollars → `bkit-audit-cost`. Propose per-task price ceiling as routing config, not spend figure. **Done when:** `Endpoints` row per id: qualifying endpoints · parameters · context vs input · latency vs timeout · verdict.
  - [ ] **Step 7 — Fallbacks:** (a) Chain positions = different makers → one delisting or outage cannot collapse retry. Record router as single point of failure; whether any call constructs direct maker client. Diagram naming maker SDKs is not that client. (b) One synthetic fixture per chain position, under routing parameters production sends. Pass = position accepted call shape. Fail = finding. Proves fallback answers; does not score quality. Extraction accuracy, tool-call validity rate, hostile fixture → `bkit-audit-llm`. (c) Record whether anything counts how often a position fires. Nothing = finding; counter = `Process Improvements` proposal; spend consequence → `bkit-audit-cost`. **Done when:** `Fallbacks` row per position: maker · fixture result or skip · fire-rate measured · verdict.
  - [ ] **Step 8 — Registry:** Re-check current list, not only candidates. (1) Modality: every model in chain accepts input call site sends (image support does not satisfy file part). (2) Reasoning that cannot be switched off on tool-calling path. (3) Task group or list with no call site. References on export plus text search, including docs — search sees planning docs language server does not. Recommend delete unless plan in progress. Carrying lists for unbuilt feature = how registry goes stale. (4) Model ids outside registry. **Done when:** every hit = finding with `file:line`, or clean stated in `Registry`.
- - [ ] **Step 9 — Proposal:** Proposed list + per-task config (retention, required-parameters, quantization pin, price ceiling, output cap); catalogue price and context window as row comments. Chain order = judgement unless `bkit-audit-llm` scorecard cited — label which. Never an invented score. Apply order (report only, does not apply): (1) wrappers must pass per-task settings or nothing else applies; (2) retention routing pinned at the shared boundary before the model switch, so new models are validated under the routing they will run; (3) import registry, delete hardcoded lists, apply list + per-task config; (4) the eval audit's check before the list is treated as mergeable — do not change model, sampling, and fallback behaviour in one unmeasured step; (5) watch with named revert (current lists, by commit) + per-signal thresholds (format-error rate, fallback-fire count, task success). Cost per job → `bkit-audit-cost`. Open decision → one `Proposal` question with `Options: A) … / B) …` and a `Recommended: A) … — {reason}` naming the chosen letter + what would settle it. Route: defect / filter-fail id → proposed list; missing routing param → per-task config; wrapper cannot pass settings → apply-order (1); model change (incl. alias move) → `bkit-audit-llm`; children's-data borders → `bkit-audit-privacy`; unwired group → delete recommendation. **Done when:** `Proposal` holds list, apply order, watch plan, any open question.
+ - [ ] **Step 9 — Proposal:** Proposed list + per-task config (retention, required-parameters, quantization pin, price ceiling, output cap); catalogue price and context window as row comments. Chain order = judgement unless `bkit-audit-llm` scorecard cited — label which. Never an invented score. Apply order (report only, does not apply): (1) wrappers must pass per-task settings or nothing else applies; (2) retention routing pinned at the shared boundary before the model switch, so new models are validated under the routing they will run; (3) import registry, delete hardcoded lists, apply list + per-task config; (4) the eval audit's check before the list is treated as mergeable — do not change model, sampling, and fallback behaviour in one unmeasured step; (5) watch with named revert (current lists, by commit) + per-signal thresholds (format-error rate, fallback-fire count, task success). Cost per job → `bkit-audit-cost`. Open decision → one `Proposal` question + recommendation + what would settle it. Route: defect / filter-fail id → proposed list; missing routing param → per-task config; wrapper cannot pass settings → apply-order (1); model change (incl. alias move) → `bkit-audit-llm`; children's-data borders → `bkit-audit-privacy`; unwired group → delete recommendation. **Done when:** `Proposal` holds list, apply order, watch plan, any open question.
  - [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per catalogue field, routing parameter, maker lifecycle rule, and third-party-model control this procedure relies on → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
  - [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching model choice (registry, wrappers, call sites, routing parameters, embedding model id) → one-line verdict each. Read provider and maker changelogs since previous report for changed meaning of retention routing, reasoning, tool choice, or pricing. Flag catalogue anomalies on current ids: price jump, context cut, endpoint count fallen to one. (b) Bounded ~30 min pass: what senior ML platform engineer flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Include catalogue/changelog items surfaced unchecked, with query for next run. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

  ### 🔒 Gate 2: Probes Check


 ❯ .bkit/core/engine/audits/templates/templates.test.ts:205:41
    203|       expect(stamp, relPath).toBeTruthy();
    204|       const upToEnd = (s: string) => s.slice(0, s.indexOf("<!-- bkit:e…
    205|       expect(upToEnd(dogfood), relPath).toBe(
       |                                         ^
    206|         upToEnd(template.replace("{{BKIT_MANAGED_MARKER}}", stamp!)),
    207|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/templates.test.ts > audit templates — managed block plus consumer stub > docs/templates/bkit-plan.md dogfood matches the template but for the managed-version stamp
AssertionError: expected '<!-- Note: Plans live at `docs/plans/…' to be '<!-- Note: Plans live at `docs/plans/…' // Object.is equality

- Expected
+ Received

@@ -102,11 +102,11 @@
  > **🛑 HUMAN must READ and CONFIRM this SECTION.**
  > Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

  - **Assumption:** [what the plan takes as given] → [what breaks if it's wrong]
  - **Open Question:** [decision needed] → [who / how to resolve]
-   - **Options:** A) [option] — [trade-off] · B) [option] — [trade-off] · C) [option] — [trade-off, optional]
+   - **Options:** A — [option, trade-off] · B — [option, trade-off] · C — [option, trade-off, optional]
    - **Recommended:** [A] — [why, 1 line]
    - **Default if unanswered:** [what the agent proceeds with]

  ### 👤 ✅ Human Confirmation


 ❯ .bkit/core/engine/audits/templates/templates.test.ts:223:21
    221|     )?.[0];
    222|     expect(stamp, relPath).toBeTruthy();
    223|     expect(dogfood).toBe(template.replace("{{BKIT_MANAGED_MARKER}}", s…
       |                     ^
    224|   });
    225| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed | 152 passed (153)
      Tests  2 failed | 6276 passed | 1 skipped (6279)
   Start at  18:59:23
   Duration  75.39s (tests 97%, transform 1%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/703-standardise-question-option/build-group-gate-2-1.log.reports/vitest-15323.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.52 |    82.54 |   95.34 |    90.8 |                   
 engine            |   75.47 |    79.27 |    87.5 |   75.86 |                   
  cli.ts           |   75.47 |    79.27 |    87.5 |   75.86 | ...11,921,926-928 
 ...e/checks/after |   90.62 |     85.4 |   94.44 |    94.4 |                   
  auth.ts          |   98.41 |    98.38 |     100 |   97.95 | 70                
  ci-yml.ts        |   90.09 |    82.06 |     100 |   92.49 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   86.25 |    72.72 |     100 |   97.09 | ...97,317,412-413 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   96.96 |       90 |     100 |   98.14 | 299               
 .../checks/before |   94.29 |    88.34 |   95.45 |   97.69 |                   
  context-fetch.ts |   98.72 |     92.4 |     100 |     100 | ...92,514,528,575 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |   83.78 |    73.33 |     100 |     100 | ...38,144,152-171 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   92.66 |    92.77 |   86.36 |   92.77 | 154-162           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   90.26 |    85.15 |   91.66 |   90.06 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...67,376,444,492 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.14 |    89.74 |     100 |     100 | 70-74,134,140     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   98.39 |     93.6 |      96 |   98.73 | 283-284           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   77.14 |    59.09 |   66.66 |   77.27 | ...58-171,201-202 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   98.36 |    86.09 |   96.29 |   99.53 |                   
  ci.ts            |   98.36 |    86.09 |   96.29 |   99.53 | 164               
 ...mmands/install |   47.55 |    45.73 |   59.49 |   48.12 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |    66.6 |    63.09 |      70 |   67.96 | ...1107,1130-1297 
  upgrade.ts       |   32.77 |    31.87 |   35.71 |   34.05 | 348-376,558-1049  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.96 |    84.53 |   97.22 |   94.44 |                   
  branches.ts      |   88.94 |    81.32 |   97.97 |   90.47 | ...1819,1824,1847 
  challenge.ts     |   95.92 |    83.07 |     100 |   97.39 | ...17-319,553,577 
  context.ts       |   96.56 |    87.02 |   98.52 |    97.3 | ...1564,1718,1807 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   94.38 |    77.58 |   97.67 |   98.23 | 171,274,342       
  disk.ts          |   92.88 |    84.69 |   95.55 |   95.54 | ...29,412-420,536 
  fids.ts          |    98.3 |    95.03 |   98.71 |   98.87 | 160,446,915-916   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   90.63 |       80 |   97.05 |   94.68 | ...1361,1371,1447 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,377-378 
  plan-blocks.ts   |   89.28 |    81.96 |     100 |   89.49 | ...70-572,575-576 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1153,1169-1170 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,219         
  roadmap.ts       |   96.63 |    91.42 |     100 |   97.15 | ...63,483-485,489 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 498-499           
  runs.ts          |   92.81 |     84.8 |     100 |    94.1 | ...1858,1890-1894 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...53,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 97,102            
  status.ts        |   97.29 |    95.54 |     100 |   98.45 | 103,203,407       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 314               
  steps.ts         |   87.94 |    82.02 |   88.88 |   88.97 | ...1369,1374,1376 
  summary.ts       |   93.93 |    87.09 |   88.37 |   93.03 | ...56-357,365-371 
  tests.ts         |   95.62 |    86.21 |   95.65 |   97.06 | ...1499,1561,1570 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.14 |    81.85 |   97.01 |   94.82 | ...1610,1783,2479 
  workstreams.ts   |   98.27 |    96.42 |     100 |     100 | 115               
  worktrees.ts     |   70.14 |     67.2 |   82.85 |   70.95 | ...23-826,829-830 
 engine/install    |   93.11 |    84.79 |   93.23 |   95.86 |                   
  cloud-env.ts     |   97.45 |    92.51 |     100 |     100 | ...98,722-774,877 
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 548-555           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.41 |    91.93 |   98.82 |   96.91 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 114               
  telemetry.ts     |   95.85 |    91.16 |   98.51 |   96.44 | ...1719,1762,2130 
 engine/render     |   90.02 |    81.39 |   98.07 |   92.24 |                   
  hosts.ts         |   88.31 |    78.89 |   94.73 |   89.69 | ...48-158,490-491 
  models.ts        |      90 |    81.11 |     100 |   94.26 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.36 |    97.29 |     100 |   99.26 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |      96 |       75 |     100 |   95.45 | 119               
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |     100 |    99.06 |     100 |     100 | 247               
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   90.71 |    85.83 |    95.4 |   91.43 |                   
  instructions.ts  |   90.71 |    85.83 |    95.4 |   91.43 | ...1662-1744,1749 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.52% ( 14989/16743 )
Branches     : 82.54% ( 10572/12807 )
Functions    : 95.34% ( 2397/2514 )
Lines        : 90.8% ( 13154/14486 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
