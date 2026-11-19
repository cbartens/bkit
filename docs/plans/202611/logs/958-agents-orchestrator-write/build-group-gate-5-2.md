
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/audit-report.test.ts .bkit/core/engine/commands/workflow/audit-report.ts .bkit/core/engine/commands/workflow/challenge.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/open-decision.test.ts .bkit/core/engine/commands/workflow/open-decision.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/steps.ts DETAILS.md dist/commands/workflow/audit-report.js dist/commands/workflow/challenge.js dist/commands/workflow/decisions.js dist/commands/workflow/open-decision.js dist/commands/workflow/steps.js docs/capabilities.md docs/plans/202611/958-agents-orchestrator-write-plan.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-tests-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-diff-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-diff-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-gaps-remediate-5-1-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-tasks-5-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-tests-5-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-verify-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-verify-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-green-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-green-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-red-5-1.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/audit-report.test.ts .bkit/core/engine/commands/workflow/audit-report.ts .bkit/core/engine/commands/workflow/challenge.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/open-decision.test.ts .bkit/core/engine/commands/workflow/open-decision.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/steps.ts DETAILS.md dist/commands/workflow/audit-report.js dist/commands/workflow/challenge.js dist/commands/workflow/decisions.js dist/commands/workflow/open-decision.js dist/commands/workflow/steps.js docs/capabilities.md docs/plans/202611/958-agents-orchestrator-write-plan.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-tests-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-diff-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-diff-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-gaps-remediate-5-1-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-tasks-5-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-tests-5-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-verify-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-verify-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-green-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-green-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-red-5-1.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

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

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

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

 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (62 tests) 61312ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 1024ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 6841ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 739ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 655ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 608ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 724ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1015ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1281ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 620ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 609ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 539ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 518ms
     ✓ design installs dependencies like build and debug 560ms
     ✓ plan installs dependencies like build and debug 521ms
     ✓ design stops on a failed install (5) 542ms
     ✓ plan stops on a failed install (5) 530ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 524ms
     ✓ tracks origin/feat/{fid} when only the remote has it 603ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 523ms
     ✓ reports a package manager that could not run (127) apart from a failed install 731ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1008ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 1623ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 1582ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1230ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1264ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1232ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 908ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 981ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 897ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 893ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1222ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1119ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1392ms
     ✓ commits leftovers when a copy entry points outside the checkout 1200ms
     ✓ never commits the entries setup copies in from the main checkout 1134ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1164ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 528ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 519ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 692ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 701ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 695ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 696ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 837ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 988ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1090ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 536ms
     ✓ leaves a clean worktree's history alone 1043ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1697ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1825ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1534ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1585ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 1766ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1541ms
     ✓ does not mark a resumed worktree it did not create 668ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (1)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 369ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 478ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 733ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 986ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 627ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (80 tests) 63153ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 341ms
     ✓ install --claude does not write Serena or graphify examples 397ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 808ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 820ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 1095ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 1445ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 1444ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 1416ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 1263ms
     ✓ an adopted copy of every template survives upgrade and check 1499ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1395ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1377ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 515ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 1939ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 1148ms
   ✓ #1053 — upgrade re-records the entry of every rendered output (1)
     ✓ re-records a stale entry for a rendered mirror, doc and allowlist that are already current 742ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 1033ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 1584ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 1091ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1065ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 1781ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1720ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1225ms
     ✓ a dry-run hook and CI token migration writes nothing 613ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1513ms
     ✓ a second check-name migration writes nothing 1488ms
     ✓ a dry-run check-name migration writes and moves nothing 624ms
     ✓ a second Vale migration and a dry run write nothing 1543ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 1180ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 1081ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 1235ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 872ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 821ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 818ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 820ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 819ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 824ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 792ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 976ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1134ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1135ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 649ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 495ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 1156ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 1315ms
     ✓ migrates legacy ownership without changing project text or core ownership 1703ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 1241ms
     ✓ previews project document migration without mutating the checkout 680ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 1236ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 837ms
     ✓ upgrade names the missing root lint-staged config with the copy command 850ms
     ✓ install names the missing root lint-staged config under its own log prefix 783ms
     ✓ check names the missing root lint-staged config under its own log prefix 772ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 655ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 843ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 867ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 872ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 824ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (194 tests) 64159ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 403ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 496ms
   ✓ bkit workflows close (26)
     ✓ writes one completeness row per close 396ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 407ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 314ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 312ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 317ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 337ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 362ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 794ms
     ✓ --flush with nothing to record commits and pushes nothing 414ms
     ✓ --flush carries the named worktree's logs into the dev commit 726ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1458ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1513ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1257ms
     ✓ closePr titles the PR by the record it carries 1497ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 325ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 416ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 302ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 561ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 885ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1001ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 839ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1008ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 845ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 850ms
     ✓ --push on dev never carries a row whose references name another feature 854ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 823ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1543ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 919ms
     ✓ --push commits in the named worktree, not the checkout it runs from 409ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 980ms
     ✓ preserves unlanded file deletions and ledger additions on close 1959ms
     ✓ preserves dirty work and uncertain branch evidence during close 1974ms
     ✓ preserves a local feature ref changed after its cleanup proof 2030ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1060ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 776ms
     ✓ a close that landed releases the lock 1029ms
     ✓ removes the worktree before it releases the lock 1015ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1846ms
       ✓ closePr refuses when the PR base is unknown 1355ms
     ✓ leaves a worktree no workflow created, and its branch, in place 854ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 472ms
     ✓ record is present after workflows close and before the push 469ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 960ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 934ms
       ✓ a run closed by workflow-failed keeps no parked copy 921ms
       ✓ a run closed by workflow-done keeps no parked copy 935ms
       ✓ a FAILED run gets no row 951ms
       ✓ a DONE run gets no row 946ms
     ✓ failed handover from dev removes the record and keeps recorded paths 842ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 364ms
     ✓ puts each --line after the summary, in flag order 301ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 32020ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 399ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 497ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 729ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 350ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 383ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 392ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 387ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 403ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 389ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 387ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 373ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 358ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 384ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 366ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 402ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 405ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 402ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 742ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 1153ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 1145ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 1126ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 1073ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 642ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 1027ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (6)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 707ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 1135ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 1194ms
     ✓ a --codex install reports the private-key and .env shell-read protection status 407ms
     ✓ a --codex install tells the reader how to act on the private-key status 406ms
     ✓ the codex-setup private-key action is self-contained in a fresh consumer 414ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 1304ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 1297ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 1173ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 1174ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 696ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 679ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 1125ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 986ms
   ✓ #864 — project document starters and their index (4)
     ✓ ships ten optional document starters on fresh install 733ms
     ✓ preserves the contents of a legacy managed document when reinstalling 734ms
     ✓ registers an adopted starter without duplicating project rows 1054ms
     ✓ preserves indexed equivalents and warns about unsafe registration paths 1035ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 40801ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 691ms
   ✓ preserves the requested event for selected-workflow verification 527ms
   ✓ requires selected other-workflow success at the exact pushed head 886ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 854ms
     ✓ a CI selection keeps the failed job names, capstone left out 471ms
     ✓ filters branch and PR discovery by configured workflow and exact head 342ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 576ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 750ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 579ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 729ms
     ✓ checks the named repository base and fails closed on missing evidence 382ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 345ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 375ms
     ✓ rejects MCP capstone jobs belonging to another run 511ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 355ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 355ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1045ms
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 385ms
     ✓ a failed re-trigger push names the cause in the log 592ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 605ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 776ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 434ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 417ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 421ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 522ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 537ms
     ✓ CLI: verdict JSON, body scan, exit codes 406ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 531ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 587ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 585ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 577ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1106ms
   ✓ bkit runs revalidate (7)
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 721ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 428ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 441ms
     ✓ debug: a failure test run is a failed run 450ms
     ✓ debug: a timed_out test run is a failed run 472ms
     ✓ debug: a startup_failure test run is a failed run 434ms
     ✓ debug: a test run still in progress or cancelled is not returned 707ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 757ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 662ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 969ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1067ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 55127ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 9217ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 1092ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 911ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 540ms
     ✓ node — with no report path the test file is left as it was 8378ms
     ✓ bats — with no report path the test file is left as it was 1062ms
     ✓ node — with no report path the test file is left as it was 902ms
     ✓ vitest — with no report path the test file is left as it was 533ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 342ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 428ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 344ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30356ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (286 tests) 121063ms
   ✓ branches rebase: behaviour (32)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 552ms
     ✓ produces byte-identical output to merge=union 444ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 648ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 318ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 603ms
     ✓ refuses a lockfile whose regenerate command fails 350ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 422ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 387ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 374ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 319ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 430ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 350ms
     ✓ resolves a conflict in each of two replayed commits across rounds 329ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 345ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 372ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 301ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 686ms
     ✓ runs exactly one git push 572ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 493ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 775ms
     ✓ --require-ci pushes as-is when dev has not moved 355ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 560ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 834ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 611ms
     ✓ --mode=abort pushes when the branch has no open PR 414ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 576ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 804ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 420ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 531ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1726ms
     ✓ skip-ci HEAD on the replay is refused 327ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 840ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1274ms
     ✓ a level local dev is a plain push, recording nothing extra 435ms
     ✓ a record with no commits pushes nothing 316ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 625ms
     ✓ a rewritten branch is refused, never forced 317ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 508ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 429ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 420ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 393ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 529ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 479ms
     ✓ an up-to-date branch is a no-op 320ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 488ms
   ✓ branches scan-diff (41)
     ✓ scan-diff consumes each moved assertion once and … 307ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 365ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 379ms
     ✓ --marker reads a diff over 1 MiB 303ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 330ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 301ms
     ✓ scan-diff finds an added skip 334ms
     ✓ scan-diff reports a disabled test with its line 305ms
     ✓ scan-diff finds an added pytest mark skip 308ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 893ms
     ✓ a title that already carries the marker is left alone 549ms
     ✓ with no open PR: pushes the marker commit and edits no title 516ms
     ✓ a re-run is deduped: no second marker commit 691ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 658ms
     ✓ --title-set skips gh entirely 348ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 617ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1278ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 660ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1546ms
     ✓ continues only the explicitly recorded target through the public merge command 1065ms
     ✓ fetches the unseen feature head before classifying the base 722ms
     ✓ fast forwards the feature before either base path is chosen 1538ms
     ✓ merges divergent feature tips without rebasing either side 918ms
     ✓ continues the feature merge before starting a dev merge 1432ms
     ✓ publishes local code with a CI running head before bookkeeping 1652ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2205ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1497ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 964ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 399ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 433ms
     ✓ --merge-docs merges dev when docs/ is behind 495ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 457ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 648ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 680ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 545ms
     ✓ --merge-docs skips an empty bkit:generate script 495ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 412ms
     ✓ --merge-docs never merges on dev itself 367ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 547ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 590ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 567ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 576ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 314ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 774ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 762ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 894ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 704ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 704ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 925ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 626ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 726ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 473ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 324ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 420ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 782ms
     ✓ a failed install stops ship (16) 523ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 477ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 478ms
     ✓ exits 10 when the fetch fails 360ms
   ✓ shared landed comparison (5)
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 613ms
     ✓ names only the file whose branch version never reached dev 611ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 594ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1278ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1078ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1063ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1067ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2207ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2652ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 392ms
     ✓ local: names unpushed dev as the cause when the branch carries it 500ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 477ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1066ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2040ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1204ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3833ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 947ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1044ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 964ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 623ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1386ms
     ✓ land removes the worktree when only the copied .env is untracked 1100ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 927ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1031ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1679ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1049ms
     ✓ landPr refuses a main-based PR without retrying 512ms
     ✓ landPr refuses when the PR base is unknown 504ms
     ✓ PR not open (closed): stops (17) at once, no retry 638ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 451ms
     ✓ --attempt names the merge round in a fix commit 411ms
     ✓ commits a rewritten and a deleted tracked file 422ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 373ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 338ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 394ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 378ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 343ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 378ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 374ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 30865ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1153ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 464ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 521ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 399ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 745ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 313ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 468ms
     ✓ clears a previous attempt's reports before the gate runs 480ms
   ✓ bkit tests run --artifact (5)
     ✓ a log small enough is copied whole: not clamped, raw null 443ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 394ms
     ✓ numbers runs within the workflow's active run and per step 399ms
     ✓ a PASS test-run row records no failed tests 590ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 392ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 464ms
     ✓ --since-pass-of skips failing runs and steps it does not name 547ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 422ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 316ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 317ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 324ms
     ✓ a failed importer search runs the whole check 328ms
     ✓ --changed-since=feature-base starts at the feature's start commit 364ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 323ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ uncommitted code blocks the receipt until it is committed 343ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 460ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 335ms
   ✓ bkit tests red / green (46)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 517ms
     ✓ a planned test absent from a loaded report is a missing gap 409ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 354ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 411ms
     ✓ per-test proof (4)
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 377ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 313ms
     ✓ takeover (5)
       ✓ tests red records a passing pre-run takeover as updated against the run start 350ms
       ✓ a resumed tests red skips a taken-over entry 303ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 336ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 441ms
     ✓ tests a code step changed (7)
       ✓ green leaves a changed test the plan no longer names out of changed 308ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 321ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 324ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 352ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 315ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 332ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 463ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (98 tests) 29126ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (5)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 457ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 311ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 369ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 341ms
     ✓ a new run of the same FID rewrites startSha 559ms
     ✓ a resume of the same FID reuses the record 484ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 625ms
       ✓ drops a commit id that is not on the branch 640ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 632ms
       ✓ writes an empty commit list when the run has no run-commits row 644ms
       ✓ ignores a row from before the open run started 635ms
       ✓ restores the commits from the row on origin/dev when the handover landed 762ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 806ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 742ms
       ✓ ignores the row on origin/dev when the run there is closed 787ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 654ms
         ✓ wins over the row on origin/dev, which is then not needed 760ms
         ✓ wins over the row in the checkout's own log while the run is open 793ms
         ✓ still drops a commit id that is not on the branch 804ms
         ✓ is ignored and removed when the checkout's log shows the run closed 773ms
         ✓ is ignored when it was parked for another workflow 810ms
         ✓ is removed once the record is rebuilt 796ms
         ✓ is removed when the live record already stands for the open run 675ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 346ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 380ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 446ms
     ✓ a stale record without a lock is replaced 497ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 377ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1279ms
     ✓ names inherited commits and ship recovery in the refusal 324ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 364ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 372ms
   ✓ bkit worktrees remove (20)
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 367ms
       ✓ preserves staged-only mode during landed cleanup 371ms
       ✓ preserves staged-only type during landed cleanup 373ms
       ✓ preserves staged-only deletion during landed cleanup 386ms
       ✓ removes landed staged content when both index and working contents are on dev 410ms
       ✓ deletes the proved local and remote branch at their landed tips 492ms
       ✓ retains the remote branch when origin refuses its conditional deletion 833ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 702ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 696ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 21026ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 587ms
     ✓ runs code.ts through its declared gate in the built checkout 599ms
     ✓ runs code.ts through its declared gate in the built checkout 601ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 585ms
     ✓ runs an audit template's project-section change through bkit:gate:min 694ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 530ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 542ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 552ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 357ms
     ✓ runs the full gate for replayed debug code 531ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 642ms
     ✓ installs local dependencies against the built target tree 714ms
     ✓ runs the configured frozen install even without root dependencies 599ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 630ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 643ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 675ms
     ✓ never pushes local dev commits missing from origin/dev 656ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1159ms
     ✓ dev moved before every push: exhausted, nothing landed 1796ms
     ✓ any other refusal is returned, not retried 747ms
     ✓ pushToDev replays a commit range onto origin/dev 670ms
     ✓ a replay retries on the new dev when dev moved 1134ms
     ✓ pushToDev log line names what it lands 606ms
     ✓ runs no git hooks in the throwaway checkout, and says so 637ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 645ms
     ✓ a push that fails without a server answer is returned once, never retried 529ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 900ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 908ms
     ✓ lands from a clone whose fetch refspec omits dev 724ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 15238ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 489ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 308ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 422ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 506ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 376ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 378ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 365ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 356ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 996ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 432ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (174 tests) 22616ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 356ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 323ms
     ✓ writeStepRow refuses when a recorded path changed 381ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 437ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 394ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 359ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 325ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 366ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 380ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 305ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 340ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 13274ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 391ms
     ✓ writes the jira marker shape, taking the tracker from package.json 415ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 756ms
[feat/test ce609c1] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 13500ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 948ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 956ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1022ms
     ✓ does not fall back through a malformed later success receipt 541ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 345ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 358ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 395ms
     ✓ a pending attempt whose process is gone is not treated as running 1021ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 796ms
     ✓ a push gate the hold limit stopped exits 124, hands the held-too-long status file on and earns no proof 520ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 630ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 674ms
     ✓ requires proof even when the pushed increment changes no files 355ms
     ✓ ignores malformed receipts 368ms
     ✓ records no proof for a failed gate or lighter gate 381ms
     ✓ requires integration proof when integration is declared 474ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 847ms
     ✓ a new branch with only bookkeeping after a receipted ancestor takes the minimum gate 397ms
     ✓ invalidates proof when the gate definition changes 363ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 13235ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 1736ms
     ✓ a foreign commit made mid-run never reaches the remote 1679ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 1682ms
     ✓ push from a level local dev is a plain push 866ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 1741ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 1109ms
     ✓ two records on dev: each push selects its own FID's commits 1659ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 724ms
     ✓ close commit tree excludes foreign files 974ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 1066ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (132 tests) 13060ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 391ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ a recorded ledger commits only the rows the run appended 345ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 409ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 365ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (107 tests) 11854ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 791ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 402ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 458ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 415ms
   ✓ postCommentOnce (11)
     ✓ invalidates missing corrupt and unsupported progress cache 390ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 408ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 11720ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 491ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 357ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2034ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 4018ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 608ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 840ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 690ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 7907ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 444ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 6574ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 415ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 331ms
     ✓ copies the worktreeCopy entries into the base checkout 320ms
     ✓ a base file run that writes no report reads unknown 329ms
     ✓ a CI run that cannot settle the base falls back to the local run 1795ms
     ✓ a pull_request-event CI run at the base sha does not settle none 359ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 328ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 323ms
     ✓ the base test run does not inherit the hooks-off git config 333ms
     ✓ adopt follows the run's runtimeWorktrees 670ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 9302ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 600ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 389ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 390ms
     ✓ runs the --fallback gate even when no file changed, as it did before 389ms
     ✓ exits 4 when the gate could not run 396ms
     ✓ changed-since exits 81 with the holder read from the status file 397ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 387ms
     ✓ exits 1 when the gate exits 75 and writes no status file 386ms
   ✓ tests changed default base (8)
     ✓ lists a file the subagent committed after the last step-done commit 404ms
     ✓ lists the same file when it is left uncommitted 364ms
     ✓ leaves out a file only the previous step's own commit touched 408ms
     ✓ lists the subagent's file when a later commit sweeps in an uncommitted step-done row 419ms
     ✓ lists the subagent's committed file when another feature's run is also in progress 474ms
     ✓ on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit 429ms
     ✓ on an in-place shared-branch run with a second run in progress and a dirty status file leaves out another agent's commit 517ms
     ✓ lists the subagent's committed file on an adopted branch when another feature's run is also in progress 538ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 6003ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section banner and drops every other context's 497ms
   ✓ bkit context diff (10)
     ✓ --reset-log empties the step's clamp log before the record lands 358ms
   ✓ featureBase (#960) (7)
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 311ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 325ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 4249ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 361ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 4996ms
   ✓ bkit roadmap mirror (8)
     ✓ writes the row in the worktree, then commits and pushes the same row on dev 696ms
     ✓ lands the same docs/roadmap.md bytes on dev as it writes on the branch, a second apart 680ms
     ✓ appends the branch's row byte for byte on dev when dev lacks the feature's earlier rows 686ms
     ✓ never touches the main checkout and never pushes its local dev commits 716ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 701ms
     ✓ a refused dev push is logged, never fails the close 929ms
 ✓ .bkit/core/engine/commands/install/doctor.integration.test.ts (26 tests) 4800ms
   ✓ bkit doctor — integration (8)
     ✓ requires a provider only for installed OpenCode agents: false 300ms
   ✓ bkit doctor — [mcp-env] advisory surface (8)
     ✓ doctor subprocess surfaces mcp-env advisory in output when .env.example present without .env 309ms
   ✓ bkit doctor — multi-provider cred check (Task 5 / #281) (2)
     ✓ checks credentials for ALL installed providers 303ms
 ✓ .bkit/core/engine/commands/comply.integration.test.ts (11 tests) 2184ms
   ✓ bkit comply — row labels (3)
     ✓ labels rows with the origin remote's owner/repo (resolveRepoSlug) and the repo's pinned bkit version 346ms
     ✓ falls back to unknown/repo without an origin remote, never to bkit.repoSlug 372ms
     ✓ without --phase grades, writes no rows and says so 341ms
 ✓ .bkit/core/engine/commands/lib.test.ts (78 tests) 2701ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1299ms
     ✓ runGit names ENOBUFS when output passes the limit 350ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 350ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (102 tests) 4035ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 405ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 3605ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 430ms
     ✓ workflow progress command wiring progress specialized completion producers 1596ms
     ✓ progress excludes noncompletions 862ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (39 tests) 1924ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 441ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 1817ms
 ✓ .bkit/core/engine/commands/workflow/step-base.test.ts (7 tests) 1476ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 1613ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 1341ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 1263ms
   ✓ selected CI context evidence (3)
     ✓ accepts only matching complete CI receipts with nonempty logs 493ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 1168ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (105 tests) 1342ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 922ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 1206ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 930ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (73 tests) 1504ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (28 tests) 406ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 418ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (4 tests) 351ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 778ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 121ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 172ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (337 tests) 201ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 280ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 46ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-Y8wVP9/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > a marker-less consumer file gets the block appended, its own content kept
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > the shipped hook template upgrades to its generated form: shared parts spliced into the block
[bkit-upgrade] upgrade (merge): .claude/hooks/gateguard.cjs

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: auto-applies non-conflicting changes
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: does NOT overwrite consumer drift (conflict preserved)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 56ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (21 tests) 71ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 97ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (49 tests | 3 skipped) 37ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 32ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 32ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 25ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 22ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 25ms
stdout | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
# bkit stats

> [!CAUTION]
> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows; rows a direct chat wrote (`utility`) are reported apart.
>
> **Rules:**
>
> - Generated — do not edit. `bkit stats` rewrites this file.

## Rows

<!-- prettier-ignore -->
| Kind | Workflow rows | Direct-chat rows |
| --- | --- | --- |
| outcome | 1 | 0 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Workflow runs

Rows a workflow close wrote at the end of a design, plan, build, debug or ship run.

### Run durations

No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

### Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

## Direct chats (`utility`)

Rows a direct chat wrote outside any workflow run (`by.workflow` `utility`). They are never added to the workflow figures.

No outcome or compliance rows from direct chats.

# bkit stats

> [!CAUTION]
> **Purpose:** This repo's workflow statistics, computed from `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`. Workflow closes append the rows; rows a direct chat wrote (`utility`) are reported apart.
>
> **Rules:**
>
> - Generated — do not edit. `bkit stats` rewrites this file.

## Rows

<!-- prettier-ignore -->
| Kind | Workflow rows | Direct-chat rows |
| --- | --- | --- |
| outcome | 1 | 0 |

<!-- prettier-ignore -->
| Workflow | Rows |
| --- | --- |
| build | 1 |

## Workflow runs

Rows a workflow close wrote at the end of a design, plan, build, debug or ship run.

### Run durations

No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |

Attempt counters: 0 counted by the shell (trusted), 1 reported by the model (untrusted).

### Agent context peaks

No context data. A close records it from the Claude Code session that ran the workflow.

## Direct chats (`utility`)

Rows a direct chat wrote outside any workflow run (`by.workflow` `utility`). They are never added to the workflow figures.

No outcome or compliance rows from direct chats.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/commands/workflow/open-decision.test.ts (29 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 14ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 19ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 7ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/audit-report.test.ts (5 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 3ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 3ms

 Test Files  71 passed (71)
   Affected  71 of 248 test files (related to 30 files)
      Tests  4482 passed | 3 skipped (4485)
   Start at  05:29:05
   Duration  180.09s (tests 99%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/958-agents-orchestrator-write/build-group-gate-5-2.log.reports/vitest-19703.xml

[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/repo/ledger-integrity.test.ts .bkit/core/engine/audits/repo/readme-models.test.ts .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts .bkit/core/engine/commands/ci/ci.test.ts .bkit/core/engine/commands/conventions.test.ts .bkit/core/engine/commands/install/uninstall.test.ts .bkit/core/engine/commands/install/upgrade.integration.test.ts .bkit/core/engine/commands/workflow/audit-report.test.ts .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/commands/workflow/open-decision.test.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/install/project-docs.test.ts .bkit/core/engine/ledgers/compact.test.ts .bkit/core/engine/ledgers/journal.integration.test.ts

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write

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

 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (80 tests) 67620ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ install --claude does not write Serena or graphify examples 389ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 943ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 940ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 920ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 1548ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 1551ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 1573ms
     ✓ malformed .mcp.json fails install instead of being overwritten 321ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 1591ms
     ✓ an adopted copy of every template survives upgrade and check 1646ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1599ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1512ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 575ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 2100ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 1253ms
   ✓ #1053 — upgrade re-records the entry of every rendered output (1)
     ✓ re-records a stale entry for a rendered mirror, doc and allowlist that are already current 779ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 1154ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 1760ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 1046ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1065ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 1781ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1780ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1268ms
     ✓ a dry-run hook and CI token migration writes nothing 631ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1597ms
     ✓ a second check-name migration writes nothing 1582ms
     ✓ a dry-run check-name migration writes and moves nothing 685ms
     ✓ a second Vale migration and a dry run write nothing 1667ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 1253ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 1159ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 1406ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 934ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 848ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 864ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 873ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 870ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 853ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 882ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1043ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1211ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1236ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 693ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 528ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 1259ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 1354ms
     ✓ migrates legacy ownership without changing project text or core ownership 1881ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 1321ms
     ✓ previews project document migration without mutating the checkout 739ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 1325ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 903ms
     ✓ upgrade names the missing root lint-staged config with the copy command 929ms
     ✓ install names the missing root lint-staged config under its own log prefix 829ms
     ✓ check names the missing root lint-staged config under its own log prefix 841ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 709ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 901ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 904ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 893ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 831ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (194 tests) 68846ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 431ms
   ✓ bkit workflows close (26)
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 318ms
     ✓ appends the completeness row before the workflow-done row 316ms
     ✓ writes one completeness row per close 440ms
     ✓ ship: run.pr, size of the squash commit, and coverage 307ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 432ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 379ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 376ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 304ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 339ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 351ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 368ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 352ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 822ms
     ✓ --flush with nothing to record commits and pushes nothing 451ms
     ✓ --flush carries the named worktree's logs into the dev commit 785ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 982ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1829ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 2063ms
     ✓ closePr titles the PR by the record it carries 1488ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 318ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 600ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 310ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 382ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 900ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1056ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 867ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1042ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 906ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 908ms
     ✓ --push on dev never carries a row whose references name another feature 934ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 899ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1678ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1073ms
     ✓ --push commits in the named worktree, not the checkout it runs from 437ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1133ms
     ✓ preserves unlanded file deletions and ledger additions on close 2092ms
     ✓ preserves dirty work and uncertain branch evidence during close 2077ms
     ✓ preserves a local feature ref changed after its cleanup proof 2154ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1147ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 839ms
     ✓ a close that landed releases the lock 1103ms
     ✓ removes the worktree before it releases the lock 1131ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1640ms
       ✓ closePr refuses when the PR base is unknown 1430ms
     ✓ leaves a worktree no workflow created, and its branch, in place 914ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 305ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 498ms
     ✓ record is present after workflows close and before the push 483ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1044ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1030ms
       ✓ a run closed by workflow-failed keeps no parked copy 1006ms
       ✓ a run closed by workflow-done keeps no parked copy 1015ms
       ✓ a FAILED run gets no row 1020ms
       ✓ a DONE run gets no row 1029ms
     ✓ failed handover from dev removes the record and keeps recorded paths 936ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 338ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (174 tests) 24185ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 873ms
     ✓ a failed commit leaves no row staged in the index 527ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 537ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 531ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 718ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 310ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 510ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 366ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 345ms
     ✓ writeStepRow refuses when a recorded path changed 334ms
     ✓ writeStepRow appends its commit sha to the record 312ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 428ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 386ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 342ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 306ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 321ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 365ms
 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (134 tests) 103896ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 374ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 364ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 391ms
     ✓ .husky/pre-push: empty stdin → gates still run 372ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 373ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ tag on a commit no origin branch holds → gates run 527ms
     ✓ tag pushed with a branch → gates run 541ms
     ✓ branch with files no origin dev / main tip has → gates run 538ms
     ✓ dev push with the files origin/dev already has → gates run 516ms
     ✓ main push with the files origin/main already has → gates run 521ms
     ✓ no origin dev / main ref fetched → a branch push gates 543ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 494ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 507ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 847ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 647ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 881ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 839ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 669ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 641ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 661ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 724ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 887ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1148ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 673ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 663ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 424ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 381ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 404ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 445ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 405ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 425ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 363ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 418ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 411ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 527ms
     ✓ .husky/pre-push: a gate fails → no disk prune 403ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 408ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 434ms
     ✓ a stale register stops the push before any gate runs 626ms
     ✓ bkit check fails → the push stops before any gate runs 365ms
     ✓ the dependency audit runs before any gate, when its script is present 394ms
     ✓ no dependency-audit script → skipped, the gates still run 402ms
     ✓ no register script → skipped, the gates still run 922ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 454ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 414ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 659ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 425ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 765ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 461ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 495ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 459ms
   ✓ graphify register pre-push gate (18)
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 331ms
     ✓ branch with an open PR into dev, register current → push goes on 340ms
     ✓ branch with no open PR → no check, push goes on 430ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 430ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 342ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 480ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 503ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 337ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 677ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1644ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 1639ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1139ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1946ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1041ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1099ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1132ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1268ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1269ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1507ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1241ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1700ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 1655ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1144ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2285ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1078ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1126ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1141ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1272ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1281ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1414ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1173ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1038ms
     ✓ .husky/pre-push: a code push still runs them 1100ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 817ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 353ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 348ms
     ✓ untrusted .envrc still prints the direnv allow line 366ms
     ✓ no .envrc → no direnv call 724ms
     ✓ direnv not on PATH → gates run, no warning 1059ms
     ✓ CI set → no direnv call 464ms
     ✓ delete-only push through direnv exec → exit 0, no gate 398ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1550ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1056ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1142ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 1351ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 1797ms
     ✓ open PR that merges cleanly → gates run, no message 1847ms
     ✓ no open PR → no fetch, gates run 1585ms
     ✓ gh not on PATH → warns, gates run 1177ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1217ms
     ✓ base fetch fails → warns, gates run 1793ms
     ✓ dev push → no PR lookup 1170ms
     ✓ min push of a conflicting PR → blocked 1733ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 1513ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 1891ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 1827ms
     ✓ fork PR with the same head branch name → ignored, gates run 2140ms
     ✓ shallow clone → no base fetch, warns, gates run 2284ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 1748ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 2427ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 1786ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 41119ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 655ms
   ✓ bkit tests run (14)
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 490ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 461ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 429ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 795ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 589ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 577ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 467ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 730ms
     ✓ PASS is 0 failures with or without reports 380ms
     ✓ clears a previous attempt's reports before the gate runs 428ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 603ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 329ms
     ✓ numbers runs within the workflow's active run and per step 620ms
     ✓ a FAIL test-run row records each failing case as file and name 398ms
     ✓ a PASS test-run row records no failed tests 720ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 347ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 424ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 626ms
     ✓ --since-pass-of skips failing runs and steps it does not name 779ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 484ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 510ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 354ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 678ms
     ✓ a failed importer search runs the whole check 336ms
     ✓ --changed-since=feature-base starts at the feature's start commit 550ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 603ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 451ms
     ✓ a failing required push gate leaves the failed marker 469ms
     ✓ uncommitted code blocks the receipt until it is committed 539ms
     ✓ only the required push gate records a receipt 332ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 643ms
   ✓ bkit tests red / green (46)
     ✓ a planned test absent from a loaded report is a missing gap 419ms
     ✓ a file that fails to load is a red of kind red-not-loaded 478ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 426ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 355ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 416ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 843ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 657ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 551ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 866ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 371ms
     ✓ takeover (5)
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 479ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 560ms
       ✓ a resumed tests red skips a taken-over entry 518ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 313ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 589ms
     ✓ green: a passed-accepted test is already landed, not a gap 382ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1097ms
     ✓ tests a code step changed (7)
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 453ms
       ✓ green leaves a changed test the plan no longer names out of changed 549ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 648ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 571ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 549ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 313ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 628ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 322ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 503ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 469ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 18649ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 385ms
     ✓ names each net-new and worsened finding in the log and the JSON 875ms
     ✓ fails on a net score rise with no net count change 510ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 522ms
     ✓ passes when the change only resolves findings 523ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 852ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 459ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 445ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 530ms
     ✓ exits 4 on a dropped net field instead of silently passing 540ms
     ✓ exits 4 on output that is not JSON instead of silently passing 520ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 972ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 314ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 372ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 335ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 327ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 926ms
   ✓ bkit ci prose — gate (9)
     ✓ explicit globs can select ignored prose and nested checkout files 534ms
     ✓ exits 6 on a vale runtime error 408ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ fails when vale sync cannot restore the required styles 458ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (39 tests) 2429ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (73 tests) 1461ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (132 tests) 12681ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 325ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ a recorded ledger commits only the rows the run appended 346ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 399ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 367ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests) 462ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 111ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 119ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 102ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/context.md
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .agents/skills.md
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips a managed lite.md block and keeps the consumer section
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .bkit/lite.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves the project docs and their wrapper text alone, because the project owns them
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > deletes the owned docs/templates/bkit-*.md and keeps the consumer's own templates
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] delete: docs/templates/bkit-audit-security.md
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > prunes docs/templates when only bkit's files were in it
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md
[bkit-uninstall-test] prune empty dir: docs/templates

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves docs/ alone on a targeted (non-core) uninstall, and on a dry run
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | skip-absent            | file not found — nothing to do
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > formatDecisionTable — P2.T7 > dry-run snapshot: decision table is printed, nothing deleted
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | strip-block            | json (deep-containment) — strip bkit-owned scope, preserve consumer keys
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > strips bkit block from markered-text file, preserving consumer content
[bkit-uninstall-test] strip-block: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > deletes markered-text file when stripping leaves only whitespace
[bkit-uninstall-test] delete (empty after strip): AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves markered-text file when no bkit markers present (100% consumer)
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash unknown
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it))
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > reclaims an unedited owned byte-equal file via canonicalHashes
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash mismatches (consumer modified)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's linear entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's jira entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's github entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's linear entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's jira entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after strip): .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude/hooks
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves a markered-text file when the consumer added content outside the block
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json on full uninstall (renders @@sentinel@@ keys before strip-scope)
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json holding every provider block and tracker entry earlier installs left
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a github tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a linear tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a jira tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves opencode.json when the consumer added their own key
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > prunes deleted paths from .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete mirror: .claude/agents/bkit-foo.md
[bkit-uninstall-test] prune empty dir: .claude/agents
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > leaves .bkit/version byte-identical on a targeted uninstall that prunes nothing
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > does not rewrite .bkit/version on a targeted dry-run (no writes)
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do

[bkit-uninstall-test] [dry-run] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (github)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (linear)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (jira)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (github)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (linear)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (jira)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > deletes .cursor/bkit-cloud.md when the cursor host is uninstalled
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .cursor/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
.cursor/hooks.json                               | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.cursor/cli.json                                 | skip-absent            | file not found — nothing to do
.cursor/rules/bkit-rules.mdc                     | skip-absent            | file not found — nothing to do
.cursor/mcp.json                                 | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > leaves .cursor/bkit-cloud.md untouched when cursor is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > deletes .codex/bkit-cloud.md when the codex host is uninstalled
[bkit-uninstall-test] absent: .codex/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-rules.cjs (file not found — nothing to do)
[bkit-uninstall-test] delete: .codex/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .codex

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
.codex/hooks.json                                | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-gateguard.cjs                  | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-readguard.cjs                  | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-guardrails.cjs                 | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-rules.cjs                      | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > leaves .codex/bkit-cloud.md untouched when codex is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 93ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 59ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 154ms
(node:29759) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:29759) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 47ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 32ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row when an indexed equivalent covers the topic
[bkit-install] skip: docs/noise.md — .agents/docs.md already lists docs/other/noise.md for this topic, so no row was added. Add a row by hand if both documents matter.

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > reports instead of throwing when docs is a regular file
[bkit-install] docs/architecture.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/technology.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/security.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/data-schema.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/testing.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/deployments.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/observability.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/design.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/noise.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/setup.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (38 tests) 36ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 33ms
 ✓ .bkit/core/engine/commands/workflow/open-decision.test.ts (29 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/audit-report.test.ts (5 tests) 4ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 11258ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 499ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 365ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2036ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 4052ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 470ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 660ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 551ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (286 tests) 126569ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 308ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 307ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 377ms
     ✓ produces byte-identical output to merge=union 524ms
     ✓ restores a trailing newline so the next append starts on its own line 304ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 414ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 331ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 739ms
     ✓ refuses a lockfile whose regenerate command fails 452ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 438ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 407ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 410ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 347ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 438ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 316ms
     ✓ removes a stale sentinel when the rebase succeeds 353ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 446ms
     ✓ resolves a conflict in each of two replayed commits across rounds 370ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 397ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 420ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 408ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 810ms
     ✓ runs exactly one git push 682ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 544ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 854ms
     ✓ --require-ci pushes as-is when dev has not moved 356ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 622ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 900ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 512ms
     ✓ --mode=abort pushes when the branch has no open PR 476ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 352ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 923ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 459ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 538ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1637ms
     ✓ skip-ci HEAD on the replay is refused 354ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 841ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1579ms
     ✓ a level local dev is a plain push, recording nothing extra 445ms
     ✓ a record with no commits pushes nothing 319ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 634ms
     ✓ a rewritten branch is refused, never forced 319ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 510ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 455ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 434ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 421ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 549ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 519ms
     ✓ an up-to-date branch is a no-op 333ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 530ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 324ms
     ✓ scan-diff still reports a new skip when its test … 315ms
     ✓ scan-diff recognizes a renamed test file 304ms
     ✓ scan-diff recognizes a suite moved into a differe… 320ms
     ✓ scan-diff does not match identical assertions fro… 318ms
     ✓ scan-diff does not match the same leaf test name … 311ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 316ms
     ✓ --paths with no match exits 1 312ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 393ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 417ms
     ✓ --marker reads a diff over 1 MiB 313ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 364ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 308ms
     ✓ scan-diff finds an added skip 327ms
     ✓ scan-diff ignores a skip predating the base 316ms
     ✓ scan-diff reports a disabled test with its line 318ms
     ✓ scan-diff ignores a removed comment in a test file 307ms
     ✓ scan-diff finds an added pytest mark skip 352ms
     ✓ scan-diff finds an added unittest skip 307ms
     ✓ scan-diff ignores an assertion whose expectation changed 308ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 640ms
     ✓ a title that already carries the marker is left alone 581ms
     ✓ with no open PR: pushes the marker commit and edits no title 525ms
     ✓ a re-run is deduped: no second marker commit 649ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 708ms
     ✓ --title-set skips gh entirely 398ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 768ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1326ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 778ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1630ms
     ✓ continues only the explicitly recorded target through the public merge command 1148ms
     ✓ fetches the unseen feature head before classifying the base 781ms
     ✓ fast forwards the feature before either base path is chosen 1668ms
     ✓ merges divergent feature tips without rebasing either side 976ms
     ✓ continues the feature merge before starting a dev merge 1577ms
     ✓ publishes local code with a CI running head before bookkeeping 1747ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2361ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1498ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1022ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 429ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 455ms
     ✓ --merge-docs merges dev when docs/ is behind 583ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 532ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 661ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 558ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 485ms
     ✓ --merge-docs skips an empty bkit:generate script 435ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 358ms
     ✓ --merge-docs never merges on dev itself 339ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 508ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 469ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 474ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 579ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 341ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 781ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 757ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 866ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 928ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 724ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 903ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 655ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 744ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 524ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 367ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 498ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 690ms
     ✓ a failed install stops ship (16) 812ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 494ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 422ms
     ✓ exits 10 when the fetch fails 331ms
   ✓ shared landed comparison (5)
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 538ms
     ✓ names only the file whose branch version never reached dev 538ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 560ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1242ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1161ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1121ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1115ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2523ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3022ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 367ms
     ✓ local: names unpushed dev as the cause when the branch carries it 476ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 457ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1863ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1657ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 998ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4407ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1063ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1145ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 993ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 667ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1657ms
     ✓ land removes the worktree when only the copied .env is untracked 1321ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1136ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1111ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1600ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 969ms
     ✓ landPr refuses a main-based PR without retrying 513ms
     ✓ landPr refuses when the PR base is unknown 527ms
     ✓ PR not open (closed): stops (17) at once, no retry 613ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 375ms
     ✓ --attempt names the merge round in a fix commit 337ms
     ✓ commits a rewritten and a deleted tracked file 349ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 316ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 301ms

 Test Files  26 passed (26)
      Tests  2494 passed (2494)
   Start at  05:32:06
   Duration  126.76s (tests 100%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/958-agents-orchestrator-write/build-group-gate-5-2.log.reports/vitest-43635.xml

[bkit:gate:changed] named: bats tests/shell/bkit-graphify-refresh.bats tests/shell/bkit-graphify-rollup.bats
1..11
ok 1 refresh builds the register from the staged files, not HEAD or unstaged edits
ok 2 refresh rewrites the DETAILS copy of the packages diagram from the new register
ok 3 refresh drops a file deleted in the index from the build
ok 4 refresh replaces the text between the graphify markers and keeps an unstaged edit outside them
ok 5 a run replaces the text between the markers and leaves the text outside them unchanged
ok 6 a doc without markers that the script wrote whole is rewritten into the new layout with its overrides kept
ok 7 an absent doc is built from the starter
ok 8 a doc with one marker stops the run and is not written
ok 9 a doc with the markers out of order stops the run and is not written
ok 10 a hand-written doc without markers stops the run and is not written
ok 11 a marker named inside a sentence is not taken for a marker line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/audit-report.test.ts .bkit/core/engine/commands/workflow/audit-report.ts .bkit/core/engine/commands/workflow/challenge.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/open-decision.test.ts .bkit/core/engine/commands/workflow/open-decision.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/steps.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/audit-report.test.ts .bkit/core/engine/commands/workflow/audit-report.ts .bkit/core/engine/commands/workflow/challenge.ts .bkit/core/engine/commands/workflow/decisions.test.ts .bkit/core/engine/commands/workflow/decisions.ts .bkit/core/engine/commands/workflow/open-decision.test.ts .bkit/core/engine/commands/workflow/open-decision.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/steps.ts DETAILS.md dist/commands/workflow/audit-report.js dist/commands/workflow/challenge.js dist/commands/workflow/decisions.js dist/commands/workflow/open-decision.js dist/commands/workflow/steps.js docs/capabilities.md docs/plans/202611/958-agents-orchestrator-write-plan.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-brief-tests-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-diff-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-diff-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-gaps-remediate-5-1-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-tasks-5-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-tests-5-log.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-verify-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-plan-verify-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-green-5-1.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-green-5-2.md docs/plans/202611/logs/958-agents-orchestrator-write/build-tests-red-5-1.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/958-agents-orchestrator-write
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
