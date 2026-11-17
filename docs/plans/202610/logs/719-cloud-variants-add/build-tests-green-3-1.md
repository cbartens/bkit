Enforced: true
Verdict: CONCERNS
Gaps: 1
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
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | red | not passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --auto=cursor exits 0 and records cursor" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode" | red | passed |

## Gaps

- Task 6 `not-green` — "--tracker=jira --codex --auto=codex exits 0 and records codex" failure: expected false to be true // Object.is equality — Fixable: true — log: TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=jira --codex --auto=codex exits 0 and records codex` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 8057ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 7849ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 7218ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 8115ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 2438ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 2373ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 2373ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 3722ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > cloud variants — wired trackers and host prerequisites > --tracker=jira --codex --auto=codex exits 0 and records codex
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:883:71
    881|     expect(facts.bkit?.tracker?.default).toBe("jira");
    882|     expect(facts.bkit?.cloud?.agent).toBe("codex");
    883|     expect(fs.existsSync(path.join(tmpDir, ".codex", "config.toml"))).…
       |                                                                       ^
    884|   });
    885|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 61 passed (62)
   Start at  20:10:46
   Duration  101.81s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4RBiW6/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
