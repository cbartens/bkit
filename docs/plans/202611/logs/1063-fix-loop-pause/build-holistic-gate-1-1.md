
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/counters.test.ts .bkit/core/engine/commands/workflow/counters.ts .bkit/version .bkit/workflows.md dist/commands/workflow/counters.js docs/plans/202611/1063-fix-loop-pause-plan.md docs/plans/202611/logs/1063-fix-loop-pause/build-brief-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-brief-tests-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-diff-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-diff-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-input-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-install-skills.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-check.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-gaps-remediate-1-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-tasks-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-tests-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-green-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-green-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-red-1-1.md docs/testing.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/counters.test.ts .bkit/core/engine/commands/workflow/counters.ts .bkit/version .bkit/workflows.md dist/commands/workflow/counters.js docs/plans/202611/1063-fix-loop-pause-plan.md docs/plans/202611/logs/1063-fix-loop-pause/build-brief-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-brief-tests-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-diff-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-diff-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-input-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-install-skills.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-check.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-gaps-remediate-1-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-tasks-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-tests-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-green-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-green-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-red-1-1.md docs/testing.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause

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

 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (62 tests) 183977ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 3441ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 20153ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1842ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1154ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1151ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1686ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1835ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2746ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1316ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1001ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 723ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 989ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 945ms
     ✓ design installs dependencies like build and debug 1079ms
     ✓ plan installs dependencies like build and debug 1280ms
     ✓ design stops on a failed install (5) 1064ms
     ✓ plan stops on a failed install (5) 1132ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 969ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1205ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1084ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1571ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2600ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 4666ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4399ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 6551ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 3512ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 3517ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2789ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 3461ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1774ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1797ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2466ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3114ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 4225ms
     ✓ commits leftovers when a copy entry points outside the checkout 3382ms
     ✓ never commits the entries setup copies in from the main checkout 3176ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 4067ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 2218ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 3465ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 3067ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 2602ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 2615ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 2883ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2276ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2882ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2746ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1147ms
     ✓ leaves a clean worktree's history alone 2557ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 4372ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 5726ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 7563ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 7588ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 6502ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 5508ms
     ✓ does not mark a resumed worktree it did not create 2587ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (1)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 1559ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 680ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 1110ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 2387ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 3397ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1683ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (193 tests) 229513ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 496ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1325ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 342ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 313ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 320ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 411ms
       ✓ a new run in the same chat gets its own session row 359ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 377ms
     ✓ design / plan / build / debug book in the current worktree 356ms
     ✓ --lock-held checks the lock is ours 358ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 455ms
   ✓ bkit workflows start — resume facts (12)
     ✓ a resumed run prints its last DONE step; a closed decision is not open 303ms
     ✓ an OPEN decision of an earlier run never resurfaces 330ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 495ms
     ✓ openDecision gate is null without the header 345ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 414ms
     ✓ writes no row when status.jsonl does not exist 322ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 321ms
     ✓ aborts a rebase only when one is in progress 730ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 563ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 688ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 482ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 410ms
     ✓ --max-exceeded says a handover is due without any sentinel 719ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 485ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 572ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 485ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 345ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 597ms
       ✓ counts subagents of an earlier chat the run's session rows name 577ms
       ✓ records no context block, and still closes, outside a Claude Code session 667ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 583ms
     ✓ records ending held and publish false on the workflow-done row 547ms
     ✓ defaults the close row to ending done 583ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1008ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1018ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 698ms
     ✓ always writes the telemetry, whatever the runtime 598ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 446ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 595ms
     ✓ an unwritable stats path is logged and never fails the close 568ms
     ✓ appends the completeness row before the workflow-done row 822ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 697ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 643ms
     ✓ writes one completeness row per close 1052ms
     ✓ leaves out the previous run's rows that share a second with this run's start 622ms
     ✓ still closes when the completeness check throws 685ms
     ✓ still closes when the completeness row write throws 656ms
     ✓ ship: run.pr, size of the squash commit, and coverage 861ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1037ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 621ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 650ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1059ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 834ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 854ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 806ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 949ms
     ✓ --record-step writes the close step's row before workflow-done 690ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 685ms
     ✓ --number without --outbox is a usage error 622ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 991ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 849ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 894ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 983ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 893ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 540ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 377ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2443ms
     ✓ --flush with nothing to record commits and pushes nothing 1235ms
     ✓ --flush carries the named worktree's logs into the dev commit 2170ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 3534ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 3366ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 6813ms
     ✓ closePr titles the PR by the record it carries 3362ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 1057ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 757ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 1563ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 1275ms
       ✓ --ref, no push → route stop, no message 526ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 1347ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3203ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2424ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2085ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2605ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3412ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3290ms
     ✓ --push on dev never carries a row whose references name another feature 2864ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2761ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6710ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 5183ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1431ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3872ms
     ✓ preserves unlanded file deletions and ledger additions on close 7507ms
     ✓ preserves dirty work and uncertain branch evidence during close 5614ms
     ✓ preserves a local feature ref changed after its cleanup proof 7804ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 6205ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 5393ms
     ✓ a close that landed releases the lock 6653ms
     ✓ removes the worktree before it releases the lock 5178ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6575ms
       ✓ closePr refuses when the PR base is unknown 5430ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3949ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 375ms
     ✓ exits 12 when there is no versioned draft 421ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 343ms
     ✓ stamps the anchor from the runtime-resolved base commit 385ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 463ms
     ✓ promote copies the plan only 312ms
     ✓ rejects a workflow other than design or plan 302ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 521ms
     ✓ names the branch, not the remote-tracking ref, in each URL 524ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 464ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 507ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1283ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 707ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 1886ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 927ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 808ms
     ✓ a second run's record does not let this FID's close commit 1008ms
     ✓ record is present after workflows close and before the push 1741ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 3738ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 3584ms
       ✓ a run closed by workflow-failed keeps no parked copy 3382ms
       ✓ a run closed by workflow-done keeps no parked copy 3212ms
       ✓ a FAILED run gets no row 3820ms
       ✓ a DONE run gets no row 3250ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3217ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 327ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 305ms
     ✓ a run with no issue holds the prompt alone 308ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 602ms
     ✓ --plan is appended when the file exists and skipped when it does not 536ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 795ms
     ✓ a missing prompt file exits 13 312ms
     ✓ a rebuilt design input keeps the owner-interview record appended after the first build 390ms
     ✓ a grill file that was never appended is appended once, after a blank line 370ms
     ✓ a workflow with no grill file writes exactly the sections 352ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1375ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 988ms
     ✓ puts each --line after the summary, in flag order 1045ms
     ✓ refuses --final-return without --summary-file 391ms
     ✓ --summary prints the file and keeps a copy in --outbox 1118ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1008ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 450ms
     ✓ a resumed start with another session keeps the run's first link 588ms
     ✓ start with a session folder that holds no progress id writes the row without progress and records association friction 470ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (80 tests) 240567ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 1144ms
     ✓ install --claude does not write Serena or graphify examples 1480ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 819ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 857ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 788ms
     ✓ bkit upgrade prints the adopted marker for a changed starter with a project copy 817ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 2734ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 2753ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 2765ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 4988ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3551ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 4693ms
     ✓ malformed .mcp.json fails install instead of being overwritten 739ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 3801ms
     ✓ an adopted copy of every template survives upgrade and check 4380ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 4313ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 4481ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1471ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 6370ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 3973ms
   ✓ #1053 — upgrade re-records the entry of every rendered output (1)
     ✓ re-records a stale entry for a rendered mirror, doc and allowlist that are already current 2318ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 6044ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 6056ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 4029ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 4569ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 4719ms
     ✓ branded script migration is idempotent and dry-run writes nothing 5092ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 4397ms
     ✓ a dry-run hook and CI token migration writes nothing 2473ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 4911ms
     ✓ a second check-name migration writes nothing 6796ms
     ✓ a dry-run check-name migration writes and moves nothing 4139ms
     ✓ a second Vale migration and a dry run write nothing 5730ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 4477ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3954ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3593ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 2868ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 2719ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 4168ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 4519ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 6154ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 5888ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 4837ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 5048ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 6763ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 5457ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 3040ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 598ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 887ms
     ✓ passes -w when the consumer is a pnpm workspace root 664ms
     ✓ starts the package runner for the install and the re-exec 1341ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 600ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 4567ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 4900ms
     ✓ migrates legacy ownership without changing project text or core ownership 6223ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 4064ms
     ✓ previews project document migration without mutating the checkout 2736ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 4248ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 3105ms
     ✓ upgrade names the missing root lint-staged config with the copy command 3202ms
     ✓ install names the missing root lint-staged config under its own log prefix 3306ms
     ✓ check names the missing root lint-staged config under its own log prefix 3136ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 2434ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 3794ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 3073ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 3069ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 2842ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 100677ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1338ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 708ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 689ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 523ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 752ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 570ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 517ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 743ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 448ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 879ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 532ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 531ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 800ms
     ✓ PASS is 0 failures with or without reports 774ms
     ✓ clears a previous attempt's reports before the gate runs 688ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 739ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 849ms
     ✓ a log under the outbox is named main-checkout relative in the record 631ms
     ✓ a log small enough is copied whole: not clamped, raw null 1004ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 551ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1808ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 1617ms
     ✓ numbers runs within the workflow's active run and per step 1343ms
     ✓ tests run --file records the tested snapshot on its test-run row 746ms
     ✓ a FAIL test-run row records each failing case as file and name 704ms
     ✓ a PASS test-run row records no failed tests 1536ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 752ms
     ✓ without --file no row is written and the output carries row null 739ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 1169ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 981ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 580ms
     ✓ the nothing-to-run row records the tested snapshot 657ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 2014ms
     ✓ --since-pass-of skips failing runs and steps it does not name 2098ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1674ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1213ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1068ms
     ✓ changed-since refuses a sha that names no commit 343ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1107ms
     ✓ a deleted file that no file mentions passes and the log says so 989ms
     ✓ a failed importer search runs the whole check 1183ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1235ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 307ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1064ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 909ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 832ms
     ✓ a failing required push gate leaves the failed marker 1145ms
     ✓ uncommitted code blocks the receipt until it is committed 1401ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 981ms
     ✓ only the required push gate records a receipt 972ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 1024ms
   ✓ bkit tests plan-check (40)
     ✓ --ledger-rows (4)
       ✓ refuses a missing or unfilled Ledger rows line 315ms
       ✓ passes when the plan parses and every key has a decision or deferral row 319ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 819ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1082ms
     ✓ a planned test absent from a loaded report is a missing gap 976ms
     ✓ a file that fails to load is a red of kind red-not-loaded 876ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1011ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 406ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1010ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 735ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 619ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1399ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 768ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 872ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1139ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 951ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 796ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 864ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1092ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 850ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 926ms
       ✓ tests red records no from when no earlier task naming the test has a baseline 928ms
       ✓ a resumed tests red skips a taken-over entry 1246ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 1060ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1616ms
     ✓ green: a passed-accepted test is already landed, not a gap 676ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 755ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 955ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 1731ms
       ✓ green leaves a changed test the plan no longer names out of changed 929ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 1145ms
       ✓ green lists a changed test when test-first is not enforced 313ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 974ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 661ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1124ms
     ✓ green: --group audits only that group's tasks 689ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 817ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 877ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 758ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1009ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 740ms
     ✓ green: lists each gap kind, with the runner output 740ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1401ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 561ms
       ✓ green clears an exception-only task from a human commit 402ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (69 tests) 117040ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 724ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner 330ms
     ✓ no duplicate ids in the final checklist 308ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 1613ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1209ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 562ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 502ms
     ✓ explicit `bkit help` prints the same usage and exits 0 553ms
     ✓ `bkit check --claude` (stray module flag) errors 583ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 545ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1372ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1233ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1936ms
     ✓ saves the failed job count without the capstone job 1014ms
     ✓ a CI selection keeps the failed job names, capstone left out 1517ms
     ✓ counts the capstone job when it is the only failed job 764ms
     ✓ saves no failed job count when no job failed 773ms
     ✓ counts fallback evidence jobs without the capstone job 403ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 463ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1073ms
     ✓ freezes explicit workflow run attempt and all failed job pages 791ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1867ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2800ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2147ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2579ms
     ✓ checks the named repository base and fails closed on missing evidence 1294ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1135ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1318ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 711ms
       ✓ a source change past the validated head refuses (17) and names the path 681ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 733ms
       ✓ --validated without --month / --fid is a usage error (2) 485ms
       ✓ a validated sha that is not an ancestor refuses (17) 616ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 619ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1640ms
     ✓ a failed re-trigger push names the cause in the log 1502ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2162ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2723ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1581ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 803ms
     ✓ gh-error: every poll errored 731ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1454ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1484ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 1027ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 3024ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 732ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 678ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 673ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 623ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2354ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2469ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1000ms
     ✓ re-trigger on dev only uses the record of its own FID 1254ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1142ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 438ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 693ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 453ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 417ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 484ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 462ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 1350ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 1586ms
     ✓ debug: a failure test run is a failed run 1213ms
     ✓ debug: a timed_out test run is a failed run 861ms
     ✓ debug: a startup_failure test run is a failed run 1219ms
     ✓ debug: a test run still in progress or cancelled is not returned 895ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1669ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 794ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1661ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 483ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 720ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 740ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 749ms
     ✓ --file and --step go together 699ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3292ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 784ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 705ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 664ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 883ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 805ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 715ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 851ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 2674ms
     ✓ vitest — with no report path the test file is left as it was 1496ms
     ✓ a run naming files of two kinds is refused as a usage error 1028ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 876ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1011ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 546ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 750ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30905ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (286 tests) 423482ms
   ✓ bkit branches parse (2)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 592ms
     ✓ refuses a code conflict and aborts the rebase on the spot 640ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1062ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 660ms
     ✓ produces byte-identical output to merge=union 1331ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1063ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1624ms
     ✓ refuses a lockfile whose regenerate command fails 1251ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1125ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1040ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 538ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 658ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 770ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 939ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 622ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 551ms
       ✓ runs (0) with the landed path count once dev moved 962ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 535ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1151ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1810ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2870ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 652ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1054ms
     ✓ --mode=abort pushes when the branch has no open PR 1004ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 849ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 580ms
     ✓ --open-pr carries the MCP answer and skips gh 1104ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1600ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 4110ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4477ms
     ✓ skip-ci HEAD on the replay is refused 1102ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2674ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1358ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1821ms
     ✓ a fetch that fails exits 10 683ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 941ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 1165ms
     ✓ scan-diff attributes deletion to its old test ins… 1040ms
     ✓ scan-diff consumes each moved assertion once and … 1838ms
     ✓ scan-diff does not match identical assertions fro… 2189ms
     ✓ scan-diff does not match the same leaf test name … 1224ms
     ✓ scan-diff does not match a same-named test with d… 981ms
     ✓ scan-diff does not match a same-named test with c… 967ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1112ms
     ✓ --paths with no match exits 1 1062ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 799ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1333ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1727ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 728ms
     ✓ scan-diff ignores a removed comment in a test file 708ms
     ✓ scan-diff ignores an assertion moved within the file 764ms
     ✓ scan-diff still reports a removed assertion 711ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1043ms
     ✓ scan-diff finds an added pytest mark skip 934ms
     ✓ scan-diff finds an added unittest skip 832ms
     ✓ scan-diff finds an added bare skip call 863ms
     ✓ scan-diff ignores a quoted skip in a documentation file 977ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1834ms
     ✓ scan-diff ignores an assertion whose expectation changed 1085ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1644ms
     ✓ scan-diff reports a deleted test file 1306ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1340ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 5227ms
     ✓ publishes local code with a CI running head before bookkeeping 6184ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 8541ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 5670ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 3772ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2533ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 2772ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2190ms
     ✓ --merge-docs skips an empty bkit:generate script 1697ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1639ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2324ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2996ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2742ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2332ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3208ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1951ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1382ms
     ✓ exits 10 when the fetch fails 790ms
     ✓ refuses --merge-docs with --head, and an unknown --head 909ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1608ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2336ms
     ✓ a failed install stops ship (16) 1859ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1807ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 2816ms
     ✓ exits 10 when the fetch fails 1835ms
   ✓ shared landed comparison (5)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 1428ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3192ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3179ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2623ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1674ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 5221ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 972ms
     ✓ reports undeclared and runs nothing with an empty script 937ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1190ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1291ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 918ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 533ms
     ✓ finishes a CI round only with its own failed job count 525ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 390ms
     ✓ done --group writes group on the row 318ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 470ms
     ✓ reports a failed commit with exit 8 without writing the row 535ms
     ✓ a failed commit leaves no row staged in the index 707ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 976ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 735ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 768ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 572ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 822ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 360ms
     ✓ --ref reads the status file as committed on that ref, not from disk 369ms
     ✓ --ref exits 3 when the ref does not carry the status file 448ms
     ✓ fails on a placeholder left in the artifact 413ms
     ✓ fails when the row's verdict differs from the artifact's 425ms
     ✓ fails when the row does not list the artifact, or carries another attempt 376ms
     ✓ fails on a missing artifact 374ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 394ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a diagnose row missing its strategy, passes with it 337ms
     ✓ fails a run-tests row missing its scope, and an empty scope 507ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 494ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 749ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1152ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 700ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 371ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 702ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 526ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 352ms
     ✓ --attempt-of checks the row carries the derived counter 419ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1870ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2137ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1583ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1819ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1682ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1052ms
     ✓ runs the full gate for replayed debug code 1641ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1868ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1844ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1823ms
     ✓ a push that fails without a server answer is returned once, never retried 1791ms
     ✓ a failed fetch is returned before anything is built 666ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2628ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2003ms
     ✓ lands from a clone whose fetch refspec omits dev 2465ms
     ✓ build throwing stops the landing and removes the throwaway checkout 833ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 441ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 402ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 448ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 349ms
     ✓ tells a caller inside the removed worktree where to cd 503ms
     ✓ fails with its own exit code when git cannot remove a marked path 349ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 1384ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 45933ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 983ms
     ✓ names each net-new and worsened finding in the log and the JSON 754ms
     ✓ fails on a net score rise with no net count change 707ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 753ms
     ✓ treats a net score at or below 0.001 as float noise 732ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 693ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 345ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1066ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 906ms
     ✓ exits 4 on a dropped net field instead of silently passing 708ms
     ✓ exits 4 on no summary instead of silently passing 722ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 821ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1204ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1125ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1075ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 773ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 469ms
     ✓ fails (exit 1) when vale reports alerts 473ms
     ✓ exits 6 on a vale runtime error 482ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 556ms
     ✓ falls back to vale sync when the main worktree has none 502ms
     ✓ fails when vale sync cannot restore the required styles 573ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 572ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 413ms
     ✓ is a usage error when the commit cannot be read 343ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 493ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 493ms
     ✓ exits 1 naming the files outside, whatever the commit message says 424ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 936ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 544ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 529ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 400ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 547ms
     ✓ retries a failed create once, and exits 5 when it fails twice 678ms
     ✓ exits 5 when the open-PR probe errors 400ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 504ms
     ✓ prs open still opens against any other base 440ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 388ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 889ms
     ✓ exits 4 when gh errors and 80 when it needs auth 538ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip actions] in the landed commit body (exit 1) 314ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 378ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 650ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 401ms
     ✓ runs no merge when the PR is already MERGED 525ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 859ms
     ✓ prs merge refuses a PR whose base is main 382ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 488ms
     ✓ prs merge refuses when the PR base is unknown 406ms
     ✓ prs merge reads the base from the one pr view it already makes 483ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 546ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 588ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 457ms
     ✓ never reads dev's required checks without --only-if-required 355ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 372ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 353ms
     ✓ is not green when a check failed, naming it (exit 1) 362ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 474ms
     ✓ is not green on an empty rollup (total 0) 359ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 602ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 865ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 375ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 43753ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 3010ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2876ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 466ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 453ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 485ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3580ms
     ✓ does not fall back through a malformed later success receipt 1297ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1108ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1131ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 1193ms
     ✓ a gate that has not finished leaves no failed receipt 842ms
     ✓ the restore step leaves another worktree's .failed file alone 749ms
     ✓ a pending attempt whose process is gone is not treated as running 3082ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 2149ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 702ms
     ✓ does not record a committed tree 1036ms
     ✓ records no proof for a failed gate or lighter gate 1717ms
     ✓ requires integration proof when integration is declared 1719ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2842ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 455ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 387ms
     ✓ staging failure: exit 4 and no commit is created, no false success 409ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 533ms
     ✓ a --month that is not six digits is refused and commits nothing 311ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 514ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 321ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ stageTrackedUpdates skips recorded paths 1346ms
> [bkit] TRUNCATED HERE — 54 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 353ms
     ✓ continues after friction and diagnostic writes fail without recursion 329ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 496ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2445ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 329ms
     ✓ rolls over after intervening comments external edits and deletion 381ms
     ✓ uses exact new comment after a failed eligibility read 315ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 430ms
     ✓ contains exhausted append and create failures without fabricated success 423ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 552ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 462ms
     ✓ reserves new comment opportunity within total delivery budget 1096ms
     ✓ contains preparation state lock and reconciliation exceptions 327ms
     ✓ attempts independent attention after routine uncertainty 436ms
     ✓ seals an acknowledged segment after a postflight intervening comment 327ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 441ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 687ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 415ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 418ms
     ✓ fetches the issue and its comments as GitHub returns them 1068ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ linear fetch marks a canceled state terminal and a started state not 1470ms
   ✓ jira client (MCP over HTTP) (6)
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 355ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 916ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1239ms
     ✓ invalidates missing corrupt and unsupported progress cache 2070ms
     ✓ contains cache read and write failures as standalone degradation 836ms
     ✓ uses legacy receipts and contains receipt failures 1082ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1093ms
     ✓ a recent identical comment counts as done (the final close comment) 783ms
     ✓ a failed post reports done false with the reason and never leaks a token 1660ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1230ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1542ms
     ✓ a different marker hash posts 1239ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 953ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 34305ms
   ✓ the dispatch seam on a real worktree (7)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 30856ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1717ms
     ✓ counts files committed since --base 1443ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1383ms
     ✓ runs nothing and exits 0 when no file changed 916ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1721ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1580ms
     ✓ a failing file absent at the base commit is the branch's 858ms
     ✓ no JUnit report reads unknown 338ms
     ✓ an undeclared bkit:test:file reads unknown 654ms
     ✓ a failed base install reads unknown and removes the worktree 1112ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 1445ms
     ✓ copies the worktreeCopy entries into the base checkout 1262ms
     ✓ no origin/dev ref reads unknown 625ms
     ✓ a base file run that writes no report reads unknown 1145ms
     ✓ a missing required flag is a usage error 302ms
     ✓ a passing CI run at the exact base sha settles none without a local run 655ms
     ✓ a CI run that cannot settle the base falls back to the local run 5478ms
     ✓ a pull_request-event CI run at the base sha does not settle none 1464ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 930ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 886ms
     ✓ the base test run does not inherit the hooks-off git config 956ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 591ms
     ✓ writes zero files (purely read-only — write-set assertion) 560ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 566ms
     ✓ reports opencode as absent when .opencode/ does not exist 535ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 682ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2016ms
     ✓ a refused dev push is logged, never fails the close 2301ms
     ✓ an unreachable remote is logged, never fails the close 622ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 11343ms
   ✓ workflow progress command wiring (12)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (78 tests) 5218ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1342ms
     ✓ runGit names ENOBUFS when output passes the limit 958ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 944ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 676ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1369ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 481ms
     ✓ challenge gate without --base sizes only the branch's own lines 590ms
 ✓ .bkit/core/engine/commands/comply.integration.test.ts (11 tests) 6235ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 698ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 636ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 335ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 3378ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 124 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 58 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 4622ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 4195ms
     ✓ malformed .mcp.json fails install instead of being overwritten 775ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 3698ms
> [bkit] TRUNCATED HERE — 91 lines omitted. Dropped content was NOT read.
     ✓ openDecision gate ignores a Gate line below the header 316ms
     ✓ reads Test attempt from a tests pause 653ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 551ms
     ✓ writes no row when status.jsonl does not exist 474ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 368ms
     ✓ aborts a rebase only when one is in progress 800ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 638ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 600ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 364ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 416ms
     ✓ --max-exceeded says a handover is due without any sentinel 389ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 384ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 500ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 409ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 374ms
     ✓ a debug run in SOAK mode always needs a handover 356ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 536ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 604ms
     ✓ an unwritable stats path is logged and never fails the close 561ms
     ✓ appends the completeness row before the workflow-done row 743ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 702ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 798ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1179ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 590ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 627ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 494ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 600ms
     ✓ --number without --outbox is a usage error 603ms
     ✓ --flush is ship only 349ms
   ✓ bkit workflows handover (32)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 705ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 344ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2451ms
     ✓ --flush with nothing to record commits and pushes nothing 1258ms
     ✓ --flush carries the named worktree's logs into the dev commit 2057ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 3395ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 4085ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 4596ms
     ✓ closePr titles the PR by the record it carries 4562ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 6981ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4173ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2599ms
     ✓ a close that landed releases the lock 3842ms
     ✓ removes the worktree before it releases the lock 3526ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 445ms
     ✓ names the branch, not the remote-tracking ref, in each URL 413ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 368ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 421ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 932ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 603ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 3505ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 3194ms
       ✓ a run closed by workflow-failed keeps no parked copy 3449ms
       ✓ a run closed by workflow-done keeps no parked copy 3501ms
       ✓ a FAILED run gets no row 4098ms
       ✓ a DONE run gets no row 3428ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2851ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 568ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1004ms
     ✓ a missing summary file exits 13 before anything is written 328ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 380ms
   ✓ bkit workflows start — the run's progress link (3)
     ✓ start with --session-dir writes the session's link as progress on the workflow-started row 312ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 616ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 582ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 412ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 425ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 465ms
     ✓ .husky/pre-push: first and last lines name the log 513ms
     ✓ .husky/pre-push: the hook body runs once 456ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1045ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 1432ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1532ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 914ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1298ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1090ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1305ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 921ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 1357ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 944ms
     ✓ .husky/pre-push: a gate fails → no disk prune 651ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1342ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 736ms
     ✓ a stale register stops the push before any gate runs 1062ms
     ✓ bkit check fails → the push stops before any gate runs 1521ms
     ✓ the dependency audit runs before any gate, when its script is present 1540ms
     ✓ no dependency-audit script → skipped, the gates still run 1124ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1170ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1712ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1085ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 798ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 988ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1278ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 947ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1108ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 910ms
     ✓ branch with no open PR → no check, push goes on 711ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 1469ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 954ms
     ✓ revert push of a branch with an open PR → no check 335ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 1608ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 561ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 774ms
     ✓ untrusted .envrc still prints the direnv allow line 562ms
     ✓ no .envrc → no direnv call 979ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2475ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2839ms
     ✓ base fetch fails → warns, gates run 3898ms
     ✓ dev push → no PR lookup 3395ms
     ✓ min push of a conflicting PR → blocked 4255ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 138032ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 4242ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 519ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2938ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 3395ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 2204ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1886ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 3128ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2746ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 5091ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 475ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1976ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1928ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 3308ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 2068ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2666ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 3541ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 3377ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 3320ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 3255ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 3106ms
       ✓ a branch with no status.jsonl dispatches as before 2816ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 3393ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 5465ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 3127ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2178ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 1161ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 571ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 598ms
     ✓ explicit `bkit help` prints the same usage and exits 0 553ms
     ✓ `bkit check --claude` (stray module flag) errors 594ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 576ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1258ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1317ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 658ms
     ✓ refuses a code conflict and aborts the rebase on the spot 678ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1120ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 650ms
     ✓ produces byte-identical output to merge=union 1457ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 902ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1526ms
     ✓ refuses a lockfile whose regenerate command fails 1404ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1192ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1143ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 755ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 896ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 956ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1047ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 764ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 625ms
       ✓ runs (0) with the landed path count once dev moved 1189ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 550ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1200ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1531ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2650ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 734ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1135ms
     ✓ --mode=abort pushes when the branch has no open PR 1659ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1370ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 465ms
     ✓ --open-pr carries the MCP answer and skips gh 692ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1149ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1876ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3948ms
     ✓ skip-ci HEAD on the replay is refused 1024ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2286ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1113ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1654ms
     ✓ a fetch that fails exits 10 672ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 1014ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 1064ms
     ✓ scan-diff attributes deletion to its old test ins… 914ms
     ✓ scan-diff consumes each moved assertion once and … 1081ms
     ✓ scan-diff does not match identical assertions fro… 999ms
     ✓ scan-diff does not match the same leaf test name … 1122ms
     ✓ scan-diff does not match a same-named test with d… 1029ms
     ✓ scan-diff does not match a same-named test with c… 967ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 954ms
     ✓ --paths with no match exits 1 859ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 682ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1348ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1172ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1060ms
     ✓ scan-diff ignores a removed comment in a test file 1012ms
     ✓ scan-diff ignores an assertion moved within the file 929ms
     ✓ scan-diff still reports a removed assertion 934ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1052ms
     ✓ scan-diff finds an added pytest mark skip 1204ms
     ✓ scan-diff finds an added unittest skip 1085ms
     ✓ scan-diff finds an added bare skip call 1105ms
     ✓ scan-diff ignores a quoted skip in a documentation file 960ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1072ms
     ✓ scan-diff ignores an assertion whose expectation changed 955ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 936ms
     ✓ scan-diff reports a deleted test file 1008ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 859ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 4962ms
     ✓ publishes local code with a CI running head before bookkeeping 7018ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 7398ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 4846ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 3133ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2105ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 2205ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1784ms
     ✓ --merge-docs skips an empty bkit:generate script 1780ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1394ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2538ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2682ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2189ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2255ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2996ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 2334ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1433ms
     ✓ exits 10 when the fetch fails 1025ms
     ✓ refuses --merge-docs with --head, and an unknown --head 996ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1601ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2880ms
     ✓ a failed install stops ship (16) 2161ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1876ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1718ms
     ✓ exits 10 when the fetch fails 1223ms
   ✓ shared landed comparison (5)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 870ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2157ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2022ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1798ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1136ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3280ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 549ms
     ✓ reports undeclared and runs nothing with an empty script 551ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 668ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 783ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 586ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 7260ms
     ✓ continues after the prepared completion source disappears 3969ms
     ✓ records preparation and session association failures despite successful delivery 4092ms
     ✓ associates startup and run across restart or starts fresh safely 5638ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 15433ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 382ms
     ✓ finishes a CI round only with its own failed job count 402ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 302ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 430ms
     ✓ reports a failed commit with exit 8 without writing the row 561ms
     ✓ a failed commit leaves no row staged in the index 616ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 623ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 486ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 460ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 427ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 638ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 316ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 351ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 578ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 964ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 538ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 80 lines omitted. Dropped content was NOT read.
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
     ✓ runs local gates only after current-generation remediation or soak 926ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 411ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 363ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 357ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 358ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 373ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 355ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 359ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 325ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 477ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 383ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 370ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 365ms
     ✓ PASS is 0 failures with or without reports 483ms
     ✓ clears a previous attempt's reports before the gate runs 362ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 343ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 488ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 862ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 639ms
     ✓ numbers runs within the workflow's active run and per step 879ms
     ✓ tests run --file records the tested snapshot on its test-run row 502ms
     ✓ a FAIL test-run row records each failing case as file and name 492ms
     ✓ a PASS test-run row records no failed tests 940ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 471ms
     ✓ without --file no row is written and the output carries row null 377ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 341ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1514ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1307ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1190ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 787ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 734ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 693ms
     ✓ a deleted file that no file mentions passes and the log says so 399ms
     ✓ a failed importer search runs the whole check 688ms
     ✓ --changed-since=feature-base starts at the feature's start commit 762ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 690ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 566ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 554ms
     ✓ a failing required push gate leaves the failed marker 589ms
     ✓ uncommitted code blocks the receipt until it is committed 761ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 567ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 511ms
     ✓ a planned test absent from a loaded report is a missing gap 494ms
     ✓ a file that fails to load is a red of kind red-not-loaded 858ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 626ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 820ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 625ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 575ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 752ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 663ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 692ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 917ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 504ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 676ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 510ms
     ✓ green: lists each gap kind, with the runner output 566ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 903ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 319ms
stdout | .bkit/core/engine/commands/install/check.integration.test.ts > dry-run-parity > check ≡ install writeset parity — claude (cross-module parity, v4-3) > check --claude writeset ≡ install --claude writeset
[bkit-check] [dry-run] Running core payload pass
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 2018ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 1355ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 1608ms
   ✓ #1053 — bkit check fails on a wrong entry for a rendered output (1)
     ✓ a wrong entry for a rendered mirror fails check and names the file, a wrong package.json entry does not 3364ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 3633ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 686ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 690ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 673ms
   ✓ cloud bootstrap fingerprint compare — adoption signal (1)
     ✓ bkit check reports a stale adopted cloud bootstrap with the template block to copy 668ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1486ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2095ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1229ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1214ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1306ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 823ms
     ✓ runs the full gate for replayed debug code 1323ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1559ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1470ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1509ms
     ✓ a push that fails without a server answer is returned once, never retried 1665ms
     ✓ a failed fetch is returned before anything is built 936ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3941ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2236ms
     ✓ lands from a clone whose fetch refspec omits dev 2157ms
     ✓ build throwing stops the landing and removes the throwaway checkout 594ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 505ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 517ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 546ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 481ms
     ✓ fetches the issue and its comments as GitHub returns them 560ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 468ms
     ✓ invalidates missing corrupt and unsupported progress cache 1003ms
     ✓ contains cache read and write failures as standalone degradation 501ms
     ✓ uses legacy receipts and contains receipt failures 886ms
     ✓ skips issue-less runs and tracker none 331ms
     ✓ records an engine-action row and skips the same key + body on a re-run 936ms
     ✓ a recent identical comment counts as done (the final close comment) 796ms
     ✓ a failed post reports done false with the reason and never leaks a token 416ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 483ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 355ms
     ✓ a different marker hash posts 369ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 453ms
stdout | .bkit/core/engine/install/modules/index.integration.test.ts > permissions-parity > cross-host gate parity — network allowlist > every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks
[test] core: .bkit/allowlist.json
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 312ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 317ms
     ✓ staging failure: exit 4 and no commit is created, no false success 318ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 501ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 736ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 31465ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1118ms
     ✓ names each net-new and worsened finding in the log and the JSON 1332ms
     ✓ fails on a net score rise with no net count change 975ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 837ms
     ✓ treats a net score at or below 0.001 as float noise 541ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 795ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 411ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 523ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 553ms
     ✓ exits 4 on a dropped net field instead of silently passing 552ms
     ✓ exits 4 on no summary instead of silently passing 542ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 809ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 813ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 912ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 768ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 379ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 345ms
     ✓ fails (exit 1) when vale reports alerts 361ms
     ✓ exits 6 on a vale runtime error 378ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 425ms
     ✓ falls back to vale sync when the main worktree has none 380ms
     ✓ fails when vale sync cannot restore the required styles 366ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 341ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 310ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 563ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 379ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 310ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 28214ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 1985ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1965ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2172ms
     ✓ does not fall back through a malformed later success receipt 1147ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 734ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 735ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 872ms
     ✓ a gate that has not finished leaves no failed receipt 581ms
     ✓ the restore step leaves another worktree's .failed file alone 534ms
     ✓ a pending attempt whose process is gone is not treated as running 2139ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 1598ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 434ms
     ✓ does not record a committed tree 464ms
     ✓ records no proof for a failed gate or lighter gate 816ms
     ✓ requires integration proof when integration is declared 995ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1749ms
> [bkit] TRUNCATED HERE — 412 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 579ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 366ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 716ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 398ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 406ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 392ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 413ms
     ✓ an unpinned repo reports nulls and asks no registry 400ms
   ✓ bkit repo preflight (4)
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 300ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 334ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 345ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 466 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 174 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 14359ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 578ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 399ms
     ✓ follows summary cursors even when the first page is shorter than the limit 494ms
     ✓ reports excluded intervals as unread even when pagination finishes 399ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 417ms
     ✓ reports an unread remainder at the page cap 387ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 361ms
     ✓ rejects missing summaries instead of treating them as empty results 345ms
     ✓ reports a failed first page as unavailable 330ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 397ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 378ms
     ✓ follows summary cursors even when the first page is shorter than the limit 454ms
     ✓ reports excluded intervals as unread even when pagination finishes 397ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 421ms
     ✓ reports an unread remainder at the page cap 365ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 370ms
     ✓ rejects missing summaries instead of treating them as empty results 328ms
     ✓ reports a failed first page as unavailable 317ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 11984ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 608ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 1177ms
       ✓ prints nothing to stdout when every recipe succeeds 1040ms
       ✓ logs and carries on when the installed bkit has no provision verb 426ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 433ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1340ms
     ✓ a refused dev push is logged, never fails the close 1722ms
     ✓ an unreachable remote is logged, never fails the close 579ms
stdout | .bkit/core/engine/install/template-copies.integration.test.ts > install copies the template set into .bkit/templates/ > copies exactly the set, raw, keeping each file's mode, with no hash record
[bkit-test] Running core payload pass
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 514 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 379ms
     ✓ writes zero files (purely read-only — write-set assertion) 385ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 429ms
     ✓ reports opencode as absent when .opencode/ does not exist 443ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 182 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (78 tests) 4540ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1344ms
     ✓ runGit names ENOBUFS when output passes the limit 789ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 832ms
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 164 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 515ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 533ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 310ms
stdout | .bkit/core/engine/install/payload-links.integration.test.ts > uninstall removes the payload view links > leaves a real directory at the link path alone — consumer content
[bkit-test] Running core payload pass
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 443 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 149ms
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 271ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-zuhlX2/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 146ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 178ms
 ✓ .bkit/core/engine/install/write.test.ts (85 tests) 146ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (63 tests) 198ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 82ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-WjcyAJ/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

(node:56661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:56661) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 112ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 115ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 61ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (49 tests | 3 skipped) 98ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 78ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 81ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (38 tests) 65ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 61ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 67ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 68ms
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

 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 29ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (38 tests) 62ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 67ms
 ✓ .bkit/core/engine/install/version-file.test.ts (42 tests) 34ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 55ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 47ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 41ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 35ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (14 tests) 27ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 32ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 23ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1795062885571.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1795062885574.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1795062885574.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1795062885581.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 21ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 19ms
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

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > records the fingerprint of its own domains list
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > moves the fingerprint when allowed-domains changes
[test] core: .bkit/allowlist.json
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 25ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (11 tests) 30ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 22ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (38 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 9ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 16ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 6ms

 Test Files  112 passed (112)
      Tests  7132 passed | 3 skipped (7135)
   Start at  14:25:39
   Duration  546.47s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1063-fix-loop-pause/build-holistic-gate-1.log.reports/vitest-87413.xml

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
✔ .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs (43.923458ms)
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
✔ scripts/ci/bkit-check-dependency-audit.test.mjs (41.707667ms)
✔ generates isolated workspaces for five hosts and refuses an existing destination (541.538292ms)
✔ reports an edited sentinel with no hook as unverified, never as before-edit delivery (62.594916ms)
✔ distinguishes acknowledgements before and after editing using fresh challenge tokens (275.757167ms)
✔ missing and incorrect tokens cannot prove full visibility; report does not disclose tokens (133.571ms)
✔ read tools and unrelated writes cannot trigger the armed edit challenge (145.016875ms)
✔ post-execution control stays after-execution even if acknowledgement is observed (119.495208ms)
✔ Antigravity accepts its camelCase payload and denies only the first default invocation (169.828ms)
✔ Cursor tests the legacy edit envelope separately from its shell envelope (154.747958ms)
✔ an after-execution acknowledgement with an unchanged sentinel never proves before-edit delivery (163.81775ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1845.877917

[bkit:gate:changed] named: bats tests/shell/bkit-gh-stub.bats
1..11
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

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/counters.test.ts .bkit/core/engine/commands/workflow/counters.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/counters.test.ts .bkit/core/engine/commands/workflow/counters.ts .bkit/version .bkit/workflows.md dist/commands/workflow/counters.js docs/plans/202611/1063-fix-loop-pause-plan.md docs/plans/202611/logs/1063-fix-loop-pause/build-brief-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-brief-tests-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-diff-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-diff-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-input-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-install-skills.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-check.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-gaps-remediate-1-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-tasks-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-tests-1-log.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-green-1-1.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-green-1-2.md docs/plans/202611/logs/1063-fix-loop-pause/build-tests-red-1-1.md docs/testing.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1063-fix-loop-pause
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3983 of 27682 lines (294 KB of 1.9 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
