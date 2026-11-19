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
| 6 | `.bkit/core/engine/install/modules/claude.integration.test.ts` "keeps a retired value the mcp-servers block derives and records no drift on the next dry run" | red | passed |
| 7 | `.bkit/core/engine/install/write.test.ts` "does not remove a deny rule named by an injected retired list" | red | passed |

## Gaps

None.
