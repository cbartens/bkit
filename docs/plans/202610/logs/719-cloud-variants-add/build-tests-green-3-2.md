Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/install/manifest.test.ts` "parseCloudAgents accepts codex" | red | passed |
| 4 | `.bkit/core/engine/cli.test.ts` "--auto=codex parses to the codex cloud variant" | red | passed |
| 4 | `.bkit/core/engine/cli.test.ts` "--auto=<bad> lists claude, cursor, opencode and codex" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "%s variant under %s names only that tracker's key" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "opencode variant advisory names the configured provider's BKIT_ key" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "vendor API keys are BKIT_-prefixed" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.test.ts` "validateCloudTrackerWired passes %s with %s" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.test.ts` "validateCloudTrackerWired refuses tracker none naming --tracker=" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--auto=codex without .codex/ exits 1 naming --codex and writes nothing" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | passed-accepted | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --auto=cursor exits 0 and records cursor" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode" | red | passed |
| 19 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 6 `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" — passed at the group's red, and the tests step accepted it: the implementation already satisfies the planned behavior; the current engine run in build-tests-red-3-2.md passed all 62 install integration tests. The test reaches the real install and retains all corrected behavior assertions. Preserved source, test and earlier red evidence rather than inventing a new failure.; no red is due
- Task 19 `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" — passed at the group's red, and the tests step accepted it: existing runCodexModule writes .codex/hooks.json; the task corrects only the stale footprint filename while retaining exit 0, tracker jira and cloud agent codex assertions. The full integration file passed 62 tests; targeted lint, formatting and git diff --check passed. Existing implementation and prior red evidence were preserved.; no red is due
