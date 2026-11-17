
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/ledgers/journal.integration.test.ts .bkit/friction.jsonl dist/commands/workflow/ledgers.js docs/deferrals.jsonl docs/plans/202611/992-ledger-commands-six-plan.md docs/plans/202611/logs/992-ledger-commands-six/build-brief-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-brief-tests-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md docs/plans/202611/logs/992-ledger-commands-six/build-diff-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-2.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-4-log.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-4-log.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/992-ledger-commands-six/build-tests-green-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-4-1.md docs/plans/202611/logs/992-ledger-commands-six/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/ledgers/journal.integration.test.ts .bkit/friction.jsonl dist/commands/workflow/ledgers.js docs/deferrals.jsonl docs/plans/202611/992-ledger-commands-six-plan.md docs/plans/202611/logs/992-ledger-commands-six/build-brief-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-brief-tests-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md docs/plans/202611/logs/992-ledger-commands-six/build-diff-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-2.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-4-log.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-4-log.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/992-ledger-commands-six/build-tests-green-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-4-1.md docs/plans/202611/logs/992-ledger-commands-six/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six

 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 84285ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1752ms
   ✓ preserves the requested event for selected-workflow verification 867ms
   ✓ requires selected other-workflow success at the exact pushed head 1467ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1527ms
     ✓ saves the failed job count without the capstone job 535ms
     ✓ a CI selection keeps the failed job names, capstone left out 1125ms
     ✓ counts the capstone job when it is the only failed job 544ms
     ✓ saves no failed job count when no job failed 553ms
     ✓ filters branch and PR discovery by configured workflow and exact head 716ms
     ✓ freezes explicit workflow run attempt and all failed job pages 761ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1495ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1859ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 408ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 393ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 711ms
     ✓ rejects a workflow result count smaller than its returned records 547ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1230ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1420ms
     ✓ checks the named repository base and fails closed on missing evidence 800ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 665ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 691ms
     ✓ rejects MCP capstone jobs belonging to another run 934ms
     ✓ --fetch refreshes origin/<branch> before gating 464ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 448ms
       ✓ a source change past the validated head refuses (17) and names the path 368ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 358ms
       ✓ a validated sha that is not an ancestor refuses (17) 325ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 1159ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1422ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1075ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 301ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 720ms
     ✓ a failed re-trigger push names the cause in the log 1131ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1913ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1570ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 763ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 695ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 711ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 450ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 902ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 964ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 311ms
     ✓ CLI: verdict JSON, body scan, exit codes 769ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 538ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 315ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 316ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 321ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 324ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1118ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1301ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1308ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1270ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 497ms
     ✓ re-trigger on dev only uses the record of its own FID 547ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 598ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 641ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 319ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1211ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 317ms
       ✓ without --repo no call gains a --repo flag 393ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1571ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 346ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 309ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 304ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 341ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 606ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 1271ms
     ✓ debug: a failure test run is a failed run 1018ms
     ✓ debug: a timed_out test run is a failed run 1223ms
     ✓ debug: a startup_failure test run is a failed run 867ms
     ✓ debug: a test run still in progress or cancelled is not returned 1579ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 932ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 1193ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 2118ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 325ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 470ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 607ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 585ms
     ✓ --file and --step go together 498ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2538ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 534ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 571ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 529ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 567ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 548ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 615ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 525ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 636ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 640ms
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

 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 116770ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 2208ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 14839ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1378ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1021ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1086ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 2016ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1840ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2571ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1102ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 990ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 345ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1451ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1038ms
     ✓ design installs dependencies like build and debug 872ms
     ✓ plan installs dependencies like build and debug 1067ms
     ✓ design stops on a failed install (5) 930ms
     ✓ plan stops on a failed install (5) 1366ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1120ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1155ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1179ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1031ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2018ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3370ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 3218ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2368ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 2313ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 2376ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1465ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1729ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1632ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1623ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1975ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2295ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3133ms
     ✓ commits leftovers when a copy entry points outside the checkout 2530ms
     ✓ never commits the entries setup copies in from the main checkout 2423ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2082ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1051ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1092ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1362ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1323ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1319ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1400ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1449ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1797ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1989ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 819ms
     ✓ leaves a clean worktree's history alone 1907ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2426ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 2741ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2975ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3123ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 3218ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2623ms
     ✓ does not mark a resumed worktree it did not create 1116ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 311ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 682ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1263ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1789ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1282ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (187 tests) 119290ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 849ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 360ms
     ✓ --lock-held checks the lock is ours 315ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 386ms
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 522ms
     ✓ openDecision gate is null without the header 321ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 376ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 338ms
     ✓ aborts a rebase only when one is in progress 528ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 387ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 436ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 326ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 318ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 317ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 477ms
       ✓ counts subagents of an earlier chat the run's session rows name 504ms
       ✓ records no context block, and still closes, outside a Claude Code session 497ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 604ms
     ✓ records ending held and publish false on the workflow-done row 610ms
     ✓ defaults the close row to ending done 562ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 492ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 510ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 571ms
     ✓ always writes the telemetry, whatever the runtime 545ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 407ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 422ms
     ✓ an unwritable stats path is logged and never fails the close 494ms
     ✓ appends the completeness row before the workflow-done row 487ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 512ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 539ms
     ✓ writes one completeness row per close 851ms
     ✓ leaves out the previous run's rows that share a second with this run's start 523ms
     ✓ still closes when the completeness check throws 522ms
     ✓ still closes when the completeness row write throws 500ms
     ✓ ship: run.pr, size of the squash commit, and coverage 567ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 787ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 504ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 512ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 573ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 588ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 534ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 521ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 475ms
     ✓ --record-step writes the close step's row before workflow-done 365ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 425ms
     ✓ --number without --outbox is a usage error 419ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 580ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 544ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 597ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 642ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 555ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 334ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1551ms
     ✓ --flush with nothing to record commits and pushes nothing 868ms
     ✓ --flush carries the named worktree's logs into the dev commit 1545ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1827ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 593ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 487ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 986ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 605ms
       ✓ --ref, no push → route stop, no message 377ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 913ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1851ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2158ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1743ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2040ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1751ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1740ms
     ✓ --push on dev never carries a row whose references name another feature 1642ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1713ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3171ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2207ms
     ✓ --push commits in the named worktree, not the checkout it runs from 646ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1675ms
     ✓ preserves unlanded file deletions and ledger additions on close 3382ms
     ✓ preserves dirty work and uncertain branch evidence during close 3276ms
     ✓ preserves a local feature ref changed after its cleanup proof 3857ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2242ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1459ms
     ✓ a close that landed releases the lock 1983ms
     ✓ removes the worktree before it releases the lock 2094ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3002ms
       ✓ closePr refuses when the PR base is unknown 2625ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1760ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 638ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 374ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 1024ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 423ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 433ms
     ✓ a second run's record does not let this FID's close commit 506ms
     ✓ record is present after workflows close and before the push 960ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1762ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1669ms
       ✓ a run closed by workflow-failed keeps no parked copy 1988ms
       ✓ a run closed by workflow-done keeps no parked copy 1939ms
       ✓ a FAILED run gets no row 1906ms
       ✓ a DONE run gets no row 1991ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1745ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 334ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 364ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 762ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 483ms
     ✓ puts each --line after the summary, in flag order 563ms
     ✓ --summary prints the file and keeps a copy in --outbox 581ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 530ms
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

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 59053ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ design and plan in place on main are refused 304ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 870ms
     ✓ may debug in place on dev 467ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 890ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 825ms
     ✓ a new run of the same FID rewrites startSha 1462ms
     ✓ a resume of the same FID reuses the record 1260ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1575ms
       ✓ drops a commit id that is not on the branch 1449ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1490ms
       ✓ writes an empty commit list when the run has no run-commits row 1436ms
       ✓ ignores a row from before the open run started 1515ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1874ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1992ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1632ms
       ✓ ignores the row on origin/dev when the run there is closed 1890ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1569ms
         ✓ wins over the row on origin/dev, which is then not needed 1949ms
         ✓ wins over the row in the checkout's own log while the run is open 1692ms
         ✓ still drops a commit id that is not on the branch 2295ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1789ms
         ✓ is ignored when it was parked for another workflow 1757ms
         ✓ is removed once the record is rebuilt 1717ms
         ✓ is removed when the live record already stands for the open run 1576ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 900ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 791ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1180ms
     ✓ a stale record without a lock is replaced 1124ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 769ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2538ms
     ✓ names inherited commits and ship recovery in the refusal 571ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 610ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 677ms
   ✓ bkit worktrees remove (18)
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 664ms
       ✓ preserves staged-only mode during landed cleanup 758ms
       ✓ preserves staged-only type during landed cleanup 744ms
       ✓ preserves staged-only deletion during landed cleanup 757ms
       ✓ removes landed staged content when both index and working contents are on dev 806ms
       ✓ deletes the proved local and remote branch at their landed tips 899ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1319ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 342ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 398ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 550ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 69592ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 12443ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 2191ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 1820ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 1049ms
     ✓ node — with no report path the test file is left as it was 11461ms
     ✓ bats — with no report path the test file is left as it was 2355ms
     ✓ node — with no report path the test file is left as it was 1877ms
     ✓ vitest — with no report path the test file is left as it was 1146ms
     ✓ a run naming files of two kinds is refused as a usage error 529ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 721ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 972ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 474ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 455ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 754ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 655ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30684ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (79 tests) 130575ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 639ms
     ✓ install --claude does not write Serena or graphify examples 855ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 541ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 571ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 547ms
     ✓ bkit upgrade prints the adopted marker for a changed starter with a project copy 551ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 1799ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 1709ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 1817ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 3082ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3117ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 2730ms
     ✓ malformed .mcp.json fails install instead of being overwritten 548ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2836ms
     ✓ an adopted copy of every template survives upgrade and check 3201ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 3064ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 3196ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1090ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 4422ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 2672ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 2547ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 3668ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 2301ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 2436ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 3941ms
     ✓ branded script migration is idempotent and dry-run writes nothing 3795ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 2716ms
     ✓ a dry-run hook and CI token migration writes nothing 1323ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 3812ms
     ✓ a second check-name migration writes nothing 3226ms
     ✓ a dry-run check-name migration writes and moves nothing 1456ms
     ✓ a second Vale migration and a dry run write nothing 3770ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 2523ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 2173ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 2334ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 1727ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1519ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1668ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1638ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1592ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1646ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1579ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1901ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 2305ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 2220ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1269ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 357ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 347ms
     ✓ passes -w when the consumer is a pnpm workspace root 356ms
     ✓ starts the package runner for the install and the re-exec 768ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 310ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2188ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 2875ms
     ✓ migrates legacy ownership without changing project text or core ownership 3477ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 2033ms
     ✓ previews project document migration without mutating the checkout 1209ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 1998ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 841ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 309ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 417ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 307ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 321ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 354ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 309ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 307ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 422ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 325ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 318ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 732ms
     ✓ PASS is 0 failures with or without reports 411ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 310ms
   ✓ bkit tests run --artifact (5)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 433ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 859ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 649ms
     ✓ numbers runs within the workflow's active run and per step 879ms
     ✓ tests run --file records the tested snapshot on its test-run row 412ms
     ✓ a FAIL test-run row records each failing case as file and name 446ms
     ✓ a PASS test-run row records no failed tests 802ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 449ms
     ✓ without --file no row is written and the output carries row null 364ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 365ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1040ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1164ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 947ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1137ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1179ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 785ms
     ✓ a deleted file that no file mentions passes and the log says so 331ms
     ✓ a failed importer search runs the whole check 1125ms
     ✓ --changed-since=feature-base starts at the feature's start commit 829ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1009ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 734ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 802ms
     ✓ a failing required push gate leaves the failed marker 1126ms
     ✓ uncommitted code blocks the receipt until it is committed 770ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 526ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 841ms
     ✓ a planned test absent from a loaded report is a missing gap 395ms
     ✓ a file that fails to load is a red of kind red-not-loaded 536ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 910ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 706ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 632ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 411ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 615ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 510ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 535ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 698ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 477ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 611ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 471ms
     ✓ green: lists each gap kind, with the runner output 496ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 913ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 370ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 48838ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 407ms
     ✓ finishes a CI round only with its own failed job count 418ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 318ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 435ms
     ✓ reports a failed commit with exit 8 without writing the row 725ms
     ✓ a failed commit leaves no row staged in the index 437ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 909ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 946ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1008ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 797ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1184ms
   ✓ bkit steps finish (17)
     ✓ --commit=auto never stages a copied-in worktree.copy file 392ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 469ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 673ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 451ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 387ms
     ✓ refuses a code conflict and aborts the rebase on the spot 418ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1034ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 509ms
     ✓ produces byte-identical output to merge=union 1192ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 611ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1332ms
     ✓ refuses a lockfile whose regenerate command fails 729ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 869ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 850ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 466ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 535ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 743ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 953ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 503ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 448ms
       ✓ runs (0) with the landed path count once dev moved 738ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 380ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 754ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1272ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1710ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 484ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 881ms
     ✓ --mode=abort pushes when the branch has no open PR 1274ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1090ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 365ms
     ✓ --open-pr carries the MCP answer and skips gh 546ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 981ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1154ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2510ms
     ✓ skip-ci HEAD on the replay is refused 739ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1842ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 509ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 828ms
     ✓ a fetch that fails exits 10 408ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 533ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 451ms
     ✓ scan-diff attributes deletion to its old test ins… 465ms
     ✓ scan-diff consumes each moved assertion once and … 439ms
     ✓ scan-diff does not match identical assertions fro… 481ms
     ✓ scan-diff does not match the same leaf test name … 497ms
     ✓ scan-diff does not match a same-named test with d… 524ms
     ✓ scan-diff does not match a same-named test with c… 469ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 500ms
     ✓ --paths with no match exits 1 508ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 435ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 777ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 780ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 529ms
     ✓ scan-diff ignores a removed comment in a test file 556ms
     ✓ scan-diff ignores an assertion moved within the file 475ms
     ✓ scan-diff still reports a removed assertion 555ms
     ✓ scan-diff reports an assertion re-added only outside the test file 581ms
     ✓ scan-diff finds an added pytest mark skip 588ms
     ✓ scan-diff finds an added unittest skip 587ms
     ✓ scan-diff finds an added bare skip call 603ms
     ✓ scan-diff ignores a quoted skip in a documentation file 579ms
     ✓ scan-diff ignores a marker literal in a non-test source file 608ms
     ✓ scan-diff ignores an assertion whose expectation changed 585ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 590ms
     ✓ scan-diff reports a deleted test file 589ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 437ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3077ms
     ✓ publishes local code with a CI running head before bookkeeping 3728ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5045ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3043ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2041ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1491ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1372ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1237ms
     ✓ --merge-docs skips an empty bkit:generate script 1070ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 890ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1880ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2051ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1567ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1715ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2204ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 947ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 687ms
     ✓ exits 10 when the fetch fails 435ms
     ✓ refuses --merge-docs with --head, and an unknown --head 474ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 923ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1268ms
     ✓ a failed install stops ship (16) 1043ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 940ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 930ms
     ✓ exits 10 when the fetch fails 711ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 510ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2385ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2149ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1970ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1118ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3270ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 587ms
     ✓ reports undeclared and runs nothing with an empty script 608ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 730ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 825ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 619ms
[feat/test ab943f6] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 26502ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 1851ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1856ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2169ms
     ✓ does not fall back through a malformed later success receipt 1144ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 761ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 686ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 788ms
     ✓ a gate that has not finished leaves no failed receipt 612ms
     ✓ the restore step leaves another worktree's .failed file alone 495ms
     ✓ a pending attempt whose process is gone is not treated as running 1832ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 1367ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 373ms
     ✓ does not record a committed tree 447ms
     ✓ records no proof for a failed gate or lighter gate 741ms
     ✓ requires integration proof when integration is declared 910ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1782ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 29803ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 748ms
     ✓ names each net-new and worsened finding in the log and the JSON 732ms
     ✓ fails on a net score rise with no net count change 678ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 518ms
     ✓ treats a net score at or below 0.001 as float noise 686ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 745ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 371ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 521ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 667ms
     ✓ exits 4 on a dropped net field instead of silently passing 509ms
     ✓ exits 4 on no summary instead of silently passing 542ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 897ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 725ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 712ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 686ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 367ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 315ms
     ✓ fails (exit 1) when vale reports alerts 370ms
     ✓ exits 6 on a vale runtime error 365ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 431ms
     ✓ falls back to vale sync when the main worktree has none 375ms
     ✓ fails when vale sync cannot restore the required styles 359ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 320ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit ci min-push (22)
     ✓ exits 1 naming the files outside, whatever the commit message says 334ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 545ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 367ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 634ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1216ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1559ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1074ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1243ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1146ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 684ms
     ✓ runs the full gate for replayed debug code 1069ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1366ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1234ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1369ms
     ✓ a push that fails without a server answer is returned once, never retried 1166ms
     ✓ a failed fetch is returned before anything is built 421ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1910ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1381ms
     ✓ lands from a clone whose fetch refspec omits dev 1564ms
     ✓ build throwing stops the landing and removes the throwaway checkout 547ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 775ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 360ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 370ms
     ✓ explicit `bkit help` prints the same usage and exits 0 374ms
     ✓ `bkit check --claude` (stray module flag) errors 372ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 382ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 843ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 865ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 550ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 330ms
     ✓ retries a failed create once, and exits 5 when it fails twice 387ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 333ms
     ✓ prs open still opens against any other base 315ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 332ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 326ms
     ✓ exits 4 when gh errors and 80 when it needs auth 373ms
   ✓ bkit prs merge ship retry (4)
     ✓ returns an explicit terminal reason for other merge refusals 506ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 343ms
     ✓ runs no merge when the PR is already MERGED 345ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 469ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 388ms
     ✓ prs merge refuses when the PR base is unknown 352ms
     ✓ prs merge reads the base from the one pr view it already makes 386ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 301ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 376ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 365ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 303ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 430ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 323ms
     ✓ is not green when a check failed, naming it (exit 1) 468ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 456ms
     ✓ is not green on an empty rollup (total 0) 473ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 319ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 605ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 370ms
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 484ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 490ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 809ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 461ms
     ✓ fetches the issue and its comments as GitHub returns them 822ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 744ms
     ✓ invalidates missing corrupt and unsupported progress cache 870ms
     ✓ contains cache read and write failures as standalone degradation 351ms
     ✓ uses legacy receipts and contains receipt failures 335ms
     ✓ records an engine-action row and skips the same key + body on a re-run 334ms
   ✓ label writes (4)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 325ms
     ✓ a different marker hash posts 333ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 524ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests) 20961ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 21425ms
   ✓ the dispatch seam on a real worktree (7)
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 836ms
     ✓ a failing file absent at the base commit is the branch's 475ms
     ✓ an undeclared bkit:test:file reads unknown 413ms
     ✓ a failed base install reads unknown and removes the worktree 479ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 600ms
     ✓ copies the worktreeCopy entries into the base checkout 626ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3434ms
     ✓ a pull_request-event CI run at the base sha does not settle none 632ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 667ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 695ms
     ✓ the base test run does not inherit the hooks-off git config 732ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 385ms
     ✓ writes zero files (purely read-only — write-set assertion) 383ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 383ms
     ✓ reports opencode as absent when .opencode/ does not exist 369ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 433ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1447ms
     ✓ a refused dev push is logged, never fails the close 1563ms
     ✓ an unreachable remote is logged, never fails the close 552ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (25 tests) 8424ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 632ms
     ✓ counts files committed since --base 516ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 435ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 447ms
     ✓ runs the --fallback gate even when no file changed, as it did before 426ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4080ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1325ms
     ✓ runGit names ENOBUFS when output passes the limit 712ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 698ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 601ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 921ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 338ms
     ✓ challenge gate without --base sizes only the branch's own lines 488ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 2461ms
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
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 80278ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3147ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2260ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 3357ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1725ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1067ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 1897ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 1343ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 2522ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 931ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 856ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1234ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 920ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 791ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1550ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 1477ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 1331ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 1309ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 1334ms
       ✓ a branch with no status.jsonl dispatches as before 1118ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1697ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 2062ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1383ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1392ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 4300ms
     ✓ continues after the prepared completion source disappears 1820ms
     ✓ records preparation and session association failures despite successful delivery 1662ms
     ✓ associates startup and run across restart or starts fresh safely 3195ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 10678ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 895ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 569ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 450ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 688ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 513ms
     ✓ .husky/pre-push: first and last lines name the log 319ms
     ✓ .husky/pre-push: the hook body runs once 681ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 584ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 499ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 672ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 640ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 656ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 807ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 674ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 476ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 747ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 559ms
     ✓ .husky/pre-push: a gate fails → no disk prune 565ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 554ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 563ms
     ✓ a stale register stops the push before any gate runs 627ms
     ✓ bkit check fails → the push stops before any gate runs 445ms
     ✓ the dependency audit runs before any gate, when its script is present 483ms
     ✓ no dependency-audit script → skipped, the gates still run 446ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 546ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 495ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 857ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 555ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 677ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 570ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 637ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 586ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 505ms
     ✓ branch with no open PR → no check, push goes on 688ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 500ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 370ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 847ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 898ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 559ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 809ms
     ✓ untrusted .envrc still prints the direnv allow line 716ms
     ✓ no .envrc → no direnv call 522ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 1369ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1667ms
     ✓ base fetch fails → warns, gates run 1903ms
     ✓ dev push → no PR lookup 1498ms
     ✓ min push of a conflicting PR → blocked 1884ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 333ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 381ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 301ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 344ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ always writes the telemetry, whatever the runtime 365ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 357ms
     ✓ an unwritable stats path is logged and never fails the close 363ms
     ✓ appends the completeness row before the workflow-done row 402ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 383ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 392ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 548ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 346ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 330ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 473ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 427ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1201ms
     ✓ --flush with nothing to record commits and pushes nothing 654ms
     ✓ --flush carries the named worktree's logs into the dev commit 1191ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 2741ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1478ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1135ms
     ✓ a close that landed releases the lock 1509ms
     ✓ removes the worktree before it releases the lock 1506ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 1956ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1111ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 438ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 552ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1393ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1402ms
       ✓ a run closed by workflow-failed keeps no parked copy 1419ms
       ✓ a run closed by workflow-done keeps no parked copy 1304ms
       ✓ a FAILED run gets no row 1300ms
       ✓ a DONE run gets no row 1319ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1237ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 469ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1129ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1351ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1673ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1057ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 661ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 724ms
     ✓ plan installs dependencies like build and debug 699ms
     ✓ design stops on a failed install (5) 702ms
     ✓ plan stops on a failed install (5) 694ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 695ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1371ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 924ms
     ✓ reports a package manager that could not run (127) apart from a failed install 917ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2064ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1217ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1189ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1572ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1461ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1620ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1469ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1879ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 376ms
     ✓ refuses a code conflict and aborts the rebase on the spot 427ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1113ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 374ms
     ✓ produces byte-identical output to merge=union 947ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 394ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1623ms
     ✓ refuses a lockfile whose regenerate command fails 1376ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 618ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 658ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 389ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 440ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 585ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 829ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 474ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 411ms
       ✓ runs (0) with the landed path count once dev moved 755ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 392ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 817ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1339ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2021ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 484ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1117ms
     ✓ --mode=abort pushes when the branch has no open PR 855ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1083ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 454ms
     ✓ --open-pr carries the MCP answer and skips gh 624ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 686ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 783ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2370ms
     ✓ skip-ci HEAD on the replay is refused 500ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1439ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 451ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 692ms
     ✓ a fetch that fails exits 10 310ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 328ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 392ms
     ✓ scan-diff attributes deletion to its old test ins… 396ms
     ✓ scan-diff consumes each moved assertion once and … 382ms
     ✓ scan-diff does not match identical assertions fro… 357ms
     ✓ scan-diff does not match the same leaf test name … 375ms
     ✓ scan-diff does not match a same-named test with d… 378ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 389ms
     ✓ scan-diff ignores a removed comment in a test file 365ms
     ✓ scan-diff ignores an assertion moved within the file 330ms
     ✓ scan-diff still reports a removed assertion 368ms
     ✓ scan-diff reports an assertion re-added only outside the test file 374ms
     ✓ scan-diff finds an added pytest mark skip 411ms
     ✓ scan-diff finds an added unittest skip 347ms
     ✓ scan-diff finds an added bare skip call 371ms
     ✓ scan-diff ignores a quoted skip in a documentation file 375ms
     ✓ scan-diff ignores a marker literal in a non-test source file 379ms
     ✓ scan-diff ignores an assertion whose expectation changed 347ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 376ms
     ✓ scan-diff reports a deleted test file 381ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 312ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 2188ms
     ✓ publishes local code with a CI running head before bookkeeping 2290ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2990ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1832ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1324ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1037ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1020ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 785ms
     ✓ --merge-docs skips an empty bkit:generate script 588ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 500ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1045ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1327ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1205ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1040ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1132ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 750ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 526ms
     ✓ exits 10 when the fetch fails 331ms
     ✓ refuses --merge-docs with --head, and an unknown --head 367ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 714ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 890ms
     ✓ a failed install stops ship (16) 1062ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 473ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 520ms
     ✓ exits 10 when the fetch fails 547ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 388ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1470ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1430ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1348ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 857ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2049ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 463ms
     ✓ reports undeclared and runs nothing with an empty script 413ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 510ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 591ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 419ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1239ms
     ✓ saves the failed job count without the capstone job 365ms
     ✓ a CI selection keeps the failed job names, capstone left out 970ms
     ✓ counts the capstone job when it is the only failed job 358ms
     ✓ saves no failed job count when no job failed 415ms
     ✓ filters branch and PR discovery by configured workflow and exact head 872ms
     ✓ freezes explicit workflow run attempt and all failed job pages 360ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1159ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1131ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 810ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1011ms
     ✓ checks the named repository base and fails closed on missing evidence 525ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 492ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 518ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 615ms
     ✓ a failed re-trigger push names the cause in the log 813ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1168ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1099ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 628ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 614ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 565ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 395ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 735ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1023ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1000ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 420ms
     ✓ re-trigger on dev only uses the record of its own FID 490ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 493ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1223ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 518ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 632ms
     ✓ debug: a failure test run is a failed run 612ms
     ✓ debug: a timed_out test run is a failed run 536ms
     ✓ debug: a startup_failure test run is a failed run 553ms
     ✓ debug: a test run still in progress or cancelled is not returned 516ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 554ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 525ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1126ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 392ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 474ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 458ms
     ✓ --file and --step go together 369ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1976ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 395ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 410ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 394ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 456ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 471ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 491ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 476ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 698ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 463ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 478ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 481ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 476ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 340ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ PASS is 0 failures with or without reports 350ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 318ms
     ✓ a log under the outbox is named main-checkout relative in the record 307ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 680ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 613ms
     ✓ numbers runs within the workflow's active run and per step 1005ms
     ✓ tests run --file records the tested snapshot on its test-run row 550ms
     ✓ a FAIL test-run row records each failing case as file and name 360ms
     ✓ a PASS test-run row records no failed tests 676ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 358ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 511ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 455ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 772ms
     ✓ --since-pass-of skips failing runs and steps it does not name 900ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 656ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 463ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 438ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 489ms
     ✓ a deleted file that no file mentions passes and the log says so 303ms
     ✓ a failed importer search runs the whole check 537ms
     ✓ --changed-since=feature-base starts at the feature's start commit 687ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 466ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 397ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 408ms
     ✓ a failing required push gate leaves the failed marker 380ms
     ✓ uncommitted code blocks the receipt until it is committed 562ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 627ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 308ms
     ✓ a planned test absent from a loaded report is a missing gap 301ms
     ✓ a file that fails to load is a red of kind red-not-loaded 421ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 421ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 524ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 321ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 318ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 438ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 396ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 416ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 522ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 374ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 473ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 373ms
     ✓ green: lists each gap kind, with the runner output 386ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 677ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 42562ms
   ✓ bkit worktrees setup — debug (5)
> [bkit] TRUNCATED HERE — 73 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 161 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 6378ms
     ✓ records the failed job count and reads an uncounted local round as unknown 4383ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 3321ms
     ✓ finishes the first CI evidence round of the second debug run 1836ms
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 22389ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 598ms
     ✓ names each net-new and worsened finding in the log and the JSON 388ms
     ✓ fails on a net score rise with no net count change 377ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 388ms
     ✓ treats a net score at or below 0.001 as float noise 375ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 425ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 387ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 388ms
     ✓ exits 4 on a dropped net field instead of silently passing 395ms
     ✓ exits 4 on no summary instead of silently passing 377ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 609ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 554ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 528ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 523ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 533ms
     ✓ explicit globs can select ignored prose and nested checkout files 314ms
     ✓ fails (exit 1) when vale reports alerts 382ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 314ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 446ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 415ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 312ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 520ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 35797ms
   ✓ test-round completion evidence (3)
     ✓ finishes a CI round only with its own failed job count 307ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 306ms
     ✓ reports a failed commit with exit 8 without writing the row 571ms
     ✓ a failed commit leaves no row staged in the index 364ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 474ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 429ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 570ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 384ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 575ms
   ✓ bkit steps finish (17)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 384ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 334ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 519ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 305ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 629ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 787ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 674ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 885ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ writes the jira marker shape, taking the tracker from package.json 351ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 304ms
     ✓ retries a failed create once, and exits 5 when it fails twice 360ms
     ✓ exits 5 when the open-PR probe errors 310ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 327ms
   ✓ bkit prs probe ship entry (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ returns the open PR for the current branch, filtering by --base when given 311ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 314ms
     ✓ exits 4 when gh errors and 80 when it needs auth 305ms
   ✓ bkit prs merge ship retry (4)
     ✓ returns an explicit terminal reason for other merge refusals 385ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 317ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 600ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 886ms
   ✓ bkit prs update-branch (5)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ exits 80 without updating when gh cannot read dev's required checks 307ms
   ✓ bkit prs checks (7)
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 313ms
     ✓ is not green when a check failed, naming it (exit 1) 301ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 310ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 354ms
   ✓ bkit prs verbose-ci (4)
     ✓ strips the marker, with or without its bkit prefix 388ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 343ms
     ✓ invalidates missing corrupt and unsupported progress cache 649ms
     ✓ contains cache read and write failures as standalone degradation 382ms
     ✓ uses legacy receipts and contains receipt failures 302ms
     ✓ records an engine-action row and skips the same key + body on a re-run 303ms
   ✓ blockers (4)
> [bkit] TRUNCATED HERE — 422 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 182 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 131 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 15295ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 93 lines omitted. Dropped content was NOT read.
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
[bkit-install] write version pin: .bkit/version (6.2.0)

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (165 tests) 13648ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 6766ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 446ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 342ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 12818ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 875ms
     ✓ a failing file absent at the base commit is the branch's 506ms
     ✓ an undeclared bkit:test:file reads unknown 483ms
     ✓ a failed base install reads unknown and removes the worktree 516ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 634ms
     ✓ copies the worktreeCopy entries into the base checkout 637ms
     ✓ a base file run that writes no report reads unknown 636ms
     ✓ a passing CI run at the exact base sha settles none without a local run 407ms
     ✓ a CI run that cannot settle the base falls back to the local run 3347ms
     ✓ a pull_request-event CI run at the base sha does not settle none 650ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 618ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 692ms
     ✓ the base test run does not inherit the hooks-off git config 574ms
     ✓ adopt follows the run's runtimeWorktrees 1263ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 11956ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 434ms
     ✓ keeps each context's own section banner and drops every other context's 1027ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 463ms
   ✓ bkit context diff (10)
     ✓ --base narrows the range to the commits after a group's start sha 336ms
     ✓ diff from a group start covers only the group's commits 356ms
     ✓ an empty range writes a one-line note and zero numbers 304ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 440ms
     ✓ --reset-log empties the step's clamp log before the record lands 631ms
     ✓ whole: nothing omitted and no copy kept 315ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 361ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 549ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 604ms
     ✓ featureBase uses the origin/dev meeting point when there is no local dev 315ms
     ✓ context diff without --base leaves out an unpushed local dev commit 407ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 10529ms
   ✓ bkit runtime detect — the table (17)
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 332ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 517ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 353ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 525ms
     ✓ LOCAL -> runtimeHeadless=false 500ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 340ms
     ✓ UNKNOWN -> runtimeHeadless=false 684ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 597ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 534ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 320ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 540ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 310ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 591ms
     ✓ --file into a missing directory is refused, not created 769ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 7054ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 509ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 6421ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 705ms
     ✓ workflow progress command wiring progress specialized completion producers 2774ms
     ✓ workflow progress command wiring progress gate only completions 322ms
     ✓ progress excludes noncompletions 1571ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 7356ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 1852ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 1427ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 4075ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.integration.test.ts (14 tests) 3783ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 9365ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 560ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 790ms
     ✓ stops the step when the command crashed or was misused 1471ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2131ms
     ✓ ship gates on CI and merges the pinned head 4412ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 4216ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 649ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1022ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 353ms
     ✓ challenge gate without --base sizes only the branch's own lines 398ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 3251ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 305ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3010ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4039ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1320ms
     ✓ runGit names ENOBUFS when output passes the limit 686ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 664ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 2687ms
   ✓ bkit tasks currency (6)
     ✓ currency emits no hunk outside the matched set 331ms
     ✓ currency exits 0 with no hunks when no task matches 311ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 416ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 2291ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 436ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 2579ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 324ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1865ms
   ✓ runLines (5)
     ✓ counts deleted lines into changed 315ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 494ms
     ✓ is null when first is not an ancestor of last, or either is missing 340ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1933ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (301 tests) 586ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 910ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 463ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1559ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 267ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1689ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 120ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 228ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 191ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 352ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 75ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 111ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (20 tests) 136ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 76ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 65ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 63ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 53ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 49ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 21ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 46ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 33ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 30ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 40ms

 Test Files  63 passed (63)
      Tests  4874 passed (4874)
   Start at  07:34:23
   Duration  313.31s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/992-ledger-commands-six/build-holistic-gate-3.log.reports/vitest-11080.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/ledgers/journal.integration.test.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/ledgers.ts .bkit/core/engine/ledgers/journal.integration.test.ts .bkit/friction.jsonl dist/commands/workflow/ledgers.js docs/deferrals.jsonl docs/plans/202611/992-ledger-commands-six-plan.md docs/plans/202611/logs/992-ledger-commands-six/build-brief-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-brief-tests-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md docs/plans/202611/logs/992-ledger-commands-six/build-diff-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-holistic-gate-1-2.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-tasks-4-log.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-tests-4-log.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/992-ledger-commands-six/build-tests-green-4-1.md docs/plans/202611/logs/992-ledger-commands-six/build-tests-red-4-1.md docs/plans/202611/logs/992-ledger-commands-six/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/992-ledger-commands-six
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3140 of 17847 lines (225 KB of 1.2 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
