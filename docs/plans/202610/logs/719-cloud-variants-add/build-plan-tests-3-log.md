Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 4: cloud variants are CLOUD_MODES and parseCloudAgents in .bkit/core/engine/install/manifest.ts:104-115; parseArgs cloudVariant and modules from .bkit/core/engine/cli.test.ts:109-120; CLASSIC_VERB_HELP owns install/uninstall help.
SOURCE — TASK 5: ModuleContext carries issueTracker, cloudVariant and opencodeProvider in .bkit/core/engine/install/modules/index.ts:77-94; setup advisories use id bkit-cloud-setup and action in .bkit/core/engine/install/modules/cloud.ts:88-188; provider envVar table in .bkit/core/engine/shared/egress.ts:49-106; assigned env keys parsed from source .env.example in templates-content.test.ts:634-637.
SOURCE — TASK 6: existing host prerequisite executes before package writes in .bkit/core/engine/commands/install/install.ts:390-440; ModuleFlag opencode syntax is --opencode=openrouter; subprocess helper uses requireTsx from vitest.tsx-bin.ts:18. Replaced retired pairing-refusal fixtures with wired-tracker cases, preserving no-state-write assertions on missing Codex host.
WROTE — TASK 4: `.bkit/core/engine/install/manifest.test.ts` `parseCloudAgents accepts codex`
WROTE — TASK 4: `.bkit/core/engine/cli.test.ts` `--auto=codex parses to the codex cloud variant`
WROTE — TASK 4: `.bkit/core/engine/cli.test.ts` `--auto=<bad> lists claude, cursor, opencode and codex`
WROTE — TASK 5: `.bkit/core/engine/install/modules/cloud.integration.test.ts` `codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY`
WROTE — TASK 5: `.bkit/core/engine/install/modules/cloud.integration.test.ts` `%s variant under %s names only that tracker's key`
WROTE — TASK 5: `.bkit/core/engine/install/modules/cloud.integration.test.ts` `claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables`
WROTE — TASK 5: `.bkit/core/engine/install/modules/cloud.integration.test.ts` `opencode variant advisory names the configured provider's BKIT_ key`
WROTE — TASK 5: `.bkit/core/engine/audits/templates/templates-content.test.ts` `vendor API keys are BKIT_-prefixed`
WROTE — TASK 6: `.bkit/core/engine/commands/install/install.test.ts` `validateCloudTrackerWired passes %s with %s`
WROTE — TASK 6: `.bkit/core/engine/commands/install/install.test.ts` `validateCloudTrackerWired refuses tracker none naming --tracker=`
WROTE — TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` `--auto=codex without .codex/ exits 1 naming --codex and writes nothing`
WROTE — TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=jira --codex --auto=codex exits 0 and records codex`
WROTE — TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=github --auto=cursor exits 0 and records cursor`
WROTE — TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode`
