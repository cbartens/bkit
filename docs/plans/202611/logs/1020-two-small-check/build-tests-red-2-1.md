Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1020-two-small-check-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "the shipped authoring.md names no command that exists only in the bkit repo" | red | failure: expected [ …(7) ] to deeply equal [] |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1020-two-small-check
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1020-two-small-check
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1020-two-small-check

 ❯ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests | 1 failed) 85ms
   ✓ shipped docs carry no internal identifiers (133)
     ✓ enumerates the shipped markdown corpus (not vacuous) 1ms
     ✓ .bkit/core/.bkit/LICENSE.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/LICENSE.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/README.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/README.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/authoring.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/authoring.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/cli.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/cli.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/cloud.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/cloud.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/comparison.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/comparison.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/install.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/install.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/jsonl.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/jsonl.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/pipeline.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/pipeline.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/prompts.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/prompts.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/providers.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/providers.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/router.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/router.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/templates.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/templates.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/trackers.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/trackers.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/workflows.md cites no tracker issue number 1ms
     ✓ .bkit/core/.bkit/workflows.md cites no ledger key or review-finding label 1ms
     ✓ .bkit/core/docs/templates/bkit-audit-accessibility.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-accessibility.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-adoption.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-adoption.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-agents.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-agents.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-aio-seo.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-aio-seo.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-analytics.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-analytics.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-annotations.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-annotations.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-performance.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-performance.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-store.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-store.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-architecture.md cites no tracker issue number 1ms
     ✓ .bkit/core/docs/templates/bkit-audit-architecture.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-ci-performance.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-ci-performance.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-config.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-config.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-cost.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-cost.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-coverage.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-coverage.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-database.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-database.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dead-code.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dead-code.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-deferrals.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-deferrals.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dependencies.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dependencies.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-documentation.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-documentation.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-duplication.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-duplication.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-failures.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-failures.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-flakes.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-flakes.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-gates.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-gates.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-issues.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-issues.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-llm.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-llm.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-logs.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-logs.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-models.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-models.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-privacy.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-privacy.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-prompts.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-prompts.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-red-team.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-red-team.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-reliability.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-reliability.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-repo.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-repo.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-security.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-security.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-slop.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-slop.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-testing.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-testing.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-usability.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-usability.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-plan.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-plan.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/architecture.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/architecture.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/capabilities.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/capabilities.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/components.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/components.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/data-schema.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/data-schema.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/deployments.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/deployments.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/design.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/design.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/noise.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/noise.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/observability.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/observability.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/security.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/security.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/setup.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/setup.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/technology.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/technology.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/testing.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/testing.md cites no ledger key or review-finding label 0ms
     ✓ AGENTS.md cites no tracker issue number 0ms
     ✓ AGENTS.md cites no ledger key or review-finding label 0ms
     ✓ CLAUDE.md cites no tracker issue number 0ms
     ✓ CLAUDE.md cites no ledger key or review-finding label 0ms
     ✓ GEMINI.md cites no tracker issue number 0ms
     ✓ GEMINI.md cites no ledger key or review-finding label 0ms
   ✓ execution surfaces carry no internal identifiers or step cross-refs (93)
     ✓ enumerates workflows and prompts (not vacuous) 0ms
     ✓ .bkit/core/workflows/bkit-auto.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-auto.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-build.md cites no tracker issue number, ledger key or finding label 1ms
     ✓ .bkit/core/workflows/bkit-build.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-debug.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-debug.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-design.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-design.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-plan.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-plan.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-ship.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-ship.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-audit-generate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-audit-generate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-install-skills.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-install-skills.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-convert.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-convert.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-current.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-current.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tasks.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tasks.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tests.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tests.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-verify.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-verify.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-abort-handover.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-abort-handover.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-diagnose.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-diagnose.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-reproduce.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-reproduce.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-soak.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-soak.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-3.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-3.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-generate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-generate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-organise.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-organise.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-review-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-review-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-review-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-review-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-spike.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-spike.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-update.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-update.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-scope-check.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-scope-check.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-update.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-update.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-ship-deferred-sweep.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-ship-deferred-sweep.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-ship-update-docs.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-ship-update-docs.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-compress-markdown.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-compress-markdown.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-decisions.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-decisions.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-deferrals.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-deferrals.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-documentation.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-documentation.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-failures.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-failures.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-knowledge.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-knowledge.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-roadmap.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-roadmap.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-tracker.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-tracker.md references no step by number 0ms
   ✓ seeded config templates carry no internal identifiers or history prose (53)
     ✓ enumerates the seeded config corpus (not vacuous) 0ms
     ✓ .bkit/templates/.cursor/environment.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.cursor/environment.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.cursor/settings.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.cursor/settings.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/dependabot.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/dependabot.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/renovate.json5 cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/renovate.json5 carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-ci.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-ci.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-cloud.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-cloud.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-health.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-health.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-renovate.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-renovate.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-trivy.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-trivy.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.oxlintrc.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.oxlintrc.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.serena/project.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.serena/project.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Filler.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Filler.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Hedging.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Hedging.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/LLMSlop.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/LLMSlop.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Verbose.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Verbose.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/lintstagedrc.example.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/lintstagedrc.example.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-advisories.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-advisories.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-divergences.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-divergences.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-external-rules.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-external-rules.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/serena/bkit-serena.mcp.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/serena/bkit-serena.mcp.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/slop-scan.config.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/slop-scan.config.json carries no narrative about what it used to be 0ms
   ✓ documentation responsibility inventory (1)
     ✓ covers the full documentation responsibility inventory 3ms
   ✓ documentation warning contracts (1)
     ✓ ships documentation warning contracts for plan and no-plan paths 2ms
   ✓ starter section citations (1)
     ✓ every shipped docs/{topic}.md § citation resolves to a starter heading 46ms
   ❯ shipped authoring doc (1)
     × the shipped authoring.md names no command that exists only in the bkit repo 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts > shipped authoring doc > the shipped authoring.md names no command that exists only in the bkit repo
AssertionError: expected [ …(7) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/.bkit/authoring.md:181: - After the edit, run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first. It reports what would change and wr",
+   ".bkit/core/.bkit/authoring.md:182: - Run `pnpm instructions:sync`, which writes the change into every file, only when that report shows the change you expe",
+   ".bkit/core/.bkit/authoring.md:183: - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.",
+   ".bkit/core/.bkit/authoring.md:290: - Why: Fixed blocks let an agent find what a file asks of it at a glance, and let `pnpm instructions:sync` maintain the ",
+   ".bkit/core/.bkit/authoring.md:298: - Checked by: `.bkit/core/engine/tools/instructions.test.ts` checks block order, the shared lines and `**Rules file:**`.",
+   ".bkit/core/.bkit/authoring.md:326: - Checked by: `.bkit/core/engine/tools/instructions.test.ts`.",
+   ".bkit/core/.bkit/authoring.md:721: - Run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` after you change a rule, a clause or this file, and read w",
+ ]

 ❯ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:524:47
    522|     const rel = ".bkit/core/.bkit/authoring.md";
    523|     expect(fs.existsSync(path.join(REPO_ROOT, rel))).toBe(true);
    524|     expect(allLines(rel, BKIT_ONLY_COMMANDS)).toEqual([]);
       |                                               ^
    525|   });
    526| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 282 passed (283)
   Start at  09:22:48
   Duration  183ms (tests 68%, transform 14%, setup 13%, import 5%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ZCrX7r/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
