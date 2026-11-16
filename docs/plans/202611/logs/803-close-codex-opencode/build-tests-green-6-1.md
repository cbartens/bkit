Enforced: true
Verdict: CONCERNS
Gaps: 1
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
| 15 | `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" | red | not passed |

## Gaps

- Task 15 `not-green` — "the codex-setup private-key action is self-contained in a fresh consumer" failure: expected { pointsAtOwnDoc: true, …(1) } to not deeply equal { pointsAtOwnDoc: true, …(1) } — Fixable: true — log: TASK 15: `.bkit/core/engine/commands/install/install.integration.test.ts` `the codex-setup private-key action is self-contained in a fresh consumer` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 1105ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 1040ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 1069ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 1049ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 628ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 622ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 1108ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 891ms
   ✓ #864 — project document starters and their index (4)
     ✓ ships ten optional document starters on fresh install 648ms
     ✓ preserves the contents of a legacy managed document when reinstalling 629ms
     ✓ registers an adopted starter without duplicating project rows 945ms
     ✓ preserves indexed equivalents and warns about unsafe registration paths 954ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > Scenario — Codex + Antigravity install side by side without conflict (#534) > the codex-setup private-key action is self-contained in a fresh consumer
AssertionError: expected { pointsAtOwnDoc: true, …(1) } to not deeply equal { pointsAtOwnDoc: true, …(1) }

Compared values have no visual difference.

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:1394:52
    1392|     const pointsAtOwnDoc = out.includes("docs/testing.md");
    1393|     const recipeInOwnDoc = body.includes("Codex key-read deny");
    1394|     expect({ pointsAtOwnDoc, recipeInOwnDoc }).not.toEqual({
       |                                                    ^
    1395|       pointsAtOwnDoc: true,
    1396|       recipeInOwnDoc: false,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 68 passed (69)
   Start at  09:44:28
   Duration  28.14s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-308zzn/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
