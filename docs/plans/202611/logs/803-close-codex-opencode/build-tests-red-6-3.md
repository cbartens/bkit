Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 6, attempt 3

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/commands/install/install.integration.test.ts` "the codex-setup private-key action is self-contained in a fresh consumer" | passed-accepted | passes; accepted by the tests step: vacuous only because the code fix already landed (codex.ts:219 inlines the steps and names no docs/testing.md); the test already scopes to the codex-setup block and asserts id_rsa and bkit tests jump inline, so it fails if the pointer returns; left unchanged |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/install.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/install.integration.test.ts

[test-timeout-budget] load average 15.4 on 10 cores: unit limits 12200ms per test, 24400ms per hook (x2.44)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode

 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 159107ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 758ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset 548ms
     ✓ full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner 357ms
     ✓ no duplicate ids in the final checklist 641ms
   ✓ Scenario 3 — bkit check: Phase 3 detectors run for parity with install (4)
     ✓ runPostInstallCheck includes Phase 3 detector findings (gh-mcp-token-unset-shell when BKIT_GH_TOKEN unset) 368ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 2187ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 2594ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 4200ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 1529ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 1548ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 1493ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 1578ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 1777ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 2004ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 2493ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --auto=codex without .codex/ exits 1 naming --codex and writes nothing 1737ms
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 2706ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 2176ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 2233ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1761ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 951ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 951ms
     ✓ explicit `bkit help` prints the same usage and exits 0 1063ms
     ✓ `bkit check --claude` (stray module flag) errors 848ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 1012ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 2066ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1576ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 1148ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 2006ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 4278ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 5596ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 5337ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 5971ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 4838ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 3575ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 4761ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (6)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 3372ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 4957ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 4929ms
     ✓ a --codex install reports the private-key and .env shell-read protection status 1546ms
     ✓ a --codex install tells the reader how to act on the private-key status 2026ms
     ✓ the codex-setup private-key action is self-contained in a fresh consumer 1689ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 5711ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 5591ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 5634ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 6235ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 3281ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 4046ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 6183ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 5299ms
   ✓ #864 — project document starters and their index (4)
     ✓ ships ten optional document starters on fresh install 4377ms
     ✓ preserves the contents of a legacy managed document when reinstalling 2985ms
     ✓ registers an adopted starter without duplicating project rows 4774ms
     ✓ preserves indexed equivalents and warns about unsafe registration paths 5091ms

 Test Files  1 passed (1)
      Tests  69 passed (69)
   Start at  11:21:09
   Duration  160.21s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-GNs7Bk/junit.xml
```
