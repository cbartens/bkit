Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 12 | `.bkit/core/engine/install/modules/index.integration.test.ts` "Codex denies a private-key read combined with an ask-tier command" | red | passed |
| 12 | `.bkit/core/engine/install/modules/index.integration.test.ts` "Codex denies a private-key read after a destructive git ask" | red | passed |
| 13 | `.bkit/core/engine/install/modules/index.integration.test.ts` "Codex denies a private-key shell read chained after an ask-tier command" | red | passed |
| 14 | `.bkit/core/engine/checks/before/files.test.ts` "redacts schemeless user-info in a reported key" | red | passed |
| 14 | `.bkit/core/engine/checks/before/files.test.ts` "redactUrlParts drops user-info with no scheme" | red | passed |
| 15 | `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" | passed-accepted | passed |
| 16 | `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 15 `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" — passed at the group's red, and the tests step accepted it: vacuous only because the code fix already landed (codex.ts:219 inlines the steps and names no docs/testing.md); the test already scopes to the codex-setup block and asserts id_rsa and bkit tests jump inline, so it fails if the pointer returns; left unchanged; no red is due
- Task 16 `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" — passed at the group's red, and the tests step accepted it: advisory in codex.ts:219 is already inline and names no docs/testing.md; test now scopes to that block and fails if it names it; no red is due
