
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl dist/commands/workflow/workflows.js docs/deferrals.jsonl docs/plans/202611/1042-ship-s-pr-plan.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-4-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-4-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/1042-ship-s-pr/build-tests-green-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-4-1.md docs/plans/202611/logs/1042-ship-s-pr/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl dist/commands/workflow/workflows.js docs/deferrals.jsonl docs/plans/202611/1042-ship-s-pr-plan.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-4-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-4-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/1042-ship-s-pr/build-tests-green-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-4-1.md docs/plans/202611/logs/1042-ship-s-pr/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (103 tests) 98957ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (9)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 1885ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 1031ms
     ✓ the adopted linked worktree holds the log directory 455ms
     ✓ refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 380ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 1485ms
     ✓ says so when the adopted worktree has no hooks directory 916ms
     ✓ does not report a ~ hooks directory that exists 680ms
     ✓ names no package install for a missing hooks directory outside the checkout 656ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 714ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1069ms
     ✓ may debug in place on dev 647ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 1232ms
     ✓ debug in place on dev from a linked worktree records its own checkout 958ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 841ms
     ✓ a new run of the same FID rewrites startSha 1169ms
     ✓ a resume of the same FID reuses the record 1190ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1441ms
       ✓ drops a commit id that is not on the branch 1408ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1282ms
       ✓ writes an empty commit list when the run has no run-commits row 1466ms
       ✓ ignores a row from before the open run started 1254ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1814ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1799ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1463ms
       ✓ ignores the row on origin/dev when the run there is closed 2162ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1624ms
         ✓ wins over the row on origin/dev, which is then not needed 1943ms
         ✓ wins over the row in the checkout's own log while the run is open 2458ms
         ✓ still drops a commit id that is not on the branch 2071ms
         ✓ is ignored and removed when the checkout's log shows the run closed 3347ms
         ✓ is ignored when it was parked for another workflow 2127ms
         ✓ is removed once the record is rebuilt 4278ms
         ✓ is removed when the live record already stands for the open run 3573ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1433ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1437ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 2201ms
     ✓ a stale record without a lock is replaced 1856ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1106ms
     ✓ refuses inherited unpublished dev commits in every ship mode 6324ms
     ✓ names inherited commits and ship recovery in the refusal 1048ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1591ms
     ✓ ship names a missing feat branch 335ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1157ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 369ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 309ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 384ms
       ✓ checks no disk when there are no cleanup step files 338ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 304ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 591ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 381ms
     ✓ never commits an entry only the main checkout's copy list names 606ms
   ✓ bkit worktrees remove (20)
     ✓ preserves a marked worktree with uncommitted changes and its marker 494ms
     ✓ tells a caller inside the removed worktree where to cd 314ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 2057ms
       ✓ preserves staged-only mode during landed cleanup 933ms
       ✓ preserves staged-only type during landed cleanup 1403ms
       ✓ preserves staged-only deletion during landed cleanup 2449ms
       ✓ removes landed staged content when both index and working contents are on dev 1425ms
       ✓ deletes the proved local and remote branch at their landed tips 2156ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1613ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 1977ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 1767ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 394ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 715ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 492ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1846ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1247ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 110633ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 988ms
   ✓ preserves the requested event for selected-workflow verification 694ms
   ✓ requires selected other-workflow success at the exact pushed head 2194ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1859ms
     ✓ saves the failed job count without the capstone job 443ms
     ✓ a CI selection keeps the failed job names, capstone left out 907ms
     ✓ counts the capstone job when it is the only failed job 505ms
     ✓ saves no failed job count when no job failed 520ms
     ✓ filters branch and PR discovery by configured workflow and exact head 668ms
     ✓ freezes explicit workflow run attempt and all failed job pages 514ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1501ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1966ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 467ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 385ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 400ms
     ✓ rejects a workflow result count smaller than its returned records 472ms
     ✓ validates normalized fallback evidence against the requested identity 307ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1012ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1484ms
     ✓ checks the named repository base and fails closed on missing evidence 706ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 589ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 646ms
     ✓ rejects MCP capstone jobs belonging to another run 1010ms
     ✓ --fetch refreshes origin/<branch> before gating 369ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 549ms
       ✓ a source change past the validated head refuses (17) and names the path 345ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 364ms
       ✓ --validated without --month / --fid is a usage error (2) 306ms
       ✓ a validated sha that is not an ancestor refuses (17) 330ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 599ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 766ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1123ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 403ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1173ms
     ✓ a failed re-trigger push names the cause in the log 1052ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1308ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1459ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1741ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 559ms
     ✓ gh-error: every poll errored 418ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 926ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 932ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 1841ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1365ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 1339ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 431ms
     ✓ CLI: verdict JSON, body scan, exit codes 1356ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 2359ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 544ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 447ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 1007ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 1409ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 624ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 2492ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 2895ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 2182ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2071ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1002ms
     ✓ re-trigger on dev only uses the record of its own FID 2005ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1784ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 1045ms
   ✓ scanBody (8)
     ✓ flags [ci skip] inherited into the landed commit body 408ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 413ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 357ms
     ✓ --snapshot without --repo leaves its run list unscoped 317ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1331ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 662ms
       ✓ without --repo no call gains a --repo flag 519ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 2403ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 699ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 574ms
     ✓ refuses an unknown --reason 531ms
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 321ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 409ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 394ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 784ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 685ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 1598ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 810ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 965ms
     ✓ debug: a failure test run is a failed run 1397ms
     ✓ debug: a timed_out test run is a failed run 848ms
     ✓ debug: a startup_failure test run is a failed run 725ms
     ✓ debug: a test run still in progress or cancelled is not returned 1092ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 845ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 828ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1277ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 359ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1035ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2275ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1224ms
     ✓ --file and --step go together 1119ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3960ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 555ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 470ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 535ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 897ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 768ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 1208ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 1181ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 701ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 692ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (69 tests) 183800ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 1808ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 16971ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1174ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1013ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 833ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1180ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1539ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2103ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1083ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 736ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 356ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 779ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 865ms
     ✓ design installs dependencies like build and debug 1023ms
     ✓ plan installs dependencies like build and debug 887ms
     ✓ design stops on a failed install (5) 1149ms
     ✓ plan stops on a failed install (5) 926ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 772ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1148ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1413ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1178ms
   ✓ bkit worktrees setup — mint (resume) (38)
     ✓ rebases onto origin/dev and clears a stale sentinel 3523ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 5110ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 8119ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 4223ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 4263ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 5151ms
     ✓ a plan-closed branch with a leftover push (2)
       ✓ a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts 4535ms
       ✓ a code conflict beside the plan logs still stops the start, and the reason names the rule 3785ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2649ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 4191ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 3418ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1896ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3212ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 4472ms
     ✓ keeps a dangling untracked symlink among the dropped logs as a link, and still starts 3625ms
     ✓ keeps an untracked symlink to a folder among the dropped logs as a link, leaving the folder untouched 2504ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3102ms
     ✓ commits leftovers when a copy entry points outside the checkout 3015ms
     ✓ never commits the entries setup copies in from the main checkout 3724ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 3360ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1564ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 2180ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 4158ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 2882ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 2076ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 5441ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 6282ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 4831ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 4182ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 983ms
     ✓ leaves a clean worktree's history alone 2089ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2168ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3000ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2696ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3484ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 4388ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 3702ms
     ✓ does not mark a resumed worktree it did not create 1224ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 1487ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 935ms
   ✓ bkit worktrees setup — the unpushed-dev check reads the checked-out branch as a branch (2)
     ✓ adopts plan on a branch named like a top-level path that carries no unpushed dev work 605ms
     ✓ refuses plan on a branch whose name starts with a dash and leaves the file that name points at untouched 498ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 805ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 707ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1264ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1735ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1040ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 93396ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1303ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 1228ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 451ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 371ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 749ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 892ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 399ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 407ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 403ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1207ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 488ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 429ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 760ms
     ✓ PASS is 0 failures with or without reports 539ms
     ✓ clears a previous attempt's reports before the gate runs 819ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 663ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1030ms
     ✓ a log under the outbox is named main-checkout relative in the record 829ms
     ✓ a log small enough is copied whole: not clamped, raw null 567ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 773ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1305ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 935ms
     ✓ numbers runs within the workflow's active run and per step 1561ms
     ✓ tests run --file records the tested snapshot on its test-run row 872ms
     ✓ a FAIL test-run row records each failing case as file and name 840ms
     ✓ a PASS test-run row records no failed tests 3022ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 551ms
     ✓ without --file no row is written and the output carries row null 576ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 1487ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 673ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 647ms
     ✓ the nothing-to-run row records the tested snapshot 464ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1427ms
     ✓ --since-pass-of skips failing runs and steps it does not name 3776ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 5590ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1107ms
     ✓ --since-pass-of needs --file, --workflow and --changed-since 760ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1643ms
     ✓ changed-since refuses a sha that names no commit 1577ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1280ms
     ✓ a deleted file that no file mentions passes and the log says so 631ms
     ✓ a failed importer search runs the whole check 1193ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1561ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 382ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1136ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 721ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 875ms
     ✓ a failing required push gate leaves the failed marker 990ms
     ✓ uncommitted code blocks the receipt until it is committed 757ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 823ms
     ✓ only the required push gate records a receipt 577ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 667ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 559ms
     ✓ a planned test that passes is a vacuous gap, exit 1 869ms
     ✓ a planned test absent from a loaded report is a missing gap 466ms
     ✓ a file that fails to load is a red of kind red-not-loaded 667ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 810ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 314ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 947ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1050ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 444ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1118ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 630ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 902ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 994ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 840ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 885ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 626ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1252ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 889ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 871ms
       ✓ tests red records no from when no earlier task naming the test has a baseline 705ms
       ✓ a resumed tests red skips a taken-over entry 677ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 1058ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 924ms
     ✓ green: a passed-accepted test is already landed, not a gap 774ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 401ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 781ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 820ms
       ✓ green leaves a changed test the plan no longer names out of changed 774ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 586ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 790ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 431ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 512ms
     ✓ green: --group audits only that group's tasks 589ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 844ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 794ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 485ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 733ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 532ms
     ✓ green: lists each gap kind, with the runner output 695ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 838ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 383ms
       ✓ green clears an exception-only task from a human commit 303ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 93794ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 21665ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 9246ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 4745ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 2197ms
     ✓ node — with no report path the test file is left as it was 12946ms
     ✓ bats — with no report path the test file is left as it was 2777ms
     ✓ node — with no report path the test file is left as it was 2668ms
     ✓ vitest — with no report path the test file is left as it was 1279ms
     ✓ a run naming files of two kinds is refused as a usage error 639ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 1233ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 965ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 584ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 515ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 897ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 660ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30768ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 37498ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 4114ms
     ✓ a foreign commit made mid-run never reaches the remote 4050ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 4361ms
     ✓ push from a level local dev is a plain push 2694ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 4970ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 2646ms
     ✓ two records on dev: each push selects its own FID's commits 5530ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 2831ms
     ✓ close commit tree excludes foreign files 3393ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 2904ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (132 tests) 42823ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (28)
     ✓ modified ledger under the FID logdir is staged and committed 514ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 551ms
     ✓ brand-new untracked ledger is staged and committed 387ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 370ms
     ✓ path containing a space is staged and committed 449ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 350ms
     ✓ staging failure: exit 4 and no commit is created, no false success 367ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 703ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 449ms
     ✓ --mode=stage stages the sweep but creates no commit 325ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 982ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 715ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 703ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 392ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 429ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 365ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 387ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 349ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ stageTrackedUpdates skips recorded paths 1048ms
     ✓ --path records its commit on the run's record, like every other commit mode 989ms
     ✓ a recorded ledger commits only the rows the run appended 799ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1316ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1040ms
     ✓ commitBookkeeping refuses when a recorded path changed 755ms
     ✓ a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit 1023ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 992ms
     ✓ under --mode=commit counts the squashed paths as something to commit 914ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 514ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 304ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 450ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 320ms
   ✓ bkit ledgers only-bookkeeping (8)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 395ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 452ms
     ✓ a source file in the range: exit 7, path listed 353ms
     ✓ another FID's plan file in the range: exit 7 377ms
     ✓ from not an ancestor of to: exit 7 359ms
     ✓ unknown commit exits 3; a missing flag exits 2 336ms
   ✓ bkit ledgers triage (11)
     ✓ triage ignores another feature's deferral rows 365ms
     ✓ triage refuses a plan with no task blocks 336ms
     ✓ triage refuses a plan whose task blocks do not parse 386ms
   ✓ bkit ledgers append --invocation (7)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 890ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 632ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 792ms
     ✓ lands a standalone corrected candidate and reports the spend 485ms
     ✓ the correction-events file has mode 0600 453ms
     ✓ a correction-events file left at 0644 is 0600 after a corrected append 558ms
     ✓ issues the same operation for rows whose keys are reordered 823ms
   ✓ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 396ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 339ms
     ✓ a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 341ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 911ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 580ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 581ms
     ✓ is invisible to the record listing and removes by fid 564ms
   ✓ the bookkeeping sinks check month and fid for every caller (2)
     ✓ checkOnlyBookkeeping refuses a climbing fid from any caller 604ms
     ✓ commitBookkeeping refuses a climbing fid from any caller 463ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (175 tests) 70297ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 404ms
     ✓ finishes a CI round only with its own failed job count 365ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 445ms
     ✓ reports a failed commit with exit 8 without writing the row 726ms
     ✓ a failed commit leaves no row staged in the index 579ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 608ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 668ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 723ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 500ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 745ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 335ms
     ✓ --ref exits 3 when the ref does not carry the status file 304ms
     ✓ fails on a placeholder left in the artifact 343ms
     ✓ fails when the row's verdict differs from the artifact's 320ms
     ✓ fails when the row does not list the artifact, or carries another attempt 370ms
     ✓ fails on a missing artifact 319ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 311ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 405ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 389ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 550ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 891ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 636ms
     ✓ --post needs --number; without --post there is no tracker key 312ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 557ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 508ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 311ms
     ✓ --attempt-of checks the row carries the derived counter 527ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 2723ms
   ✓ bkit steps finish (12)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 388ms
     ✓ a fenced ## line under ## CRITICAL does not end the section 471ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 47776ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1774ms
     ✓ a failing file absent at the base commit is the branch's 1088ms
     ✓ no JUnit report reads unknown 413ms
     ✓ an undeclared bkit:test:file reads unknown 1089ms
     ✓ a failed base install reads unknown and removes the worktree 1248ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 1419ms
     ✓ copies the worktreeCopy entries into the base checkout 1365ms
     ✓ no origin/dev ref reads unknown 601ms
     ✓ a base file run that writes no report reads unknown 3060ms
     ✓ a missing required flag is a usage error 379ms
     ✓ a passing CI run at the exact base sha settles none without a local run 869ms
     ✓ a CI run that cannot settle the base falls back to the local run 7911ms
     ✓ a pull_request-event CI run at the base sha does not settle none 1299ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 1063ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 1840ms
     ✓ the base test run does not inherit the hooks-off git config 1494ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1599ms
     ✓ counts files committed since --base 930ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1704ms
     ✓ runs nothing and exits 0 when no file changed 928ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1427ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (133 tests) 24038ms
   ✓ bkit decisions apply --by=rerun (6)
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section banner and drops every other context's 5175ms
     ✓ a ci artifact keeps a section header that carries none of the base signal words 380ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 503ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 441ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 528ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 552ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 989ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1696ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 719ms
     ✓ challenge gate without --base sizes only the branch's own lines 746ms
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 7665ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 381ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1405ms
     ✓ runGit names ENOBUFS when output passes the limit 1198ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1320ms
> [bkit] TRUNCATED HERE — 87 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 390ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 395ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 324ms
     ✓ aborts a rebase only when one is in progress 601ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 591ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 618ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 438ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 520ms
     ✓ --max-exceeded says a handover is due without any sentinel 400ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 495ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 399ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 347ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 787ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 912ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 335ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 423ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 322ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 359ms
     ✓ skips an error file in the log folder that is a directory 331ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 341ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 380ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 426ms
     ✓ a debug run in SOAK mode always needs a handover 317ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 356ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 453ms
     ✓ an unwritable stats path is logged and never fails the close 385ms
     ✓ appends the completeness row before the workflow-done row 476ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 546ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 556ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 770ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 467ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 859ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 565ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 703ms
     ✓ --number without --outbox is a usage error 757ms
   ✓ bkit workflows handover (48)
     ✓ --push commits and pushes the record on the feature branch without a handover 747ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 543ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 483ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3568ms
     ✓ --flush with nothing to record commits and pushes nothing 2021ms
     ✓ --flush carries the named worktree's logs into the dev commit 2714ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 5063ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 4741ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 3451ms
     ✓ closePr titles the PR by the record it carries 3566ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 19971ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 5806ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 5715ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 4194ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 3274ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 5924ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 4761ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 6262ms
     ✓ --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 11895ms
     ✓ --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 16477ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a skill 3623ms
     ✓ --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 3233ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 5550ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3977ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3153ms
     ✓ a close that landed releases the lock 5706ms
     ✓ removes the worktree before it releases the lock 6363ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 504ms
     ✓ names the branch, not the remote-tracking ref, in each URL 477ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 564ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 848ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 2505ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 1018ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 4208ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 4432ms
       ✓ a run closed by workflow-failed keeps no parked copy 5829ms
       ✓ a run closed by workflow-done keeps no parked copy 4073ms
       ✓ a FAILED run gets no row 2646ms
       ✓ a DONE run gets no row 2596ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2600ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 324ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1712ms
     ✓ a missing summary file exits 13 before anything is written 386ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 432ms
     ✓ a folder outside the outbox sessions folder is kept 988ms
     ✓ without --session-dir prints no sessionRemoved 481ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 12322ms
     ✓ continues after the prepared completion source disappears 6957ms
     ✓ records preparation and session association failures despite successful delivery 6483ms
     ✓ associates startup and run across restart or starts fresh safely 17871ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 26813ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 1023ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 722ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 465ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 1118ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 847ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1231ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 567ms
     ✓ .husky/pre-push: first and last lines name the log 720ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1125ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 896ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 947ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1076ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1080ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1434ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 706ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 710ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 734ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 880ms
     ✓ .husky/pre-push: a gate fails → no disk prune 852ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 924ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 812ms
     ✓ a stale register stops the push before any gate runs 691ms
     ✓ bkit check fails → the push stops before any gate runs 691ms
     ✓ the dependency audit runs before any gate, when its script is present 709ms
     ✓ no dependency-audit script → skipped, the gates still run 717ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1031ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 942ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1478ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 846ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1146ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1205ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1736ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1064ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ branch with no open PR → no check, push goes on 755ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 385ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 751ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 552ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 672ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 1696ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 598ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 706ms
     ✓ untrusted .envrc still prints the direnv allow line 553ms
     ✓ no .envrc → no direnv call 1104ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2650ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2631ms
     ✓ base fetch fails → warns, gates run 4641ms
     ✓ dev push → no PR lookup 3818ms
     ✓ min push of a conflicting PR → blocked 4599ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
     ✓ openDecision gate ignores a Gate line below the header 450ms
     ✓ reads Test attempt from a tests pause 501ms
   ✓ bkit workflows fail (47)
     ✓ writes workflow-failed, releases its lock, and reports no handover 895ms
     ✓ writes no row when status.jsonl does not exist 1561ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 628ms
     ✓ aborts a rebase only when one is in progress 1227ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 2201ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1710ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 774ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 677ms
     ✓ --max-exceeded says a handover is due without any sentinel 848ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 545ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 796ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 697ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 370ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 606ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 355ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 363ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 475ms
     ✓ rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines 770ms
     ✓ redacts credentials beyond the tracker keys from the error and stderr files 697ms
     ✓ redacts token-shaped values that no environment variable holds from the error and stderr files 707ms
     ✓ redacts refresh_token and id_token values and the ghu_, ghr_, sk_live_, rk_live_, ASIA, AIza and npm_ prefixes 604ms
     ✓ redacts JSON-quoted access_token, refresh_token and id_token values and keeps their keys 521ms
     ✓ keeps npm_ environment names and ASIA- or AKIA-led words that are not token-shaped 1019ms
     ✓ scrubs the log folder of a linked worktree that sits outside the main checkout 629ms
     ✓ redacts a private-key body whose BEGIN or END line is missing from the error and stderr files 762ms
     ✓ skips an error or stderr file outside the run's log folder, names it in refusedFiles, and still records the failure 3245ms
     ✓ skips an error or stderr file that is a symbolic link to a file outside the log folder and leaves that file unchanged 2968ms
     ✓ skips a log-folder file other than {workflow}-error.md and {workflow}-stderr.md, such as status.jsonl 4266ms
     ✓ skips an error file it cannot rewrite, quotes none of it, and still records the failure 2911ms
     ✓ keeps the --error text and says on the Error line that the error file was skipped, and why 1301ms
     ✓ skips a stderr file in the log folder that is a hard link to a file outside it, and leaves that file unchanged 1326ms
     ✓ skips an error file in the log folder that is a directory 1112ms
     ✓ skips a stderr file in the log folder that is a FIFO, without waiting on it 1080ms
     ✓ skips a missing error file, still prints the comment and names it in refusedFiles 1453ms
     ✓ skips an error file that is a dangling symbolic link, still prints the comment and names it in refusedFiles 1065ms
     ✓ scrubs an AWS key ID followed by more letters, digits or an underscore 491ms
     ✓ redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files 614ms
     ✓ redacts the password of a URL with an empty user name from the error and stderr files 619ms
     ✓ redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files 745ms
     ✓ writes the stderr file with the checkout path made relative and the home directory as ~ 507ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 837ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 484ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 486ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 896ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 514ms
     ✓ bkit workflows fail treats an empty --next-step as absent 462ms
     ✓ a debug run in SOAK mode always needs a handover 639ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 852ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1232ms
     ✓ an unwritable stats path is logged and never fails the close 1535ms
     ✓ appends the completeness row before the workflow-done row 1598ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1518ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 1952ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2817ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1798ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 2277ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 1693ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 2493ms
     ✓ --number without --outbox is a usage error 1943ms
     ✓ --flush is ship only 1209ms
   ✓ bkit workflows handover (48)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 610ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 507ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3495ms
     ✓ --flush with nothing to record commits and pushes nothing 3121ms
     ✓ --flush carries the named worktree's logs into the dev commit 4911ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 5284ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 4990ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 4664ms
     ✓ closePr titles the PR by the record it carries 4874ms
     ✓ --flush refused by dev twice for one FID publishes the second record through a PR 22184ms
     ✓ --flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch 9760ms
     ✓ --flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record 8765ms
     ✓ --flush refused by dev does not merge a leftover tip that changes code 5305ms
     ✓ --flush refused by dev with gh pr create failing names the pushed ship-failed branch 5454ms
     ✓ --flush refused by dev links the handover comment at the pushed commit when the PR did not merge 5788ms
     ✓ --flush refused by dev keeps the unmerged handover link readable after the branch is deleted 6962ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a symlinked ledger 4889ms
     ✓ --flush refused by dev with a fork PR on the ship-failed branch name opens its own PR 7683ms
     ✓ --flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head 18987ms
     ✓ --flush refused by dev does not merge a leftover tip that adds a skill 6990ms
     ✓ --flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl 5476ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 8234ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4361ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2424ms
     ✓ a close that landed releases the lock 3199ms
     ✓ removes the worktree before it releases the lock 4146ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 578ms
     ✓ names the branch, not the remote-tracking ref, in each URL 393ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 355ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 640ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1100ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 585ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2944ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 3233ms
       ✓ a run closed by workflow-failed keeps no parked copy 3461ms
       ✓ a run closed by workflow-done keeps no parked copy 2645ms
       ✓ a FAILED run gets no row 3649ms
       ✓ a DONE run gets no row 3459ms
     ✓ failed handover from dev removes the record and keeps recorded paths 4064ms
   ✓ bkit workflows input (10)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 447ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 312ms
     ✓ a missing summary file exits 13 before anything is written 301ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 400ms
     ✓ without --session-dir prints no sessionRemoved 404ms
   ✓ bkit workflows start — the run's progress link (3)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 162772ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 5973ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 760ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 4393ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 5502ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 3017ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 2663ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 3970ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 3587ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 5769ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 695ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 2209ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2429ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 3161ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 3063ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 2972ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 3040ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 4259ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 4356ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 3777ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 3563ms
       ✓ a branch with no status.jsonl dispatches as before 3303ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 4153ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 5837ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 4304ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 3789ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 3117ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2730ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 4163ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 2037ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1712ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 2015ms
     ✓ plan installs dependencies like build and debug 1813ms
     ✓ design stops on a failed install (5) 1608ms
     ✓ plan stops on a failed install (5) 2516ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1487ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1956ms
     ✓ fails without minting when origin cannot be reached 321ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1550ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1570ms
   ✓ bkit worktrees setup — mint (resume) (38)
     ✓ rebases onto origin/dev and clears a stale sentinel 2826ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2422ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2777ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2284ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 3199ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3792ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 3944ms
     ✓ keeps a dangling untracked symlink among the dropped logs as a link, and still starts 4350ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 1056ms
     ✓ refuses a code conflict and aborts the rebase on the spot 833ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1244ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 947ms
     ✓ produces byte-identical output to merge=union 2066ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 2642ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2527ms
     ✓ refuses a lockfile whose regenerate command fails 1536ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2336ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 2361ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 1116ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1846ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1882ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 3963ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 2180ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 886ms
       ✓ runs (0) with the landed path count once dev moved 2230ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1059ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2663ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3165ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4195ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 902ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1190ms
     ✓ --mode=abort pushes when the branch has no open PR 1389ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2716ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1038ms
     ✓ --open-pr carries the MCP answer and skips gh 1446ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2386ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2430ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4834ms
     ✓ skip-ci HEAD on the replay is refused 1763ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3812ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 1649ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2623ms
     ✓ a fetch that fails exits 10 1008ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 1404ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 955ms
     ✓ scan-diff attributes deletion to its old test ins… 1904ms
     ✓ scan-diff consumes each moved assertion once and … 1448ms
     ✓ scan-diff does not match identical assertions fro… 1682ms
     ✓ scan-diff does not match the same leaf test name … 2223ms
     ✓ scan-diff does not match a same-named test with d… 2024ms
     ✓ scan-diff does not match a same-named test with c… 1300ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1311ms
     ✓ --paths with no match exits 1 1337ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 908ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1312ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1713ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1757ms
     ✓ scan-diff ignores a removed comment in a test file 1208ms
     ✓ scan-diff ignores an assertion moved within the file 1300ms
     ✓ scan-diff still reports a removed assertion 1833ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1813ms
     ✓ scan-diff finds an added pytest mark skip 1829ms
     ✓ scan-diff finds an added unittest skip 1687ms
     ✓ scan-diff finds an added bare skip call 1253ms
     ✓ scan-diff ignores a quoted skip in a documentation file 2152ms
     ✓ scan-diff ignores a marker literal in a non-test source file 2204ms
     ✓ scan-diff ignores an assertion whose expectation changed 1967ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1383ms
     ✓ scan-diff reports a deleted test file 1940ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 809ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 5094ms
     ✓ publishes local code with a CI running head before bookkeeping 5535ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 9746ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 5398ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 5181ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 3585ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 3027ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2872ms
     ✓ --merge-docs skips an empty bkit:generate script 1721ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1431ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2958ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 4596ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 3997ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2835ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3754ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1713ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1111ms
     ✓ exits 10 when the fetch fails 831ms
     ✓ refuses --merge-docs with --head, and an unknown --head 838ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1357ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2214ms
     ✓ a failed install stops ship (16) 2098ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1662ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1220ms
     ✓ exits 10 when the fetch fails 1243ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 954ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3685ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 4051ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3607ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 2591ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 6295ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 914ms
     ✓ reports undeclared and runs nothing with an empty script 749ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1053ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1318ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 834ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2664ms
     ✓ saves the failed job count without the capstone job 975ms
     ✓ a CI selection keeps the failed job names, capstone left out 2775ms
     ✓ counts the capstone job when it is the only failed job 1310ms
     ✓ saves no failed job count when no job failed 1542ms
     ✓ counts fallback evidence jobs without the capstone job 337ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 321ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1002ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1226ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2204ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2832ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2508ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2455ms
     ✓ checks the named repository base and fails closed on missing evidence 1355ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1116ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1575ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 523ms
       ✓ a source change past the validated head refuses (17) and names the path 655ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 783ms
       ✓ --validated without --month / --fid is a usage error (2) 596ms
       ✓ a validated sha that is not an ancestor refuses (17) 626ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 712ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1132ms
     ✓ a failed re-trigger push names the cause in the log 1844ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2109ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2711ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1105ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 581ms
     ✓ gh-error: every poll errored 716ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1166ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1410ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 929ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1626ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 443ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 586ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 441ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 564ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1910ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2516ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 932ms
     ✓ re-trigger on dev only uses the record of its own FID 1277ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1433ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 384ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 557ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 423ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 353ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 976ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 983ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 1396ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 2985ms
     ✓ debug: a failure test run is a failed run 1340ms
     ✓ debug: a timed_out test run is a failed run 1214ms
     ✓ debug: a startup_failure test run is a failed run 1221ms
     ✓ debug: a test run still in progress or cancelled is not returned 1141ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1293ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 1043ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1784ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 651ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 1251ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1453ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1685ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1647ms
     ✓ --file and --step go together 1259ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 6931ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 1847ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 1584ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 1584ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 1737ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 1721ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 1756ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 2133ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 13160ms
     ✓ records the failed job count and reads an uncounted local round as unknown 9643ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 6735ms
     ✓ finishes the first CI evidence round of the second debug run 5613ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1228ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 670ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 948ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 999ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 529ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 754ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 583ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 575ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 447ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 649ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 539ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 518ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 468ms
     ✓ PASS is 0 failures with or without reports 812ms
     ✓ clears a previous attempt's reports before the gate runs 563ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1029ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 589ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1782ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 658ms
     ✓ numbers runs within the workflow's active run and per step 1402ms
     ✓ tests run --file records the tested snapshot on its test-run row 894ms
     ✓ a FAIL test-run row records each failing case as file and name 646ms
     ✓ a PASS test-run row records no failed tests 1857ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 1427ms
     ✓ without --file no row is written and the output carries row null 1064ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 958ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 2692ms
     ✓ --since-pass-of skips failing runs and steps it does not name 3436ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 2254ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1800ms
     ✓ --since-pass-of needs --file, --workflow and --changed-since 319ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1558ms
     ✓ changed-since refuses a sha that names no commit 656ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1594ms
     ✓ a deleted file that no file mentions passes and the log says so 1030ms
     ✓ a failed importer search runs the whole check 1657ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1724ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 550ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a passing required push gate records a receipt 1014ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 1083ms
     ✓ a failing required push gate leaves the failed marker 954ms
     ✓ uncommitted code blocks the receipt until it is committed 1664ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1308ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 1167ms
     ✓ a planned test absent from a loaded report is a missing gap 703ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1044ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1047ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 558ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1560ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 707ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 848ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1039ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 1243ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1100ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1705ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 1233ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1089ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 807ms
     ✓ green: lists each gap kind, with the runner output 1052ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2126ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 789ms
       ✓ green clears an exception-only task from a human commit 691ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (103 tests) 190509ms
   ✓ bkit worktrees setup — adopt in place (10)
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 393ms
     ✓ fails with a fetch error when there is no origin to rebase onto 710ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 532ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 622ms
     ✓ tells a caller inside the removed worktree where to cd 600ms
     ✓ fails with its own exit code when git cannot remove a marked path 635ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 2412ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (103 tests) 105672ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1575ms
     ✓ names each net-new and worsened finding in the log and the JSON 1041ms
     ✓ fails on a net score rise with no net count change 1045ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 985ms
     ✓ treats a net score at or below 0.001 as float noise 1311ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 824ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 484ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1074ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1153ms
     ✓ exits 4 on a dropped net field instead of silently passing 1213ms
     ✓ exits 4 on no summary instead of silently passing 1212ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2062ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 3306ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1923ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2620ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 948ms
     ✓ explicit globs can select ignored prose and nested checkout files 1351ms
     ✓ fails closed when the git index cannot be read 317ms
     ✓ fails closed when a selected prose source cannot be read 383ms
     ✓ fails when vale is not installed 341ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 672ms
     ✓ fails (exit 1) when vale reports alerts 615ms
     ✓ exits 6 on a vale runtime error 693ms
     ✓ skips with exit 0 when no file matches 416ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 721ms
     ✓ falls back to vale sync when the main worktree has none 1124ms
     ✓ fails when vale sync cannot restore the required styles 698ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 1023ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 731ms
     ✓ is a usage error when the commit cannot be read 633ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 904ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 1025ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1030ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1854ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1829ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 962ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 1197ms
     ✓ finishes a CI round only with its own failed job count 912ms
     ✓ preserves local clamp enforcement when completing test rounds 390ms
   ✓ progress command output (4)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ carries extra fields, parsed as JSON when they are JSON 765ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 342ms
     ✓ rejects ["--failures=-1"] 319ms
     ✓ rejects ["--field=verdict=PASS"] 313ms
     ✓ rejects ["--status=SKIPPED"] 318ms
     ✓ reports a failed commit with exit 8 without writing the row 962ms
     ✓ a failed commit leaves no row staged in the index 1319ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1553ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1193ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1209ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1161ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1286ms
   ✓ bkit steps verdict (11)
     ✓ empty artifact exits 0 551ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1119ms
     ✓ fails when no row was written for the step 318ms
     ✓ --ref reads the status file as committed on that ref, not from disk 794ms
     ✓ --ref exits 3 when the ref does not carry the status file 996ms
     ✓ fails on a placeholder left in the artifact 1127ms
     ✓ fails when the row's verdict differs from the artifact's 1281ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1072ms
     ✓ fails on a missing artifact 537ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 682ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a row missing its attempt 311ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 315ms
     ✓ fails a diagnose row missing its strategy, passes with it 814ms
     ✓ fails a run-tests row missing its scope, and an empty scope 845ms
     ✓ steps finish records attempt and scope on a build-holistic-gate row 311ms
   ✓ bkit steps finish (21)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 1001ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1816ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1236ms
     ✓ --post needs --number; without --post there is no tracker key 521ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 378ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 693ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 345ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1734ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1084ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 873ms
       ✓ gate --issue without --fid is a usage error 427ms
       ✓ gate --issue="" under none keeps today's check 563ms
     ✓ --attempt-of checks the row carries the derived counter 1118ms
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1652ms
   ✓ bkit steps finish (12)
     ✓ checks Failures against the ## CRITICAL items and ignores OPTIONAL ones 329ms
     ✓ does not count a fenced line under ## CRITICAL as an item 359ms
stdout | .bkit/core/engine/install/modules/index.integration.test.ts > permissions-parity > cross-host gate parity — network allowlist > every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 41364ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1718ms
     ✓ counts files committed since --base 960ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1537ms
     ✓ runs nothing and exits 0 when no file changed 1068ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1581ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section banner and drops every other context's 2513ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 419ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 311ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 666ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 622ms
     ✓ staging failure: exit 4 and no commit is created, no false success 443ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 879ms
     ✓ a --fid that climbs out of the log folder is refused and commits nothing 413ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 652ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 1069ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (7)
     ✓ stageTrackedUpdates skips recorded paths 1356ms
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1817ms
     ✓ a failing file absent at the base commit is the branch's 882ms
     ✓ no JUnit report reads unknown 410ms
     ✓ an undeclared bkit:test:file reads unknown 974ms
     ✓ a failed base install reads unknown and removes the worktree 1524ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 1356ms
     ✓ copies the worktreeCopy entries into the base checkout 1142ms
     ✓ no origin/dev ref reads unknown 506ms
     ✓ a base file run that writes no report reads unknown 1301ms
     ✓ a missing required flag is a usage error 350ms
     ✓ a passing CI run at the exact base sha settles none without a local run 828ms
     ✓ a CI run that cannot settle the base falls back to the local run 5462ms
     ✓ a pull_request-event CI run at the base sha does not settle none 873ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 779ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 877ms
     ✓ the base test run does not inherit the hooks-off git config 928ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 1161ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1180ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1381ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1740ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 340ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 401ms
     ✓ retries a failed create once, and exits 5 when it fails twice 535ms
     ✓ exits 5 when the open-PR probe errors 384ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 409ms
     ✓ prs open still opens against any other base 386ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 362ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 535ms
     ✓ exits 4 when gh errors and 80 when it needs auth 534ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 401ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 370ms
     ✓ runs no merge when the PR is already MERGED 368ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 615ms
     ✓ prs merge refuses a PR whose base is main 570ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 459ms
     ✓ prs merge refuses when the PR base is unknown 531ms
     ✓ prs merge reads the base from the one pr view it already makes 425ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 333ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 491ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 670ms
     ✓ never reads dev's required checks without --only-if-required 688ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 375ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 785ms
     ✓ is not green when a check failed, naming it (exit 1) 650ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 353ms
     ✓ is not green on an empty rollup (total 0) 320ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 330ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 575ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 352ms
> [bkit] TRUNCATED HERE — 392 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 454 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
     ✓ starts only new source after overflow or missing source 316ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 318ms
     ✓ reserves new comment opportunity within total delivery budget 748ms
     ✓ attempts independent attention after routine uncertainty 322ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 712ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 618ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 424ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 654ms
     ✓ fetches the issue and its comments as GitHub returns them 814ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 779ms
     ✓ invalidates missing corrupt and unsupported progress cache 1283ms
     ✓ contains cache read and write failures as standalone degradation 548ms
     ✓ uses legacy receipts and contains receipt failures 554ms
     ✓ records an engine-action row and skips the same key + body on a re-run 574ms
     ✓ a recent identical comment counts as done (the final close comment) 445ms
     ✓ a failed post reports done false with the reason and never leaks a token 564ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 660ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 371ms
     ✓ a different marker hash posts 409ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 381ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 22808ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
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
> [bkit] TRUNCATED HERE — 128 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (168 tests) 19528ms
   ✓ MED-5: first-install advisory block has no broken backslash-escape sequences (2)
     ✓ advisory action for first-install is plain text (copy-paste safety) 423ms
   ✓ bkit-source `.agents/{rules,docs,skills}.md` must not leak to consumers (2)
     ✓ rules.md is reachable via the templates pass — no additive leak path 302ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 8914ms
   ✓ #1053 — a core install run re-records rendered outputs and drops .agents/ entries (3)
     ✓ re-records a stale entry for a rendered output whose file is already current 311ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 694ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 588ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 25792ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ github reads "ISSUE-12 needs work" as issue 12 408ms
     ✓ github reads "see o/r#12" as issue 12 301ms
     ✓ github reads "(#12)" as issue 12 362ms
     ✓ github: "12" names no issue (source none) 402ms
     ✓ github: "fix it in 12 steps" names no issue (source none) 490ms
     ✓ jira: "https://github.com/o/r/issues/12" names no issue (source none) 525ms
     ✓ none: "#12 and ABC-12" names no issue (source none) 327ms
     ✓ an explicit form wins over a bare mention, with a warning naming the other 546ms
     ✓ github: "priority #1, then GitHub issue: #677" reads as issue 677 450ms
     ✓ github: "set color: #123456 for the header, see #677" reads as issue 677 387ms
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 365ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 501ms
     ✓ github with origin O/r: "see https://github.com/Other/Repo/issues/9" reads as "" 310ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1220ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 349ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 398ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 511ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 366ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 360ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (102 tests) 11709ms
   ✓ bkit issues labels (25)
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 316ms
   ✓ bkit issues comment (34)
     ✓ renders header fields in the order the flags were given 411ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from the report and preserves tracker adapters 606ms
   ✓ bkit issues comment workflow-run proof (7)
     ✓ session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it 396ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 710ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (42 tests) 4995ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 478ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 880ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 341ms
     ✓ challenge gate without --base sizes only the branch's own lines 573ms
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 5402ms
   ✓ repo facts on a real repository (5)
     ✓ repoRoot resolves the main checkout from inside a linked worktree 304ms
     ✓ a host-made linked worktree holds the run 389ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 327ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1346ms
     ✓ runGit names ENOBUFS when output passes the limit 801ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 812ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 316ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 11575ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 502ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 305ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 325ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 311ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 664ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 418ms
     ✓ LOCAL -> runtimeHeadless=false 505ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 667ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 961ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 397ms
     ✓ UNKNOWN -> runtimeHeadless=false 592ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 355ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 303ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ re-derives per call: one run's answer does not leak into the next 421ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 401ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 334ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 323ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 339ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 9682ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1225ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 488ms
     ✓ stops the step when the command crashed or was misused 1042ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2587ms
     ✓ ship gates on CI and merges the pinned head 4338ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (50 tests) 4051ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 417ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 373ms
     ✓ currency emits no hunk outside the matched set 464ms
     ✓ currency exits 0 with no hunks when no task matches 394ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 648ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (111 tests) 3816ms
   ✓ bkit status invocation (7)
     ✓ records the issued invocation in the run status log and rebuilds a deleted receipt 313ms
     ✓ binds group and attempt and registers setup, remediation and ship steps 397ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (90 tests) 3552ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 583ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 457ms
     ✓ judges codeChanged between the compared same-scope rounds 560ms
     ✓ trendLine for a fall without a code change says no source code changed 316ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (27 tests) 5059ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 343ms
   ✓ bkit locks release (6)
     ✓ removes its own lock, by token or by workflow and fid 416ms
     ✓ locks release removes the FID shared-checkout record 435ms
     ✓ locks release from a linked worktree removes the FID record under that worktree's git dir 424ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 10443ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 2750ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 2102ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 5587ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1775ms
   ✓ design close: archive before overwrite (4)
     ✓ moves an existing canonical design into archive/ and writes the new one 386ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.integration.test.ts (14 tests) 4732ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 2374ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 2471ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 321ms
     ✓ counts deleted lines into changed 470ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 711ms
     ✓ is null when first is not an ancestor of last, or either is missing 472ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 1051ms
 ✓ .bkit/core/engine/commands/workflow/step-base.test.ts (7 tests) 3873ms
   ✓ stepBase (7)
     ✓ returns the commit that holds the last step-done row 540ms
     ✓ with a step name returns the commit of the row before that step's latest row 538ms
     ✓ falls back to the run start commit, and null with no run 548ms
     ✓ returns the parentSha of an uncommitted row even after a later commit sweeps it in 455ms
     ✓ with no file on a feat/{FID} branch, picks that FID's run when another run is in progress 656ms
     ✓ skips a build-takeover row written inside the step it measures 523ms
     ✓ with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress 610ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1807ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (304 tests) 563ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 515ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 274ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (340 tests) 402ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (21 tests) 109ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 231ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 128ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 236ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 128ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (38 tests) 66ms
 ✓ .bkit/core/engine/commands/workflow/open-decision.test.ts (58 tests) 123ms
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

 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 61ms
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 63ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (85 tests) 120ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 108ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 44ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 48ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 63ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 50ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 24ms
 ✓ .bkit/core/engine/install/version-file.test.ts (42 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (16 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 8ms

 Test Files  71 passed (71)
      Tests  5460 passed (5460)
   Start at  11:22:55
   Duration  975.67s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1042-ship-s-pr/build-holistic-gate-3.log.reports/vitest-43275.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl dist/commands/workflow/workflows.js docs/deferrals.jsonl docs/plans/202611/1042-ship-s-pr-plan.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-brief-tests-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-1.md docs/plans/202611/logs/1042-ship-s-pr/build-challenge-2.md docs/plans/202611/logs/1042-ship-s-pr/build-diff-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-holistic-gate-1-2.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tasks-4-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-tests-4-log.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/1042-ship-s-pr/build-tests-green-4-1.md docs/plans/202611/logs/1042-ship-s-pr/build-tests-red-4-1.md docs/plans/202611/logs/1042-ship-s-pr/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3349 of 20651 lines (240 KB of 1.4 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
