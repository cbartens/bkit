
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/commands/workflow/prs.ts .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl .bkit/version .bkit/workflows.md DETAILS.md dist/commands/workflow/branches.js dist/commands/workflow/ledgers.js dist/commands/workflow/prs.js dist/commands/workflow/workflows.js docs/capabilities.md docs/deferrals.jsonl docs/failures.jsonl docs/plans/202611/1042-ship-s-pr-plan.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-1.md docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-2-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-group-gate-2-2.md docs/plans/202611/logs/1042-ship-s-pr/build-handover.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-1.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-2-1-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-2-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-3-log.md docs/plans/202611/logs/1042-ship-s-pr/ … [bkit] line shortened, 729 bytes dropped


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/commands/workflow/prs.ts .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl .bkit/version .bkit/workflows.md DETAILS.md dist/commands/workflow/branches.js dist/commands/workflow/ledgers.js dist/commands/workflow/prs.js dist/commands/workflow/workflows.js docs/capabilities.md docs/deferrals.jsonl docs/failures.jsonl docs/plans/202611/1042-ship-s-pr-plan.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-1.md docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-2-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-group-gate-2-2.md docs/plans/202611/logs/1042-ship-s-pr/build-handover.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-1.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-2-1-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-2-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-3-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-2-log.md docs/ … [bkit] line shortened, 698 bytes dropped

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr

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

 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (69 tests) 195089ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 2189ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 17589ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 2150ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1596ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1316ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 2030ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2016ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3603ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1406ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1319ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 588ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1403ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1484ms
     ✓ design installs dependencies like build and debug 973ms
     ✓ plan installs dependencies like build and debug 1201ms
     ✓ design stops on a failed install (5) 1617ms
     ✓ plan stops on a failed install (5) 1282ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1869ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1531ms
     ✓ fails without minting when origin cannot be reached 638ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1438ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1865ms
   ✓ bkit worktrees setup — mint (resume) (38)
     ✓ rebases onto origin/dev and clears a stale sentinel 4051ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 6742ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 7272ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 4709ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 3892ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 3581ms
     ✓ a plan-closed branch with a leftover push (2)
       ✓ a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts 5368ms
       ✓ a code conflict beside the plan logs still stops the start, and the reason names the rule 3865ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2289ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2765ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2732ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 3097ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3644ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3047ms
     ✓ keeps a dangling untracked symlink among the dropped logs as a link, and still starts 2525ms
     ✓ keeps an untracked symlink to a folder among the dropped logs as a link, leaving the folder untouched 2520ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3464ms
     ✓ commits leftovers when a copy entry points outside the checkout 3248ms
     ✓ never commits the entries setup copies in from the main checkout 2662ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 3115ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1392ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 2520ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 3471ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 3603ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 2237ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 2125ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2386ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2900ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 3307ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1132ms
     ✓ leaves a clean worktree's history alone 3544ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 3219ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 6272ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3764ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3124ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 4503ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 4489ms
     ✓ does not mark a resumed worktree it did not create 1746ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 2175ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 1247ms
   ✓ bkit worktrees setup — the unpushed-dev check reads the checked-out branch as a branch (2)
     ✓ adopts plan on a branch named like a top-level path that carries no unpushed dev work 1052ms
     ✓ refuses plan on a branch whose name starts with a dash and leaves the file that name points at untouched 474ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 464ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 960ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1975ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 3029ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1881ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (86 tests) 243389ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 609ms
     ✓ install --claude does not write Serena or graphify examples 983ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 486ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 507ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 719ms
     ✓ bkit upgrade prints the adopted marker for a changed starter with a project copy 502ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 2172ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 1536ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 1591ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 2980ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 4550ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 4187ms
     ✓ malformed .mcp.json fails install instead of being overwritten 672ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 4583ms
     ✓ an adopted copy of every template survives upgrade and check 5320ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 4826ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 6050ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1760ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 8273ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 5546ms
   ✓ #1053 — upgrade re-records the entry of every rendered output (1)
     ✓ re-records a stale entry for a rendered mirror, doc and allowlist that are already current 3326ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 4892ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 7252ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 3854ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 4135ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 6227ms
     ✓ branded script migration is idempotent and dry-run writes nothing 5760ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 4524ms
     ✓ a dry-run hook and CI token migration writes nothing 2160ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 5595ms
     ✓ a second check-name migration writes nothing 4433ms
     ✓ a dry-run check-name migration writes and moves nothing 1687ms
     ✓ a second Vale migration and a dry run write nothing 4295ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 4064ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3204ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3905ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 3647ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 3737ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 3350ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 2395ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2534ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 2826ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 2948ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 3491ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 4309ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 4605ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 3338ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 608ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 633ms
     ✓ passes -w when the consumer is a pnpm workspace root 515ms
     ✓ starts the package runner for the install and the re-exec 873ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 372ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2954ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 4521ms
     ✓ migrates legacy ownership without changing project text or core ownership 6164ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 5531ms
     ✓ previews project document migration without mutating the checkout 2441ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 3526ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 3062ms
     ✓ upgrade names the missing root lint-staged config with the copy command 3084ms
     ✓ install names the missing root lint-staged config under its own log prefix 2469ms
     ✓ check names the missing root lint-staged config under its own log prefix 3099ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 2404ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 3459ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 3147ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 3338ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 2900ms
   ✓ #985 — upgrade takes back a retired settings grant (6)
     ✓ upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's 4746ms
     ✓ upgrade names each retired entry it removed 2750ms
     ✓ install over a retired grant says it removed it and does not ask for bkit upgrade 2917ms
     ✓ upgrade prints a look-alike once; check and install print none and check exits 0 7136ms
     ✓ upgrade over a contained settings file changes only the retired line 3523ms
     ✓ upgrade dry run lists the settings update and leaves the retired grant 2790ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 150322ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1892ms
   ✓ preserves the requested event for selected-workflow verification 1110ms
   ✓ requires selected other-workflow success at the exact pushed head 1989ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2333ms
     ✓ saves the failed job count without the capstone job 761ms
     ✓ a CI selection keeps the failed job names, capstone left out 1295ms
     ✓ counts the capstone job when it is the only failed job 766ms
     ✓ saves no failed job count when no job failed 837ms
     ✓ counts fallback evidence jobs without the capstone job 539ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 622ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1303ms
     ✓ freezes explicit workflow run attempt and all failed job pages 722ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2096ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2293ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 623ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 708ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 694ms
     ✓ rejects a workflow result count smaller than its returned records 608ms
     ✓ validates normalized fallback evidence against the requested identity 418ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1955ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2052ms
     ✓ checks the named repository base and fails closed on missing evidence 974ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 811ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1574ms
     ✓ rejects MCP capstone jobs belonging to another run 1578ms
     ✓ --fetch refreshes origin/<branch> before gating 807ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 622ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ refuses when any of several required lanes was skipped 372ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 322ms
     ✓ tells an API error (20) from no run (10) 436ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 344ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 585ms
     ✓ --event (5)
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 339ms
       ✓ without --event the newer green pull_request run masks the failed push run 455ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 396ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 340ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 370ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 791ms
       ✓ a source change past the validated head refuses (17) and names the path 866ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1151ms
       ✓ --validated without --month / --fid is a usage error (2) 558ms
       ✓ a validated sha that is not an ancestor refuses (17) 783ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 809ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 763ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 654ms
   ✓ bkit runs wait (10)
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 542ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 409ms
     ✓ CLI: a failed gh workflow run exits 5 315ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1232ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 746ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1559ms
     ✓ a failed re-trigger push names the cause in the log 1976ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2346ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3364ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2042ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1017ms
     ✓ gh-error: every poll errored 841ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1632ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2578ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 2452ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 2953ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 2605ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 641ms
     ✓ CLI: verdict JSON, body scan, exit codes 2496ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 921ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 573ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 966ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 953ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 1063ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 504ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 3730ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 4168ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 4423ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2883ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1090ms
     ✓ re-trigger on dev only uses the record of its own FID 1362ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1323ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 1599ms
   ✓ scanBody (8)
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 301ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 615ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1315ms
       ✓ a wait that runs out exits 11 and writes no ship-merge-ci row 477ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 484ms
       ✓ without --repo no call gains a --repo flag 535ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 2549ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 365ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 384ms
     ✓ refuses an unknown --reason 571ms
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 401ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 876ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 717ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 329ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 669ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 853ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 537ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 935ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 914ms
     ✓ debug: a failure test run is a failed run 872ms
     ✓ debug: a timed_out test run is a failed run 1114ms
     ✓ debug: a startup_failure test run is a failed run 799ms
     ✓ debug: a test run still in progress or cancelled is not returned 740ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 898ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 730ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1694ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 363ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 552ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 727ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 872ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1215ms
     ✓ --file and --step go together 721ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 4493ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 913ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 837ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 822ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 1379ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 1025ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 1391ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 989ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 1044ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 948ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (232 tests) 382394ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 863ms
     ✓ opens the next run after a finished one, and after another workflow's run 332ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 357ms
     ✓ --lock-held checks the lock is ours 537ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 364ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a resumed run prints its last DONE step; a closed decision is not open 367ms
     ✓ an OPEN decision mid-build prints its header fields 310ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 303ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 309ms
     ✓ aborts a rebase only when one is in progress 524ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 501ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 465ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 342ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 345ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 465ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 337ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 335ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 444ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 328ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 338ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 378ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 447ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 414ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 526ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 1083ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 1434ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 687ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 484ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 698ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 599ms
     ✓ skips an error file in the log folder that is a directory 1041ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 1000ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 568ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 734ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 375ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 498ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 434ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 484ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 590ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 346ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 698ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 437ms
     ✓ bkit workflows fail treats an empty --next-step as absent 380ms
     ✓ a debug run in SOAK mode always needs a handover 331ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 844ms
       ✓ counts subagents of an earlier chat the run's session rows name 1541ms
       ✓ records no context block, and still closes, outside a Claude Code session 668ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 857ms
     ✓ records ending held and publish false on the workflow-done row 862ms
     ✓ defaults the close row to ending done 923ms
     ✓ refuses an unknown ending 502ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1039ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 938ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1249ms
     ✓ always writes the telemetry, whatever the runtime 926ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 582ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1104ms
     ✓ an unwritable stats path is logged and never fails the close 970ms
     ✓ appends the completeness row before the workflow-done row 981ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1534ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1160ms
     ✓ writes one completeness row per close 1547ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1429ms
     ✓ still closes when the completeness check throws 1235ms
     ✓ still closes when the completeness row write throws 1211ms
     ✓ refuses without status.jsonl and writes nothing 313ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1381ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2053ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1362ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 993ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1602ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1516ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1603ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1635ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1262ms
     ✓ --record-step writes the close step's row before workflow-done 1045ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 999ms
     ✓ --number without --outbox is a usage error 1593ms
     ✓ --flush is ship only 383ms
   ✓ bkit workflows handover (45)
     ✓ --push commits and pushes the record on the feature branch without a handover 1442ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1439ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1650ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1158ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 762ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 476ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 391ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3083ms
     ✓ --flush with nothing to record commits and pushes nothing 1430ms
     ✓ --flush carries the named worktree's logs into the dev commit 2223ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 3875ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 3902ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 3781ms
     ✓ closePr titles the PR by the record it carries 4551ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 17759ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 5281ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 5381ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 5480ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 4765ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 3320ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 3923ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 4033ms
     ✓ --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 5916ms
     ✓ --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 16095ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a skill 3905ms
     ✓ --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 4519ms
     ✓ --flush refused by dev runs the landing gate on a merged leftover tip 6423ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 949ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 925ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 1357ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 1094ms
       ✓ --ref, no push → route stop, no message 603ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 1081ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3168ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4003ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2878ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3958ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3798ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3455ms
     ✓ --push on dev never carries a row whose references name another feature 3404ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 9035ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 7215ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3969ms
     ✓ a close that landed releases the lock 5262ms
     ✓ removes the worktree before it releases the lock 6778ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 385ms
     ✓ names the branch, not the remote-tracking ref, in each URL 503ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 626ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 390ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 923ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 652ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 3839ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 3208ms
       ✓ a run closed by workflow-failed keeps no parked copy 3555ms
       ✓ a run closed by workflow-done keeps no parked copy 3637ms
       ✓ a FAILED run gets no row 4504ms
       ✓ a DONE run gets no row 4326ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3870ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 720ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 941ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 359ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 579ms
     ✓ a folder outside the outbox sessions folder is kept 519ms
     ✓ without --session-dir prints no sessionRemoved 542ms
> [bkit] TRUNCATED HERE — 68 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 368ms
     ✓ fails with a fetch error when there is no origin to rebase onto 668ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 461ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 3835ms
     ✓ vitest — with no report path the test file is left as it was 3382ms
     ✓ a run naming files of two kinds is refused as a usage error 600ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 968ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1009ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 581ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 756ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 32054ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 132024ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1861ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 686ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 665ms
     ✓ explicit `bkit help` prints the same usage and exits 0 633ms
     ✓ `bkit check --claude` (stray module flag) errors 545ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 718ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1910ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1405ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 443ms
     ✓ refuses a code conflict and aborts the rebase on the spot 753ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 790ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 635ms
     ✓ produces byte-identical output to merge=union 940ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 686ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1105ms
     ✓ refuses a lockfile whose regenerate command fails 500ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1488ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1183ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 804ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 809ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 923ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1586ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 727ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 943ms
       ✓ runs (0) with the landed path count once dev moved 1509ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1049ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1688ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2140ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2914ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 808ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1006ms
     ✓ --mode=abort pushes when the branch has no open PR 1119ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1465ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 742ms
     ✓ --open-pr carries the MCP answer and skips gh 898ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1449ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1896ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4176ms
     ✓ skip-ci HEAD on the replay is refused 1321ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3370ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 926ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1792ms
     ✓ a fetch that fails exits 10 597ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 739ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 1557ms
     ✓ scan-diff attributes deletion to its old test ins… 1403ms
     ✓ scan-diff consumes each moved assertion once and … 967ms
     ✓ scan-diff does not match identical assertions fro… 797ms
     ✓ scan-diff does not match the same leaf test name … 960ms
     ✓ scan-diff does not match a same-named test with d… 728ms
     ✓ scan-diff does not match a same-named test with c… 842ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 899ms
     ✓ --paths with no match exits 1 753ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 818ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1498ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1044ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1253ms
     ✓ scan-diff ignores a removed comment in a test file 1068ms
     ✓ scan-diff ignores an assertion moved within the file 704ms
     ✓ scan-diff still reports a removed assertion 800ms
     ✓ scan-diff reports an assertion re-added only outside the test file 679ms
     ✓ scan-diff finds an added pytest mark skip 2111ms
     ✓ scan-diff finds an added unittest skip 1119ms
     ✓ scan-diff finds an added bare skip call 1496ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1654ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1046ms
     ✓ scan-diff ignores an assertion whose expectation changed 743ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 636ms
     ✓ scan-diff reports a deleted test file 628ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 552ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 5447ms
     ✓ publishes local code with a CI running head before bookkeeping 5373ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 8269ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 7704ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 4453ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2975ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 2537ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 3011ms
     ✓ --merge-docs skips an empty bkit:generate script 2231ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 2913ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 4342ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 4917ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2958ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2911ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2739ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1794ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1247ms
     ✓ exits 10 when the fetch fails 820ms
     ✓ refuses --merge-docs with --head, and an unknown --head 1407ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1878ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2422ms
     ✓ a failed install stops ship (16) 1633ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1628ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1238ms
     ✓ exits 10 when the fetch fails 1067ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 1129ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 5517ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3993ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3229ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1679ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 4280ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 1265ms
     ✓ reports undeclared and runs nothing with an empty script 731ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1171ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1262ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1190ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1270ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 1022ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 445ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 417ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 371ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 579ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 365ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 362ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 345ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 844ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 713ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 353ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 356ms
     ✓ PASS is 0 failures with or without reports 945ms
     ✓ clears a previous attempt's reports before the gate runs 480ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 504ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --artifact needs --fid and --step 356ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1490ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 513ms
     ✓ numbers runs within the workflow's active run and per step 1184ms
     ✓ tests run --file records the tested snapshot on its test-run row 973ms
     ✓ a FAIL test-run row records each failing case as file and name 1434ms
     ✓ a PASS test-run row records no failed tests 1749ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 842ms
     ✓ without --file no row is written and the output carries row null 669ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 473ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 2012ms
     ✓ --since-pass-of skips failing runs and steps it does not name 2142ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1482ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1084ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 763ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 828ms
     ✓ a deleted file that no file mentions passes and the log says so 609ms
     ✓ a failed importer search runs the whole check 976ms
     ✓ --changed-since=feature-base starts at the feature's start commit 921ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 997ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 653ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 646ms
     ✓ a failing required push gate leaves the failed marker 587ms
     ✓ uncommitted code blocks the receipt until it is committed 1310ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 820ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 515ms
     ✓ a planned test absent from a loaded report is a missing gap 435ms
     ✓ a file that fails to load is a red of kind red-not-loaded 868ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 578ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 738ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 421ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 448ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1271ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 1625ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1672ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1824ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 956ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1296ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 1002ms
     ✓ green: lists each gap kind, with the runner output 688ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2467ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 600ms
       ✓ green clears an exception-only task from a human commit 530ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 56164ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (103 tests) 74989ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2134ms
     ✓ names each net-new and worsened finding in the log and the JSON 1047ms
     ✓ fails on a net score rise with no net count change 1043ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 970ms
     ✓ treats a net score at or below 0.001 as float noise 1081ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 493ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 327ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1050ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1051ms
     ✓ exits 4 on a dropped net field instead of silently passing 833ms
     ✓ exits 4 on no summary instead of silently passing 614ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1168ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1173ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1001ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1027ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1552ms
     ✓ explicit globs can select ignored prose and nested checkout files 785ms
     ✓ fails closed when the git index cannot be read 449ms
     ✓ fails closed when a selected prose source cannot be read 408ms
     ✓ fails when vale is not installed 470ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 458ms
     ✓ fails (exit 1) when vale reports alerts 618ms
     ✓ exits 6 on a vale runtime error 537ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1014ms
     ✓ falls back to vale sync when the main worktree has none 507ms
     ✓ fails when vale sync cannot restore the required styles 620ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 599ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 499ms
     ✓ is a usage error when the commit cannot be read 339ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 724ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 607ms
     ✓ exits 1 naming the files outside, whatever the commit message says 544ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1257ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 875ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 442ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2365ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2131ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1698ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1915ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1730ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1012ms
     ✓ runs the full gate for replayed debug code 1626ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 3858ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2647ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 3519ms
     ✓ a push that fails without a server answer is returned once, never retried 2397ms
     ✓ a failed fetch is returned before anything is built 594ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2721ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2095ms
     ✓ lands from a clone whose fetch refspec omits dev 2964ms
     ✓ build throwing stops the landing and removes the throwaway checkout 651ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (175 tests) 93792ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 1707ms
     ✓ finishes a CI round only with its own failed job count 1180ms
     ✓ preserves local clamp enforcement when completing test rounds 338ms
   ✓ progress command output (4)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 530ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 432ms
     ✓ reports a failed commit with exit 8 without writing the row 852ms
     ✓ a failed commit leaves no row staged in the index 553ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1099ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 772ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 716ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 589ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 799ms
   ✓ bkit steps verdict (11)
     ✓ returns the verdict and every header field 374ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --ref reads the status file as committed on that ref, not from disk 485ms
     ✓ --ref exits 3 when the ref does not carry the status file 396ms
     ✓ fails on a placeholder left in the artifact 362ms
     ✓ fails when the row's verdict differs from the artifact's 410ms
     ✓ fails when the row does not list the artifact, or carries another attempt 388ms
     ✓ fails on a missing artifact 361ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 388ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 329ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 695ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 549ms
     ✓ fails a diagnose row missing its strategy, passes with it 407ms
     ✓ fails a run-tests row missing its scope, and an empty scope 973ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 1494ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 1683ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1989ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1211ms
     ✓ --post needs --number; without --post there is no tracker key 322ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 635ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1040ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 372ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 350ms
     ✓ --attempt-of checks the row carries the derived counter 431ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 67 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 549ms
     ✓ writes zero files (purely read-only — write-set assertion) 645ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 844ms
     ✓ reports opencode as absent when .opencode/ does not exist 804ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 49958ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 3885ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 4622ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 371ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 408ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 365ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3427ms
     ✓ does not fall back through a malformed later success receipt 1509ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1203ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1510ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 1058ms
     ✓ a gate that has not finished leaves no failed receipt 799ms
     ✓ the restore step leaves another worktree's .failed file alone 659ms
     ✓ a pending attempt whose process is gone is not treated as running 2876ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 2520ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 917ms
     ✓ does not record a committed tree 1080ms
     ✓ records no proof for a failed gate or lighter gate 1190ms
     ✓ requires integration proof when integration is declared 1331ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2565ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (132 tests) 48263ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 554ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 396ms
     ✓ staging failure: exit 4 and no commit is created, no false success 417ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 577ms
     ✓ a --fid that climbs out of the log folder is refused and commits nothing 325ms
> [bkit] TRUNCATED HERE — 120 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 587ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2299ms
     ✓ a refused dev push is logged, never fails the close 2096ms
     ✓ an unreachable remote is logged, never fails the close 663ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 37426ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 606ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 566ms
     ✓ retries a failed create once, and exits 5 when it fails twice 647ms
     ✓ exits 5 when the open-PR probe errors 383ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 426ms
     ✓ prs open still opens against any other base 411ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 347ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 768ms
     ✓ exits 4 when gh errors and 80 when it needs auth 530ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 438ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 361ms
     ✓ runs no merge when the PR is already MERGED 312ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 458ms
     ✓ prs merge refuses a PR whose base is main 344ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 397ms
     ✓ prs merge refuses when the PR base is unknown 331ms
     ✓ prs merge reads the base from the one pr view it already makes 323ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 319ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 309ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 342ms
     ✓ never reads dev's required checks without --only-if-required 336ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 326ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 302ms
     ✓ is not green when a check failed, naming it (exit 1) 341ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 380ms
     ✓ is not green on an empty rollup (total 0) 336ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 426ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 525ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 352ms
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1143ms
     ✓ a failing file absent at the base commit is the branch's 583ms
     ✓ an undeclared bkit:test:file reads unknown 566ms
     ✓ a failed base install reads unknown and removes the worktree 572ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 822ms
     ✓ copies the worktreeCopy entries into the base checkout 1099ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 4493ms
     ✓ a pull_request-event CI run at the base sha does not settle none 1067ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 675ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 1039ms
     ✓ the base test run does not inherit the hooks-off git config 1151ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1169ms
     ✓ counts files committed since --base 659ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1113ms
     ✓ runs nothing and exits 0 when no file changed 768ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 966ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1260ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1439ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 957ms
     ✓ challenge gate without --base sizes only the branch's own lines 738ms
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 6856ms
   ✓ repo facts on a real repository (5)
     ✓ a host-made linked worktree holds the run 440ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1375ms
     ✓ runGit names ENOBUFS when output passes the limit 912ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1888ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 312ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 493ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 372ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 488ms
     ✓ fetches the issue and its comments as GitHub returns them 573ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 508ms
     ✓ invalidates missing corrupt and unsupported progress cache 1013ms
     ✓ contains cache read and write failures as standalone degradation 972ms
     ✓ uses legacy receipts and contains receipt failures 484ms
     ✓ records an engine-action row and skips the same key + body on a re-run 694ms
     ✓ a recent identical comment counts as done (the final close comment) 507ms
     ✓ a failed post reports done false with the reason and never leaks a token 594ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 732ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 427ms
     ✓ a different marker hash posts 547ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 586ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 6050ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1041ms
     ✓ passes every rule on a clean head 359ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 359ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (111 tests) 7203ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
> [bkit] TRUNCATED HERE — 161 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 58 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 7865ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 6379ms
     ✓ malformed .mcp.json fails install instead of being overwritten 1225ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 7942ms
> [bkit] TRUNCATED HERE — 82 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 597ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 829ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 354ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 399ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 438ms
     ✓ .husky/pre-push: first and last lines name the log 411ms
     ✓ .husky/pre-push: the hook body runs once 375ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1046ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 995ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 700ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1016ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 740ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 663ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 583ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 926ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 706ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 927ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1443ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 2472ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1180ms
     ✓ a stale register stops the push before any gate runs 777ms
     ✓ bkit check fails → the push stops before any gate runs 1104ms
     ✓ the dependency audit runs before any gate, when its script is present 1407ms
     ✓ no dependency-audit script → skipped, the gates still run 796ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1022ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1016ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1627ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 782ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1005ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1055ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1012ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 816ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ branch with no open PR → no check, push goes on 1119ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 554ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 828ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 522ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 391ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 2537ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 504ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 687ms
     ✓ untrusted .envrc still prints the direnv allow line 636ms
     ✓ no .envrc → no direnv call 1042ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2459ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2679ms
     ✓ base fetch fails → warns, gates run 3756ms
     ✓ dev push → no PR lookup 2477ms
     ✓ min push of a conflicting PR → blocked 3592ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 503ms
     ✓ reads Test attempt from a tests pause 422ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 376ms
     ✓ writes no row when status.jsonl does not exist 323ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 383ms
     ✓ aborts a rebase only when one is in progress 870ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1375ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 865ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 533ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 569ms
     ✓ --max-exceeded says a handover is due without any sentinel 466ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 438ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 542ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 972ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 308ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 361ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 488ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 486ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 570ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 341ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 512ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 766ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 875ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 986ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 2235ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 3093ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 617ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 713ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 679ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 653ms
     ✓ skips an error file in the log folder that is a directory 659ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 669ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 833ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 992ms
     ✓ scrubs an AWS key ID followed by more letters, digits or an underscore 905ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 756ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 1080ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 597ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 835ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 717ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 580ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 1000ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 654ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 301ms
     ✓ bkit workflows fail treats an empty --next-step as absent 552ms
     ✓ a debug run in SOAK mode always needs a handover 558ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1556ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 725ms
     ✓ an unwritable stats path is logged and never fails the close 930ms
     ✓ appends the completeness row before the workflow-done row 1031ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1035ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 1264ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1722ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1008ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 778ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 699ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1002ms
     ✓ --number without --outbox is a usage error 1292ms
     ✓ --flush is ship only 317ms
   ✓ bkit workflows handover (45)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 1072ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 485ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 5410ms
     ✓ --flush with nothing to record commits and pushes nothing 1568ms
     ✓ --flush carries the named worktree's logs into the dev commit 5328ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 6126ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 5371ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 5571ms
     ✓ closePr titles the PR by the record it carries 5081ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 20648ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 8551ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 6717ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 4649ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 4868ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 5619ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 5678ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 4406ms
     ✓ --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 5644ms
     ✓ --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 16346ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a skill 3826ms
     ✓ --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 4754ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 5528ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3111ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2190ms
     ✓ a close that landed releases the lock 4063ms
     ✓ removes the worktree before it releases the lock 5828ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 639ms
     ✓ names the branch, not the remote-tracking ref, in each URL 404ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 364ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 365ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 847ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 676ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 3383ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2628ms
       ✓ a run closed by workflow-failed keeps no parked copy 2472ms
       ✓ a run closed by workflow-done keeps no parked copy 2563ms
       ✓ a FAILED run gets no row 2707ms
       ✓ a DONE run gets no row 3626ms
     ✓ failed handover from dev removes the record and keeps recorded paths 5025ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 510ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --summary prints the file and keeps a copy in --outbox 639ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 806ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 600ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 1218ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 543ms
     ✓ refuses a code conflict and aborts the rebase on the spot 743ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 947ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 583ms
     ✓ produces byte-identical output to merge=union 1237ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1601ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1484ms
     ✓ refuses a lockfile whose regenerate command fails 1478ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1704ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1733ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 1571ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1613ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 2141ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 2430ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 904ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 829ms
       ✓ runs (0) with the landed path count once dev moved 1609ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 586ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1894ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3335ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4838ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 902ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1467ms
     ✓ --mode=abort pushes when the branch has no open PR 3468ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1328ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1786ms
     ✓ --open-pr carries the MCP answer and skips gh 1413ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1994ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3293ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4922ms
     ✓ skip-ci HEAD on the replay is refused 1483ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 5335ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1069ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1757ms
     ✓ a fetch that fails exits 10 951ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 1732ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 1594ms
     ✓ scan-diff attributes deletion to its old test ins… 1357ms
     ✓ scan-diff consumes each moved assertion once and … 1253ms
     ✓ scan-diff does not match identical assertions fro… 1322ms
     ✓ scan-diff does not match the same leaf test name … 1001ms
     ✓ scan-diff does not match a same-named test with d… 1895ms
     ✓ scan-diff does not match a same-named test with c… 1087ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1118ms
     ✓ --paths with no match exits 1 786ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 881ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1670ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1216ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 945ms
     ✓ scan-diff ignores a removed comment in a test file 619ms
     ✓ scan-diff ignores an assertion moved within the file 651ms
     ✓ scan-diff still reports a removed assertion 828ms
     ✓ scan-diff reports an assertion re-added only outside the test file 651ms
     ✓ scan-diff finds an added pytest mark skip 731ms
     ✓ scan-diff finds an added unittest skip 755ms
     ✓ scan-diff finds an added bare skip call 1159ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1251ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1399ms
     ✓ scan-diff ignores an assertion whose expectation changed 1044ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 825ms
     ✓ scan-diff reports a deleted test file 735ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 566ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 7059ms
     ✓ publishes local code with a CI running head before bookkeeping 5879ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 8067ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 4819ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2915ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2097ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1856ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1589ms
     ✓ --merge-docs skips an empty bkit:generate script 1450ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1173ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2203ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2709ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1454ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2063ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3574ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1862ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1238ms
     ✓ exits 10 when the fetch fails 659ms
     ✓ refuses --merge-docs with --head, and an unknown --head 759ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1690ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2455ms
     ✓ a failed install stops ship (16) 2012ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 2964ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 2099ms
     ✓ exits 10 when the fetch fails 1281ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 780ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 5192ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3439ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3287ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1715ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 5551ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 618ms
     ✓ reports undeclared and runs nothing with an empty script 645ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1213ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1070ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 708ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 6661ms
     ✓ continues after the prepared completion source disappears 5709ms
     ✓ records preparation and session association failures despite successful delivery 5986ms
     ✓ associates startup and run across restart or starts fresh safely 6370ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 18288ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1919ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2016ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 5159ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1636ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1062ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1190ms
     ✓ plan installs dependencies like build and debug 1385ms
     ✓ design stops on a failed install (5) 1222ms
     ✓ plan stops on a failed install (5) 1046ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1172ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1702ms
     ✓ fails without minting when origin cannot be reached 325ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 910ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1246ms
   ✓ bkit worktrees setup — mint (resume) (38)
     ✓ rebases onto origin/dev and clears a stale sentinel 2427ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2235ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 3190ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2108ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2775ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 4790ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3065ms
     ✓ keeps a dangling untracked symlink among the dropped logs as a link, and still starts 3668ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2080ms
     ✓ saves the failed job count without the capstone job 1068ms
     ✓ a CI selection keeps the failed job names, capstone left out 1475ms
     ✓ counts the capstone job when it is the only failed job 560ms
     ✓ saves no failed job count when no job failed 794ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1061ms
     ✓ freezes explicit workflow run attempt and all failed job pages 862ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1724ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3073ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1534ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2821ms
     ✓ checks the named repository base and fails closed on missing evidence 1844ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1171ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1248ms
     ✓ rejects MCP capstone jobs belonging to another run 3108ms
     ✓ --fetch refreshes origin/<branch> before gating 812ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 395ms
     ✓ tells an API error (20) from no run (10) 373ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 363ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 375ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 764ms
       ✓ a source change past the validated head refuses (17) and names the path 636ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 782ms
       ✓ --validated without --month / --fid is a usage error (2) 615ms
       ✓ a validated sha that is not an ancestor refuses (17) 481ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1492ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2891ms
     ✓ a failed re-trigger push names the cause in the log 1662ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1816ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2379ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1526ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 616ms
     ✓ gh-error: every poll errored 881ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1646ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1162ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 731ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1844ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 536ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 475ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 495ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 681ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2003ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2049ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 663ms
     ✓ re-trigger on dev only uses the record of its own FID 799ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1230ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 415ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 625ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 421ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 334ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 639ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 565ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 781ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 916ms
     ✓ debug: a failure test run is a failed run 1214ms
     ✓ debug: a timed_out test run is a failed run 961ms
     ✓ debug: a startup_failure test run is a failed run 900ms
     ✓ debug: a test run still in progress or cancelled is not returned 744ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1138ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 851ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1957ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 440ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 1282ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1045ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1309ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1190ms
     ✓ --file and --step go together 1562ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 7925ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 683ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 709ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 818ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 916ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 915ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 956ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 1019ms
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 481ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 590ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 386ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1323ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 768ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 559ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 522ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 735ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 381ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 342ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 440ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 312ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 526ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 809ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 355ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 357ms
     ✓ PASS is 0 failures with or without reports 681ms
     ✓ clears a previous attempt's reports before the gate runs 742ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 516ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 560ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1582ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 631ms
     ✓ numbers runs within the workflow's active run and per step 1315ms
     ✓ tests run --file records the tested snapshot on its test-run row 715ms
     ✓ a FAIL test-run row records each failing case as file and name 594ms
     ✓ a PASS test-run row records no failed tests 1328ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 721ms
     ✓ without --file no row is written and the output carries row null 393ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 375ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 2009ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1731ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1256ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1170ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 815ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1086ms
     ✓ a deleted file that no file mentions passes and the log says so 509ms
     ✓ a failed importer search runs the whole check 1071ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1192ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1007ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 683ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 794ms
     ✓ a failing required push gate leaves the failed marker 723ms
     ✓ uncommitted code blocks the receipt until it is committed 1171ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 742ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 1039ms
     ✓ a planned test absent from a loaded report is a missing gap 556ms
     ✓ a file that fails to load is a red of kind red-not-loaded 698ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 941ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 461ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1050ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 536ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 539ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1481ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 1161ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 748ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1097ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 608ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 999ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 630ms
     ✓ green: lists each gap kind, with the runner output 640ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1321ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 382ms
       ✓ green clears an exception-only task from a human commit 507ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 125603ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1137ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 540ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 899ms
     ✓ explicit `bkit help` prints the same usage and exits 0 684ms
     ✓ `bkit check --claude` (stray module flag) errors 564ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 536ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1421ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1349ms
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 137827ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 5309ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 1114ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 4668ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 3896ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 2000ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1759ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 4316ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2639ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 5918ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 364ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1851ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1981ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2097ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1961ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2152ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 5979ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 4150ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 4903ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 3170ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 3298ms
       ✓ a branch with no status.jsonl dispatches as before 2645ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2910ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3618ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2945ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2698ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (103 tests) 58141ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1029ms
     ✓ names each net-new and worsened finding in the log and the JSON 692ms
     ✓ fails on a net score rise with no net count change 629ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 646ms
     ✓ treats a net score at or below 0.001 as float noise 718ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 804ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 526ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 656ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 630ms
     ✓ exits 4 on a dropped net field instead of silently passing 650ms
     ✓ exits 4 on no summary instead of silently passing 627ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 878ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 888ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 858ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 956ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 449ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 428ms
     ✓ fails (exit 1) when vale reports alerts 376ms
     ✓ exits 6 on a vale runtime error 512ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 447ms
     ✓ falls back to vale sync when the main worktree has none 572ms
     ✓ fails when vale sync cannot restore the required styles 642ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 430ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 343ms
     ✓ exits 1 naming the files outside, whatever the commit message says 355ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 650ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 481ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 377ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 498ms
     ✓ finishes a CI round only with its own failed job count 502ms
   ✓ progress command output (4)
     ✓ done prints progressLine 451ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ build-group-start records parentSha and group 348ms
     ✓ carries extra fields, parsed as JSON when they are JSON 386ms
     ✓ reports a failed commit with exit 8 without writing the row 889ms
     ✓ a failed commit leaves no row staged in the index 663ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 952ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 655ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 860ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 553ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 756ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 324ms
     ✓ --ref reads the status file as committed on that ref, not from disk 380ms
     ✓ --ref exits 3 when the ref does not carry the status file 451ms
     ✓ fails on a placeholder left in the artifact 385ms
     ✓ fails when the row's verdict differs from the artifact's 303ms
     ✓ fails when the row does not list the artifact, or carries another attempt 406ms
     ✓ fails on a missing artifact 368ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 341ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a diagnose row missing its strategy, passes with it 302ms
     ✓ fails a run-tests row missing its scope, and an empty scope 450ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 477ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 611ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 872ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 617ms
     ✓ --post needs --number; without --post there is no tracker key 342ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
> [bkit] TRUNCATED HERE — 64 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1554ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1895ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1371ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1527ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1332ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 847ms
     ✓ runs the full gate for replayed debug code 1256ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1571ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1784ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1821ms
     ✓ a push that fails without a server answer is returned once, never retried 1527ms
     ✓ a failed fetch is returned before anything is built 726ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2206ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1458ms
     ✓ lands from a clone whose fetch refspec omits dev 2566ms
     ✓ build throwing stops the landing and removes the throwaway checkout 932ms
> [bkit] TRUNCATED HERE — 58 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .claude/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 140 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-check] [dry-run] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 3248ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 2539ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 4623ms
   ✓ #1053 — bkit check fails on a wrong entry for a rendered output (1)
     ✓ a wrong entry for a rendered mirror fails check and names the file, a wrong package.json entry does not 5213ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 5940ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 892ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 1047ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 1338ms
   ✓ cloud bootstrap fingerprint compare — adoption signal (1)
     ✓ bkit check reports a stale adopted cloud bootstrap with the template block to copy 1175ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
[bkit-install] core: scripts/slop/bkit-slop-type-suppression.mjs left unchanged (the copy differs from the shipped version); merge the corrected .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs by hand to avoid false skip/focus findings in inert text
[bkit-install] core: scripts/ci/bkit-machine-lock.sh left unchanged (the copy differs from the shipped version); merge .bkit/templates/scripts/ci/bkit-machine-lock.sh by hand, until then waiting runs take the lock out of arrival order
[bkit-install] core: scripts/ci/bkit-machine-lock.sh left unchanged (the copy never writes LOCAL_STACK_LOCK_STATUS_FILE); merge .bkit/templates/scripts/ci/bkit-machine-lock.sh by hand, until then a lock wait that gives up reads as a gate failure (exit 1) instead of exit 81
[bkit-install] core: scripts/ci/bkit-machine-lock.sh left unchanged (the copy has no LOCAL_STACK_LOCK_HOLD_S hold limit); merge .bkit/templates/scripts/ci/bkit-machine-lock.sh by hand, until then a hung run holds the tests lock until someone stops it by hand

> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 166 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 162 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 134 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 13018ms
     ✓ records the failed job count and reads an uncounted local round as unknown 12792ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 7684ms
     ✓ finishes the first CI evidence round of the second debug run 5015ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 57970ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 3483ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3008ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 485ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 397ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 390ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4090ms
     ✓ does not fall back through a malformed later success receipt 1511ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 2653ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 2085ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 1297ms
     ✓ a gate that has not finished leaves no failed receipt 880ms
     ✓ the restore step leaves another worktree's .failed file alone 1162ms
     ✓ a pending attempt whose process is gone is not treated as running 4044ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 2351ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 1328ms
     ✓ does not record a committed tree 669ms
     ✓ records no proof for a failed gate or lighter gate 1387ms
     ✓ requires integration proof when integration is declared 1966ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 9568ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 533ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 566ms
     ✓ staging failure: exit 4 and no commit is created, no false success 628ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 1081ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 543ms
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 780ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 916ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1446ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1110ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 382ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 315ms
     ✓ retries a failed create once, and exits 5 when it fails twice 384ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 357ms
     ✓ prs open still opens against any other base 338ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 394ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 540ms
     ✓ exits 4 when gh errors and 80 when it needs auth 340ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 329ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 301ms
     ✓ runs no merge when the PR is already MERGED 545ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 438ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 593ms
     ✓ prs merge refuses when the PR base is unknown 1906ms
     ✓ prs merge reads the base from the one pr view it already makes 384ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 420ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 607ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 301ms
     ✓ never reads dev's required checks without --only-if-required 315ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 389ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 471ms
     ✓ is not green when a check failed, naming it (exit 1) 461ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 445ms
     ✓ is not green on an empty rollup (total 0) 443ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 444ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 539ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 350ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 874ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 324ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 986ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 331ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 469ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 325ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 338ms
     ✓ an unpinned repo reports nulls and asks no registry 316ms
   ✓ bkit repo preflight (4)
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 341ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 320ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (107 tests) 24631ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 445ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 445ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 450ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 438ms
     ✓ fetches the issue and its comments as GitHub returns them 439ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 417ms
     ✓ invalidates missing corrupt and unsupported progress cache 825ms
     ✓ contains cache read and write failures as standalone degradation 485ms
     ✓ uses legacy receipts and contains receipt failures 315ms
     ✓ records an engine-action row and skips the same key + body on a re-run 460ms
   ✓ label writes (4)
> [bkit] TRUNCATED HERE — 397 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 455 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 198 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 161 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 393 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 71 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 981ms
     ✓ counts files committed since --base 432ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 665ms
     ✓ runs nothing and exits 0 when no file changed 408ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 638ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 513ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 637ms
     ✓ stops the step when the command crashed or was misused 1163ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/install/cloud-env.integration.test.ts (11 tests) 7830ms
   ✓ T4 — the derived egress set reaches all five surfaces (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 411ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 937ms
       ✓ prints nothing to stdout when every recipe succeeds 764ms
       ✓ logs and carries on when the installed bkit has no provision verb 425ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 350ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 366ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 363ms
     ✓ --file into a missing directory is refused, not created 316ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 133 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 801ms
     ✓ a failing file absent at the base commit is the branch's 451ms
     ✓ an undeclared bkit:test:file reads unknown 377ms
     ✓ a failed base install reads unknown and removes the worktree 500ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 603ms
     ✓ copies the worktreeCopy entries into the base checkout 536ms
     ✓ a base file run that writes no report reads unknown 519ms
     ✓ a CI run that cannot settle the base falls back to the local run 2886ms
     ✓ a pull_request-event CI run at the base sha does not settle none 691ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 511ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 624ms
     ✓ the base test run does not inherit the hooks-off git config 635ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 587ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 327ms
     ✓ follows summary cursors even when the first page is shorter than the limit 456ms
     ✓ reports excluded intervals as unread even when pagination finishes 563ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 348ms
     ✓ reports an unread remainder at the page cap 304ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 443ms
     ✓ rejects missing summaries instead of treating them as empty results 333ms
     ✓ reports a failed first page as unavailable 313ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 348ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 359ms
     ✓ follows summary cursors even when the first page is shorter than the limit 436ms
     ✓ reports excluded intervals as unread even when pagination finishes 328ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 399ms
     ✓ reports an unread remainder at the page cap 336ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 338ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 170 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 433ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1370ms
     ✓ a refused dev push is logged, never fails the close 2148ms
     ✓ an unreachable remote is logged, never fails the close 631ms
 ✓ .bkit/core/engine/audits/templates/secrets-sync.integration.test.ts (17 tests) 4959ms
   ✓ bkit-secrets.mjs (17)
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 5131ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1341ms
     ✓ runGit names ENOBUFS when output passes the limit 857ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 892ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 827ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1088ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 733ms
     ✓ challenge gate without --base sizes only the branch's own lines 887ms
stdout | .bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 625ms
     ✓ passes every rule on a clean head 320ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 861ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (27 tests) 6311ms
   ✓ publication ownership lock (4)
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 178 lines omitted. Dropped content was NOT read.
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
> [bkit] TRUNCATED HERE — 58 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] [dry-run] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] [dry-run] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ cursor gateguard — relative path resolution (spike fix) (3)
     ✓ a genuinely absent file gets the new-file nudge 440ms
   ✓ cursor gateguard — no-op and fail-open cases (2)
     ✓ malformed and empty stdin still emit one allow 384ms
   ✓ cursor gateguard — delete and shell advice (1)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 484 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/checks/after/tools.test.ts (63 tests) 851ms
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

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 571ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 521ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 551ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (49 tests | 3 skipped) 125ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 344ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 341ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (102 tests) 171ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 145ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 783ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 354ms
 ✓ .bkit/core/engine/commands/workflow/open-decision.test.ts (58 tests) 122ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 210ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 204ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 205ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (340 tests) 728ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 139ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 181ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/tips/detect.test.ts (38 tests) 127ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 25ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 470ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (7 tests) 14ms
(node:70604) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:70604) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 415ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 102ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1888ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1756ms
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

 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 74ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (38 tests) 84ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 86ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (8 tests) 230ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/install/version-file.test.ts (42 tests) 47ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > records the fingerprint of its own domains list
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > moves the fingerprint when allowed-domains changes
[test] core: .bkit/allowlist.json
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 71ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (11 tests) 37ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 65ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1795133960655.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1795133960661.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1795133960662.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (38 tests) 47ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1795133960682.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (16 tests) 19ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (21 tests) 347ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 44ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-1kkJTA/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 90ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 102ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 54ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 189ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 39ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 58ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 210ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (85 tests) 153ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 161ms
 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 58ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 57ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (14 tests) 49ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 68ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 20ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (4 tests) 17ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 50ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 29ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 52ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 51ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 20ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms

 Test Files  148 passed (148)
      Tests  8992 passed | 3 skipped (8995)
   Start at  10:03:37
   Duration  947.11s (tests 99%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1042-ship-s-pr/build-holistic-gate-2.log.reports/vitest-43605.xml

[bkit:gate:changed] named: node --test --test-timeout=180000 --test-force-exit .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs scripts/ci/bkit-check-dependency-audit.test.mjs tests/experiments/hooks/bkit-hook-probe.test.mjs
  ok   keeps high and critical, drops moderate
  ok   a custom blocking table changes what blocks
  ok   an advisory with no acceptance is missing
  ok   accepted, in-date advisories pass
  ok   an acceptance is valid through its expiry day, expired the day after
  ok   an acceptance past its severity's limit is too long
  ok   an acceptance for an advisory no longer reported is stale
  ok   a row with no reason, a bad date, or a repeat is invalid
  ok   a report with no advisories has nothing to block
  ok   classifies a report as ok
  ok   classifies an unreachable registry by its network code
  ok   a registry that answered badly is a failure, not unreachable
  ok   empty or non-JSON output is a failure

13 passed, 0 failed
✔ .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs (56.316333ms)
  ok   keeps high and critical, drops moderate
  ok   a custom blocking table changes what blocks
  ok   an advisory with no acceptance is missing
  ok   accepted, in-date advisories pass
  ok   an acceptance is valid through its expiry day, expired the day after
  ok   an acceptance past its severity's limit is too long
  ok   an acceptance for an advisory no longer reported is stale
  ok   a row with no reason, a bad date, or a repeat is invalid
  ok   a report with no advisories has nothing to block
  ok   classifies a report as ok
  ok   classifies an unreachable registry by its network code
  ok   a registry that answered badly is a failure, not unreachable
  ok   empty or non-JSON output is a failure

13 passed, 0 failed
✔ scripts/ci/bkit-check-dependency-audit.test.mjs (54.122083ms)
✔ generates isolated workspaces for five hosts and refuses an existing destination (1156.639625ms)
✔ reports an edited sentinel with no hook as unverified, never as before-edit delivery (106.583458ms)
✔ distinguishes acknowledgements before and after editing using fresh challenge tokens (474.679709ms)
✔ missing and incorrect tokens cannot prove full visibility; report does not disclose tokens (219.259583ms)
✔ read tools and unrelated writes cannot trigger the armed edit challenge (213.602792ms)
✔ post-execution control stays after-execution even if acknowledgement is observed (176.423041ms)
✔ Antigravity accepts its camelCase payload and denies only the first default invocation (259.579375ms)
✔ Cursor tests the legacy edit envelope separately from its shell envelope (203.261875ms)
✔ an after-execution acknowledgement with an unchanged sentinel never proves before-edit delivery (215.1225ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3121.5245

[bkit:gate:changed] named: bats tests/shell/bkit-gh-stub.bats tests/shell/bkit-graphify-refresh.bats tests/shell/bkit-graphify-rollup.bats tests/shell/bkit-status-holes-sweep.bats
1..24
ok 1 stub: a response script keeps argv and exit status through the stable executable
ok 2 stub: a missing response script fails instead of using the normal fixtures
ok 3 stub: the response selector is cleared before running its body
ok 4 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list
ok 5 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted
ok 6 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape)
ok 7 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path)
ok 8 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE)
ok 9 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent)
ok 10 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers
ok 11 stub: --paginate emits one document per page; --slurp collapses them into an array
ok 12 refresh builds the register from the staged files, not HEAD or unstaged edits
ok 13 refresh rewrites the DETAILS copy of the packages diagram from the new register
ok 14 refresh drops a file deleted in the index from the build
ok 15 refresh replaces the text between the graphify markers and keeps an unstaged edit outside them
ok 16 a run replaces the text between the markers and leaves the text outside them unchanged
ok 17 a doc without markers that the script wrote whole is rewritten into the new layout with its overrides kept
ok 18 an absent doc is built from the starter
ok 19 a doc with one marker stops the run and is not written
ok 20 a doc with the markers out of order stops the run and is not written
ok 21 a hand-written doc without markers stops the run and is not written
ok 22 a marker named inside a sentence is not taken for a marker line
ok 23 the sweep prints the summary line the lane greps for
ok 24 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/commands/workflow/prs.ts .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/commands/workflow/prs.ts .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl .bkit/version .bkit/workflows.md DETAILS.md dist/commands/workflow/branches.js dist/commands/workflow/ledgers.js dist/commands/workflow/prs.js dist/commands/workflow/workflows.js docs/capabilities.md docs/deferrals.jsonl docs/failures.jsonl docs/plans/202611/1042-ship-s-pr-plan.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-1.md docs/plans/202611/logs/1042-ship-s-pr/build-decision-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-2-1.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-2-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-3-1.md docs/plans/202611/logs/1042-ship-s-pr/build-group-gate-2-2.md docs/plans/202611/logs/1042-ship-s-pr/build-handover.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-1.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-input-1.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-2-1-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-2-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-3-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-2-log.md docs/plans/ … [bkit] line shortened, 692 bytes dropped
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 4 over-long lines were shortened; each says so inline.
> [bkit] TRUNCATED — kept 4283 of 28988 lines (319 KB of 2.0 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
