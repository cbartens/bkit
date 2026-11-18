
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/ledgers.ts dist/commands/workflow/decisions.js dist/commands/workflow/ledgers.js docs/failures.jsonl docs/plans/202611/1035-ledger-commit-outbox-plan.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-brief-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-brief-tests-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-diff-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-1-log.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-1-log.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-green-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/ledgers.ts dist/commands/workflow/decisions.js dist/commands/workflow/ledgers.js docs/failures.jsonl docs/plans/202611/1035-ledger-commit-outbox-plan.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-brief-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-brief-tests-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-diff-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-1-log.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-1-log.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-green-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

[feat/test 67c9fd1] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 33062ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 1346ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2784ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1976ms
     ✓ does not fall back through a malformed later success receipt 1197ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 707ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 645ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 763ms
     ✓ a gate that has not finished leaves no failed receipt 528ms
     ✓ the restore step leaves another worktree's .failed file alone 565ms
     ✓ a pending attempt whose process is gone is not treated as running 2120ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 1831ms
     ✓ a push gate the hold limit stopped exits 124, hands the held-too-long status file on and earns no proof 1164ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1388ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1740ms
     ✓ requires proof even when the pushed increment changes no files 1012ms
     ✓ ignores malformed receipts 1237ms
     ✓ does not record a tracked tree 616ms
     ✓ does not record a untracked tree 580ms
     ✓ does not record a mutated tree 654ms
     ✓ does not record a committed tree 759ms
     ✓ records no proof for a failed gate or lighter gate 1185ms
     ✓ requires integration proof when integration is declared 1554ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2568ms
     ✓ a new branch with only bookkeeping after a receipted ancestor takes the minimum gate 1174ms
     ✓ invalidates proof when the gate definition changes 1184ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 748ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 78484ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 12897ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 2540ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 2034ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 1309ms
     ✓ node — with no report path the test file is left as it was 14098ms
     ✓ bats — with no report path the test file is left as it was 3160ms
     ✓ node — with no report path the test file is left as it was 2895ms
     ✓ vitest — with no report path the test file is left as it was 2100ms
     ✓ a run naming files of two kinds is refused as a usage error 903ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 1044ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1278ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 854ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 578ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 983ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 850ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30955ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 97630ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 581ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 1733ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 1944ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 788ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 833ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 919ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 971ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 807ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 824ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 860ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --auto=codex without .codex/ exits 1 naming --codex and writes nothing 437ms
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 809ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 866ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 1007ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 819ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 399ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 407ms
     ✓ explicit `bkit help` prints the same usage and exits 0 438ms
     ✓ `bkit check --claude` (stray module flag) errors 453ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 409ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 887ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1058ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 484ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 1148ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 2665ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 3723ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 3343ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 3715ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 3627ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 2924ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 3793ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (6)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 2695ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 4213ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 3405ms
     ✓ a --codex install reports the private-key and .env shell-read protection status 1153ms
     ✓ a --codex install tells the reader how to act on the private-key status 1303ms
     ✓ the codex-setup private-key action is self-contained in a fresh consumer 1180ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 3694ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 3749ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 4343ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 4011ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 2371ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 2173ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 4065ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 3498ms
   ✓ #864 — project document starters and their index (4)
     ✓ ships ten optional document starters on fresh install 2320ms
     ✓ preserves the contents of a legacy managed document when reinstalling 2157ms
     ✓ registers an adopted starter without duplicating project rows 3437ms
     ✓ preserves indexed equivalents and warns about unsafe registration paths 3178ms
stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 55377ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1515ms
     ✓ runs code.ts through its declared gate in the built checkout 1748ms
     ✓ runs code.ts through its declared gate in the built checkout 1658ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1711ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1822ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1434ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1374ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1535ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 920ms
     ✓ runs the full gate for replayed debug code 1449ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1593ms
     ✓ installs local dependencies against the built target tree 1743ms
     ✓ runs the configured frozen install even without root dependencies 1536ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1440ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1552ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1675ms
     ✓ never pushes local dev commits missing from origin/dev 1784ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3287ms
     ✓ dev moved before every push: exhausted, nothing landed 4634ms
     ✓ any other refusal is returned, not retried 1782ms
     ✓ pushToDev replays a commit range onto origin/dev 1974ms
     ✓ a replay retries on the new dev when dev moved 3276ms
     ✓ pushToDev log line names what it lands 1718ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1810ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1812ms
     ✓ a push that fails without a server answer is returned once, never retried 1573ms
     ✓ a failed fetch is returned before anything is built 522ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2210ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1749ms
     ✓ lands from a clone whose fetch refspec omits dev 1872ms
     ✓ build throwing stops the landing and removes the throwaway checkout 647ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (79 tests) 178739ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 415ms
     ✓ install --claude does not write Serena or graphify examples 531ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 409ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 664ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 962ms
     ✓ bkit upgrade prints the adopted marker for a changed starter with a project copy 907ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 1814ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 1904ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 1858ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 3178ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3585ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3876ms
     ✓ malformed .mcp.json fails install instead of being overwritten 812ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 4358ms
     ✓ an adopted copy of every template survives upgrade and check 4651ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 4765ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 4884ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 2320ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 6710ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 4511ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 3445ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 5115ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 3518ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 3454ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 6405ms
     ✓ branded script migration is idempotent and dry-run writes nothing 5414ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 3834ms
     ✓ a dry-run hook and CI token migration writes nothing 2040ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 4481ms
     ✓ a second check-name migration writes nothing 4385ms
     ✓ a dry-run check-name migration writes and moves nothing 1759ms
     ✓ a second Vale migration and a dry run write nothing 4102ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 3288ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 2936ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3370ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 2367ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 2083ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 2102ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 2004ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2008ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 2178ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 2202ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 2759ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 3071ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 2948ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1779ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 474ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 479ms
     ✓ passes -w when the consumer is a pnpm workspace root 471ms
     ✓ starts the package runner for the install and the re-exec 1025ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 468ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 3434ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 3673ms
     ✓ migrates legacy ownership without changing project text or core ownership 4613ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 3152ms
     ✓ previews project document migration without mutating the checkout 1790ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 3193ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 2265ms
     ✓ upgrade names the missing root lint-staged config with the copy command 2105ms
     ✓ install names the missing root lint-staged config under its own log prefix 2357ms
     ✓ check names the missing root lint-staged config under its own log prefix 2055ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 1884ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 2228ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 2329ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 2319ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 2196ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (190 tests) 203394ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 436ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1495ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 409ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 371ms
     ✓ writes no limits for a workflow with no ask point 354ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 302ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 352ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 477ms
       ✓ a new run in the same chat gets its own session row 385ms
       ✓ writes none outside Claude Code 377ms
     ✓ opens the next run after a finished one, and after another workflow's run 406ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 561ms
     ✓ design / plan / build / debug book in the current worktree 438ms
     ✓ refuses when the lock is live, writing no row 303ms
     ✓ --lock-held checks the lock is ours 498ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 384ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 593ms
   ✓ bkit workflows start — resume facts (12)
     ✓ an OPEN decision of an earlier run never resurfaces 384ms
     ✓ an OPEN decision mid-build prints its header fields 353ms
     ✓ openDecision carries the Source changed header 301ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 564ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 471ms
     ✓ writes no row when status.jsonl does not exist 350ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 342ms
     ✓ aborts a rebase only when one is in progress 810ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 657ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 689ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 410ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 500ms
     ✓ --max-exceeded says a handover is due without any sentinel 300ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 331ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 417ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 407ms
     ✓ a debug run in SOAK mode always needs a handover 322ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 850ms
       ✓ counts subagents of an earlier chat the run's session rows name 719ms
       ✓ records no context block, and still closes, outside a Claude Code session 743ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 726ms
     ✓ records ending held and publish false on the workflow-done row 820ms
     ✓ defaults the close row to ending done 832ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 733ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 715ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 729ms
     ✓ always writes the telemetry, whatever the runtime 745ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 565ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 608ms
     ✓ an unwritable stats path is logged and never fails the close 645ms
     ✓ appends the completeness row before the workflow-done row 798ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 780ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 707ms
     ✓ writes one completeness row per close 1194ms
     ✓ leaves out the previous run's rows that share a second with this run's start 660ms
     ✓ still closes when the completeness check throws 671ms
     ✓ still closes when the completeness row write throws 600ms
     ✓ ship: run.pr, size of the squash commit, and coverage 722ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1082ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 715ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 615ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 804ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 758ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 900ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 773ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 786ms
     ✓ --record-step writes the close step's row before workflow-done 656ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 711ms
     ✓ --number without --outbox is a usage error 637ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 953ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1022ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 987ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1057ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 787ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 347ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 348ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2203ms
     ✓ --flush with nothing to record commits and pushes nothing 1173ms
     ✓ --flush carries the named worktree's logs into the dev commit 2252ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2825ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 3582ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 3390ms
     ✓ closePr titles the PR by the record it carries 3114ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 956ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 716ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 1159ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 845ms
       ✓ --ref, no push → route stop, no message 497ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 862ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2293ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2865ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2382ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2714ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2667ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2453ms
     ✓ --push on dev never carries a row whose references name another feature 2455ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2325ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4377ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2817ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1052ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2654ms
     ✓ preserves unlanded file deletions and ledger additions on close 5496ms
     ✓ preserves dirty work and uncertain branch evidence during close 5290ms
     ✓ preserves a local feature ref changed after its cleanup proof 5545ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3339ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3036ms
     ✓ a close that landed releases the lock 3435ms
     ✓ removes the worktree before it releases the lock 3081ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4799ms
       ✓ closePr refuses when the PR base is unknown 4390ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3796ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 323ms
     ✓ exits 12 when there is no versioned draft 311ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 313ms
     ✓ stamps the anchor from the runtime-resolved base commit 403ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 492ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 570ms
     ✓ names the branch, not the remote-tracking ref, in each URL 397ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 358ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 387ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 864ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 600ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 2552ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1313ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 1393ms
     ✓ a second run's record does not let this FID's close commit 1387ms
     ✓ record is present after workflows close and before the push 2634ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 5197ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 5416ms
       ✓ a run closed by workflow-failed keeps no parked copy 4478ms
       ✓ a run closed by workflow-done keeps no parked copy 3359ms
       ✓ a FAILED run gets no row 3454ms
       ✓ a DONE run gets no row 3509ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3665ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 458ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 320ms
     ✓ a run with no issue holds the prompt alone 391ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 678ms
     ✓ --plan is appended when the file exists and skipped when it does not 424ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 613ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 307ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1116ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 958ms
     ✓ puts each --line after the summary, in flag order 884ms
     ✓ refuses --final-return without --summary-file 309ms
     ✓ --summary prints the file and keeps a copy in --outbox 923ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1073ms
   ✓ --session-dir on fail / close (3)
     ✓ a folder outside the outbox sessions folder is kept 336ms
     ✓ without --session-dir prints no sessionRemoved 312ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 137002ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1746ms
   ✓ preserves the requested event for selected-workflow verification 1596ms
   ✓ requires selected other-workflow success at the exact pushed head 1895ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1971ms
     ✓ saves the failed job count without the capstone job 619ms
     ✓ a CI selection keeps the failed job names, capstone left out 1280ms
     ✓ counts the capstone job when it is the only failed job 1136ms
     ✓ saves no failed job count when no job failed 602ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 310ms
     ✓ filters branch and PR discovery by configured workflow and exact head 957ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1020ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1701ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1815ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 705ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 525ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 1076ms
     ✓ rejects a workflow result count smaller than its returned records 881ms
     ✓ validates normalized fallback evidence against the requested identity 394ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1522ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2036ms
     ✓ checks the named repository base and fails closed on missing evidence 1265ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1123ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1498ms
     ✓ rejects MCP capstone jobs belonging to another run 1818ms
     ✓ --fetch refreshes origin/<branch> before gating 733ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 629ms
       ✓ a source change past the validated head refuses (17) and names the path 528ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 605ms
       ✓ --validated without --month / --fid is a usage error (2) 641ms
       ✓ a validated sha that is not an ancestor refuses (17) 595ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 904ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1133ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1305ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 860ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1767ms
     ✓ a failed re-trigger push names the cause in the log 1526ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2095ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2410ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2445ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1153ms
     ✓ gh-error: every poll errored 1033ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2238ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2180ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 1370ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 2652ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 833ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 802ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 687ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 614ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2239ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2210ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 919ms
     ✓ re-trigger on dev only uses the record of its own FID 1270ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1552ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 445ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 669ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 485ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 310ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 531ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 632ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 917ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 967ms
     ✓ debug: a failure test run is a failed run 1355ms
     ✓ debug: a timed_out test run is a failed run 1252ms
     ✓ debug: a startup_failure test run is a failed run 941ms
     ✓ debug: a test run still in progress or cancelled is not returned 1501ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1396ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 1241ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 2251ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 332ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 594ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 888ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 995ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 901ms
     ✓ --file and --step go together 832ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 4074ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 701ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 840ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 837ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 893ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 1016ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 1164ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 983ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1567ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2245ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2932ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1433ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1032ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1058ms
     ✓ plan installs dependencies like build and debug 1440ms
     ✓ design stops on a failed install (5) 1112ms
     ✓ plan stops on a failed install (5) 1102ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1210ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1337ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 964ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1320ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 3173ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2623ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2452ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 4209ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 3803ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 5454ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 5451ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 5498ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1475ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 508ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 892ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 466ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 678ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 992ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1268ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 611ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 380ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 837ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1363ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1308ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 691ms
     ✓ PASS is 0 failures with or without reports 1056ms
     ✓ clears a previous attempt's reports before the gate runs 1135ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 866ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 677ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1236ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 715ms
     ✓ numbers runs within the workflow's active run and per step 1340ms
     ✓ tests run --file records the tested snapshot on its test-run row 1040ms
     ✓ a FAIL test-run row records each failing case as file and name 581ms
     ✓ a PASS test-run row records no failed tests 1473ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 648ms
     ✓ without --file no row is written and the output carries row null 923ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 677ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1497ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1887ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1780ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1132ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1082ms
     ✓ changed-since refuses a sha that names no commit 335ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1118ms
     ✓ a deleted file that no file mentions passes and the log says so 763ms
     ✓ a failed importer search runs the whole check 1236ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1730ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 352ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a passing required push gate records a receipt 984ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 876ms
     ✓ a failing required push gate leaves the failed marker 716ms
     ✓ uncommitted code blocks the receipt until it is committed 1193ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1078ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 748ms
     ✓ a planned test absent from a loaded report is a missing gap 663ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1027ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1394ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 413ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1035ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 875ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 611ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1277ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 1251ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1059ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 983ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 674ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 715ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 544ms
     ✓ green: lists each gap kind, with the runner output 650ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1177ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 470ms
       ✓ green clears an exception-only task from a human commit 340ms
 ✓ .bkit/core/engine/commands/install/doctor.integration.test.ts (26 tests) 12335ms
   ✓ bkit doctor — integration (8)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 472ms
     ✓ writes zero files (purely read-only — write-set assertion) 449ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 475ms
     ✓ reports opencode as absent when .opencode/ does not exist 476ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 601ms
     ✓ finishes a CI round only with its own failed job count 605ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 502ms
     ✓ done --group writes group on the row 403ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 616ms
     ✓ carries extra fields, parsed as JSON when they are JSON 413ms
     ✓ reports a failed commit with exit 8 without writing the row 558ms
     ✓ a failed commit leaves no row staged in the index 1024ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 830ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 786ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1497ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 651ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 894ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 514ms
     ✓ --ref reads the status file as committed on that ref, not from disk 645ms
     ✓ --ref exits 3 when the ref does not carry the status file 454ms
     ✓ fails on a placeholder left in the artifact 470ms
     ✓ fails when the row's verdict differs from the artifact's 465ms
     ✓ fails when the row does not list the artifact, or carries another attempt 476ms
     ✓ fails on a missing artifact 476ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 410ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a diagnose row missing its strategy, passes with it 372ms
     ✓ fails a run-tests row missing its scope, and an empty scope 578ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 583ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 653ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1058ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 633ms
     ✓ --post needs --number; without --post there is no tracker key 314ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 689ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 456ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 324ms
     ✓ --attempt-of checks the row carries the derived counter 346ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 101 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 396ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 393ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 449ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 582ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1852ms
     ✓ a refused dev push is logged, never fails the close 2518ms
     ✓ an unreachable remote is logged, never fails the close 500ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (279 tests) 372849ms
   ✓ bkit branches parse (2)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 983ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1043ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1121ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 794ms
     ✓ produces byte-identical output to merge=union 1725ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1475ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1668ms
     ✓ refuses a lockfile whose regenerate command fails 1394ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1370ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1252ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 805ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 830ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1096ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1401ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 775ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 707ms
       ✓ runs (0) with the landed path count once dev moved 1420ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 799ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1267ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1679ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2685ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 676ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 944ms
     ✓ --mode=abort pushes when the branch has no open PR 1700ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 837ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 568ms
     ✓ --open-pr carries the MCP answer and skips gh 748ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1469ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1433ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3416ms
     ✓ skip-ci HEAD on the replay is refused 1061ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2588ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 841ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1338ms
     ✓ a fetch that fails exits 10 643ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 748ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 812ms
     ✓ scan-diff attributes deletion to its old test ins… 808ms
     ✓ scan-diff consumes each moved assertion once and … 807ms
     ✓ scan-diff does not match identical assertions fro… 866ms
     ✓ scan-diff does not match the same leaf test name … 827ms
     ✓ scan-diff does not match a same-named test with d… 797ms
     ✓ scan-diff does not match a same-named test with c… 817ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 832ms
     ✓ --paths with no match exits 1 766ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 549ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 935ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1056ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 664ms
     ✓ scan-diff ignores a removed comment in a test file 740ms
     ✓ scan-diff ignores an assertion moved within the file 722ms
     ✓ scan-diff still reports a removed assertion 767ms
     ✓ scan-diff reports an assertion re-added only outside the test file 751ms
     ✓ scan-diff finds an added pytest mark skip 829ms
     ✓ scan-diff finds an added unittest skip 738ms
     ✓ scan-diff finds an added bare skip call 825ms
     ✓ scan-diff ignores a quoted skip in a documentation file 677ms
     ✓ scan-diff ignores a marker literal in a non-test source file 709ms
     ✓ scan-diff ignores an assertion whose expectation changed 736ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 860ms
     ✓ scan-diff reports a deleted test file 906ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 616ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 4546ms
     ✓ publishes local code with a CI running head before bookkeeping 6015ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 6236ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 5186ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 4660ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 3730ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 3844ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2910ms
     ✓ --merge-docs skips an empty bkit:generate script 2819ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 2434ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2404ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 3762ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2543ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2437ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3106ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1874ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1416ms
     ✓ exits 10 when the fetch fails 575ms
     ✓ refuses --merge-docs with --head, and an unknown --head 940ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1396ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2315ms
     ✓ a failed install stops ship (16) 2043ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1554ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1222ms
     ✓ exits 10 when the fetch fails 1102ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 851ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3075ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3140ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3151ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1749ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 4039ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 686ms
     ✓ reports undeclared and runs nothing with an empty script 651ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 706ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 807ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 575ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1053ms
     ✓ counts files committed since --base 830ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 858ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1464ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1041ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 54415ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1649ms
     ✓ names each net-new and worsened finding in the log and the JSON 1294ms
     ✓ fails on a net score rise with no net count change 1524ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1081ms
     ✓ treats a net score at or below 0.001 as float noise 1000ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1195ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 389ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1088ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1310ms
     ✓ exits 4 on a dropped net field instead of silently passing 1074ms
     ✓ exits 4 on no summary instead of silently passing 1346ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1148ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 867ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 862ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 975ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1581ms
     ✓ explicit globs can select ignored prose and nested checkout files 1699ms
     ✓ fails closed when a selected prose source cannot be read 398ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1031ms
     ✓ fails (exit 1) when vale reports alerts 733ms
     ✓ exits 6 on a vale runtime error 1615ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1317ms
     ✓ falls back to vale sync when the main worktree has none 1015ms
     ✓ fails when vale sync cannot restore the required styles 1972ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 497ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 356ms
     ✓ is a usage error when the commit cannot be read 323ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 481ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 736ms
     ✓ exits 1 naming the files outside, whatever the commit message says 499ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1037ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 815ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 529ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 870ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 811ms
     ✓ retries a failed create once, and exits 5 when it fails twice 916ms
     ✓ exits 5 when the open-PR probe errors 1139ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 900ms
     ✓ prs open still opens against any other base 1261ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 591ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 757ms
     ✓ exits 4 when gh errors and 80 when it needs auth 464ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 1840ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 1483ms
     ✓ runs no merge when the PR is already MERGED 751ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1630ms
     ✓ prs merge refuses a PR whose base is main 1826ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1020ms
     ✓ prs merge refuses when the PR base is unknown 993ms
     ✓ prs merge reads the base from the one pr view it already makes 504ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 750ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 760ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 724ms
     ✓ never reads dev's required checks without --only-if-required 572ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 624ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 1193ms
     ✓ is not green when a check failed, naming it (exit 1) 754ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1042ms
     ✓ is not green on an empty rollup (total 0) 1392ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1634ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1926ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 736ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1957ms
   ✓ bounded nonfatal publication (10)
     ✓ contains exhausted append and create failures without fabricated success 301ms
     ✓ reserves new comment opportunity within total delivery budget 684ms
     ✓ attempts independent attention after routine uncertainty 372ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1522ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1454ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1023ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 487ms
     ✓ fetches the issue and its comments as GitHub returns them 1572ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1095ms
     ✓ invalidates missing corrupt and unsupported progress cache 2353ms
     ✓ contains cache read and write failures as standalone degradation 1028ms
     ✓ uses legacy receipts and contains receipt failures 1135ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1329ms
     ✓ a recent identical comment counts as done (the final close comment) 1506ms
     ✓ a failed post reports done false with the reason and never leaks a token 1862ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1320ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 504ms
     ✓ a different marker hash posts 1143ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 900ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (125 tests) 40348ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 401ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 402ms
     ✓ staging failure: exit 4 and no commit is created, no false success 576ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 595ms
     ✓ a --fid that climbs out of the log folder is refused and commits nothing 311ms
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1307ms
     ✓ a failing file absent at the base commit is the branch's 821ms
     ✓ no JUnit report reads unknown 384ms
     ✓ an undeclared bkit:test:file reads unknown 757ms
     ✓ a failed base install reads unknown and removes the worktree 803ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 1068ms
     ✓ copies the worktreeCopy entries into the base checkout 909ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 5457ms
     ✓ a pull_request-event CI run at the base sha does not settle none 1042ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 1031ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 1003ms
     ✓ the base test run does not inherit the hooks-off git config 1063ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 813ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 704ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 314ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 11961ms
   ✓ workflow progress command wiring (12)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 319ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1354ms
     ✓ runGit names ENOBUFS when output passes the limit 1006ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 995ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 821ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1458ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 448ms
     ✓ challenge gate without --base sizes only the branch's own lines 659ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 3693ms
> [bkit] TRUNCATED HERE — 140 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1617ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2704ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2822ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1539ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1314ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1142ms
     ✓ plan installs dependencies like build and debug 1226ms
     ✓ design stops on a failed install (5) 1025ms
     ✓ plan stops on a failed install (5) 1576ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1269ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1718ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1490ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1773ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2535ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2390ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2099ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2001ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1750ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2586ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2754ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2737ms
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
     ✓ openDecision gate ignores a Gate line below the header 310ms
     ✓ reads Test attempt from a tests pause 332ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 522ms
     ✓ writes no row when status.jsonl does not exist 422ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 419ms
     ✓ aborts a rebase only when one is in progress 898ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 748ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 735ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 518ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 432ms
     ✓ --max-exceeded says a handover is due without any sentinel 356ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 353ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 387ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 507ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 466ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 318ms
     ✓ a debug run in SOAK mode always needs a handover 325ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 454ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 495ms
     ✓ an unwritable stats path is logged and never fails the close 464ms
     ✓ appends the completeness row before the workflow-done row 566ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 576ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 665ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 939ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 559ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 478ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 519ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 516ms
     ✓ --number without --outbox is a usage error 446ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 630ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 620ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 399ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1770ms
     ✓ --flush with nothing to record commits and pushes nothing 962ms
     ✓ --flush carries the named worktree's logs into the dev commit 1424ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2929ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 4359ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 4404ms
     ✓ closePr titles the PR by the record it carries 3980ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 4287ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2394ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1638ms
     ✓ a close that landed releases the lock 2727ms
     ✓ removes the worktree before it releases the lock 2646ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 340ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 868ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 384ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2596ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2519ms
       ✓ a run closed by workflow-failed keeps no parked copy 2500ms
       ✓ a run closed by workflow-done keeps no parked copy 2192ms
       ✓ a FAILED run gets no row 2105ms
       ✓ a DONE run gets no row 2284ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1949ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 399ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 632ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 750ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 610ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 401ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 450ms
     ✓ .husky/pre-push: first and last lines name the log 469ms
     ✓ .husky/pre-push: the hook body runs once 422ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1647ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 932ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1194ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1187ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1159ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1081ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 718ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 1184ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 812ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 964ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1317ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1180ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 958ms
     ✓ a stale register stops the push before any gate runs 956ms
     ✓ bkit check fails → the push stops before any gate runs 1348ms
     ✓ the dependency audit runs before any gate, when its script is present 1447ms
     ✓ no dependency-audit script → skipped, the gates still run 1664ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 2387ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 735ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 866ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 1306ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1445ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1260ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1194ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1265ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 1401ms
     ✓ branch with no open PR → no check, push goes on 977ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 1020ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 722ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 764ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 2460ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 835ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 988ms
     ✓ untrusted .envrc still prints the direnv allow line 1271ms
     ✓ no .envrc → no direnv call 1173ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2381ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2322ms
     ✓ base fetch fails → warns, gates run 3047ms
     ✓ dev push → no PR lookup 1939ms
     ✓ min push of a conflicting PR → blocked 2675ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2568ms
     ✓ saves the failed job count without the capstone job 1034ms
     ✓ a CI selection keeps the failed job names, capstone left out 2023ms
     ✓ counts the capstone job when it is the only failed job 1415ms
     ✓ saves no failed job count when no job failed 1009ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1617ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1231ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1887ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2141ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1486ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1965ms
     ✓ checks the named repository base and fails closed on missing evidence 1037ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 873ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 997ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 562ms
       ✓ a source change past the validated head refuses (17) and names the path 494ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 503ms
       ✓ --validated without --month / --fid is a usage error (2) 381ms
       ✓ a validated sha that is not an ancestor refuses (17) 447ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 474ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1039ms
     ✓ a failed re-trigger push names the cause in the log 999ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1790ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1860ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 972ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 477ms
     ✓ gh-error: every poll errored 418ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 851ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 934ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 590ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1091ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 322ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 373ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 338ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 339ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1310ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1273ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 550ms
     ✓ re-trigger on dev only uses the record of its own FID 730ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 704ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 354ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 554ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 331ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 380ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 366ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 374ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 669ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 751ms
     ✓ debug: a failure test run is a failed run 822ms
     ✓ debug: a timed_out test run is a failed run 757ms
     ✓ debug: a startup_failure test run is a failed run 823ms
     ✓ debug: a test run still in progress or cancelled is not returned 783ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 738ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 958ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1674ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 414ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 595ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 667ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 604ms
     ✓ --file and --step go together 507ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2907ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 517ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 526ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 624ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 715ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 690ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 638ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 602ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 5084ms
     ✓ continues after the prepared completion source disappears 3393ms
     ✓ records preparation and session association failures despite successful delivery 3363ms
     ✓ associates startup and run across restart or starts fresh safely 5069ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 13751ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 646ms
     ✓ refuses a code conflict and aborts the rebase on the spot 710ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1171ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 643ms
     ✓ produces byte-identical output to merge=union 1655ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1205ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1571ms
     ✓ refuses a lockfile whose regenerate command fails 976ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1378ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1264ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 816ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 878ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1241ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1477ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 831ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 425ms
       ✓ runs (0) with the landed path count once dev moved 755ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 406ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 894ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1378ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1983ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 508ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1219ms
     ✓ --mode=abort pushes when the branch has no open PR 1418ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1628ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 390ms
     ✓ --open-pr carries the MCP answer and skips gh 558ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 880ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 906ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4269ms
     ✓ skip-ci HEAD on the replay is refused 850ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1852ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 695ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 880ms
     ✓ a fetch that fails exits 10 437ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 615ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 616ms
     ✓ scan-diff attributes deletion to its old test ins… 556ms
     ✓ scan-diff consumes each moved assertion once and … 593ms
     ✓ scan-diff does not match identical assertions fro… 610ms
     ✓ scan-diff does not match the same leaf test name … 697ms
     ✓ scan-diff does not match a same-named test with d… 627ms
     ✓ scan-diff does not match a same-named test with c… 691ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 851ms
     ✓ --paths with no match exits 1 572ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 400ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 695ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 722ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 741ms
     ✓ scan-diff ignores a removed comment in a test file 625ms
     ✓ scan-diff ignores an assertion moved within the file 614ms
     ✓ scan-diff still reports a removed assertion 657ms
     ✓ scan-diff reports an assertion re-added only outside the test file 670ms
     ✓ scan-diff finds an added pytest mark skip 714ms
     ✓ scan-diff finds an added unittest skip 615ms
     ✓ scan-diff finds an added bare skip call 642ms
     ✓ scan-diff ignores a quoted skip in a documentation file 705ms
     ✓ scan-diff ignores a marker literal in a non-test source file 622ms
     ✓ scan-diff ignores an assertion whose expectation changed 670ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 648ms
     ✓ scan-diff reports a deleted test file 645ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 460ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3889ms
     ✓ publishes local code with a CI running head before bookkeeping 4138ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5143ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3353ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2510ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1542ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1522ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1243ms
     ✓ --merge-docs skips an empty bkit:generate script 1048ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 866ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2227ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2508ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1747ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1931ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2388ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1380ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 899ms
     ✓ exits 10 when the fetch fails 558ms
     ✓ refuses --merge-docs with --head, and an unknown --head 620ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1100ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1689ms
     ✓ a failed install stops ship (16) 1778ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1200ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1101ms
     ✓ exits 10 when the fetch fails 823ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 668ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2253ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2934ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2234ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1953ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2525ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 516ms
     ✓ reports undeclared and runs nothing with an empty script 535ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 609ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 717ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 541ms
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1507ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 1352ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 890ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1846ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1163ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1372ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1143ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1645ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 871ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1517ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1376ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1459ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1344ms
     ✓ PASS is 0 failures with or without reports 1190ms
     ✓ clears a previous attempt's reports before the gate runs 1374ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1316ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1380ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1091ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 913ms
     ✓ numbers runs within the workflow's active run and per step 1528ms
     ✓ tests run --file records the tested snapshot on its test-run row 1428ms
     ✓ a FAIL test-run row records each failing case as file and name 1300ms
     ✓ a PASS test-run row records no failed tests 1354ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 899ms
     ✓ without --file no row is written and the output carries row null 920ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 354ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1686ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1198ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1297ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1294ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1302ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 890ms
     ✓ a deleted file that no file mentions passes and the log says so 429ms
     ✓ a failed importer search runs the whole check 808ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1105ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 955ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 623ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 958ms
     ✓ a failing required push gate leaves the failed marker 1060ms
     ✓ uncommitted code blocks the receipt until it is committed 844ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 889ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 665ms
     ✓ a planned test absent from a loaded report is a missing gap 733ms
     ✓ a file that fails to load is a red of kind red-not-loaded 872ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 638ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1131ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 444ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 445ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 633ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 824ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 705ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 888ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 1266ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1420ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 1114ms
     ✓ green: lists each gap kind, with the runner output 924ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2128ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 827ms
       ✓ green clears an exception-only task from a human commit 776ms
 ✓ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (9 tests) 70771ms
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9163ms
     ✓ records the failed job count and reads an uncounted local round as unknown 6435ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 5663ms
     ✓ finishes the first CI evidence round of the second debug run 2981ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 131523ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3654ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 359ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2097ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 3726ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1693ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 2128ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 3066ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2349ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3369ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1705ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2030ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1972ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1489ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2019ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2240ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2283ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2504ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2711ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2659ms
       ✓ a branch with no status.jsonl dispatches as before 2599ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2817ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 4118ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 5174ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 5171ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 378ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 574ms
     ✓ retries a failed create once, and exits 5 when it fails twice 671ms
     ✓ exits 5 when the open-PR probe errors 551ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 673ms
     ✓ prs open still opens against any other base 411ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 348ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 500ms
     ✓ exits 4 when gh errors and 80 when it needs auth 623ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 339ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 384ms
     ✓ runs no merge when the PR is already MERGED 597ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 776ms
     ✓ prs merge refuses a PR whose base is main 449ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 414ms
     ✓ prs merge refuses when the PR base is unknown 847ms
     ✓ prs merge reads the base from the one pr view it already makes 815ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 330ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 403ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 426ms
     ✓ never reads dev's required checks without --only-if-required 326ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 368ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 434ms
     ✓ is not green when a check failed, naming it (exit 1) 476ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 602ms
     ✓ is not green on an empty rollup (total 0) 482ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 583ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 546ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 439ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 28254ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 311ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 345ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1885ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 806ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 405ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 409ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 447ms
     ✓ fetches the issue and its comments as GitHub returns them 423ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 484ms
     ✓ invalidates missing corrupt and unsupported progress cache 1047ms
     ✓ contains cache read and write failures as standalone degradation 485ms
     ✓ uses legacy receipts and contains receipt failures 530ms
     ✓ records an engine-action row and skips the same key + body on a re-run 616ms
     ✓ a recent identical comment counts as done (the final close comment) 531ms
     ✓ a failed post reports done false with the reason and never leaks a token 588ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 649ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 363ms
     ✓ a different marker hash posts 432ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 352ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 36050ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 658ms
     ✓ names each net-new and worsened finding in the log and the JSON 942ms
     ✓ fails on a net score rise with no net count change 799ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 643ms
     ✓ treats a net score at or below 0.001 as float noise 619ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 499ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 320ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 901ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 813ms
     ✓ exits 4 on a dropped net field instead of silently passing 812ms
     ✓ exits 4 on no summary instead of silently passing 614ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1000ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 834ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 809ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 850ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 599ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 387ms
     ✓ fails (exit 1) when vale reports alerts 588ms
     ✓ exits 6 on a vale runtime error 593ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 658ms
     ✓ falls back to vale sync when the main worktree has none 628ms
     ✓ fails when vale sync cannot restore the required styles 565ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 386ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 362ms
     ✓ exits 1 naming the files outside, whatever the commit message says 404ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 705ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 457ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 367ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 461ms
     ✓ finishes a CI round only with its own failed job count 854ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 340ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ build-group-start records parentSha and group 344ms
     ✓ carries extra fields, parsed as JSON when they are JSON 763ms
     ✓ rejects ["--failures=-1"] 434ms
     ✓ rejects ["--status=SKIPPED"] 305ms
     ✓ reports a failed commit with exit 8 without writing the row 943ms
     ✓ a failed commit leaves no row staged in the index 876ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1352ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1263ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 975ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1084ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1217ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 334ms
     ✓ --ref exits 3 when the ref does not carry the status file 328ms
     ✓ fails on a missing artifact 301ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 324ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 363ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 448ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 579ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 875ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 619ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 301ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 515ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 385ms
> [bkit] TRUNCATED HERE — 128 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 1132ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1100ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1189ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1323ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 970ms
     ✓ a failing file absent at the base commit is the branch's 573ms
     ✓ an undeclared bkit:test:file reads unknown 457ms
     ✓ a failed base install reads unknown and removes the worktree 539ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 713ms
     ✓ copies the worktreeCopy entries into the base checkout 743ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3908ms
     ✓ a pull_request-event CI run at the base sha does not settle none 783ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 705ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 566ms
     ✓ the base test run does not inherit the hooks-off git config 561ms
> [bkit] TRUNCATED HERE — 390 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 176 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
stdout | .bkit/core/engine/install/modules/core.integration.test.ts > .bkit-version first-run signal extra-logging > second install (.bkit-version present at current version) suppresses first-run extra logging
[bkit-install] Running core payload pass
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 170 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 206 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 172 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 176 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 454 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 181 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .codex/agents/bkit-audit-generate.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-1.toml
[bkit-install] write: .codex/agents/bkit-build-challenge-2.toml
[bkit-install] write: .codex/agents/bkit-build-install-skills.toml
[bkit-install] write: .codex/agents/bkit-build-plan-convert.toml
[bkit-install] write: .codex/agents/bkit-build-plan-current.toml
[bkit-install] write: .codex/agents/bkit-build-plan-gaps-remediate.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tasks.toml
[bkit-install] write: .codex/agents/bkit-build-plan-tests.toml
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-3.toml
[bkit-install] write: .codex/agents/bkit-design-generate.toml
[bkit-install] write: .codex/agents/bkit-design-organise.toml
[bkit-install] write: .codex/agents/bkit-design-review-1.toml
[bkit-install] write: .codex/agents/bkit-design-review-2.toml
[bkit-install] write: .codex/agents/bkit-design-spike.toml
[bkit-install] write: .codex/agents/bkit-design-update.toml
[bkit-install] write: .codex/agents/bkit-plan-generate.toml
[bkit-install] write: .codex/agents/bkit-plan-review-1.toml
[bkit-install] write: .codex/agents/bkit-plan-review-2.toml
[bkit-install] write: .codex/agents/bkit-plan-scope-check.toml
[bkit-install] write: .codex/agents/bkit-plan-update.toml
[bkit-install] write: .codex/agents/bkit-ship-conflict-resolve.toml
[bkit-install] write: .codex/agents/bkit-ship-deferred-sweep.toml
[bkit-install] write: .codex/agents/bkit-ship-update-docs.toml
[bkit-install] write: .codex/agents/bkit-utility-compress-markdown.toml
[bkit-install] write: .codex/agents/bkit-utility-update-decisions.toml
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
[bkit-install] write: .codex/agents/bkit-utility-update-tracker.toml
[bkit-install] write: .agents/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/skills/bkit-ship/SKILL.md
[bkit-install] codex: .codex/hooks.json
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-readguard.cjs
[bkit-install] codex: .codex/hooks/bkit-rules.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] codex: .codex/hooks/bkit-gateguard.cjs
[bkit-install] codex: .codex/hooks/bkit-guardrails.cjs
[bkit-install] codex: .codex/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades shipped registrations without dropping consumer hook groups or permissions
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] core: .bkit/.env.example
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .cursor/commands/bkit-auto.md
[bkit-install] write: .cursor/commands/bkit-build.md
[bkit-install] write: .cursor/commands/bkit-debug.md
[bkit-install] write: .cursor/commands/bkit-design.md
[bkit-install] write: .cursor/commands/bkit-plan.md
[bkit-install] write: .cursor/commands/bkit-ship.md
[bkit-install] write: .cursor/agents/bkit-audit-generate.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-1.md
[bkit-install] write: .cursor/agents/bkit-build-challenge-2.md
[bkit-install] write: .cursor/agents/bkit-build-install-skills.md
[bkit-install] write: .cursor/agents/bkit-build-plan-convert.md
[bkit-install] write: .cursor/agents/bkit-build-plan-current.md
[bkit-install] write: .cursor/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tasks.md
[bkit-install] write: .cursor/agents/bkit-build-plan-tests.md
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .cursor/agents/bkit-design-generate.md
[bkit-install] write: .cursor/agents/bkit-design-organise.md
[bkit-install] write: .cursor/agents/bkit-design-review-1.md
[bkit-install] write: .cursor/agents/bkit-design-review-2.md
[bkit-install] write: .cursor/agents/bkit-design-spike.md
[bkit-install] write: .cursor/agents/bkit-design-update.md
[bkit-install] write: .cursor/agents/bkit-plan-generate.md
[bkit-install] write: .cursor/agents/bkit-plan-review-1.md
[bkit-install] write: .cursor/agents/bkit-plan-review-2.md
[bkit-install] write: .cursor/agents/bkit-plan-scope-check.md
[bkit-install] write: .cursor/agents/bkit-plan-update.md
[bkit-install] write: .cursor/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .cursor/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .cursor/agents/bkit-ship-update-docs.md
[bkit-install] write: .cursor/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .cursor/agents/bkit-utility-update-decisions.md
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .cursor/agents/bkit-utility-update-tracker.md
[bkit-install] cursor: .cursor/hooks.json
[bkit-install] cursor: .cursor/hooks/bkit-preflight.sh
[bkit-install] cursor: .cursor/rules/bkit-rules.mdc
[bkit-install] cursor: .cursor/hooks/bkit-guardrails.cjs
[bkit-install] cursor: .cursor/hooks/bkit-gateguard.cjs
[bkit-install] cursor: .cursor/hooks/bkit-readguard.cjs
[bkit-install] cursor: .cursor/mcp.json
[bkit-install] cursor: .cursor/cli.json
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[bkit-install] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[bkit-install] antigravity: .agents/plugins/bkit/plugin.json
[bkit-install] antigravity: GEMINI.md
[bkit-install] antigravity: .agents/plugins/bkit/hooks.json
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[bkit-install] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs
[bkit-install] write version pin: .bkit/version (6.2.0)
[bkit-install] Running core payload pass
[bkit-install] Running bkit docs pass
[bkit-install] Running template copies pass
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] cursor: .cursor/bkit-cloud.md (generated — gitignored, holds resolved secrets)

stdout | .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades a shipped Claude edit group without dropping a consumer hook inside it
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] core: .bkit/.env.example
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/architecture.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/docs/components.md
[bkit-install] template added: .bkit/templates/docs/data-schema.md
[bkit-install] template added: .bkit/templates/docs/deployments.md
[bkit-install] template added: .bkit/templates/docs/design.md
[bkit-install] template added: .bkit/templates/docs/noise.md
[bkit-install] template added: .bkit/templates/docs/observability.md
[bkit-install] template added: .bkit/templates/docs/security.md
[bkit-install] template added: .bkit/templates/docs/setup.md
[bkit-install] template added: .bkit/templates/docs/technology.md
[bkit-install] template added: .bkit/templates/docs/testing.md
[bkit-install] template added: .bkit/templates/lintstagedrc.example.json
[bkit-install] template added: .bkit/templates/prettierignore.example
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write version pin: .bkit/version (6.2.0)

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (165 tests) 12092ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 6058ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 401ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 329ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 5596ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 734ms
     ✓ workflow progress command wiring progress specialized completion producers 2603ms
     ✓ progress excludes noncompletions 1281ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 5027ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 616ms
     ✓ stops the step when the command crashed or was misused 453ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 1527ms
     ✓ ship gates on CI and merges the pinned head 2143ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 7693ms
   ✓ bkit runtime detect — the table (17)
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 505ms
     ✓ LOCAL -> runtimeHeadless=false 463ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 570ms
     ✓ UNKNOWN -> runtimeHeadless=false 485ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 3089ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 447ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 676ms
     ✓ challenge gate without --base sizes only the branch's own lines 337ms
 ✓ .bkit/core/engine/audits/workflows/close-squash.integration.test.ts (15 tests) 44543ms
   ✓ bkit-design.md local close squash (6)
     ✓ lands past another session's uncommitted edit to a file the close changes, and keeps the edit 3746ms
     ✓ lands without pushing local dev's own commits, and leaves local dev where it was 3955ms
     ✓ leaves the main checkout on its branch and moves only the dev pointer 4094ms
     ✓ keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc 2157ms
     ✓ commits only the squash and bookkeeping, never another session's staged doc 3894ms
     ✓ lands this run's doc and then removes the branch, leaving unrelated edits alone 3670ms
   ✓ bkit-plan.md local close squash (6)
     ✓ lands past another session's uncommitted edit to a file the close changes, and keeps the edit 2851ms
     ✓ lands without pushing local dev's own commits, and leaves local dev where it was 3129ms
     ✓ leaves the main checkout on its branch and moves only the dev pointer 3605ms
     ✓ keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc 1502ms
     ✓ commits only the squash and bookkeeping, never another session's staged doc 3032ms
     ✓ lands this run's doc and then removes the branch, leaving unrelated edits alone 2202ms
   ✓ bkit-design.md close with no issue (1)
     ✓ lands an issue-less run with a FID-only marker 2629ms
   ✓ bkit-build.md held close (2)
     ✓ held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock 2022ms
     ✓ held close records the rows, summary and worktree-only roadmap row 2052ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 5852ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 1296ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 1154ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 3401ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (39 tests) 4390ms
   ✓ dogfood authoring advisories — each file gets the sections whose scope names it (27)
     ✓ claude: doc gets § All Agent-Read Files, § Docs 346ms
     ✓ cursor: doc gets § All Agent-Read Files, § Docs 395ms
     ✓ codex: doc gets § All Agent-Read Files, § Docs 389ms
     ✓ opencode: doc gets § All Agent-Read Files, § Docs 400ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 2764ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (78 tests) 2505ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 3535ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1323ms
     ✓ runGit names ENOBUFS when output passes the limit 608ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 585ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 1932ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 2005ms
   ✓ bkit tasks currency (6)
     ✓ currency judges base...against (origin/dev), not base...HEAD 312ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 1751ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 354ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1349ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 358ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (304 tests) 400ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1113ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1272ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1404ms
   ✓ runLines (5)
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 386ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 186ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 246ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 167ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 183ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 151ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (20 tests) 82ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 87ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 83ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 57ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 48ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 39ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 36ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 41ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 33ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 12ms

 Test Files  61 passed (61)
      Tests  4857 passed (4857)
   Start at  18:53:47
   Duration  468.48s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1035-ledger-commit-outbox/build-group-gate-1-1.log.reports/vitest-31785.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/ledgers.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/ledgers.ts dist/commands/workflow/decisions.js dist/commands/workflow/ledgers.js docs/failures.jsonl docs/plans/202611/1035-ledger-commit-outbox-plan.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-brief-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-brief-tests-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-diff-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-group-gate-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tasks-1-log.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-tests-1-log.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-plan-verify-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-green-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/build-tests-red-1-1.md docs/plans/202611/logs/1035-ledger-commit-outbox/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1035-ledger-commit-outbox
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3054 of 14276 lines (222 KB of 979 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
