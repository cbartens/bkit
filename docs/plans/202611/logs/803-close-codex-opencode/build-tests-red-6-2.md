Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 6, attempt 2

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" | vacuous | "the codex-setup private-key action is self-contained in a fresh consumer" passes at its red, so it proves nothing |
| 16 | `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" | passed-accepted | passes; accepted by the tests step: advisory in codex.ts:219 is already inline and names no docs/testing.md; test now scopes to that block and fails if it names it |

## Gaps

- TASK 15 `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" `vacuous` — "the codex-setup private-key action is self-contained in a fresh consumer" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/install.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/install.integration.test.ts

[test-timeout-budget] load average 12.8 on 10 cores: unit limits 10900ms per test, 21800ms per hook (x2.18)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 92034ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 439ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 514ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 823ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 435ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 422ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 540ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 582ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 479ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 449ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 433ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 413ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 382ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 384ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 354ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 641ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 669ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 418ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 1941ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 5472ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 3523ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 3237ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 3822ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 2937ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 3858ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (6)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 2985ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 3170ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 3503ms
     ✓ a --codex install reports the private-key and .env shell-read protection status 1177ms
     ✓ a --codex install tells the reader how to act on the private-key status 1181ms
     ✓ the codex-setup private-key action is self-contained in a fresh consumer 1370ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 3309ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 3549ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 3619ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 3614ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 2794ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 3081ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 4314ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 4705ms
   ✓ #864 — project document starters and their index (4)
     ✓ ships ten optional document starters on fresh install 2522ms
     ✓ preserves the contents of a legacy managed document when reinstalling 2695ms
     ✓ registers an adopted starter without duplicating project rows 4825ms
     ✓ preserves indexed equivalents and warns about unsafe registration paths 4259ms

 Test Files  1 passed (1)
      Tests  69 passed (69)
   Start at  10:45:11
   Duration  92.24s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-TCbhEC/junit.xml
```
