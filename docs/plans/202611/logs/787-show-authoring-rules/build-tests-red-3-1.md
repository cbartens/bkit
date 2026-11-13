Enforced: true
Red: 2
Accepted: 2
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/install/modules/core.test.ts` "keeps shipped authoring pointers in their editor context" | red | failure: expected '- **Edit tools:** Change file content…' to match /authoring/i |
| 11 | `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades shared hook behavior without replacing owned drivers" | passed-accepted | passes; accepted by the tests step: fresh install and upgrade already keep the managed shell advice, customised driver bytes and custom Claude registration group (Tier-2 writeTier2 in the host modules) |
| 12 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "keeps rendered classification advice and acknowledgement equivalent" | passed-accepted | passes; accepted by the tests step: all four shell adapters already give the same shared reminder, acknowledgement and unknown-target warning; OpenCode has no shell hook (stated exception) |
| 12 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "bounds rendered cold-start time and complete response size" | red | failure: cursor/maximum: expected 9215 to be less than or equal to 2000 |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/modules/core.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/modules/core.test.ts

```

## Runner output — `.bkit/core/engine/install/modules/core.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/modules/core.test.ts

[test-timeout-budget] load average 10.5 on 10 cores: unit limits 9750ms per test, 19500ms per hook (x1.95)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

 ❯ .bkit/core/engine/install/modules/core.test.ts (57 tests | 1 failed) 66ms
   ✓ findOldScriptNames invocation diagnostics (28)
     ✓ ignores prose, comments and non-script arguments: # This package is outside the pnpm/turbo graph by design. 3ms
     ✓ ignores prose, comments and non-script arguments: # npm run graph 0ms
     ✓ ignores prose, comments and non-script arguments: echo ready # pnpm graph 0ms
     ✓ ignores prose, comments and non-script arguments: The pnpm/turbo graph is optional. 0ms
     ✓ ignores prose, comments and non-script arguments: echo 'pnpm graph' 0ms
     ✓ ignores prose, comments and non-script arguments: # pnpm lint:prose 0ms
     ✓ ignores prose, comments and non-script arguments: pnpm test --label graph 0ms
     ✓ ignores prose, comments and non-script arguments: pnpm --filter # comment graph 0ms
     ✓ ignores prose, comments and non-script arguments: pnpm --filter #web graph 0ms
     ✓ ignores prose, comments and non-script arguments: echo -- pnpm graph 0ms
     ✓ retains genuine invocations: pnpm graph 0ms
     ✓ retains genuine invocations: npm run graph 0ms
     ✓ retains genuine invocations: npm run-script graph 0ms
     ✓ retains genuine invocations: yarn graph 0ms
     ✓ retains genuine invocations: bun run graph 0ms
     ✓ retains genuine invocations: pnpm --filter web graph 0ms
     ✓ retains genuine invocations: pnpm --filter "#web" run graph 0ms
     ✓ retains genuine invocations: pnpm --filter '#web' graph 0ms
     ✓ retains genuine invocations: pnpm --filter \#web graph 0ms
     ✓ retains genuine invocations: - run: npm run graph # update 0ms
     ✓ retains genuine invocations: echo ready && pnpm graph 0ms
     ✓ retains genuine invocations: - run: "pnpm graph" 0ms
     ✓ retains genuine invocations: - run: 'npm run graph' 0ms
     ✓ retains genuine invocations: - run: "npm run graph" # run the graph 0ms
     ✓ retains genuine invocations: exec -- pnpm graph 0ms
     ✓ retains genuine invocations: bash -c "pnpm graph" 0ms
     ✓ retains genuine invocations: if true; then pnpm graph; fi 0ms
     ✓ preserves source line numbers and namespaced invocations 0ms
   ✓ runCoreModule first-install advisory (BAR-141: structured finding) (4)
     ✓ uses advisories.push (not printSink.push) for first-install message 0ms
     ✓ first-install advisory id is first-install-postinstall-steps 0ms
     ✓ first-install advisory action does NOT contain onlyBuiltDependencies 0ms
     ✓ first-install advisory action no longer references GitHub Packages install auth 0ms
   ✓ guardCoreRoot — fail-loud on missing core root (3)
     ✓ calls process.exit(1) when the injected root does not exist 2ms
     ✓ emits the correct error message including the injected path 1ms
     ✓ does NOT exit when the root exists 0ms
   ✓ removeOrphans — prune stale bkit mirror files, allowlisted dirs only (16)
     ✓ removes prefixed .md files absent from the source set and keeps the rest 2ms
     ✓ upgrade removes the complexity-split agent mirror 10ms
     ✓ dry-run reports orphans without deleting them 2ms
     ✓ throws and deletes nothing for a dir outside the allowlist 2ms
     ✓ .opencode/agents: removes a stale bkit-* .md file and keeps the current one 2ms
     ✓ .opencode/commands: removes a stale bkit-* .md file and keeps the current one 2ms
     ✓ .agents/plugins/bkit/agents: removes a stale bkit-* .md file and keeps the current one 2ms
     ✓ .codex/agents: with extension .toml removes a stale bkit-* .toml and keeps the rest 2ms
     ✓ an empty extension matches every bkit-* entry whatever its suffix 2ms
     ✓ wholeFolders mode — skill folders removed recursively (5)
       ✓ .agents/skills: removes a stale bkit-* folder with its contents and keeps current and foreign ones 3ms
       ✓ .agents/plugins/bkit/skills: removes a stale bkit-* folder with its contents and keeps current and foreign ones 4ms
       ✓ dry-run reports the stale folder without deleting it 4ms
       ✓ returns nothing when the folder does not exist 1ms
       ✓ throws and deletes nothing for a folder outside the allowlist 2ms
     ✓ accepts the folder constants the host modules sweep 1ms
     ✓ dry-run with the extension option reports without deleting 1ms
   ✓ renameScriptTokens (5)
     ✓ renameScriptTokens rewrites whole pnpm tokens only 0ms
     ✓ renameScriptTokens rewrites tokens after pnpm flags 0ms
     ✓ renameScriptTokens leaves package-selecting flag forms alone 0ms
     ✓ renameScriptTokens leaves recursive flag forms alone 2ms
     ✓ renameScriptTokens returns a many-flag line in bounded time 0ms
   ❯ shipped authoring pointers (1)
     × keeps shipped authoring pointers in their editor context 9ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/modules/core.test.ts > shipped authoring pointers > keeps shipped authoring pointers in their editor context
AssertionError: expected '- **Edit tools:** Change file content…' to match /authoring/i

- Expected:
/authoring/i

+ Received:
"- **Edit tools:** Change file contents with the edit and write tools, not with shell commands that hand-edit source files or get around pre-edit gates. Exceptions: files generated by scripts, bulk mechanical rewrites, and appending a log line to your own step output file with `>>`."

 ❯ .bkit/core/engine/install/modules/core.test.ts:400:23
    398|         .join("\n");
    399|     const editTools = ruleLine("- **Edit tools:**");
    400|     expect(editTools).toMatch(/authoring/i);
       |                       ^
    401|     expect(editTools).toContain(".bkit/authoring.md");
    402|     const authoring = ruleLine("- **Authoring:**");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 56 passed (57)
   Start at  23:12:43
   Duration  408ms (transform 37%, tests 27%, import 19%, setup 16%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6FW7V9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/modules/core.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/modules/core.integration.test.ts

```

## Runner output — `.bkit/core/engine/install/modules/core.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/modules/core.integration.test.ts

[test-timeout-budget] load average 10.5 on 10 cores: unit limits 9750ms per test, 19500ms per hook (x1.95)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > replaces the exact shipped copy and records the same unhashed write in dry run
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
[bkit-install] [dry-run] core: scripts/slop/bkit-slop-type-suppression.mjs — slop plugin updated
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
[bkit-install] core: scripts/slop/bkit-slop-type-suppression.mjs — slop plugin updated

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > preserves an edited copy and reports the template to merge by hand
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

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > leaves an already corrected copy untouched without a manual-update warning
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

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > does not adopt a plugin the consumer never copied
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

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > preserves a symlinked file and its target
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

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > preserves a symlinked directory and its target
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > bkit canonical docs pass (runBkitDocs, #218) > mirrors the docs into the repo's own .bkit/ in dogfood too
[test] [dry-run] core: .bkit/workflows.md

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:min, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)
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
[bkit-install] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
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
[bkit-install] [dry-run] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json script names branded [lint:prose, slop:delta, graph, graph:check, graph:rollup]
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json script names branded
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json script names branded
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] [dry-run] template added: .bkit/templates/docs/components.md
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] [dry-run] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: moved bkit.linearTeam to bkit.linear.team in package.json
[bkit-install] core: moved bkit.linear -> bkit.tracker.linear in package.json
[bkit-install] core: added bkit.tracker.default, bkit.tracker.github, bkit.tracker.linear.project, bkit.tracker.linear.progress, bkit.tracker.linear.review, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: moved bkit.githubProject to bkit.github in package.json
[bkit-install] core: moved bkit.github -> bkit.tracker.github in package.json
[bkit-install] core: added bkit.tracker.default, bkit.tracker.github.progress, bkit.tracker.github.review, bkit.tracker.linear, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: moved bkit.issueTracker -> bkit.tracker.default, bkit.disk.minFreeGb -> bkit.workflows.minFreeGb, bkit.loopPause -> bkit.workflows.<workflow>.<point>.ask in package.json
[bkit-install] core: added bkit.tracker.github, bkit.tracker.linear, bkit.tracker.jira, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows.worktree, bkit.workflows.tasks, bkit.workflows.design.grill.maxTurns, bkit.workflows.build.verify.maxAttempts, bkit.workflows.build.challenge.maxAttempts, bkit.workflows.build.tests.maxAttempts, bkit.workflows.build.publish, bkit.workflows.debug.fix.maxAttempts, bkit.workflows.debug.soak.maxAttempts, bkit.workflows.ship.merge.maxAttempts, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > installs and upgrades shared hook behavior without replacing owned drivers
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
[bkit-install] template added: .bkit/templates/docs/components.md
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
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
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
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .codex/agents/bkit-audit-generate.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-1.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-2.toml
[bkit-install] write: .codex/agents/bkit-build-install-skills.toml
[bkit-install] write: .codex/agents/bkit-build-plan-convert.toml
[bkit-install] write: .codex/agents/bkit-build-plan-current.toml
[bkit-install] write: .codex/agents/bkit-build-plan-gaps-remediate.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tasks.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tests.toml
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-3.toml
[bkit-install] write: .codex/agents/bkit-design-generate.toml
[bkit-install] write: .codex/agents/bkit-design-organise.toml
[bkit-install] write: .codex/agents/bkit-design-review-1.toml
[bkit-install] write: .codex/agents/bkit-design-review-2.toml
[bkit-install] write: .codex/agents/bkit-design-spike.toml
[bkit-install] write: .codex/agents/bkit-design-update.toml
[bkit-install] write: .codex/agents/bkit-plan-generate.toml
[bkit-install] write: .codex/agents/bkit-plan-review-1.toml
[bkit-install] write: .codex/agents/bkit-plan-review-2.toml
[bkit-install] write: .codex/agents/bkit-plan-scope-check.toml
[bkit-install] write: .codex/agents/bkit-plan-update.toml
[bkit-install] write: .codex/agents/bkit-ship-conflict-resolve.toml
[bkit-install] write: .codex/agents/bkit-ship-deferred-sweep.toml
[bkit-install] write: .codex/agents/bkit-ship-update-docs.toml
[bkit-install] write: .codex/agents/bkit-utility-compress-markdown.toml
[bkit-install] write: .codex/agents/bkit-utility-update-decisions.toml
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
[bkit-install] write: .codex/agents/bkit-utility-update-tracker.toml
[bkit-install] write: .agents/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/skills/bkit-ship/SKILL.md
[bkit-install] codex: .codex/hooks.json
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-readguard.cjs
[bkit-install] codex: .codex/hooks/bkit-rules.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.1.1)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.1.1)

(node:10314) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:10314) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (147 tests) 9190ms
   ✓ detectNoopGates — bkit check warns on a gate that checks nothing (17)
     ✓ runs in check (dry run) as well as install, as an advisory 317ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (1)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 2021ms

 Test Files  1 passed (1)
      Tests  147 passed (147)
   Start at  23:12:45
   Duration  9.74s (tests 96%, transform 1%, import 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4VofcQ/junit.xml
```

## Lint output — `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts

[test-timeout-budget] load average 12.4 on 10 cores: unit limits 10700ms per test, 21400ms per hook (x2.14)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

 ❯ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts (349 tests | 1 failed) 47540ms
   ✓ gateguard behaviour parity — advisory content (210)
     ✓ claude (42)
       ✓ first edit to an existing file gets the investigation checklist 342ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 262ms
       ✓ a gate-config path gets the weaken-the-gate advisory 324ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 255ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 302ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 284ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 243ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 243ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 375ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 252ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 231ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 237ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 290ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 256ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 368ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 284ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 265ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 283ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 314ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 232ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 257ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 297ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 259ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 263ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 283ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 383ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 273ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 303ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 293ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 288ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 287ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 351ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 281ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 237ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 351ms
       ✓ ordinary file README.md is not treated as a gate config 255ms
       ✓ ordinary file src/index.ts is not treated as a gate config 230ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 207ms
       ✓ mixed-purpose package.json is not treated as a gate config 203ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 200ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 196ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 217ms
     ✓ cursor (42)
       ✓ first edit to an existing file gets the investigation checklist 182ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 167ms
       ✓ a gate-config path gets the weaken-the-gate advisory 158ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 168ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 157ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 163ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 166ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 174ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 164ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 158ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 153ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 165ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 154ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 140ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 132ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 149ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 138ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 143ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 144ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 146ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 135ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 135ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 143ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 133ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 157ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 150ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 152ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 138ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 146ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 148ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 147ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 148ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 143ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 151ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 148ms
       ✓ ordinary file README.md is not treated as a gate config 149ms
       ✓ ordinary file src/index.ts is not treated as a gate config 146ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 152ms
       ✓ mixed-purpose package.json is not treated as a gate config 147ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 152ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 145ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 156ms
     ✓ opencode (42)
       ✓ first edit to an existing file gets the investigation checklist 151ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 124ms
       ✓ a gate-config path gets the weaken-the-gate advisory 113ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 115ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 120ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 128ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 119ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 112ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 113ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 118ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 109ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 126ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 109ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 104ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 108ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 118ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 114ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 115ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 109ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 107ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 107ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 118ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 117ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 118ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 124ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 108ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 117ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 116ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 113ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 115ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 116ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 121ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 119ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 116ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 112ms
       ✓ ordinary file README.md is not treated as a gate config 109ms
       ✓ ordinary file src/index.ts is not treated as a gate config 119ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 113ms
       ✓ mixed-purpose package.json is not treated as a gate config 113ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 116ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 106ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 105ms
     ✓ codex (42)
       ✓ first edit to an existing file gets the investigation checklist 149ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 152ms
       ✓ a gate-config path gets the weaken-the-gate advisory 153ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 139ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 150ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 158ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 156ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 143ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 149ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 156ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 156ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 146ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 127ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 126ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 127ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 132ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 125ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 121ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 122ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 125ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 123ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 126ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 125ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 128ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 129ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 126ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 129ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 134ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 131ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 128ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 129ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 131ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 127ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 124ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 127ms
       ✓ ordinary file README.md is not treated as a gate config 125ms
       ✓ ordinary file src/index.ts is not treated as a gate config 121ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 121ms
       ✓ mixed-purpose package.json is not treated as a gate config 136ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 130ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 124ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 121ms
     ✓ antigravity (42)
       ✓ first edit to an existing file gets the investigation checklist 126ms
       ✓ a create of a nonexistent path gets the reuse checklist instead 125ms
       ✓ a gate-config path gets the weaken-the-gate advisory 130ms
       ✓ a ruff.toml gate config gets the weaken-the-gate advisory 132ms
       ✓ a .ruff.toml gate config gets the weaken-the-gate advisory 126ms
       ✓ a .flake8 gate config gets the weaken-the-gate advisory 129ms
       ✓ a mypy.ini gate config gets the weaken-the-gate advisory 128ms
       ✓ a .mypy.ini gate config gets the weaken-the-gate advisory 130ms
       ✓ a pylintrc gate config gets the weaken-the-gate advisory 123ms
       ✓ a .pylintrc gate config gets the weaken-the-gate advisory 123ms
       ✓ a pytest.ini gate config gets the weaken-the-gate advisory 130ms
       ✓ a jest.config.json gate config gets the weaken-the-gate advisory 130ms
       ✓ a .golangci.yml gate config gets the weaken-the-gate advisory 127ms
       ✓ a .golangci.toml gate config gets the weaken-the-gate advisory 133ms
       ✓ a clippy.toml gate config gets the weaken-the-gate advisory 125ms
       ✓ a rustfmt.toml gate config gets the weaken-the-gate advisory 123ms
       ✓ a .clippy.toml gate config gets the weaken-the-gate advisory 130ms
       ✓ a .rustfmt.toml gate config gets the weaken-the-gate advisory 128ms
       ✓ a tsconfig.build.json gate config gets the weaken-the-gate advisory 132ms
       ✓ a path/to/tsconfig.build.json gate config gets the weaken-the-gate advisory 127ms
       ✓ a vitest.config.ts gate config gets the weaken-the-gate advisory 129ms
       ✓ a vite.config.mts gate config gets the weaken-the-gate advisory 128ms
       ✓ a eslint.config.js gate config gets the weaken-the-gate advisory 124ms
       ✓ a .eslintrc gate config gets the weaken-the-gate advisory 134ms
       ✓ a .eslintrc.json gate config gets the weaken-the-gate advisory 129ms
       ✓ a .prettierrc gate config gets the weaken-the-gate advisory 141ms
       ✓ a .prettierrc.json gate config gets the weaken-the-gate advisory 125ms
       ✓ a prettier.config.js gate config gets the weaken-the-gate advisory 140ms
       ✓ a .prettierignore gate config gets the weaken-the-gate advisory 129ms
       ✓ a biome.json gate config gets the weaken-the-gate advisory 128ms
       ✓ a biome.jsonc gate config gets the weaken-the-gate advisory 130ms
       ✓ a .vale.ini gate config gets the weaken-the-gate advisory 126ms
       ✓ a slop-scan.config.json gate config gets the weaken-the-gate advisory 128ms
       ✓ a .lintstagedrc.json gate config gets the weaken-the-gate advisory 136ms
       ✓ a lint-staged.config.js gate config gets the weaken-the-gate advisory 128ms
       ✓ ordinary file README.md is not treated as a gate config 130ms
       ✓ ordinary file src/index.ts is not treated as a gate config 127ms
       ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades a gate config to the normal checklist 125ms
       ✓ mixed-purpose package.json is not treated as a gate config 131ms
       ✓ mixed-purpose pyproject.toml is not treated as a gate config 128ms
       ✓ mixed-purpose setup.cfg is not treated as a gate config 126ms
       ✓ mixed-purpose tox.ini is not treated as a gate config 137ms
   ✓ gateguard behaviour parity — template copies (25)
     ✓ claude: a consumer's .bkit/templates/.vale.ini is not a gate config 136ms
     ✓ claude: a consumer's root .vale.ini is a gate config 127ms
     ✓ claude: bkit's own .bkit/templates/.vale.ini is a gate config 136ms
     ✓ claude: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 122ms
     ✓ claude: a folder that merely ends in .bkit/templates is not a template copy 119ms
     ✓ cursor: a consumer's .bkit/templates/.vale.ini is not a gate config 125ms
     ✓ cursor: a consumer's root .vale.ini is a gate config 119ms
     ✓ cursor: bkit's own .bkit/templates/.vale.ini is a gate config 118ms
     ✓ cursor: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 123ms
     ✓ cursor: a folder that merely ends in .bkit/templates is not a template copy 127ms
     ✓ opencode: a consumer's .bkit/templates/.vale.ini is not a gate config 106ms
     ✓ opencode: a consumer's root .vale.ini is a gate config 93ms
     ✓ opencode: bkit's own .bkit/templates/.vale.ini is a gate config 91ms
     ✓ opencode: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 94ms
     ✓ opencode: a folder that merely ends in .bkit/templates is not a template copy 99ms
     ✓ codex: a consumer's .bkit/templates/.vale.ini is not a gate config 122ms
     ✓ codex: a consumer's root .vale.ini is a gate config 125ms
     ✓ codex: bkit's own .bkit/templates/.vale.ini is a gate config 120ms
     ✓ codex: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 119ms
     ✓ codex: a folder that merely ends in .bkit/templates is not a template copy 124ms
     ✓ antigravity: a consumer's .bkit/templates/.vale.ini is not a gate config 123ms
     ✓ antigravity: a consumer's root .vale.ini is a gate config 123ms
     ✓ antigravity: bkit's own .bkit/templates/.vale.ini is a gate config 125ms
     ✓ antigravity: a relative .bkit/templates/.vale.ini resolves against the cwd's package (this is bkit's repo) 122ms
     ✓ antigravity: a folder that merely ends in .bkit/templates is not a template copy 126ms
   ✓ gateguard behaviour parity — docs density advisory (25)
     ✓ claude: fires on docs/architecture.md (a docs markdown file) 120ms
     ✓ claude: fires on .bkit/shared/docs/architecture.md (nested docs tree) 122ms
     ✓ claude: does not fire on Documents/architecture.md (segment match, not substring) 126ms
     ✓ claude: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 134ms
     ✓ claude: does not fire on docs/knowledge.jsonl (gated on .md) 121ms
     ✓ cursor: fires on docs/architecture.md (a docs markdown file) 119ms
     ✓ cursor: fires on .bkit/shared/docs/architecture.md (nested docs tree) 114ms
     ✓ cursor: does not fire on Documents/architecture.md (segment match, not substring) 114ms
     ✓ cursor: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 111ms
     ✓ cursor: does not fire on docs/knowledge.jsonl (gated on .md) 113ms
     ✓ opencode: fires on docs/architecture.md (a docs markdown file) 89ms
     ✓ opencode: fires on .bkit/shared/docs/architecture.md (nested docs tree) 91ms
     ✓ opencode: does not fire on Documents/architecture.md (segment match, not substring) 91ms
     ✓ opencode: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 91ms
     ✓ opencode: does not fire on docs/knowledge.jsonl (gated on .md) 89ms
     ✓ codex: fires on docs/architecture.md (a docs markdown file) 116ms
     ✓ codex: fires on .bkit/shared/docs/architecture.md (nested docs tree) 122ms
     ✓ codex: does not fire on Documents/architecture.md (segment match, not substring) 122ms
     ✓ codex: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 129ms
     ✓ codex: does not fire on docs/knowledge.jsonl (gated on .md) 123ms
     ✓ antigravity: fires on docs/architecture.md (a docs markdown file) 124ms
     ✓ antigravity: fires on .bkit/shared/docs/architecture.md (nested docs tree) 117ms
     ✓ antigravity: does not fire on Documents/architecture.md (segment match, not substring) 123ms
     ✓ antigravity: does not fire on docs/plans/202608/x/design.md (plans follow the plan template) 131ms
     ✓ antigravity: does not fire on docs/knowledge.jsonl (gated on .md) 116ms
   ✓ gateguard behaviour parity — dedup (10)
     ✓ claude: second touch of the same file in the same session is silent 134ms
     ✓ claude: a different file in the same session warns again 233ms
     ✓ cursor: second touch of the same file in the same session is silent 143ms
     ✓ cursor: a different file in the same session warns again 236ms
     ✓ opencode: second touch of the same file in the same session is silent 95ms
     ✓ opencode: a different file in the same session warns again 181ms
     ✓ codex: second touch of the same file in the same session is silent 149ms
     ✓ codex: a different file in the same session warns again 249ms
     ✓ antigravity: second touch of the same file in the same session is silent 153ms
     ✓ antigravity: a different file in the same session warns again 250ms
   ✓ gateguard behaviour parity — modes (15)
     ✓ claude: BKIT_GATEGUARD=off is a total no-op 24ms
     ✓ claude: BKIT_GATEGUARD=deny blocks the first touch with the checklist 124ms
     ✓ claude: deny mode allows the retry (dedup lets the second call through) 155ms
     ✓ cursor: BKIT_GATEGUARD=off is a total no-op 26ms
     ✓ cursor: BKIT_GATEGUARD=deny blocks the first touch with the checklist 121ms
     ✓ cursor: deny mode allows the retry (dedup lets the second call through) 150ms
     ✓ opencode: BKIT_GATEGUARD=off is a total no-op 1ms
     ✓ opencode: BKIT_GATEGUARD=deny blocks the first touch with the checklist 97ms
     ✓ opencode: deny mode allows the retry (dedup lets the second call through) 93ms
     ✓ codex: BKIT_GATEGUARD=off is a total no-op 24ms
     ✓ codex: BKIT_GATEGUARD=deny blocks the first touch with the checklist 120ms
     ✓ codex: deny mode allows the retry (dedup lets the second call through) 153ms
     ✓ antigravity: BKIT_GATEGUARD=off is a total no-op 27ms
     ✓ antigravity: BKIT_GATEGUARD=deny blocks the first touch with the checklist 122ms
     ✓ antigravity: deny mode allows the retry (dedup lets the second call through) 149ms
   ✓ gateguard behaviour parity — no-op and fail-open (5)
     ✓ claude: an edit payload with no file path is ignored 25ms
     ✓ cursor: an edit payload with no file path is ignored 28ms
     ✓ opencode: an edit payload with no file path is ignored 1ms
     ✓ codex: an edit payload with no file path is ignored 24ms
     ✓ antigravity: an edit payload with no file path is ignored 27ms
   ✓ gateguard behaviour parity — corrupt state (4)
     ✓ claude: unparseable session state still advises, and deny does not loop 51ms
     ✓ cursor: unparseable session state still advises, and deny does not loop 55ms
     ✓ opencode: unparseable session state still advises, and deny does not loop 2ms
     ✓ codex: unparseable session state still advises, and deny does not loop 54ms
   ✓ gateguard behaviour parity — state folders (21)
     ✓ claude: dedup state lives in a per-user folder 25ms
     ✓ claude: another user's shared folder does not cost the session its dedup 49ms
     ✓ claude: an unwritable state folder still delivers the checklist 25ms
     ✓ claude: deny mode with an unwritable state folder never blocks the retry 55ms
     ✓ cursor: dedup state lives in a per-user folder 27ms
     ✓ cursor: another user's shared folder does not cost the session its dedup 53ms
     ✓ cursor: an unwritable state folder still delivers the checklist 28ms
     ✓ cursor: deny mode with an unwritable state folder never blocks the retry 55ms
     ✓ opencode: dedup state lives in a per-user folder 1ms
     ✓ opencode: another user's shared folder does not cost the session its dedup 1ms
     ✓ opencode: an unwritable state folder still delivers the checklist 1ms
     ✓ opencode: deny mode with an unwritable state folder never blocks the retry 1ms
     ✓ codex: dedup state lives in a per-user folder 31ms
     ✓ codex: another user's shared folder does not cost the session its dedup 52ms
     ✓ codex: an unwritable state folder still delivers the checklist 28ms
     ✓ codex: deny mode with an unwritable state folder never blocks the retry 58ms
     ✓ antigravity: dedup state lives in a per-user folder 29ms
     ✓ antigravity: another user's shared folder does not cost the session its dedup 59ms
     ✓ antigravity: an unwritable state folder still delivers the checklist 29ms
     ✓ antigravity: deny mode with an unwritable state folder never blocks the retry 58ms
     ✓ opencode: an unwritable state folder warns once per session, not on every edit 2ms
   ✓ antigravity deny-once delivery — retry folder (3)
     ✓ another user's shared retry folder does not cost the checklist 58ms
     ✓ an unwritable retry folder allows the call instead of denying it with no way through 56ms
     ✓ adviseOnce returns allow, never throws, when the retry folder cannot be written 3ms
   ✓ gateguard structural parity (21)
     ✓ claude: carries slash-comment markers with start before end 0ms
     ✓ claude: the managed block never emits or reads stdin 0ms
     ✓ claude: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ cursor: carries slash-comment markers with start before end 0ms
     ✓ cursor: the managed block never emits or reads stdin 0ms
     ✓ cursor: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ opencode: carries slash-comment markers with start before end 0ms
     ✓ opencode: the managed block never emits or reads stdin 0ms
     ✓ opencode: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ codex: carries slash-comment markers with start before end 0ms
     ✓ codex: the managed block never emits or reads stdin 0ms
     ✓ codex: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ antigravity: carries slash-comment markers with start before end 0ms
     ✓ antigravity: the managed block never emits or reads stdin 0ms
     ✓ antigravity: dedup state lives in the OS temp dir, never in the consumer repo 0ms
     ✓ claude and cursor blocks are byte-identical 0ms
     ✓ every host's generated block carries the shared engine verbatim 1ms
     ✓ the codex block carries the same advisory texts as the claude twin 0ms
     ✓ the codex block matches apply_patch and parses the V4A envelope 0ms
     ✓ codex advises on the *** Move to: target of a renaming patch 235ms
     ✓ the opencode block carries the same advisory texts as the CJS twins 0ms
   ✓ gateguard parity — documented deviations (4)
     ✓ only Claude distinguishes Edit from Write for the new-file nudge 123ms
     ✓ blocking is expressed differently per host but means the same thing 234ms
     ✓ Antigravity delivers the checklist by denying the first edit once; the retry passes 153ms
     ✓ malformed stdin is a CJS-hook concern only 53ms
   ✓ codex gateguard — complete-block batching (2)
     ✓ reserves notices inside conservative host budgets 56ms
     ✓ acknowledges only complete selected blocks on verified routes 81ms
   ✓ codex gateguard — complete patches and shell (1)
     ✓ routes Codex complete patches and initial shell commands 188ms
   ✓ opencode gateguard — edit coverage and boundary (1)
     ✓ preserves OpenCode edit coverage and after-execute boundary 1619ms
   ❯ gateguard parity — rendered shell advice (2)
     ✓ keeps rendered classification advice and acknowledgement equivalent 685ms
     × bounds rendered cold-start time and complete response size 221ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts > gateguard parity — rendered shell advice > bounds rendered cold-start time and complete response size
AssertionError: cursor/maximum: expected 9215 to be less than or equal to 2000
 ❯ .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts:1316:29
    1314|         const where = `${host}/${label}`;
    1315|         expect(result.elapsedMs, evidence.join("\n")).toBeLessThan(BOU…
    1316|         expect(size, where).toBeLessThanOrEqual(budget.limit);
       |                             ^
    1317|         // Never a crash, never a block, and only complete blocks (no …
    1318|         expect(result.status, where).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 348 passed (349)
   Start at  23:12:57
   Duration  47.82s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7WXEhY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
