Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 3, attempt 2

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | vacuous | "--tracker=jira --codex --auto=codex exits 0 and records codex" passes at its red, so it proves nothing |
| 19 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | passed-accepted | passes; accepted by the tests step: existing runCodexModule writes .codex/hooks.json; the task corrects only the stale footprint filename while retaining exit 0, tracker jira and cloud agent codex assertions. The full integration file passed 62 tests; targeted lint, formatting and git diff --check passed. Existing implementation and prior red evidence were preserved. |

## Gaps

- TASK 6 `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" `vacuous` — "--tracker=jira --codex --auto=codex exits 0 and records codex" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/install.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/install.integration.test.ts

[test-timeout-budget] load average 13.0 on 10 cores: unit limits 11000ms per test, 22000ms per hook (x2.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (62 tests) 104062ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 307ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 869ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 4477ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 1635ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 689ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 699ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 847ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 2002ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 1637ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 2253ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 854ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 1368ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 516ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 1299ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 521ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 691ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 691ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 320ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 674ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 1266ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 4902ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 4121ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 4469ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 4382ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 1328ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 1966ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 4086ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 4728ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 4395ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 8409ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 7832ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 8039ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 8055ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 2550ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 2588ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 2553ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 3724ms

 Test Files  1 passed (1)
      Tests  62 passed (62)
   Start at  21:04:31
   Duration  104.33s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sBXwYk/junit.xml
```
