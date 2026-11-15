
> @cbartens/bkit@6.1.1 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/.bkit/cli.md .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/summary.ts .bkit/core/engine/commands/workflow/tasks.test.ts .bkit/core/engine/commands/workflow/tasks.ts dist/commands/workflow/step-table.js dist/commands/workflow/summary.js dist/commands/workflow/tasks.js docs/plans/202611/957-workflows-skip-re-plan.md docs/plans/202611/logs/957-workflows-skip-re/build-brief-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-brief-tests-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-diff-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-tasks-1-log.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-tests-1-log.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-verify-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-tests-green-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-tests-red-1-1.md docs/plans/202611/logs/957-workflows-skip-re/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/.bkit/cli.md .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/summary.ts .bkit/core/engine/commands/workflow/tasks.test.ts .bkit/core/engine/commands/workflow/tasks.ts dist/commands/workflow/step-table.js dist/commands/workflow/summary.js dist/commands/workflow/tasks.js docs/plans/202611/957-workflows-skip-re-plan.md docs/plans/202611/logs/957-workflows-skip-re/build-brief-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-brief-tests-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-diff-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-tasks-1-log.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-tests-1-log.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-verify-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-tests-green-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-tests-red-1-1.md docs/plans/202611/logs/957-workflows-skip-re/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re

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

 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 112219ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 959ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 463ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes none outside Claude Code 484ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 628ms
   ✓ bkit workflows start — resume facts (11)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 549ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 738ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 419ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 450ms
     ✓ --max-exceeded says a handover is due without any sentinel 482ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 441ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 791ms
       ✓ counts subagents of an earlier chat the run's session rows name 521ms
       ✓ records no context block, and still closes, outside a Claude Code session 535ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 554ms
     ✓ records ending held and publish false on the workflow-done row 760ms
     ✓ defaults the close row to ending done 522ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 802ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 527ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 539ms
     ✓ always writes the telemetry, whatever the runtime 468ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 657ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 468ms
     ✓ an unwritable stats path is logged and never fails the close 415ms
     ✓ appends the completeness row before the workflow-done row 540ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 719ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 519ms
     ✓ writes one completeness row per close 788ms
     ✓ leaves out the previous run's rows that share a second with this run's start 738ms
     ✓ still closes when the completeness check throws 516ms
     ✓ still closes when the completeness row write throws 488ms
     ✓ ship: run.pr, size of the squash commit, and coverage 839ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 809ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 479ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 734ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 600ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 609ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 938ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 568ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 602ms
     ✓ --record-step writes the close step's row before workflow-done 685ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 443ms
     ✓ --number without --outbox is a usage error 466ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 919ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 620ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 698ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 985ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 485ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1880ms
     ✓ --flush with nothing to record commits and pushes nothing 1060ms
     ✓ --flush carries the named worktree's logs into the dev commit 1882ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2404ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1990ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2329ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1911ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2306ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1954ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1963ms
     ✓ --push on dev never carries a row whose references name another feature 2011ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1827ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3853ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2137ms
     ✓ --push commits in the named worktree, not the checkout it runs from 800ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2090ms
     ✓ preserves unlanded file deletions and ledger additions on close 3718ms
     ✓ preserves dirty work and uncertain branch evidence during close 3693ms
     ✓ preserves a local feature ref changed after its cleanup proof 4008ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2153ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1622ms
     ✓ a close that landed releases the lock 1959ms
     ✓ removes the worktree before it releases the lock 2097ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2910ms
       ✓ closePr refuses when the PR base is unknown 2850ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1774ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 608ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 351ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 917ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 467ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 397ms
     ✓ a second run's record does not let this FID's close commit 531ms
     ✓ record is present after workflows close and before the push 932ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1666ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 350ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 333ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 702ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 507ms
     ✓ puts each --line after the summary, in flag order 513ms
     ✓ --summary prints the file and keeps a copy in --outbox 559ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 475ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 118451ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 2476ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 16102ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1550ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1260ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 964ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1576ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1682ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2508ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1281ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 895ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 380ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 911ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 889ms
     ✓ design installs dependencies like build and debug 955ms
     ✓ plan installs dependencies like build and debug 847ms
     ✓ design stops on a failed install (5) 1126ms
     ✓ plan stops on a failed install (5) 1066ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1043ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1047ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 881ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1028ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2097ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3474ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 3712ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2690ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 2523ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 2904ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1841ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1840ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1697ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1935ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2951ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2151ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2471ms
     ✓ commits leftovers when a copy entry points outside the checkout 1981ms
     ✓ never commits the entries setup copies in from the main checkout 2016ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2052ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1011ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 999ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1328ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1375ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1358ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1352ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1425ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1681ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2040ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 860ms
     ✓ leaves a clean worktree's history alone 2429ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2264ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 2841ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2694ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 2831ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 3077ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2770ms
     ✓ does not mark a resumed worktree it did not create 1177ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 314ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 943ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1631ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1697ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 989ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (77 tests) 137036ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 555ms
     ✓ install --claude does not write Serena or graphify examples 1071ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 552ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 549ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 743ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 1910ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 2078ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 2067ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 3485ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3588ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3581ms
     ✓ malformed .mcp.json fails install instead of being overwritten 579ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 3214ms
     ✓ an adopted copy of every template survives upgrade and check 3377ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 3449ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 3515ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1050ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 4819ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 2680ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 2635ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 3997ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 2799ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 2547ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 4304ms
     ✓ branded script migration is idempotent and dry-run writes nothing 4083ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 3271ms
     ✓ a dry-run hook and CI token migration writes nothing 1340ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 3650ms
     ✓ a second check-name migration writes nothing 2910ms
     ✓ a dry-run check-name migration writes and moves nothing 1307ms
     ✓ a second Vale migration and a dry run write nothing 2962ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 2372ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 2204ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 2493ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 1724ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1572ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1677ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1632ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1662ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1634ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1356ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 2047ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 2463ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 2365ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1310ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 395ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 379ms
     ✓ passes -w when the consumer is a pnpm workspace root 354ms
     ✓ starts the package runner for the install and the re-exec 1013ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 344ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2496ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 2624ms
     ✓ migrates legacy ownership without changing project text or core ownership 2919ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 2307ms
     ✓ previews project document migration without mutating the checkout 1414ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 2540ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 1665ms
     ✓ upgrade names the missing root lint-staged config with the copy command 1705ms
     ✓ install names the missing root lint-staged config under its own log prefix 1586ms
     ✓ check names the missing root lint-staged config under its own log prefix 1636ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 1395ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 1871ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 1707ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 3453ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (167 tests) 44374ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 934ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 672ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 475ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 592ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 521ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 404ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 413ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 834ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 752ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 858ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 379ms
     ✓ PASS is 0 failures with or without reports 466ms
     ✓ clears a previous attempt's reports before the gate runs 341ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 330ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 500ms
     ✓ a log under the outbox is named main-checkout relative in the record 498ms
     ✓ a log small enough is copied whole: not clamped, raw null 503ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 419ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 870ms
     ✓ numbers runs within the workflow's active run and per step 1306ms
     ✓ without --file no row is written and the output carries row null 536ms
   ✓ bkit tests run --changed-since (6)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 853ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 575ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 619ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 611ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 628ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 623ms
     ✓ a failing required push gate leaves the failed marker 557ms
     ✓ uncommitted code blocks the receipt until it is committed 828ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 690ms
     ✓ only the required push gate records a receipt 704ms
     ✓ a tests-lock wait records no receipt and the re-run after the lock frees does 1073ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 541ms
     ✓ a planned test that passes is a vacuous gap, exit 1 482ms
     ✓ a planned test absent from a loaded report is a missing gap 522ms
     ✓ a file that fails to load is a red of kind red-not-loaded 598ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 590ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1022ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 480ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 534ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 986ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 590ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 811ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 706ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 851ms
     ✓ green: a passed-accepted test is already landed, not a gap 541ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 531ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 565ms
     ✓ green: --group audits only that group's tasks 771ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 623ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 880ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 578ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 800ms
     ✓ green: lists each gap kind, with the runner output 563ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1010ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 399ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 70153ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1424ms
   ✓ preserves the requested event for selected-workflow verification 1584ms
   ✓ requires selected other-workflow success at the exact pushed head 1544ms
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 1587ms
     ✓ saves the failed job count without the capstone job 529ms
     ✓ counts the capstone job when it is the only failed job 624ms
     ✓ saves no failed job count when no job failed 537ms
     ✓ filters branch and PR discovery by configured workflow and exact head 668ms
     ✓ freezes explicit workflow run attempt and all failed job pages 527ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1194ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1592ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 435ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 446ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 461ms
     ✓ rejects a workflow result count smaller than its returned records 433ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1153ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1458ms
     ✓ checks the named repository base and fails closed on missing evidence 813ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 706ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 705ms
     ✓ rejects MCP capstone jobs belonging to another run 949ms
     ✓ --fetch refreshes origin/<branch> before gating 511ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 505ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 435ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 614ms
       ✓ a source change past the validated head refuses (17) and names the path 423ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 553ms
       ✓ --validated without --month / --fid is a usage error (2) 382ms
       ✓ a validated sha that is not an ancestor refuses (17) 451ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 545ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 928ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1091ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 412ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 837ms
     ✓ a failed re-trigger push names the cause in the log 1103ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1177ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1902ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 836ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 445ms
     ✓ gh-error: every poll errored 381ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 743ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 752ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 876ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 785ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 401ms
     ✓ CLI: verdict JSON, body scan, exit codes 694ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 490ms
     ✓ CLI: --poll-result is validated, --attempts needs it 331ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 958ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 2247ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 2172ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2121ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 527ms
     ✓ re-trigger on dev only uses the record of its own FID 689ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 611ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 715ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 374ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 308ms
       ✓ without --repo no call gains a --repo flag 426ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1745ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 457ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 356ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 373ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 340ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 396ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 549ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 615ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 546ms
     ✓ --file and --step go together 456ms
   ✓ bkit runs handoff (1)
     ✓ derives handoff decisions from persisted poll observations and target identity 2697ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests) 74819ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 383ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 951ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 1025ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 1515ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 744ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 784ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 820ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 786ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 896ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 886ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 797ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --auto=codex without .codex/ exits 1 naming --codex and writes nothing 448ms
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 856ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 801ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 803ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 734ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 349ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 354ms
     ✓ explicit `bkit help` prints the same usage and exits 0 469ms
     ✓ `bkit check --claude` (stray module flag) errors 1095ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 937ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1147ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 958ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 555ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 934ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 2169ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 2860ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 2230ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 410ms
     ✓ finishes a CI round only with its own failed job count 433ms
   ✓ progress command output (4)
     ✓ done prints progressLine 365ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --attempt=next advances with each row, so the next parentSha differs 460ms
     ✓ carries extra fields, parsed as JSON when they are JSON 601ms
     ✓ reports a failed commit with exit 8 without writing the row 697ms
     ✓ a failed commit leaves no row staged in the index 628ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 761ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 577ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1033ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 454ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 827ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 315ms
     ✓ --ref exits 3 when the ref does not carry the status file 606ms
     ✓ fails when the row does not list the artifact, or carries another attempt 303ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 327ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 385ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 378ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 783ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 803ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 831ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 513ms
     ✓ --post needs --number; without --post there is no tracker key 472ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 409ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 301ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 530ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 605ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1353ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1603ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1203ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1142ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1489ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 691ms
     ✓ runs the full gate for replayed debug code 1508ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1677ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1386ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1450ms
     ✓ a push that fails without a server answer is returned once, never retried 1035ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1934ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1483ms
     ✓ lands from a clone whose fetch refspec omits dev 1739ms
     ✓ build throwing stops the landing and removes the throwaway checkout 393ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 2401ms
     ✓ vitest — with no report path the test file is left as it was 1675ms
     ✓ a run naming files of two kinds is refused as a usage error 566ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 848ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1099ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 497ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 627ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 31049ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 31220ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 411ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 315ms
     ✓ retries a failed create once, and exits 5 when it fails twice 395ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 460ms
     ✓ exits 6 when the created PR's base is not --base 338ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 321ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 509ms
     ✓ exits 4 when gh errors and 80 when it needs auth 460ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 377ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 305ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 419ms
     ✓ runs no merge when the PR is already MERGED 410ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 677ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 451ms
     ✓ prs merge refuses when the PR base is unknown 433ms
     ✓ prs merge reads the base from the one pr view it already makes 399ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 604ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 616ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 704ms
     ✓ never reads dev's required checks without --only-if-required 311ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 311ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 307ms
     ✓ is not green when a check failed, naming it (exit 1) 531ms
     ✓ is not green on an empty rollup (total 0) 312ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 314ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 466ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 379ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 33080ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 726ms
     ✓ names each net-new and worsened finding in the log and the JSON 1313ms
     ✓ fails on a net score rise with no net count change 399ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 405ms
     ✓ treats a net score at or below 0.001 as float noise 768ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 851ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 361ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 578ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 700ms
     ✓ exits 4 on a dropped net field instead of silently passing 578ms
     ✓ exits 4 on no summary instead of silently passing 478ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 727ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1131ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 653ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 651ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 605ms
     ✓ explicit globs can select ignored prose and nested checkout files 432ms
     ✓ fails closed when a selected prose source cannot be read 412ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 407ms
     ✓ fails (exit 1) when vale reports alerts 431ms
     ✓ exits 6 on a vale runtime error 429ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 739ms
     ✓ falls back to vale sync when the main worktree has none 522ms
     ✓ fails when vale sync cannot restore the required styles 424ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 334ms
     ✓ is a usage error when the commit cannot be read 522ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 320ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ exits 7 when a commit cannot be read 583ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 416ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 354ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 515ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 417ms
     ✓ refuses a code conflict and aborts the rebase on the spot 429ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1059ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 435ms
     ✓ produces byte-identical output to merge=union 964ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 628ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 801ms
     ✓ refuses a lockfile whose regenerate command fails 954ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 865ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1069ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 756ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 549ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 686ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1126ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 505ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 630ms
       ✓ runs (0) with the landed path count once dev moved 765ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 359ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1072ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1456ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2022ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 433ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 896ms
     ✓ --mode=abort pushes when the branch has no open PR 894ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 655ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 654ms
     ✓ --open-pr carries the MCP answer and skips gh 579ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1168ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1096ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3186ms
     ✓ skip-ci HEAD on the replay is refused 717ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2056ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 665ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1003ms
     ✓ a fetch that fails exits 10 445ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 515ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 542ms
     ✓ scan-diff attributes deletion to its old test ins… 477ms
     ✓ scan-diff consumes each moved assertion once and … 559ms
     ✓ scan-diff does not match identical assertions fro… 556ms
     ✓ scan-diff does not match the same leaf test name … 637ms
     ✓ scan-diff does not match a same-named test with d… 547ms
     ✓ scan-diff does not match a same-named test with c… 545ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 582ms
     ✓ --paths with no match exits 1 496ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 385ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 705ms
     ✓ --marker reads a diff over 1 MiB 607ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 535ms
     ✓ scan-diff ignores a removed comment in a test file 551ms
     ✓ scan-diff ignores an assertion moved within the file 541ms
     ✓ scan-diff still reports a removed assertion 512ms
     ✓ scan-diff reports an assertion re-added only outside the test file 532ms
     ✓ scan-diff finds an added pytest mark skip 644ms
     ✓ scan-diff finds an added unittest skip 579ms
     ✓ scan-diff finds an added bare skip call 560ms
     ✓ scan-diff ignores a quoted skip in a documentation file 536ms
     ✓ scan-diff ignores a marker literal in a non-test source file 549ms
     ✓ scan-diff ignores an assertion whose expectation changed 576ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 544ms
     ✓ scan-diff reports a deleted test file 608ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 473ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3090ms
     ✓ publishes local code with a CI running head before bookkeeping 3318ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4520ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3103ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 3487ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1846ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1344ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1132ms
     ✓ --merge-docs skips an empty bkit:generate script 1132ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1036ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1844ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2081ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1602ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1636ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2052ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1105ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 830ms
     ✓ exits 10 when the fetch fails 533ms
     ✓ refuses --merge-docs with --head, and an unknown --head 556ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 989ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1755ms
     ✓ a failed install stops ship (16) 1245ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1199ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1143ms
     ✓ exits 10 when the fetch fails 800ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 545ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2126ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1951ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2014ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1236ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3028ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 917ms
     ✓ reports undeclared and runs nothing with an empty script 588ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 728ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1209ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 626ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 25671ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 483ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1981ms
   ✓ routine publication policy (8)
     ✓ uses exact new comment after a failed eligibility read 371ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 308ms
     ✓ reserves new comment opportunity within total delivery budget 746ms
     ✓ contains preparation state lock and reconciliation exceptions 348ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 365ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 493ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 485ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 503ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 337ms
     ✓ fetches the issue and its comments as GitHub returns them 334ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 456ms
     ✓ invalidates missing corrupt and unsupported progress cache 768ms
     ✓ contains cache read and write failures as standalone degradation 662ms
     ✓ uses legacy receipts and contains receipt failures 401ms
     ✓ records an engine-action row and skips the same key + body on a re-run 371ms
     ✓ a recent identical comment counts as done (the final close comment) 589ms
     ✓ a failed post reports done false with the reason and never leaks a token 484ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 440ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 337ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 433ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 26144ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 80 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 812ms
     ✓ a failing file absent at the base commit is the branch's 504ms
     ✓ an undeclared bkit:test:file reads unknown 431ms
     ✓ a failed base install reads unknown and removes the worktree 445ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 652ms
     ✓ copies the worktreeCopy entries into the base checkout 594ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3444ms
     ✓ a pull_request-event CI run at the base sha does not settle none 626ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 641ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 607ms
     ✓ the base test run does not inherit the hooks-off git config 601ms
     ✓ adopt follows the run's runtimeWorktrees 1188ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (25 tests) 21395ms
   ✓ verified incremental push gates (25)
     ✓ keeps the later failure when two full gates overlap on the same commit 2087ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2019ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2060ms
     ✓ does not fall back through a malformed later success receipt 1001ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 643ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 679ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 740ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1198ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1400ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 416ms
     ✓ does not record a committed tree 456ms
     ✓ records no proof for a failed gate or lighter gate 748ms
     ✓ requires integration proof when integration is declared 911ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1961ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 452ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1398ms
     ✓ a refused dev push is logged, never fails the close 1634ms
     ✓ an unreachable remote is logged, never fails the close 539ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 8041ms
   ✓ bkit issues comment --post (7)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 783ms
     ✓ counts files committed since --base 522ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 819ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 660ms
     ✓ runs the --fallback gate even when no file changed, as it did before 444ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 349ms
     ✓ writes zero files (purely read-only — write-set assertion) 334ms
     ✓ reports opencode as absent when .opencode/ does not exist 379ms
   ✓ bkit doctor — [mcp-env] advisory surface (8)
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 3896ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1329ms
     ✓ runGit names ENOBUFS when output passes the limit 746ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 654ms
> [bkit] TRUNCATED HERE — 122 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 97623ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2741ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 300ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2050ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 1858ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1351ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1404ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2415ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2121ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3538ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1428ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1619ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2104ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1821ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1360ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2053ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2304ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2288ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2563ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2538ms
       ✓ a branch with no status.jsonl dispatches as before 2271ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2848ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3811ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2307ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2645ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 4490ms
     ✓ continues after the prepared completion source disappears 2553ms
     ✓ records preparation and session association failures despite successful delivery 2601ms
     ✓ associates startup and run across restart or starts fresh safely 3504ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 9439ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 846ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 511ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 340ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 720ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 403ms
     ✓ .husky/pre-push: first and last lines name the log 350ms
     ✓ .husky/pre-push: the hook body runs once 451ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 628ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 551ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 677ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 600ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 563ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 721ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 914ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 753ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 746ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 611ms
     ✓ .husky/pre-push: a gate fails → no disk prune 677ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 570ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 536ms
     ✓ a stale register stops the push before any gate runs 515ms
     ✓ bkit check fails → the push stops before any gate runs 677ms
     ✓ the dependency audit runs before any gate, when its script is present 723ms
     ✓ no dependency-audit script → skipped, the gates still run 537ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 935ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 514ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1055ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 602ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 776ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 691ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1009ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 641ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 502ms
     ✓ branch with no open PR → no check, push goes on 843ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 895ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 424ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 713ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 1800ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2308ms
     ✓ base fetch fails → warns, gates run 2267ms
     ✓ dev push → no PR lookup 2079ms
     ✓ min push of a conflicting PR → blocked 2443ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 382ms
     ✓ openDecision gate ignores a Gate line below the header 432ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 423ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 678ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 437ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 584ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 566ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 346ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 380ms
     ✓ an unwritable stats path is logged and never fails the close 415ms
     ✓ appends the completeness row before the workflow-done row 416ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 717ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 426ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1074ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 375ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 421ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 426ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 671ms
     ✓ --number without --outbox is a usage error 379ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 532ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 514ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 729ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1812ms
     ✓ --flush with nothing to record commits and pushes nothing 763ms
     ✓ --flush carries the named worktree's logs into the dev commit 1617ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 4135ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2838ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2158ms
     ✓ a close that landed releases the lock 2904ms
     ✓ removes the worktree before it releases the lock 2909ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 357ms
     ✓ names the branch, not the remote-tracking ref, in each URL 307ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 304ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 365ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 928ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 413ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 744ms
     ✓ record is present after workflows close and before the push 1247ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2098ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 441ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1453ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1872ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2533ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1411ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 762ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 912ms
     ✓ plan installs dependencies like build and debug 1118ms
     ✓ design stops on a failed install (5) 865ms
     ✓ plan stops on a failed install (5) 1043ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1062ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1076ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 808ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1334ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2095ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1797ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1794ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1731ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1865ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2168ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1955ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2213ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9170ms
     ✓ records the failed job count and reads an uncounted local round as unknown 7223ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 5058ms
     ✓ finishes the first CI evidence round of the second debug run 4089ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 320ms
     ✓ refuses a code conflict and aborts the rebase on the spot 424ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 981ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 304ms
     ✓ produces byte-identical output to merge=union 971ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 591ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 833ms
     ✓ refuses a lockfile whose regenerate command fails 691ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 969ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 854ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 381ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 515ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 611ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 656ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 357ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 368ms
       ✓ runs (0) with the landed path count once dev moved 708ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 364ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 617ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1179ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1617ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 404ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1317ms
     ✓ --mode=abort pushes when the branch has no open PR 846ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 680ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 303ms
     ✓ --open-pr carries the MCP answer and skips gh 476ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 780ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1014ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2834ms
     ✓ skip-ci HEAD on the replay is refused 530ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1586ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 610ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 935ms
     ✓ a fetch that fails exits 10 331ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 571ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 506ms
     ✓ scan-diff attributes deletion to its old test ins… 512ms
     ✓ scan-diff consumes each moved assertion once and … 555ms
     ✓ scan-diff does not match identical assertions fro… 707ms
     ✓ scan-diff does not match the same leaf test name … 751ms
     ✓ scan-diff does not match a same-named test with d… 571ms
     ✓ scan-diff does not match a same-named test with c… 523ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 835ms
     ✓ --paths with no match exits 1 530ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 363ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1061ms
     ✓ --marker reads a diff over 1 MiB 662ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 556ms
     ✓ scan-diff ignores a removed comment in a test file 575ms
     ✓ scan-diff ignores an assertion moved within the file 776ms
     ✓ scan-diff still reports a removed assertion 496ms
     ✓ scan-diff reports an assertion re-added only outside the test file 575ms
     ✓ scan-diff finds an added pytest mark skip 903ms
     ✓ scan-diff finds an added unittest skip 512ms
     ✓ scan-diff finds an added bare skip call 430ms
     ✓ scan-diff ignores a quoted skip in a documentation file 804ms
     ✓ scan-diff ignores a marker literal in a non-test source file 585ms
     ✓ scan-diff ignores an assertion whose expectation changed 544ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 731ms
     ✓ scan-diff reports a deleted test file 589ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 434ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3357ms
     ✓ publishes local code with a CI running head before bookkeeping 3379ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4591ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2675ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1931ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1585ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1549ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 935ms
     ✓ --merge-docs skips an empty bkit:generate script 1279ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 690ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2004ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1761ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1654ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1628ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2046ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1179ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 666ms
     ✓ exits 10 when the fetch fails 464ms
     ✓ refuses --merge-docs with --head, and an unknown --head 726ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 890ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1491ms
     ✓ a failed install stops ship (16) 1649ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 874ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 949ms
     ✓ exits 10 when the fetch fails 639ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 464ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2808ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2813ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2736ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 2016ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 4061ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 738ms
     ✓ reports undeclared and runs nothing with an empty script 742ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 883ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1032ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 700ms
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 1045ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1202ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1209ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1250ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1274ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1716ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1334ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 993ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 511ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 512ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1339ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 709ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 699ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 706ms
     ✓ PASS is 0 failures with or without reports 621ms
     ✓ clears a previous attempt's reports before the gate runs 530ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 752ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 488ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 817ms
     ✓ numbers runs within the workflow's active run and per step 867ms
     ✓ without --file no row is written and the output carries row null 885ms
   ✓ bkit tests run --changed-since (6)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 740ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 657ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 776ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1039ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 681ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 725ms
     ✓ a failing required push gate leaves the failed marker 931ms
     ✓ uncommitted code blocks the receipt until it is committed 1082ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 773ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 1181ms
     ✓ a planned test absent from a loaded report is a missing gap 572ms
     ✓ a file that fails to load is a red of kind red-not-loaded 886ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1234ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 858ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 517ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 902ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 846ms
     ✓ green: lists each gap kind, with the runner output 629ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1340ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 488ms
       ✓ green clears an exception-only task from a human commit 368ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 86631ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1917ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2047ms
     ✓ saves the failed job count without the capstone job 1243ms
     ✓ counts the capstone job when it is the only failed job 956ms
     ✓ saves no failed job count when no job failed 1197ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 322ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1111ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1265ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1571ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2718ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1476ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1949ms
     ✓ checks the named repository base and fails closed on missing evidence 941ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 927ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1005ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 618ms
       ✓ a source change past the validated head refuses (17) and names the path 598ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 598ms
       ✓ --validated without --month / --fid is a usage error (2) 450ms
       ✓ a validated sha that is not an ancestor refuses (17) 463ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 570ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 980ms
     ✓ a failed re-trigger push names the cause in the log 1261ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1203ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1846ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 899ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 540ms
     ✓ gh-error: every poll errored 451ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 875ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 763ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1048ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1005ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2555ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2620ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 680ms
     ✓ re-trigger on dev only uses the record of its own FID 845ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 826ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 310ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 487ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 315ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 431ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 512ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 697ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 687ms
     ✓ --file and --step go together 524ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 531ms
     ✓ finishes a CI round only with its own failed job count 559ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 432ms
     ✓ done --group writes group on the row 359ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 538ms
     ✓ carries extra fields, parsed as JSON when they are JSON 383ms
     ✓ reports a failed commit with exit 8 without writing the row 1006ms
     ✓ a failed commit leaves no row staged in the index 595ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 795ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 694ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1296ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 709ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 990ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 357ms
     ✓ --ref reads the status file as committed on that ref, not from disk 400ms
     ✓ --ref exits 3 when the ref does not carry the status file 411ms
     ✓ fails on a placeholder left in the artifact 360ms
     ✓ fails when the row's verdict differs from the artifact's 362ms
     ✓ fails when the row does not list the artifact, or carries another attempt 345ms
     ✓ fails on a missing artifact 337ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 377ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 322ms
     ✓ fails a run-tests row missing its scope, and an empty scope 406ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 392ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 682ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 922ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 632ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 314ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 332ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 363ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 39230ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1041ms
     ✓ names each net-new and worsened finding in the log and the JSON 1048ms
     ✓ fails on a net score rise with no net count change 640ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 658ms
     ✓ treats a net score at or below 0.001 as float noise 983ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 766ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 553ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 893ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 680ms
     ✓ exits 4 on a dropped net field instead of silently passing 680ms
     ✓ exits 4 on no summary instead of silently passing 1086ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 978ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 934ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 901ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 901ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 493ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1117ms
     ✓ fails (exit 1) when vale reports alerts 674ms
     ✓ exits 6 on a vale runtime error 978ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 651ms
     ✓ falls back to vale sync when the main worktree has none 536ms
     ✓ fails when vale sync cannot restore the required styles 952ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 420ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 379ms
     ✓ exits 1 naming the files outside, whatever the commit message says 346ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 612ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 403ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 383ms
> [bkit] TRUNCATED HERE — 262 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 205 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 453 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
[bkit-install] write version pin: .bkit/version (6.1.1)
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
[bkit-install] write version pin: .bkit/version (6.1.1)

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
[bkit-install] claude: .bkit/.env.example
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
[bkit-install] write version pin: .bkit/version (6.1.1)
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
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write version pin: .bkit/version (6.1.1)

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (157 tests) 13406ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 6543ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 476ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 410ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 23559ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 398ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 329ms
     ✓ brand-new untracked ledger is staged and committed 339ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 353ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 815ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 523ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 412ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 477ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 460ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 359ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 337ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 303ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 336ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 613ms
     ✓ --path records its commit on the run's record, like every other commit mode 491ms
     ✓ a recorded ledger commits only the rows the run appended 645ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 796ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 789ms
     ✓ commitBookkeeping refuses when a recorded path changed 409ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 549ms
     ✓ under --mode=commit counts the squashed paths as something to commit 590ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 376ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 316ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 377ms
     ✓ another FID's plan file in the range: exit 7 307ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 559ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 326ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 381ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 59615ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 644ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 620ms
     ✓ always writes the marker, even with no plan 613ms
     ✓ writes the linear marker shape, taking the tracker from package.json 697ms
     ✓ writes the jira marker shape, taking the tracker from package.json 474ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 461ms
     ✓ refuses a PR from dev, main, or the base itself 346ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 832ms
     ✓ retries a failed create once, and exits 5 when it fails twice 552ms
     ✓ exits 5 when the open-PR probe errors 971ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 752ms
     ✓ prs open still opens against any other base 979ms
     ✓ exits 6 when the created PR's base is not --base 843ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2073ms
     ✓ refuses merged entry when current feature evidence cannot be read 715ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 802ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 780ms
     ✓ exits 1 with found=false when there is none 395ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 433ms
     ✓ --number reads one PR, mergeable included 870ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1031ms
     ✓ exits 4 when gh errors and 80 when it needs auth 796ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 592ms
     ✓ classifies a refused merge with a new dev conflict as integration 878ms
     ✓ returns an explicit terminal reason for other merge refusals 1666ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 879ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1016ms
     ✓ drops the force-build marker from the title subject 1274ms
     ✓ takes an explicit --subject 887ms
     ✓ runs no merge when the PR is already MERGED 877ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1321ms
     ✓ prs merge refuses a PR whose base is main 579ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 982ms
     ✓ prs merge refuses when the PR base is unknown 353ms
     ✓ prs merge reads the base from the one pr view it already makes 485ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1104ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 409ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 751ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 810ms
     ✓ never reads dev's required checks without --only-if-required 1628ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1481ms
     ✓ updates when a dev ruleset requires status checks 838ms
     ✓ updates when dev's branch protection requires status checks 1358ms
     ✓ ignores dev rulesets that require no checks 1478ms
     ✓ updates when the repo cannot be resolved 1523ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1008ms
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 1370ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 1382ms
     ✓ is not green when a check failed, naming it (exit 1) 1404ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1237ms
     ✓ is not green on an empty rollup (total 0) 1036ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1371ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1260ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1315ms
     ✓ is a no-op when the title already says so 884ms
     ✓ strips the marker, with or without its bkit prefix 1020ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1484ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 17493ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 918ms
   ✓ bkit fids resolve (12)
     ✓ 4. mints from the title file; a JSON file with a title key also works 339ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 324ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 356ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 95ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 9690ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 590ms
     ✓ keeps each context's own section banner and drops every other context's 1140ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 320ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 563ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 314ms
     ✓ --base narrows the range to the commits after a group's start sha 398ms
     ✓ diff from a group start covers only the group's commits 432ms
     ✓ an empty range writes a one-line note and zero numbers 362ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 445ms
     ✓ --reset-log empties the step's clamp log before the record lands 477ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 314ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 312ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (22 tests) 24556ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 2013ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 720ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 450ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 411ms
     ✓ completes missing subagent attribution before a real append 410ms
   ✓ replay-safe ledger appends on real files (7)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 500ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2510ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 557ms
     ✓ resolves a pending ledger intent after its invocation is stale 582ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 416ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 305ms
     ✓ prepares afresh when nothing landed and a foreign row followed 306ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 9547ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 1417ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1778ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1356ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 49577ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1737ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 649ms
     ✓ attempts independent attention after routine uncertainty 351ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 324ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1255ms
     ✓ seals unavailable or unstable representation evidence 1490ms
     ✓ uses accepted final preflight eligibility without provider atomicity 1495ms
     ✓ rejects marker preserving external edits 1264ms
     ✓ preserves generated first line and extracts versioned h6 section markers 970ms
     ✓ returns owned comment identity and stable representation evidence 1585ms
     ✓ selects newest created comment across complete pages 1342ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 1273ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1025ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1365ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1410ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1250ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1033ms
     ✓ fetches the issue and its comments as GitHub returns them 1401ms
     ✓ github fetch marks a closed issue terminal and an open one not 1211ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 967ms
     ✓ caches exact engine source with available progress identity 909ms
     ✓ keeps original body identity separate from time and changed output 1447ms
     ✓ reuses matching invocation state without adopting foreign ownership 1210ms
     ✓ invalidates missing corrupt and unsupported progress cache 1552ms
     ✓ contains cache read and write failures as standalone degradation 482ms
     ✓ uses legacy receipts and contains receipt failures 1307ms
     ✓ records an engine-action row and skips the same key + body on a re-run 819ms
     ✓ a recent identical comment counts as done (the final close comment) 410ms
     ✓ a failed post reports done false with the reason and never leaks a token 929ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 761ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 902ms
     ✓ a board the token cannot see is scope 837ms
     ✓ an HTTP 403 from gh is scope 1251ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1500ms
     ✓ github: no block, no blockers and no further reads 1299ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1015ms
     ✓ a different marker hash posts 1753ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1004ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 14278ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 715ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 1253ms
     ✓ stops the step when the command crashed or was misused 2587ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 3943ms
     ✓ ship gates on CI and merges the pinned head 5778ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 12417ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 759ms
     ✓ a failing file absent at the base commit is the branch's 480ms
     ✓ an undeclared bkit:test:file reads unknown 589ms
     ✓ a failed base install reads unknown and removes the worktree 600ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 569ms
     ✓ copies the worktreeCopy entries into the base checkout 544ms
     ✓ a base file run that writes no report reads unknown 444ms
     ✓ a CI run that cannot settle the base falls back to the local run 3024ms
     ✓ a pull_request-event CI run at the base sha does not settle none 728ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 660ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 690ms
     ✓ the base test run does not inherit the hooks-off git config 756ms
     ✓ adopt follows the run's runtimeWorktrees 1400ms
     ✓ worktreeInstall off reads unknown 378ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 9638ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 326ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 403ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1807ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 4285ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1477ms
     ✓ runGit names ENOBUFS when output passes the limit 674ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 701ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 340ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 7894ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 1010ms
     ✓ workflow progress command wiring progress specialized completion producers 3135ms
     ✓ workflow progress command wiring progress gate only completions 419ms
     ✓ progress excludes noncompletions 1998ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 3279ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 309ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (87 tests) 4104ms
   ✓ bkit status route holistic cleanBase (5)
     ✓ holistic base falls back to origin/dev when the clean sha is no longer an ancestor of HEAD 339ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 306ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1586ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (81 tests) 2592ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 508ms
   ✓ bkit counters progress (17)
     ✓ judges codeChanged on source only, from the rounds' parent commits 348ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (38 tests) 3529ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 521ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 945ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (50 tests) 2549ms
   ✓ bkit decisions compose (27)
     ✓ Try again is offered for every base verdict 349ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 23905ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 779ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 1499ms
     ✓ CI=true -> GITHUB_ACTION 1565ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 1586ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 693ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 938ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 901ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 666ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 1333ms
     ✓ LOCAL -> runtimeHeadless=false 318ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 478ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 738ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1166ms
     ✓ UNKNOWN -> runtimeHeadless=false 1839ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 717ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 465ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 538ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 332ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 820ms
     ✓ re-derives per call: one run's answer does not leak into the next 1298ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1023ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 335ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 453ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1085ms
     ✓ --file into a missing directory is refused, not created 1088ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 2231ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 335ms
     ✓ counts deleted lines into changed 408ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 615ms
     ✓ is null when first is not an ancestor of last, or either is missing 396ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (24 tests) 2207ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 366ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 353ms
     ✓ currency emits no hunk outside the matched set 404ms
     ✓ currency exits 0 with no hunks when no task matches 361ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 530ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 621ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (301 tests) 723ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 253ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (77 tests) 1712ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (275 tests) 291ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 129ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (48 tests) 2311ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 112ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 77ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 71ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 52ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 373ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 313ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 23ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 52ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (67 tests) 58ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 27ms

 Test Files  55 passed (55)
      Tests  4113 passed (4113)
   Start at  21:29:45
   Duration  417.66s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/957-workflows-skip-re/build-group-gate-1-1.log.reports/vitest-73139.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/summary.ts .bkit/core/engine/commands/workflow/tasks.test.ts .bkit/core/engine/commands/workflow/tasks.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/.bkit/cli.md .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/summary.ts .bkit/core/engine/commands/workflow/tasks.test.ts .bkit/core/engine/commands/workflow/tasks.ts dist/commands/workflow/step-table.js dist/commands/workflow/summary.js dist/commands/workflow/tasks.js docs/plans/202611/957-workflows-skip-re-plan.md docs/plans/202611/logs/957-workflows-skip-re/build-brief-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-brief-tests-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-diff-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-tasks-1-log.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-tests-1-log.md docs/plans/202611/logs/957-workflows-skip-re/build-plan-verify-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-tests-green-1-1.md docs/plans/202611/logs/957-workflows-skip-re/build-tests-red-1-1.md docs/plans/202611/logs/957-workflows-skip-re/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2838 of 13590 lines (206 KB of 930 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
