
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/worktrees.integration.test.ts dist/commands/workflow/branches.js docs/plans/202611/994-build-cannot-start-plan.md docs/plans/202611/logs/994-build-cannot-start/build-brief-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-brief-tests-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-diff-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-diff-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-plan-gaps-remediate-1-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-tasks-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-tests-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-tests-green-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-tests-green-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-tests-red-1-1.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/worktrees.integration.test.ts dist/commands/workflow/branches.js docs/plans/202611/994-build-cannot-start-plan.md docs/plans/202611/logs/994-build-cannot-start/build-brief-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-brief-tests-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-diff-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-diff-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-plan-gaps-remediate-1-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-tasks-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-tests-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-tests-green-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-tests-green-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-tests-red-1-1.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start

 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 49441ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 721ms
   ✓ preserves the requested event for selected-workflow verification 629ms
   ✓ requires selected other-workflow success at the exact pushed head 1158ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1080ms
     ✓ saves the failed job count without the capstone job 360ms
     ✓ a CI selection keeps the failed job names, capstone left out 700ms
     ✓ counts the capstone job when it is the only failed job 315ms
     ✓ saves no failed job count when no job failed 308ms
     ✓ filters branch and PR discovery by configured workflow and exact head 497ms
     ✓ freezes explicit workflow run attempt and all failed job pages 357ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 755ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 931ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 701ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 845ms
     ✓ checks the named repository base and fails closed on missing evidence 450ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 386ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 411ms
     ✓ rejects MCP capstone jobs belonging to another run 588ms
     ✓ --fetch refreshes origin/<branch> before gating 358ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 558ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 392ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1047ms
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 462ms
     ✓ a failed re-trigger push names the cause in the log 664ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 831ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 949ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 490ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 429ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 473ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 493ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 504ms
     ✓ CLI: verdict JSON, body scan, exit codes 387ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 636ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 796ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 738ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 728ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 341ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 390ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1145ms
   ✓ bkit runs revalidate (7)
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 935ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 468ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 490ms
     ✓ debug: a failure test run is a failed run 480ms
     ✓ debug: a timed_out test run is a failed run 692ms
     ✓ debug: a startup_failure test run is a failed run 472ms
     ✓ debug: a test run still in progress or cancelled is not returned 629ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 479ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 614ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1223ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 300ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 412ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 365ms
     ✓ --file and --step go together 307ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1613ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 308ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 328ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 321ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 404ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 359ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 366ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 387ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 399ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 380ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (67 tests) 80399ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 1206ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 8921ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 871ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 698ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 679ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 888ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1134ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1505ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 769ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 588ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 895ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 814ms
     ✓ design installs dependencies like build and debug 651ms
     ✓ plan installs dependencies like build and debug 662ms
     ✓ design stops on a failed install (5) 606ms
     ✓ plan stops on a failed install (5) 600ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 629ms
     ✓ tracks origin/feat/{fid} when only the remote has it 721ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 628ms
     ✓ reports a package manager that could not run (127) apart from a failed install 883ms
   ✓ bkit worktrees setup — mint (resume) (36)
     ✓ rebases onto origin/dev and clears a stale sentinel 1187ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 1908ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 2009ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1593ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1541ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1639ms
     ✓ a plan-closed branch with a leftover push (2)
       ✓ a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts 1861ms
       ✓ a code conflict beside the plan logs still stops the start, and the reason names the rule 1527ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1267ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1262ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1072ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1160ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1501ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1379ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1708ms
     ✓ commits leftovers when a copy entry points outside the checkout 1411ms
     ✓ never commits the entries setup copies in from the main checkout 1396ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1432ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 696ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 673ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 925ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 905ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 928ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 915ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 996ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1218ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1623ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 675ms
     ✓ leaves a clean worktree's history alone 1316ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1629ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1948ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2030ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1982ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 2179ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1908ms
     ✓ does not mark a resumed worktree it did not create 811ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 563ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 415ms
   ✓ bkit worktrees setup — the unpushed-dev check reads the checked-out branch as a branch (2)
     ✓ adopts plan on a branch named like a top-level path that carries no unpushed dev work 311ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 550ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 930ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1248ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 818ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (193 tests) 81022ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 430ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 335ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 329ms
       ✓ counts subagents of an earlier chat the run's session rows name 316ms
       ✓ records no context block, and still closes, outside a Claude Code session 320ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 343ms
     ✓ records ending held and publish false on the workflow-done row 320ms
     ✓ defaults the close row to ending done 328ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 354ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 316ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 301ms
     ✓ always writes the telemetry, whatever the runtime 306ms
     ✓ appends the completeness row before the workflow-done row 302ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 317ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 319ms
     ✓ writes one completeness row per close 589ms
     ✓ ship: run.pr, size of the squash commit, and coverage 350ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 480ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 306ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 302ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 409ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 394ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 387ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 324ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 352ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 316ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 310ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 368ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 453ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 323ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 931ms
     ✓ --flush with nothing to record commits and pushes nothing 528ms
     ✓ --flush carries the named worktree's logs into the dev commit 971ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1332ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1551ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1494ms
     ✓ closePr titles the PR by the record it carries 1541ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 400ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 335ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 850ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 341ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 446ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1096ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1078ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1010ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1248ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1083ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1028ms
     ✓ --push on dev never carries a row whose references name another feature 913ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 904ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1749ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1004ms
     ✓ --push commits in the named worktree, not the checkout it runs from 507ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1287ms
     ✓ preserves unlanded file deletions and ledger additions on close 2522ms
     ✓ preserves dirty work and uncertain branch evidence during close 2502ms
     ✓ preserves a local feature ref changed after its cleanup proof 2660ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1441ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1070ms
     ✓ a close that landed releases the lock 1397ms
     ✓ removes the worktree before it releases the lock 1300ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2010ms
       ✓ closePr refuses when the PR base is unknown 1860ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1131ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 445ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 635ms
     ✓ a second run's record does not let this FID's close commit 333ms
     ✓ record is present after workflows close and before the push 632ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1374ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1292ms
       ✓ a run closed by workflow-failed keeps no parked copy 1289ms
       ✓ a run closed by workflow-done keeps no parked copy 1243ms
       ✓ a FAILED run gets no row 1277ms
       ✓ a DONE run gets no row 1297ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1200ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 467ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 345ms
     ✓ puts each --line after the summary, in flag order 374ms
     ✓ --summary prints the file and keeps a copy in --outbox 347ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 362ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (103 tests) 43483ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (9)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 858ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 984ms
     ✓ says so when the adopted worktree has no hooks directory 522ms
     ✓ does not report a ~ hooks directory that exists 371ms
     ✓ names no package install for a missing hooks directory outside the checkout 402ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 414ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 513ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 547ms
     ✓ debug in place on dev from a linked worktree records its own checkout 530ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 507ms
     ✓ a new run of the same FID rewrites startSha 787ms
     ✓ a resume of the same FID reuses the record 585ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 817ms
       ✓ drops a commit id that is not on the branch 925ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 859ms
       ✓ writes an empty commit list when the run has no run-commits row 969ms
       ✓ ignores a row from before the open run started 957ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1229ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1185ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1150ms
       ✓ ignores the row on origin/dev when the run there is closed 1180ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1066ms
         ✓ wins over the row on origin/dev, which is then not needed 1232ms
         ✓ wins over the row in the checkout's own log while the run is open 1026ms
         ✓ still drops a commit id that is not on the branch 1067ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1053ms
         ✓ is ignored when it was parked for another workflow 1082ms
         ✓ is removed once the record is rebuilt 1087ms
         ✓ is removed when the live record already stands for the open run 911ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 456ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 447ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 632ms
     ✓ a stale record without a lock is replaced 636ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 534ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2017ms
     ✓ names inherited commits and ship recovery in the refusal 436ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 547ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 496ms
   ✓ bkit worktrees remove (20)
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 452ms
       ✓ preserves staged-only mode during landed cleanup 422ms
       ✓ preserves staged-only type during landed cleanup 448ms
       ✓ preserves staged-only deletion during landed cleanup 464ms
       ✓ removes landed staged content when both index and working contents are on dev 478ms
       ✓ deletes the proved local and remote branch at their landed tips 562ms
       ✓ retains the remote branch when origin refuses its conditional deletion 707ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 821ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 963ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 418ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 39469ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 719ms
   ✓ bkit tests run (14)
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 318ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 323ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ PASS is 0 failures with or without reports 335ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 527ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 307ms
     ✓ numbers runs within the workflow's active run and per step 521ms
     ✓ a PASS test-run row records no failed tests 519ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 430ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 411ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 367ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 766ms
     ✓ --since-pass-of skips failing runs and steps it does not name 862ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 672ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 483ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 476ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 542ms
     ✓ a failed importer search runs the whole check 466ms
     ✓ --changed-since=feature-base starts at the feature's start commit 527ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 438ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 373ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 370ms
     ✓ a failing required push gate leaves the failed marker 320ms
     ✓ uncommitted code blocks the receipt until it is committed 516ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 379ms
     ✓ only the required push gate records a receipt 424ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 444ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 337ms
     ✓ a file that fails to load is a red of kind red-not-loaded 362ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 374ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 482ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 312ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 641ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 327ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 432ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 532ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 431ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 402ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 426ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 518ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 386ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 487ms
       ✓ tests red records no from when no earlier task naming the test has a baseline 326ms
       ✓ a resumed tests red skips a taken-over entry 431ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 446ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 498ms
     ✓ green: a passed-accepted test is already landed, not a gap 310ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 301ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 311ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 391ms
       ✓ green leaves a changed test the plan no longer names out of changed 443ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 458ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 327ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 336ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 340ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 352ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 368ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 304ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 377ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 304ms
     ✓ green: lists each gap kind, with the runner output 304ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1132ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 313ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 28598ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 870ms
     ✓ runs code.ts through its declared gate in the built checkout 901ms
     ✓ runs code.ts through its declared gate in the built checkout 855ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 787ms
     ✓ runs an audit template's project-section change through bkit:gate:min 950ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 670ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 732ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 737ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 375ms
     ✓ runs the full gate for replayed debug code 695ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 800ms
     ✓ installs local dependencies against the built target tree 875ms
     ✓ runs the configured frozen install even without root dependencies 739ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 799ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 883ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 920ms
     ✓ never pushes local dev commits missing from origin/dev 924ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1648ms
     ✓ dev moved before every push: exhausted, nothing landed 2533ms
     ✓ any other refusal is returned, not retried 1187ms
     ✓ pushToDev replays a commit range onto origin/dev 850ms
     ✓ a replay retries on the new dev when dev moved 1526ms
     ✓ pushToDev log line names what it lands 901ms
     ✓ runs no git hooks in the throwaway checkout, and says so 769ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 763ms
     ✓ a push that fails without a server answer is returned once, never retried 649ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1706ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1175ms
     ✓ lands from a clone whose fetch refspec omits dev 866ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 15111ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 1829ms
     ✓ a foreign commit made mid-run never reaches the remote 1898ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 2004ms
     ✓ push from a level local dev is a plain push 1035ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 2028ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 1235ms
     ✓ two records on dev: each push selects its own FID's commits 1856ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 741ms
     ✓ close commit tree excludes foreign files 1146ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 1337ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 60568ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 10303ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 1585ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 1332ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 779ms
     ✓ node — with no report path the test file is left as it was 9461ms
     ✓ bats — with no report path the test file is left as it was 1529ms
     ✓ node — with no report path the test file is left as it was 1256ms
     ✓ vitest — with no report path the test file is left as it was 778ms
     ✓ a run naming files of two kinds is refused as a usage error 382ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 518ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 587ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 340ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 313ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 475ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 429ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30496ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests) 27456ms
   ✓ bkit steps done (24)
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 578ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 310ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 305ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 401ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 369ms
     ✓ writeStepRow refuses when a recorded path changed 420ms
     ✓ writeStepRow appends its commit sha to the record 349ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 490ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 405ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 318ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 416ms
     ✓ the tests step's finish passes its own group's and taken-over tests 351ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 326ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 383ms
     ✓ refuses a later code step that changes a BLOCKED change again 307ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 418ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 398ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 354ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 420ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 324ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 444ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 387ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 458ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 12036ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 542ms
     ✓ counts files committed since --base 376ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 510ms
     ✓ runs nothing and exits 0 when no file changed 306ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 513ms
     ✓ runs the --fallback gate even when no file changed, as it did before 504ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 309ms
     ✓ exits 4 when the gate could not run 509ms
     ✓ changed-since exits 81 with the holder read from the status file 509ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 512ms
     ✓ exits 1 when the gate exits 75 and writes no status file 579ms
   ✓ tests changed default base (8)
     ✓ lists a file the subagent committed after the last step-done commit 528ms
     ✓ lists the same file when it is left uncommitted 486ms
     ✓ leaves out a file only the previous step's own commit touched 543ms
     ✓ lists the subagent's file when a later commit sweeps in an uncommitted step-done row 530ms
     ✓ lists the subagent's committed file when another feature's run is also in progress 586ms
     ✓ on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit 525ms
     ✓ on an in-place shared-branch run with a second run in progress and a dirty status file leaves out another agent's commit 643ms
     ✓ lists the subagent's committed file on an adopted branch when another feature's run is also in progress 731ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (130 tests) 16729ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 477ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ stageTrackedUpdates skips recorded paths 335ms
     ✓ --path records its commit on the run's record, like every other commit mode 334ms
     ✓ a recorded ledger commits only the rows the run appended 488ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 578ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 537ms
     ✓ a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit 321ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 342ms
     ✓ under --mode=commit counts the squashed paths as something to commit 345ms
   ✓ bkit ledgers append --invocation (7)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 341ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (296 tests) 161858ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 328ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 343ms
     ✓ a refused --continue carries git's own reason 355ms
     ✓ refuses a code conflict and aborts the rebase on the spot 325ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 623ms
     ✓ produces byte-identical output to merge=union 664ms
     ✓ restores a trailing newline so the next append starts on its own line 445ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 399ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 501ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 388ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 629ms
     ✓ refuses a lockfile whose regenerate command fails 446ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 533ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 494ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 497ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 346ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 424ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 539ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 324ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 369ms
     ✓ removes a stale sentinel when the rebase succeeds 361ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 440ms
     ✓ resolves a conflict in each of two replayed commits across rounds 424ms
   ✓ branches rebase: plan-closed branch with a leftover push (7)
     ✓ takes the rebase target's copy of a plan log both sides added, and completes the rebase 397ms
     ✓ takes the target's copy in each round when the branch changed the plan log in a later commit 478ms
     ✓ completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit 434ms
     ✓ settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass 383ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 473ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 456ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 335ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 693ms
     ✓ runs exactly one git push 605ms
     ✓ --set-upstream records the upstream 310ms
     ✓ refuses with no branch checked out 325ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 619ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 969ms
     ✓ --require-ci pushes as-is when dev has not moved 421ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 727ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1049ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 555ms
     ✓ --mode=abort pushes when the branch has no open PR 491ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 586ms
     ✓ --open-pr carries the MCP answer and skips gh 332ms
     ✓ --mode=abort on dev pushes plainly without probing 334ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1067ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 551ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 653ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1692ms
     ✓ skip-ci HEAD on the replay is refused 448ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1076ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1370ms
     ✓ a level local dev is a plain push, recording nothing extra 540ms
     ✓ a record with no commits pushes nothing 374ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 734ms
     ✓ a rewritten branch is refused, never forced 414ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 635ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 523ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 483ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 435ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 586ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 536ms
     ✓ an up-to-date branch is a no-op 372ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 580ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 311ms
     ✓ scan-diff does not cancel a skip moved between am… 313ms
     ✓ scan-diff does not spend an unchanged duplicate t… 349ms
     ✓ scan-diff recognizes a renamed test file 352ms
     ✓ scan-diff recognizes a suite moved into a differe… 373ms
     ✓ scan-diff does not let unrelated additions hide a… 353ms
     ✓ scan-diff attributes deletion to its old test ins… 348ms
     ✓ scan-diff consumes each moved assertion once and … 348ms
     ✓ scan-diff does not match identical assertions fro… 353ms
     ✓ scan-diff does not match the same leaf test name … 384ms
     ✓ scan-diff does not match a same-named test with d… 385ms
     ✓ scan-diff does not match a same-named test with c… 360ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 361ms
     ✓ --paths with no match exits 1 321ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 453ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 454ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 333ms
     ✓ --marker reads a diff over 1 MiB 421ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 412ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 397ms
     ✓ scan-diff finds an added skip 406ms
     ✓ scan-diff ignores a skip predating the base 353ms
     ✓ scan-diff reports a disabled test with its line 390ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 364ms
     ✓ scan-diff ignores a removed comment in a test file 377ms
     ✓ scan-diff ignores an assertion moved within the file 384ms
     ✓ scan-diff still reports a removed assertion 370ms
     ✓ scan-diff reports an assertion re-added only outside the test file 374ms
     ✓ scan-diff finds an added pytest mark skip 413ms
     ✓ scan-diff finds an added unittest skip 389ms
     ✓ scan-diff finds an added bare skip call 373ms
     ✓ scan-diff ignores a quoted skip in a documentation file 375ms
     ✓ scan-diff ignores a marker literal in a non-test source file 380ms
     ✓ scan-diff ignores an assertion whose expectation changed 391ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 364ms
     ✓ scan-diff reports a deleted test file 385ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 925ms
     ✓ a title that already carries the marker is left alone 615ms
     ✓ with no open PR: pushes the marker commit and edits no title 666ms
     ✓ a re-run is deduped: no second marker commit 938ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 951ms
     ✓ --title-set skips gh entirely 424ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 890ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1716ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 976ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2088ms
     ✓ continues only the explicitly recorded target through the public merge command 1486ms
     ✓ fetches the unseen feature head before classifying the base 984ms
     ✓ fast forwards the feature before either base path is chosen 2105ms
     ✓ merges divergent feature tips without rebasing either side 1189ms
     ✓ continues the feature merge before starting a dev merge 1994ms
     ✓ publishes local code with a CI running head before bookkeeping 2275ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3104ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2210ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1406ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 343ms
     ✓ Path B once dev moved; --head checks a given commit 560ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 567ms
     ✓ --merge-docs merges dev when docs/ is behind 684ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 652ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 807ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 851ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 683ms
     ✓ --merge-docs skips an empty bkit:generate script 618ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 486ms
     ✓ --merge-docs never merges on dev itself 478ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 727ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 839ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 794ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 833ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 438ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1086ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 994ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1208ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 903ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 995ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1182ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 886ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 995ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 640ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 487ms
     ✓ exits 10 when the fetch fails 317ms
     ✓ refuses --merge-docs with --head, and an unknown --head 322ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 640ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 882ms
     ✓ a failed install stops ship (16) 795ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 713ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 678ms
     ✓ exits 10 when the fetch fails 507ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 386ms
     ✓ preserves unlanded file type changes in the shared landed comparison 400ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 793ms
     ✓ names only the file whose branch version never reached dev 829ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 855ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 847ms
     ✓ a path under a directory named : that dev never touched is not reported landed 337ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1659ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1509ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1339ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2094ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2977ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3511ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 541ms
     ✓ local: names unpushed dev as the cause when the branch carries it 638ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 750ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1658ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1521ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1089ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4818ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1263ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1327ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1161ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 750ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2285ms
     ✓ land removes the worktree when only the copied .env is untracked 1797ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1455ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1609ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2569ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1475ms
     ✓ landPr refuses a main-based PR without retrying 679ms
     ✓ landPr refuses when the PR base is unknown 649ms
     ✓ PR not open (closed): stops (17) at once, no retry 847ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 631ms
     ✓ --attempt names the merge round in a fix commit 584ms
     ✓ commits a rewritten and a deleted tracked file 605ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 515ms
     ✓ reports undeclared and runs nothing with no scripts 374ms
     ✓ reports undeclared and runs nothing with an empty script 374ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 452ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 549ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 371ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 510ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 500ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 548ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 528ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 8053ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section banner and drops every other context's 663ms
   ✓ bkit context diff (10)
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 308ms
     ✓ --reset-log empties the step's clamp log before the record lands 461ms
   ✓ featureBase (#960) (7)
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 422ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 425ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 8857ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 604ms
     ✓ a failing file absent at the base commit is the branch's 307ms
     ✓ a failed base install reads unknown and removes the worktree 337ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 433ms
     ✓ copies the worktreeCopy entries into the base checkout 436ms
     ✓ a base file run that writes no report reads unknown 430ms
     ✓ a CI run that cannot settle the base falls back to the local run 2373ms
     ✓ a pull_request-event CI run at the base sha does not settle none 478ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 434ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 453ms
     ✓ the base test run does not inherit the hooks-off git config 444ms
     ✓ adopt follows the run's runtimeWorktrees 942ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 15198ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 621ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 451ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 312ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 309ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2196ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 346ms
     ✓ resolves a pending ledger intent after its invocation is stale 372ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 5434ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 831ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1194ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 950ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (78 tests) 1869ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 2521ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 348ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 586ms
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 3445ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1305ms
     ✓ runGit names ENOBUFS when output passes the limit 476ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 453ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 4865ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 597ms
     ✓ workflow progress command wiring progress specialized completion producers 2231ms
     ✓ workflow progress command wiring progress gate only completions 341ms
     ✓ progress excludes noncompletions 915ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (48 tests) 2012ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 1652ms
   ✓ selected CI context evidence (3)
     ✓ accepts only matching complete CI receipts with nonempty logs 628ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 1843ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (90 tests) 1698ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 316ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1520ms
   ✓ runLines (5)
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 388ms
     ✓ is null when first is not an ancestor of last, or either is missing 322ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1397ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1646ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 836ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (329 tests) 340ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (4 tests) 714ms
   ✓ bkit tests jump (4)
     ✓ tests jump reports no match in the EXIT.NO style when the script finds none 336ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 491ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 187ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 41ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 57ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 26ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 5ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 26ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 4ms

 Test Files  40 passed (40)
   Affected  40 of 247 test files (related to 17 files)
      Tests  3063 passed (3063)
   Start at  21:23:09
   Duration  171.63s (tests 99%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/994-build-cannot-start/build-group-gate-1-2.log.reports/vitest-86974.xml

[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/templates/disk-prune-worktrees.integration.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/context.test.ts .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts .bkit/core/engine/commands/workflow/steps.test.ts .bkit/core/engine/commands/workflow/summary.test.ts .bkit/core/engine/commands/workflow/tasks.test.ts .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/shared/branches.test.ts

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (103 tests) 43923ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (9)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 945ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 1020ms
     ✓ says so when the adopted worktree has no hooks directory 539ms
     ✓ does not report a ~ hooks directory that exists 402ms
     ✓ names no package install for a missing hooks directory outside the checkout 401ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 408ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 531ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 549ms
     ✓ debug in place on dev from a linked worktree records its own checkout 614ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 545ms
     ✓ a new run of the same FID rewrites startSha 882ms
     ✓ a resume of the same FID reuses the record 787ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 972ms
       ✓ drops a commit id that is not on the branch 980ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 993ms
       ✓ writes an empty commit list when the run has no run-commits row 993ms
       ✓ ignores a row from before the open run started 929ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1113ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1200ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1087ms
       ✓ ignores the row on origin/dev when the run there is closed 1102ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 886ms
         ✓ wins over the row on origin/dev, which is then not needed 1004ms
         ✓ wins over the row in the checkout's own log while the run is open 960ms
         ✓ still drops a commit id that is not on the branch 1111ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1039ms
         ✓ is ignored when it was parked for another workflow 1144ms
         ✓ is removed once the record is rebuilt 1001ms
         ✓ is removed when the live record already stands for the open run 823ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 508ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 437ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 609ms
     ✓ a stale record without a lock is replaced 677ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 506ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1744ms
     ✓ names inherited commits and ship recovery in the refusal 413ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 497ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 469ms
   ✓ bkit worktrees remove (20)
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 501ms
       ✓ preserves staged-only mode during landed cleanup 447ms
       ✓ preserves staged-only type during landed cleanup 447ms
       ✓ preserves staged-only deletion during landed cleanup 493ms
       ✓ removes landed staged content when both index and working contents are on dev 546ms
       ✓ deletes the proved local and remote branch at their landed tips 680ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1329ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 862ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 955ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 385ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 44913ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 699ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 511ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 349ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 339ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ PASS is 0 failures with or without reports 341ms
   ✓ bkit tests run --artifact (5)
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 558ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 594ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 334ms
     ✓ numbers runs within the workflow's active run and per step 594ms
     ✓ tests run --file records the tested snapshot on its test-run row 339ms
     ✓ a FAIL test-run row records each failing case as file and name 320ms
     ✓ a PASS test-run row records no failed tests 611ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 327ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 456ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 400ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 871ms
     ✓ --since-pass-of skips failing runs and steps it does not name 812ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 611ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 740ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 741ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 431ms
     ✓ a failed importer search runs the whole check 463ms
     ✓ --changed-since=feature-base starts at the feature's start commit 834ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 688ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 668ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 396ms
     ✓ a failing required push gate leaves the failed marker 464ms
     ✓ uncommitted code blocks the receipt until it is committed 763ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 434ms
     ✓ only the required push gate records a receipt 543ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 488ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 352ms
     ✓ a planned test that passes is a vacuous gap, exit 1 520ms
     ✓ a file that fails to load is a red of kind red-not-loaded 547ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 434ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 479ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 439ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 568ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 312ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 416ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 521ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 421ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 384ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 395ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 473ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 407ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 550ms
       ✓ a resumed tests red skips a taken-over entry 379ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 624ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 536ms
     ✓ green: a passed-accepted test is already landed, not a gap 354ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 518ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 375ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 649ms
       ✓ green leaves a changed test the plan no longer names out of changed 584ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 545ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 304ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 343ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 510ms
     ✓ green: --group audits only that group's tasks 765ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 579ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 427ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 361ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 582ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 362ms
     ✓ green: lists each gap kind, with the runner output 348ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 804ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 5026ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 1474ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 998ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 2553ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 8042ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section banner and drops every other context's 696ms
   ✓ bkit context diff (10)
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 305ms
     ✓ --reset-log empties the step's clamp log before the record lands 464ms
   ✓ featureBase (#960) (7)
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 420ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 425ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 38ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 54ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (48 tests) 1903ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (38 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/disk-prune-worktrees.integration.test.ts (3 tests) 2284ms
   ✓ example repo step — leftover worktrees (3)
     ✓ removes what loses nothing, keeps what is in use, notes the rest 1965ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 3ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests) 29763ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 505ms
     ✓ a failed commit leaves no row staged in the index 321ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 522ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 367ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 556ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 321ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 714ms
   ✓ bkit steps finish (21)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 369ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 330ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 495ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 310ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 301ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 463ms
     ✓ writeStepRow refuses when a recorded path changed 535ms
     ✓ writeStepRow appends its commit sha to the record 457ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 596ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 337ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 314ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 309ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 499ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 351ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 443ms
     ✓ the tests step's finish passes its own group's and taken-over tests 301ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 307ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 359ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 392ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 427ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 317ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 385ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 319ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 413ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (67 tests) 80855ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 1486ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 9587ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 984ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 789ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 744ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 913ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1302ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1662ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 817ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 619ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 620ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 619ms
     ✓ design installs dependencies like build and debug 582ms
     ✓ plan installs dependencies like build and debug 903ms
     ✓ design stops on a failed install (5) 684ms
     ✓ plan stops on a failed install (5) 659ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 672ms
     ✓ tracks origin/feat/{fid} when only the remote has it 789ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 653ms
     ✓ reports a package manager that could not run (127) apart from a failed install 754ms
   ✓ bkit worktrees setup — mint (resume) (36)
     ✓ rebases onto origin/dev and clears a stale sentinel 1445ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 2301ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 2216ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1537ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1715ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1588ms
     ✓ a plan-closed branch with a leftover push (2)
       ✓ a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts 2033ms
       ✓ a code conflict beside the plan logs still stops the start, and the reason names the rule 1503ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1094ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1442ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1253ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1189ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1601ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1436ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1805ms
     ✓ commits leftovers when a copy entry points outside the checkout 1512ms
     ✓ never commits the entries setup copies in from the main checkout 1490ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1511ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 747ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 726ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 975ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1063ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 993ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1001ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1169ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1230ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1304ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 605ms
     ✓ leaves a clean worktree's history alone 1150ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1463ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1727ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1731ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1889ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 1994ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1419ms
     ✓ does not mark a resumed worktree it did not create 634ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 358ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 458ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 688ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 928ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 600ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (296 tests) 133280ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 424ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 426ms
     ✓ a refused --continue carries git's own reason 395ms
     ✓ refuses a code conflict and aborts the rebase on the spot 346ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 445ms
     ✓ produces byte-identical output to merge=union 672ms
     ✓ restores a trailing newline so the next append starts on its own line 406ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 379ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 562ms
     ✓ refuses a union that leaves a line which is not JSON 328ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 436ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 782ms
     ✓ refuses a lockfile whose regenerate command fails 545ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 598ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 569ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 536ms
     ✓ refuses and aborts when both sides changed the hand-written region 342ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 407ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 461ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 582ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 360ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 424ms
     ✓ refuses and aborts when a side deleted the install record 307ms
     ✓ refuses a conflicted doc the repo's script does not list 301ms
     ✓ removes a stale sentinel when the rebase succeeds 406ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 509ms
     ✓ resolves a conflict in each of two replayed commits across rounds 458ms
   ✓ branches rebase: plan-closed branch with a leftover push (7)
     ✓ takes the rebase target's copy of a plan log both sides added, and completes the rebase 343ms
     ✓ takes the target's copy in each round when the branch changed the plan log in a later commit 490ms
     ✓ completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit 447ms
     ✓ settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass 380ms
     ✓ refuses a code conflict beside the plan logs, leaving the plan log unresolved 309ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 459ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 456ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 330ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 388ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 935ms
     ✓ runs exactly one git push 736ms
     ✓ --set-upstream records the upstream 301ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 739ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1155ms
     ✓ --require-ci pushes as-is when dev has not moved 468ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 866ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1124ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 418ms
     ✓ --mode=abort pushes when the branch has no open PR 552ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 591ms
     ✓ --open-pr carries the MCP answer and skips gh 385ms
     ✓ --mode=abort on dev pushes plainly without probing 386ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1193ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 638ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 757ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2185ms
     ✓ skip-ci HEAD on the replay is refused 486ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1189ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1634ms
     ✓ a level local dev is a plain push, recording nothing extra 617ms
     ✓ a record with no commits pushes nothing 463ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 363ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 892ms
     ✓ a rewritten branch is refused, never forced 351ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 660ms
     ✓ refuses a detached HEAD (exit 5) 301ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 587ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 613ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 587ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 770ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 315ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 708ms
     ✓ an up-to-date branch is a no-op 453ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 729ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 401ms
     ✓ scan-diff still reports a new skip when its test … 377ms
     ✓ scan-diff reports a skip moved onto a different t… 358ms
     ✓ scan-diff does not cancel a skip moved between am… 388ms
     ✓ scan-diff does not spend an unchanged duplicate t… 368ms
     ✓ scan-diff recognizes a renamed test file 383ms
     ✓ scan-diff recognizes a suite moved into a differe… 346ms
     ✓ scan-diff does not let unrelated additions hide a… 335ms
     ✓ scan-diff attributes deletion to its old test ins… 394ms
     ✓ scan-diff consumes each moved assertion once and … 399ms
     ✓ scan-diff does not match identical assertions fro… 383ms
     ✓ scan-diff does not match the same leaf test name … 401ms
     ✓ scan-diff does not match a same-named test with d… 412ms
     ✓ scan-diff does not match a same-named test with c… 401ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 399ms
     ✓ --paths with no match exits 1 351ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 508ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 517ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 365ms
     ✓ --marker reads a diff over 1 MiB 412ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 497ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 441ms
     ✓ scan-diff finds an added skip 445ms
     ✓ scan-diff ignores a skip predating the base 399ms
     ✓ scan-diff reports a disabled test with its line 444ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 407ms
     ✓ scan-diff ignores a removed comment in a test file 489ms
     ✓ scan-diff ignores an assertion moved within the file 420ms
     ✓ scan-diff still reports a removed assertion 405ms
     ✓ scan-diff reports an assertion re-added only outside the test file 402ms
     ✓ scan-diff finds an added pytest mark skip 446ms
     ✓ scan-diff finds an added unittest skip 395ms
     ✓ scan-diff finds an added bare skip call 410ms
     ✓ scan-diff ignores a quoted skip in a documentation file 382ms
     ✓ scan-diff ignores a marker literal in a non-test source file 394ms
     ✓ scan-diff ignores an assertion whose expectation changed 377ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 362ms
     ✓ scan-diff reports a deleted test file 373ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 942ms
     ✓ a title that already carries the marker is left alone 607ms
     ✓ with no open PR: pushes the marker commit and edits no title 617ms
     ✓ a re-run is deduped: no second marker commit 708ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 760ms
     ✓ --title-set skips gh entirely 410ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 803ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1453ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 823ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1957ms
     ✓ continues only the explicitly recorded target through the public merge command 1377ms
     ✓ fetches the unseen feature head before classifying the base 746ms
     ✓ fast forwards the feature before either base path is chosen 1392ms
     ✓ merges divergent feature tips without rebasing either side 802ms
     ✓ continues the feature merge before starting a dev merge 1385ms
     ✓ publishes local code with a CI running head before bookkeeping 1511ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 1947ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1156ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 809ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 336ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 338ms
     ✓ --merge-docs merges dev when docs/ is behind 410ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 386ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 551ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 549ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 462ms
     ✓ --merge-docs skips an empty bkit:generate script 409ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 356ms
     ✓ --merge-docs never merges on dev itself 316ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 455ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 464ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 433ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 454ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 574ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 633ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 711ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 638ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 574ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 736ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 533ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 632ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 419ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 300ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 376ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 571ms
     ✓ a failed install stops ship (16) 501ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 393ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 375ms
   ✓ shared landed comparison (7)
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 449ms
     ✓ names only the file whose branch version never reached dev 481ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 434ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 520ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 948ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 927ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 846ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 964ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2008ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2317ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 351ms
     ✓ local: names unpushed dev as the cause when the branch carries it 406ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 430ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1079ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1122ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 870ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3786ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 853ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 983ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 923ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 735ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1277ms
     ✓ land removes the worktree when only the copied .env is untracked 1004ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 841ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 932ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1554ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 936ms
     ✓ landPr refuses a main-based PR without retrying 534ms
     ✓ landPr refuses when the PR base is unknown 516ms
     ✓ PR not open (closed): stops (17) at once, no retry 648ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 377ms
     ✓ --attempt names the merge round in a fix commit 348ms
     ✓ commits a rewritten and a deleted tracked file 350ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 315ms

 Test Files  14 passed (14)
      Tests  1273 passed (1273)
   Start at  21:26:01
   Duration  133.48s (tests 100%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/994-build-cannot-start/build-group-gate-1-2.log.reports/vitest-20503.xml

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts .bkit/core/engine/commands/workflow/worktrees.integration.test.ts dist/commands/workflow/branches.js docs/plans/202611/994-build-cannot-start-plan.md docs/plans/202611/logs/994-build-cannot-start/build-brief-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-brief-tests-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-diff-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-diff-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-plan-gaps-remediate-1-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-tasks-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-tests-1-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-tests-green-1-1.md docs/plans/202611/logs/994-build-cannot-start/build-tests-green-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-tests-red-1-1.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
