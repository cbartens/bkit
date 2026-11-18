
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/step-base.test.ts .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts dist/commands/workflow/step-base.js docs/deferrals.jsonl docs/plans/202611/1018-subagent-commits-makes-plan.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-tests-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-challenge-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-challenge-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-diff-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-diff-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-4.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-4-1-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-tasks-4-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-tests-4-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-5.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-green-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-green-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-red-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl docs/testing.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/step-base.test.ts .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts dist/commands/workflow/step-base.js docs/deferrals.jsonl docs/plans/202611/1018-subagent-commits-makes-plan.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-tests-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-challenge-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-challenge-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-diff-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-diff-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-4.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-4-1-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-tasks-4-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-tests-4-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-5.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-green-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-green-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-red-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl docs/testing.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 43398ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 322ms
     ✓ finishes a CI round only with its own failed job count 307ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 348ms
     ✓ reports a failed commit with exit 8 without writing the row 335ms
     ✓ a failed commit leaves no row staged in the index 841ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 443ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 390ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 375ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 322ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 647ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 312ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 482ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 364ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 388ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 575ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 356ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 333ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 510ms
     ✓ writeStepRow refuses when a recorded path changed 570ms
     ✓ writeStepRow appends its commit sha to the record 500ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 642ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 394ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 371ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 428ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 615ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 482ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 361ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 309ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 783ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 449ms
     ✓ the tests step's finish passes its own group's and taken-over tests 591ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 512ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 476ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 504ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 535ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 332ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 788ms
     ✓ refuses a later code step that changes a BLOCKED change again 577ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 1202ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 920ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 409ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 646ms
     ✓ the refusal of a re-change says the logged reason is already recorded 649ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 368ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 505ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 424ms
     ✓ the same contradicted finish run again adds no second task or row 446ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 392ms
     ✓ a mixed refusal names both tests and words the problem for each kind 409ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 425ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 323ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 568ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 680ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 475ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 736ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 680ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 329ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 312ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 337ms
     ✓ does not count an artifact the run found committed when it started 471ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 461ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 793ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 86917ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1086ms
   ✓ preserves the requested event for selected-workflow verification 747ms
   ✓ requires selected other-workflow success at the exact pushed head 1423ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1362ms
     ✓ saves the failed job count without the capstone job 367ms
     ✓ a CI selection keeps the failed job names, capstone left out 744ms
     ✓ counts the capstone job when it is the only failed job 651ms
     ✓ saves no failed job count when no job failed 362ms
     ✓ filters branch and PR discovery by configured workflow and exact head 519ms
     ✓ freezes explicit workflow run attempt and all failed job pages 367ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1085ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1182ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 348ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 343ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 346ms
     ✓ rejects a workflow result count smaller than its returned records 350ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1065ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1161ms
     ✓ checks the named repository base and fails closed on missing evidence 601ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 502ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 552ms
     ✓ rejects MCP capstone jobs belonging to another run 764ms
     ✓ --fetch refreshes origin/<branch> before gating 405ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 379ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 450ms
       ✓ --validated without --month / --fid is a usage error (2) 327ms
       ✓ a validated sha that is not an ancestor refuses (17) 315ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 952ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 926ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1092ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 397ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 944ms
     ✓ a failed re-trigger push names the cause in the log 1178ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2075ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2076ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1119ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 461ms
     ✓ gh-error: every poll errored 384ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 856ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 923ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 591ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1096ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 1159ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 419ms
     ✓ CLI: verdict JSON, body scan, exit codes 931ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 661ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 356ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 390ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 377ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 395ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 382ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1223ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1638ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1664ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1561ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 619ms
     ✓ re-trigger on dev only uses the record of its own FID 725ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 905ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 825ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 385ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1226ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 362ms
       ✓ without --repo no call gains a --repo flag 532ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 2078ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 315ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 301ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 461ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 336ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 412ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 412ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 433ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 882ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 736ms
     ✓ debug: a failure test run is a failed run 754ms
     ✓ debug: a timed_out test run is a failed run 726ms
     ✓ debug: a startup_failure test run is a failed run 888ms
     ✓ debug: a test run still in progress or cancelled is not returned 879ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 840ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 849ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1863ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 510ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 688ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 787ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 736ms
     ✓ --file and --step go together 613ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3590ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 770ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 650ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 782ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 979ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 1005ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 951ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 1145ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 817ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 808ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 73889ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ design and plan in place on main are refused 318ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1003ms
     ✓ may debug in place on dev 501ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 1088ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 943ms
     ✓ a new run of the same FID rewrites startSha 1582ms
     ✓ a resume of the same FID reuses the record 1433ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1533ms
       ✓ drops a commit id that is not on the branch 1511ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1895ms
       ✓ writes an empty commit list when the run has no run-commits row 1913ms
       ✓ ignores a row from before the open run started 1880ms
       ✓ restores the commits from the row on origin/dev when the handover landed 2338ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2233ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 2114ms
       ✓ ignores the row on origin/dev when the run there is closed 2281ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 2088ms
         ✓ wins over the row on origin/dev, which is then not needed 2438ms
         ✓ wins over the row in the checkout's own log while the run is open 2248ms
         ✓ still drops a commit id that is not on the branch 2240ms
         ✓ is ignored and removed when the checkout's log shows the run closed 2436ms
         ✓ is ignored when it was parked for another workflow 2645ms
         ✓ is removed once the record is rebuilt 2222ms
         ✓ is removed when the live record already stands for the open run 1749ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 895ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 912ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1234ms
     ✓ a stale record without a lock is replaced 1313ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 969ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3648ms
     ✓ names inherited commits and ship recovery in the refusal 833ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 956ms
     ✓ ship names a missing feat branch 333ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 865ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 302ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 331ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 359ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 353ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 379ms
   ✓ addAllButCopied (3)
     ✓ never commits an entry only the main checkout's copy list names 337ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 397ms
     ✓ tells a caller inside the removed worktree where to cd 362ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 953ms
       ✓ preserves staged-only mode during landed cleanup 995ms
       ✓ preserves staged-only type during landed cleanup 1084ms
       ✓ preserves staged-only deletion during landed cleanup 1049ms
       ✓ removes landed staged content when both index and working contents are on dev 1118ms
       ✓ deletes the proved local and remote branch at their landed tips 1287ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1712ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 496ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 482ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 498ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 857ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (187 tests) 143371ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 774ms
     ✓ opens the next run after a finished one, and after another workflow's run 303ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 363ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 320ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 350ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 473ms
       ✓ counts subagents of an earlier chat the run's session rows name 419ms
       ✓ records no context block, and still closes, outside a Claude Code session 449ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 423ms
     ✓ records ending held and publish false on the workflow-done row 483ms
     ✓ defaults the close row to ending done 472ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 456ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 410ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 430ms
     ✓ always writes the telemetry, whatever the runtime 394ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 302ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 386ms
     ✓ an unwritable stats path is logged and never fails the close 355ms
     ✓ appends the completeness row before the workflow-done row 407ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 393ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 400ms
     ✓ writes one completeness row per close 681ms
     ✓ leaves out the previous run's rows that share a second with this run's start 360ms
     ✓ still closes when the completeness check throws 395ms
     ✓ still closes when the completeness row write throws 408ms
     ✓ ship: run.pr, size of the squash commit, and coverage 466ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 727ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 407ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 385ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 569ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 664ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 681ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 616ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 574ms
     ✓ --record-step writes the close step's row before workflow-done 517ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 477ms
     ✓ --number without --outbox is a usage error 475ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 716ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 726ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 865ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 855ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 919ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 338ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 321ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2208ms
     ✓ --flush with nothing to record commits and pushes nothing 1163ms
     ✓ --flush carries the named worktree's logs into the dev commit 1849ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2336ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 799ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 593ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 985ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 775ms
       ✓ --ref, no push → route stop, no message 474ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 816ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2118ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2692ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2196ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2472ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2175ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1776ms
     ✓ --push on dev never carries a row whose references name another feature 2094ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2235ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3968ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2420ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1065ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2617ms
     ✓ preserves unlanded file deletions and ledger additions on close 5025ms
     ✓ preserves dirty work and uncertain branch evidence during close 5466ms
     ✓ preserves a local feature ref changed after its cleanup proof 5902ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2954ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2111ms
     ✓ a close that landed releases the lock 2864ms
     ✓ removes the worktree before it releases the lock 2926ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4267ms
       ✓ closePr refuses when the PR base is unknown 3833ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2229ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 346ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 372ms
     ✓ names the branch, not the remote-tracking ref, in each URL 326ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 347ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 359ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 839ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 539ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 1261ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 555ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 502ms
     ✓ a second run's record does not let this FID's close commit 669ms
     ✓ record is present after workflows close and before the push 1232ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2621ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2674ms
       ✓ a run closed by workflow-failed keeps no parked copy 2794ms
       ✓ a run closed by workflow-done keeps no parked copy 2917ms
       ✓ a FAILED run gets no row 2555ms
       ✓ a DONE run gets no row 2474ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2046ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 445ms
     ✓ --plan is appended when the file exists and skipped when it does not 313ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 426ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 922ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 742ms
     ✓ puts each --line after the summary, in flag order 710ms
     ✓ --summary prints the file and keeps a copy in --outbox 717ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 688ms
     ✓ a missing summary file exits 13 before anything is written 312ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 327ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 79170ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1117ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 465ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 419ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 654ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 444ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 705ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 466ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 491ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 438ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 585ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 512ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 454ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 707ms
     ✓ PASS is 0 failures with or without reports 612ms
     ✓ clears a previous attempt's reports before the gate runs 570ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 446ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 749ms
     ✓ a log under the outbox is named main-checkout relative in the record 673ms
     ✓ a log small enough is copied whole: not clamped, raw null 861ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 672ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1079ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 610ms
     ✓ numbers runs within the workflow's active run and per step 2662ms
     ✓ tests run --file records the tested snapshot on its test-run row 1206ms
     ✓ a FAIL test-run row records each failing case as file and name 675ms
     ✓ a PASS test-run row records no failed tests 1130ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 662ms
     ✓ without --file no row is written and the output carries row null 744ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 809ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 880ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 559ms
     ✓ the nothing-to-run row records the tested snapshot 537ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1657ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1525ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1277ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 886ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 941ms
     ✓ changed-since refuses a sha that names no commit 305ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 929ms
     ✓ a deleted file that no file mentions passes and the log says so 564ms
     ✓ a failed importer search runs the whole check 1079ms
     ✓ --changed-since=feature-base starts at the feature's start commit 993ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 836ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 1090ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 655ms
     ✓ a failing required push gate leaves the failed marker 607ms
     ✓ uncommitted code blocks the receipt until it is committed 1001ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 708ms
     ✓ only the required push gate records a receipt 775ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 913ms
   ✓ bkit tests red / green (46)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 608ms
     ✓ a planned test that passes is a vacuous gap, exit 1 487ms
     ✓ a planned test absent from a loaded report is a missing gap 498ms
     ✓ a file that fails to load is a red of kind red-not-loaded 658ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 763ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 860ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 515ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 528ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1242ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 529ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 673ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1406ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 806ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 668ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 977ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 824ms
       ✓ a resumed tests red skips a taken-over entry 717ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 816ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 907ms
     ✓ green: a passed-accepted test is already landed, not a gap 757ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 639ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 633ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 680ms
       ✓ green leaves a changed test the plan no longer names out of changed 819ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 783ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 631ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 967ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 784ms
     ✓ green: --group audits only that group's tasks 790ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 674ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 880ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 707ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 886ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 836ms
     ✓ green: lists each gap kind, with the runner output 652ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1085ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 387ms
       ✓ green clears an exception-only task from a human commit 366ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 54959ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1782ms
     ✓ runs code.ts through its declared gate in the built checkout 1553ms
     ✓ runs code.ts through its declared gate in the built checkout 1629ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1751ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1880ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1421ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1443ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1365ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 883ms
     ✓ runs the full gate for replayed debug code 1465ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1738ms
     ✓ installs local dependencies against the built target tree 1912ms
     ✓ runs the configured frozen install even without root dependencies 1702ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1563ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1714ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1678ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1425ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1689ms
     ✓ a push that fails without a server answer is returned once, never retried 1503ms
     ✓ a failed fetch is returned before anything is built 556ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2216ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1709ms
     ✓ lands from a clone whose fetch refspec omits dev 1975ms
     ✓ build throwing stops the landing and removes the throwaway checkout 653ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 363ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 315ms
     ✓ staging failure: exit 4 and no commit is created, no false success 321ms
     ✓ --mode=stage stages the sweep but creates no commit 313ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 966ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1907ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1992ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2779ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1587ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1101ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1187ms
     ✓ plan installs dependencies like build and debug 1163ms
     ✓ design stops on a failed install (5) 1146ms
     ✓ plan stops on a failed install (5) 1300ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1020ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1289ms
     ✓ fails without minting when origin cannot be reached 304ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 2238ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1173ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2682ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2114ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2271ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2181ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2096ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2866ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2731ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3455ms
> [bkit] TRUNCATED HERE — 77 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 2650ms
     ✓ vitest — with no report path the test file is left as it was 1665ms
     ✓ a run naming files of two kinds is refused as a usage error 623ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 767ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 1001ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 592ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 694ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30830ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 14509ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 982ms
     ✓ a failing file absent at the base commit is the branch's 486ms
     ✓ an undeclared bkit:test:file reads unknown 424ms
     ✓ a failed base install reads unknown and removes the worktree 489ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 672ms
     ✓ copies the worktreeCopy entries into the base checkout 676ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3812ms
     ✓ a pull_request-event CI run at the base sha does not settle none 840ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 756ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 824ms
     ✓ the base test run does not inherit the hooks-off git config 769ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1037ms
     ✓ counts files committed since --base 1030ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1062ms
     ✓ runs nothing and exits 0 when no file changed 349ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 718ms
> [bkit] TRUNCATED HERE — 54 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 609ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1000ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 347ms
     ✓ challenge gate without --base sizes only the branch's own lines 538ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 2635ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4705ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1333ms
     ✓ runGit names ENOBUFS when output passes the limit 867ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 818ms
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 460ms
     ✓ refuses a code conflict and aborts the rebase on the spot 346ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 901ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 305ms
     ✓ produces byte-identical output to merge=union 748ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 501ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 807ms
     ✓ refuses a lockfile whose regenerate command fails 516ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 668ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 699ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 403ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 454ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 598ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 748ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 438ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 317ms
       ✓ runs (0) with the landed path count once dev moved 596ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 318ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 703ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1734ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2351ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 634ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1004ms
     ✓ --mode=abort pushes when the branch has no open PR 917ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 699ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 474ms
     ✓ --open-pr carries the MCP answer and skips gh 655ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1197ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1333ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3069ms
     ✓ skip-ci HEAD on the replay is refused 958ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2285ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 784ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1435ms
     ✓ a fetch that fails exits 10 558ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 734ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 741ms
     ✓ scan-diff attributes deletion to its old test ins… 751ms
     ✓ scan-diff consumes each moved assertion once and … 779ms
     ✓ scan-diff does not match identical assertions fro… 822ms
     ✓ scan-diff does not match the same leaf test name … 841ms
     ✓ scan-diff does not match a same-named test with d… 822ms
     ✓ scan-diff does not match a same-named test with c… 817ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 731ms
     ✓ --paths with no match exits 1 796ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 617ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1186ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1202ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 751ms
     ✓ scan-diff ignores a removed comment in a test file 813ms
     ✓ scan-diff ignores an assertion moved within the file 784ms
     ✓ scan-diff still reports a removed assertion 798ms
     ✓ scan-diff reports an assertion re-added only outside the test file 763ms
     ✓ scan-diff finds an added pytest mark skip 894ms
     ✓ scan-diff finds an added unittest skip 804ms
     ✓ scan-diff finds an added bare skip call 761ms
     ✓ scan-diff ignores a quoted skip in a documentation file 837ms
     ✓ scan-diff ignores a marker literal in a non-test source file 848ms
     ✓ scan-diff ignores an assertion whose expectation changed 834ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 777ms
     ✓ scan-diff reports a deleted test file 747ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 526ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3950ms
     ✓ publishes local code with a CI running head before bookkeeping 5174ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 6468ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 4068ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2676ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1940ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1837ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1582ms
     ✓ --merge-docs skips an empty bkit:generate script 1385ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1221ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1768ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2491ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2003ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1759ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2520ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1355ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1037ms
     ✓ exits 10 when the fetch fails 633ms
     ✓ refuses --merge-docs with --head, and an unknown --head 720ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1318ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1867ms
     ✓ a failed install stops ship (16) 1435ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1376ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1260ms
     ✓ exits 10 when the fetch fails 953ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 656ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2710ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2290ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2120ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1470ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3598ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 663ms
     ✓ reports undeclared and runs nothing with an empty script 696ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 757ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 967ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 841ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 2180ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 3338ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 4064ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1733ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1539ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1086ms
     ✓ plan installs dependencies like build and debug 1064ms
     ✓ design stops on a failed install (5) 1149ms
     ✓ plan stops on a failed install (5) 1055ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1067ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1564ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1425ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1225ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2568ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1877ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1715ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1839ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1593ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2241ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2234ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2497ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3456ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3717ms
     ✓ malformed .mcp.json fails install instead of being overwritten 687ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 3123ms
> [bkit] TRUNCATED HERE — 71 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 773ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 682ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 836ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 564ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 549ms
     ✓ .husky/pre-push: first and last lines name the log 1185ms
     ✓ .husky/pre-push: the hook body runs once 455ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 710ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 984ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1056ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 736ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 771ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 912ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1037ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 946ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 1119ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 659ms
     ✓ .husky/pre-push: a gate fails → no disk prune 655ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 660ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 891ms
     ✓ a stale register stops the push before any gate runs 854ms
     ✓ bkit check fails → the push stops before any gate runs 573ms
     ✓ the dependency audit runs before any gate, when its script is present 872ms
     ✓ no dependency-audit script → skipped, the gates still run 621ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1156ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 829ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 821ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 734ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 926ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1221ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1018ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 835ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 487ms
     ✓ branch with no open PR → no check, push goes on 678ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 1114ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 486ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 840ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 2033ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 870ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 834ms
     ✓ untrusted .envrc still prints the direnv allow line 1039ms
     ✓ no .envrc → no direnv call 1241ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2703ms
     ✓ gh not on PATH → warns, gates run for both hook copies 3206ms
     ✓ base fetch fails → warns, gates run 4481ms
     ✓ dev push → no PR lookup 2694ms
     ✓ min push of a conflicting PR → blocked 3779ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 773ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 365ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 403ms
     ✓ explicit `bkit help` prints the same usage and exits 0 422ms
     ✓ `bkit check --claude` (stray module flag) errors 420ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 343ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 809ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 841ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 432ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 318ms
     ✓ aborts a rebase only when one is in progress 561ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 425ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 439ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 302ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 304ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 302ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 472ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 573ms
     ✓ an unwritable stats path is logged and never fails the close 510ms
     ✓ appends the completeness row before the workflow-done row 629ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 530ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 560ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 882ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 535ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 505ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 507ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 465ms
     ✓ --number without --outbox is a usage error 452ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 666ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 726ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 509ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1718ms
     ✓ --flush with nothing to record commits and pushes nothing 917ms
     ✓ --flush carries the named worktree's logs into the dev commit 1670ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 4843ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2677ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2259ms
     ✓ a close that landed releases the lock 2438ms
     ✓ removes the worktree before it releases the lock 2395ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 315ms
     ✓ names the branch, not the remote-tracking ref, in each URL 302ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 301ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 709ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 491ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2651ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2663ms
       ✓ a run closed by workflow-failed keeps no parked copy 2437ms
       ✓ a run closed by workflow-done keeps no parked copy 2071ms
       ✓ a FAILED run gets no row 2505ms
       ✓ a DONE run gets no row 2425ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2081ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 529ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 512ms
     ✓ refuses a code conflict and aborts the rebase on the spot 595ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 975ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 467ms
     ✓ produces byte-identical output to merge=union 1390ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1128ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2163ms
     ✓ refuses a lockfile whose regenerate command fails 1364ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 973ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 888ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 571ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 629ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 769ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 886ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 542ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 388ms
       ✓ runs (0) with the landed path count once dev moved 655ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 391ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 888ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1562ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2409ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 648ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1611ms
     ✓ --mode=abort pushes when the branch has no open PR 1248ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1463ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 514ms
     ✓ --open-pr carries the MCP answer and skips gh 762ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1235ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1333ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3838ms
     ✓ skip-ci HEAD on the replay is refused 835ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2356ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 677ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 978ms
     ✓ a fetch that fails exits 10 420ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 531ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 494ms
     ✓ scan-diff attributes deletion to its old test ins… 477ms
     ✓ scan-diff consumes each moved assertion once and … 534ms
     ✓ scan-diff does not match identical assertions fro… 533ms
     ✓ scan-diff does not match the same leaf test name … 517ms
     ✓ scan-diff does not match a same-named test with d… 481ms
     ✓ scan-diff does not match a same-named test with c… 523ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 511ms
     ✓ --paths with no match exits 1 468ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 355ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 708ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 754ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 509ms
     ✓ scan-diff ignores a removed comment in a test file 517ms
     ✓ scan-diff ignores an assertion moved within the file 522ms
     ✓ scan-diff still reports a removed assertion 551ms
     ✓ scan-diff reports an assertion re-added only outside the test file 527ms
     ✓ scan-diff finds an added pytest mark skip 517ms
     ✓ scan-diff finds an added unittest skip 458ms
     ✓ scan-diff finds an added bare skip call 525ms
     ✓ scan-diff ignores a quoted skip in a documentation file 495ms
     ✓ scan-diff ignores a marker literal in a non-test source file 520ms
     ✓ scan-diff ignores an assertion whose expectation changed 506ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 536ms
     ✓ scan-diff reports a deleted test file 556ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 424ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3159ms
     ✓ publishes local code with a CI running head before bookkeeping 3862ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5028ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3198ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2121ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1646ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1663ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1424ms
     ✓ --merge-docs skips an empty bkit:generate script 1153ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 972ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2156ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1828ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2223ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1548ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1901ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1196ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 718ms
     ✓ exits 10 when the fetch fails 471ms
     ✓ refuses --merge-docs with --head, and an unknown --head 521ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1057ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2111ms
     ✓ a failed install stops ship (16) 1451ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1087ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 971ms
     ✓ exits 10 when the fetch fails 814ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 593ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2369ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2429ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2294ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1584ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 4076ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 680ms
     ✓ reports undeclared and runs nothing with an empty script 942ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 859ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1086ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 702ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1746ms
     ✓ saves the failed job count without the capstone job 912ms
     ✓ a CI selection keeps the failed job names, capstone left out 1499ms
     ✓ counts the capstone job when it is the only failed job 633ms
     ✓ saves no failed job count when no job failed 702ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1128ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1140ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1458ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2119ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1327ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1900ms
     ✓ checks the named repository base and fails closed on missing evidence 823ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 779ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 824ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 558ms
       ✓ a source change past the validated head refuses (17) and names the path 469ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 640ms
       ✓ --validated without --month / --fid is a usage error (2) 478ms
       ✓ a validated sha that is not an ancestor refuses (17) 464ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 485ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1093ms
     ✓ a failed re-trigger push names the cause in the log 1301ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1624ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1968ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 989ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 439ms
     ✓ gh-error: every poll errored 514ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1206ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1131ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 666ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1235ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 437ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 344ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 349ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 466ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1415ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1519ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 551ms
     ✓ re-trigger on dev only uses the record of its own FID 696ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 798ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 321ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 744ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 332ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 388ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 373ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 445ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 953ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 1032ms
     ✓ debug: a failure test run is a failed run 1461ms
     ✓ debug: a timed_out test run is a failed run 1132ms
     ✓ debug: a startup_failure test run is a failed run 1342ms
     ✓ debug: a test run still in progress or cancelled is not returned 1436ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1311ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 1794ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 2870ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 355ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 909ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 716ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 616ms
     ✓ --file and --step go together 483ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 4125ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 506ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 540ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 613ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 769ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 667ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 986ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 786ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 5840ms
     ✓ continues after the prepared completion source disappears 3631ms
     ✓ records preparation and session association failures despite successful delivery 3006ms
     ✓ associates startup and run across restart or starts fresh safely 4189ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 12842ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1246ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 775ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 913ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 410ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 466ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 996ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 901ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 664ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 683ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 790ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 845ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 783ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 514ms
     ✓ PASS is 0 failures with or without reports 785ms
     ✓ clears a previous attempt's reports before the gate runs 912ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 661ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 970ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1663ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 900ms
     ✓ numbers runs within the workflow's active run and per step 1196ms
     ✓ tests run --file records the tested snapshot on its test-run row 753ms
     ✓ a FAIL test-run row records each failing case as file and name 778ms
     ✓ a PASS test-run row records no failed tests 1832ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 954ms
     ✓ without --file no row is written and the output carries row null 1148ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 333ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1770ms
     ✓ --since-pass-of skips failing runs and steps it does not name 2571ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1880ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1221ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1052ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1433ms
     ✓ a deleted file that no file mentions passes and the log says so 545ms
     ✓ a failed importer search runs the whole check 1297ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1507ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 937ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 893ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 892ms
     ✓ a failing required push gate leaves the failed marker 845ms
     ✓ uncommitted code blocks the receipt until it is committed 1071ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1138ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 776ms
     ✓ a planned test absent from a loaded report is a missing gap 1030ms
     ✓ a file that fails to load is a red of kind red-not-loaded 990ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 616ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 862ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 566ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 601ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1620ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 1135ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 939ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1344ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 1023ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 783ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 739ms
     ✓ green: lists each gap kind, with the runner output 685ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1186ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 463ms
       ✓ green clears an exception-only task from a human commit 328ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 72810ms
   ✓ bkit worktrees setup — adopt in place (10)
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 309ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 333ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 365ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 127272ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 4095ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 331ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2835ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 2583ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1929ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 2227ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 3088ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2826ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 4214ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 396ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1462ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1650ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2431ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1712ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1740ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2166ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2917ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2604ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2883ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2607ms
       ✓ a branch with no status.jsonl dispatches as before 2591ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2696ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3999ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2917ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2665ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 11299ms
     ✓ records the failed job count and reads an uncounted local round as unknown 7657ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 6009ms
     ✓ finishes the first CI evidence round of the second debug run 3150ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 751ms
     ✓ finishes a CI round only with its own failed job count 522ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 408ms
     ✓ done --group writes group on the row 333ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 558ms
     ✓ carries extra fields, parsed as JSON when they are JSON 321ms
     ✓ reports a failed commit with exit 8 without writing the row 973ms
     ✓ a failed commit leaves no row staged in the index 538ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 877ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 726ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 859ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 566ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 977ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 310ms
     ✓ --ref reads the status file as committed on that ref, not from disk 300ms
     ✓ --ref exits 3 when the ref does not carry the status file 302ms
     ✓ fails on a placeholder left in the artifact 316ms
     ✓ fails when the row's verdict differs from the artifact's 327ms
     ✓ fails when the row does not list the artifact, or carries another attempt 319ms
     ✓ fails on a missing artifact 326ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 331ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ passes attempt 0, and gate --attempt=0 matches it 319ms
     ✓ fails a diagnose row missing its strategy, passes with it 309ms
     ✓ fails a run-tests row missing its scope, and an empty scope 419ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 416ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 665ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 867ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 566ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 544ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 587ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 302ms
     ✓ --attempt-of checks the row carries the derived counter 329ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 188 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 36597ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 876ms
     ✓ names each net-new and worsened finding in the log and the JSON 656ms
     ✓ fails on a net score rise with no net count change 652ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 701ms
     ✓ treats a net score at or below 0.001 as float noise 799ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 995ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 483ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 731ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 832ms
     ✓ exits 4 on a dropped net field instead of silently passing 659ms
     ✓ exits 4 on no summary instead of silently passing 651ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 973ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 969ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1165ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 931ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 426ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 411ms
     ✓ fails (exit 1) when vale reports alerts 401ms
     ✓ exits 6 on a vale runtime error 417ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 471ms
     ✓ falls back to vale sync when the main worktree has none 437ms
     ✓ fails when vale sync cannot restore the required styles 479ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 614ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 338ms
     ✓ exits 1 naming the files outside, whatever the commit message says 350ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 658ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 711ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 405ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 315ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 420ms
     ✓ retries a failed create once, and exits 5 when it fails twice 496ms
     ✓ exits 5 when the open-PR probe errors 558ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 503ms
     ✓ prs open still opens against any other base 442ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 586ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 552ms
     ✓ exits 4 when gh errors and 80 when it needs auth 430ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 353ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 362ms
     ✓ runs no merge when the PR is already MERGED 344ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 505ms
     ✓ prs merge refuses a PR whose base is main 343ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 366ms
     ✓ prs merge refuses when the PR base is unknown 365ms
     ✓ prs merge reads the base from the one pr view it already makes 369ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 363ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 316ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 336ms
     ✓ never reads dev's required checks without --only-if-required 314ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 378ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 354ms
     ✓ is not green when a check failed, naming it (exit 1) 435ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 350ms
     ✓ is not green on an empty rollup (total 0) 331ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 325ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 532ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 340ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts (18 tests) 31247ms
   ✓ tests lock through a consumer's wrapped gate (15)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 980ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1106ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1224ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1865ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 957ms
     ✓ counts files committed since --base 609ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 929ms
     ✓ runs nothing and exits 0 when no file changed 428ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 726ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1183ms
     ✓ a failing file absent at the base commit is the branch's 599ms
     ✓ an undeclared bkit:test:file reads unknown 486ms
     ✓ a failed base install reads unknown and removes the worktree 575ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 691ms
     ✓ copies the worktreeCopy entries into the base checkout 782ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3929ms
     ✓ a pull_request-event CI run at the base sha does not settle none 771ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 684ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 701ms
     ✓ the base test run does not inherit the hooks-off git config 644ms
> [bkit] TRUNCATED HERE — 391 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 376 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 620ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 637ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 528ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 366ms
     ✓ fetches the issue and its comments as GitHub returns them 701ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 460ms
     ✓ invalidates missing corrupt and unsupported progress cache 899ms
     ✓ contains cache read and write failures as standalone degradation 498ms
     ✓ uses legacy receipts and contains receipt failures 435ms
     ✓ records an engine-action row and skips the same key + body on a re-run 434ms
     ✓ a recent identical comment counts as done (the final close comment) 373ms
     ✓ a failed post reports done false with the reason and never leaks a token 405ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 437ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 366ms
     ✓ a different marker hash posts 426ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 392ms
stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateRetiredLite (via runBkitDocs) > logs no fix and writes nothing on a second install over its own stub
[bkit-install] core: .bkit/authoring.md
> [bkit] TRUNCATED HERE — 95 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 173 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 517 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 146 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 85 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 173 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 823ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 440ms
     ✓ stops the step when the command crashed or was misused 1212ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 491ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 814ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 810ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 636ms
     ✓ --file into a missing directory is refused, not created 616ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4469ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1329ms
     ✓ runGit names ENOBUFS when output passes the limit 808ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 776ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 563ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 987ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 431ms
     ✓ challenge gate without --base sizes only the branch's own lines 536ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3593ms
> [bkit] TRUNCATED HERE — 105 lines omitted. Dropped content was NOT read.
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
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
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
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it))

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > reclaims an unedited owned byte-equal file via canonicalHashes
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash mismatches (consumer modified)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's linear entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's jira entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

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
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

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
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > prunes deleted paths from .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

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
.bkit/.env.example                               | skip-absent            | file not found — nothing to do

[bkit-uninstall-test] [dry-run] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (github)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
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
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (linear)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (jira)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
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
[bkit-uninstall-test] delete: .bkit/.env.example
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
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
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
.bkit/.env.example                               | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 237ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1609ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (63 tests) 213ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (75 tests) 64ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 183ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 172ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 298ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 239ms
(node:14085) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:14085) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 124ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 429ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 351ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 316ms
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

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 85ms
 ✓ .bkit/core/engine/install/project-docs.test.ts (38 tests) 95ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 134ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 160ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 109ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 56ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 69ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 79ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 60ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 41ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 30ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (19 tests) 25ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 21ms

 Test Files  82 passed (82)
      Tests  6595 passed (6595)
   Start at  16:28:58
   Duration  567.87s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1018-subagent-commits-makes/build-holistic-gate-5.log.reports/vitest-13533.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/step-base.test.ts .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/step-base.test.ts .bkit/core/engine/commands/workflow/step-base.ts .bkit/core/engine/commands/workflow/tests-changed.test.ts dist/commands/workflow/step-base.js docs/deferrals.jsonl docs/plans/202611/1018-subagent-commits-makes-plan.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-brief-tests-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-challenge-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-challenge-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-diff-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-diff-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-holistic-gate-1-4.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-gaps-remediate-4-1-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-tasks-4-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-tests-4-log.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-plan-verify-holistic-1-5.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-green-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-green-4-2.md docs/plans/202611/logs/1018-subagent-commits-makes/build-tests-red-4-1.md docs/plans/202611/logs/1018-subagent-commits-makes/status.jsonl docs/testing.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3277 of 20327 lines (253 KB of 1.4 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
