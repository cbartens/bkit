
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/install/install.integration.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests | 1 failed) 23294ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ runPreflight returns no-package-json blocker when package.json is absent 9ms
     ✓ formatChecklist renders the blocker banner with [blocker] marker 7ms
     ✓ formatChecklist banner contains Detect and Action sections 5ms
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 278ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ runPreflight returns advisory findings for seeded conditions 7ms
     ✓ formatChecklist renders a numbered checklist for multiple advisories 7ms
     ✓ formatChecklist includes the instructions header for AI agents 6ms
     ✓ runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset 247ms
     ✓ full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner 185ms
     ✓ no duplicate ids in the final checklist 110ms
   ✓ Scenario 3 — bkit check: Phase 3 detectors run for parity with install (4)
     ✓ runPostInstallCheck includes Phase 3 detector findings (gh-mcp-token-unset-shell when BKIT_GH_TOKEN unset) 100ms
     ✓ formatChecklist renders Phase 1 advisories 8ms
     ✓ formatChecklist([]) returns empty string — no banner emitted on zero advisories 1ms
     ✓ blockers fire from preflight (Phase 1 remains active in bkit check) 7ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 684ms
   ❯ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     × every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 484ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 700ms
   ✓ Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9) (2)
     ✓ runPostInstallCheck surfaces a blocker-severity finding for a stale managed-version marker 67ms
     ✓ Phase 3 blocker findings are distinguished from advisories (severity=blocker) 64ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 329ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 320ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 378ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 426ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 493ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 435ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 449ms
   ✓ Challenge Finding 3 — cloud/tracker constraint-before-write regression (9)
     ✓ --tracker=github --auto=cursor exits non-zero (constraint mismatch) 192ms
     ✓ --tracker=jira --auto=claude exits non-zero (constraint mismatch) 181ms
     ✓ --tracker=jira --auto=cursor exits non-zero (constraint mismatch) 175ms
     ✓ --tracker=jira --auto=opencode exits non-zero (constraint mismatch) 220ms
     ✓ --tracker=github --auto=cursor does NOT write bkit.tracker.default to package.json (no partial write) 182ms
     ✓ --tracker=jira --auto=claude does NOT write bkit.tracker.default to package.json (no partial write) 211ms
     ✓ --tracker=jira --auto=cursor does NOT write bkit.tracker.default to package.json (no partial write) 147ms
     ✓ --tracker=jira --auto=opencode does NOT write bkit.tracker.default to package.json (no partial write) 168ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 277ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 130ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 126ms
     ✓ explicit `bkit help` prints the same usage and exits 0 130ms
     ✓ `bkit check --claude` (stray module flag) errors 136ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 132ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 294ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 285ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 128ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 288ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 553ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 860ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 857ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 853ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 867ms
   ✓ detectOpencodeProviders — multi-provider tracking (issue #281 Task 2) (4)
     ✓ reads opencodeProviders array from package.json 1ms
     ✓ returns [] when no bkit opencode fields present 1ms
     ✓ filters invalid providers from the array 1ms
     ✓ returns [] when package.json does not exist 0ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 552ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 815ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 572ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 825ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 831ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 885ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 897ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 902ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 885ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 576ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 556ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 977ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 816ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md > every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md
AssertionError: payload files the install did not write: expected [ '.bkit/lite.md -> .bkit/lite.md' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/lite.md -> .bkit/lite.md",
+ ]

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:405:64
    403|       .filter(({ dest }) => !fs.existsSync(path.join(tmpDir, dest)))
    404|       .map(({ rel, dest }) => `${rel} -> ${dest}`);
    405|     expect(missing, "payload files the install did not write").toEqual…
       |                                                                ^
    406|
    407|     const templates = relFiles(getTemplatesRoot()).filter((rel) => !re…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 65 passed (66)
   Start at  07:52:31
   Duration  25.14s (tests 94%, transform 5%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dltEjW/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
