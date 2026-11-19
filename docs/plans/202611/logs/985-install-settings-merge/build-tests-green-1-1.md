Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/985-install-settings-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/write.test.ts` "shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow" | red | passed |
| 1 | `.bkit/core/engine/install/write.test.ts` "removes a retired entry and keeps the person's entries beside it" | red | passed |
| 1 | `.bkit/core/engine/install/write.test.ts` "returns a document without the retired entry unchanged and a second prune changes nothing" | red | passed |
| 1 | `.bkit/core/engine/install/write.test.ts` "reports an edited variant as edited and never removes it" | red | passed |
| 1 | `.bkit/core/engine/install/write.test.ts` "does not report an entry the template ships as edited" | red | passed |
| 1 | `.bkit/core/engine/install/write.test.ts` "matches the file by repo-relative path whether the destination is relative or absolute" | red | passed |
| 1 | `.bkit/core/engine/install/write.test.ts` "prunes a retired entry in any host file the list names" | red | passed |
| 2 | `.bkit/core/engine/install/write.test.ts` "drops a retired entry even when the template is otherwise contained" | red | passed |
| 2 | `.bkit/core/engine/install/write.test.ts` "dry run records the same write and leaves the file untouched" | red | passed |
| 2 | `.bkit/core/engine/install/write.test.ts` "a second run after pruning writes nothing" | red | passed |
| 2 | `.bkit/core/engine/install/write.test.ts` "keeps an edited variant and warns with the file and the entry" | red | passed |
| 2 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's" | red | passed |
| 2 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run lists the settings update and leaves the retired grant" | red | passed |

## Gaps

None.
