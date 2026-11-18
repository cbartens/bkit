
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts .bkit/version .bkit/workflows.md dist/commands/workflow/worktrees.js docs/plans/202611/919-worktree-setup-tries-plan.md docs/plans/202611/logs/919-worktree-setup-tries/build-brief-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-brief-tests-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-diff-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-input-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-install-skills.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-check.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-tasks-1-log.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-tests-1-log.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-verify-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-tests-green-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-tests-red-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/status.jsonl docs/testing.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts .bkit/version .bkit/workflows.md dist/commands/workflow/worktrees.js docs/plans/202611/919-worktree-setup-tries-plan.md docs/plans/202611/logs/919-worktree-setup-tries/build-brief-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-brief-tests-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-diff-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-input-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-install-skills.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-check.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-tasks-1-log.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-tests-1-log.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-verify-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-tests-green-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-tests-red-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/status.jsonl docs/testing.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 33557ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 814ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 393ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 416ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 408ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 452ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ PASS is 0 failures with or without reports 473ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 412ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 306ms
     ✓ numbers runs within the workflow's active run and per step 476ms
     ✓ a PASS test-run row records no failed tests 512ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 553ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 356ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 346ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 561ms
     ✓ --since-pass-of skips failing runs and steps it does not name 702ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 508ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 372ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 370ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 393ms
     ✓ a failed importer search runs the whole check 578ms
     ✓ --changed-since=feature-base starts at the feature's start commit 693ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 368ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 531ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 436ms
     ✓ uncommitted code blocks the receipt until it is committed 382ms
     ✓ only the required push gate records a receipt 318ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 382ms
   ✓ bkit tests red / green (46)
     ✓ a planned test that passes is a vacuous gap, exit 1 390ms
     ✓ a file that fails to load is a red of kind red-not-loaded 306ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 308ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 361ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 301ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 466ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 309ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 471ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 442ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 346ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 560ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 466ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 344ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 328ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 626ms
     ✓ tests a code step changed (7)
       ✓ green leaves a changed test the plan no longer names out of changed 323ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 328ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 318ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 318ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 328ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 461ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 44531ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 697ms
   ✓ preserves the requested event for selected-workflow verification 541ms
   ✓ requires selected other-workflow success at the exact pushed head 944ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 929ms
     ✓ saves the failed job count without the capstone job 305ms
     ✓ a CI selection keeps the failed job names, capstone left out 532ms
     ✓ filters branch and PR discovery by configured workflow and exact head 542ms
     ✓ freezes explicit workflow run attempt and all failed job pages 341ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 614ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 736ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 620ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 836ms
     ✓ checks the named repository base and fails closed on missing evidence 445ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 361ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 404ms
     ✓ rejects MCP capstone jobs belonging to another run 581ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 495ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 427ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1048ms
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 471ms
     ✓ a failed re-trigger push names the cause in the log 678ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 728ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 904ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 489ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 472ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 471ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 538ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 577ms
     ✓ CLI: verdict JSON, body scan, exit codes 402ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 448ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 601ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 629ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 565ms
     ✓ re-trigger on dev only uses the record of its own FID 306ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 401ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 332ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1111ms
   ✓ bkit runs revalidate (7)
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 785ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 451ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 460ms
     ✓ debug: a failure test run is a failed run 464ms
     ✓ debug: a timed_out test run is a failed run 464ms
     ✓ debug: a startup_failure test run is a failed run 453ms
     ✓ debug: a test run still in progress or cancelled is not returned 434ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 462ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 440ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1021ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 306ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 395ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 334ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1429ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 321ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 318ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 327ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 368ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 331ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 327ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 151ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (121 tests) 12371ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 454ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ a recorded ledger commits only the rows the run appended 354ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 405ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 356ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 321ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 25143ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 306ms
     ✓ a failed commit leaves no row staged in the index 458ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 476ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 427ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 455ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 536ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 455ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 400ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 340ms
     ✓ writeStepRow refuses when a recorded path changed 382ms
     ✓ writeStepRow appends its commit sha to the record 379ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 519ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 403ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 378ms
     ✓ the tests step's finish passes its own group's and taken-over tests 315ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 334ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 399ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 369ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 400ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 315ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 305ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 424ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 28ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 849ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 1418ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 6909ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section banner and drops every other context's 608ms
   ✓ bkit context diff (10)
     ✓ --reset-log empties the step's clamp log before the record lands 423ms
   ✓ featureBase (#960) (7)
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 362ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 368ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 1691ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 1357ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (190 tests) 70200ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 395ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 303ms
     ✓ defaults the close row to ending done 314ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 316ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 331ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 318ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 301ms
     ✓ appends the completeness row before the workflow-done row 324ms
     ✓ writes one completeness row per close 472ms
     ✓ still closes when the completeness check throws 328ms
     ✓ ship: run.pr, size of the squash commit, and coverage 338ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 476ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 375ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 307ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 373ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 302ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 329ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 329ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 372ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 352ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 355ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 930ms
     ✓ --flush with nothing to record commits and pushes nothing 485ms
     ✓ --flush carries the named worktree's logs into the dev commit 890ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1370ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1557ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1468ms
     ✓ closePr titles the PR by the record it carries 1881ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 324ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 529ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 437ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 935ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1044ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 807ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1034ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 891ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 909ms
     ✓ --push on dev never carries a row whose references name another feature 830ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 812ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1419ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1095ms
     ✓ --push commits in the named worktree, not the checkout it runs from 373ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1180ms
     ✓ preserves unlanded file deletions and ledger additions on close 2184ms
     ✓ preserves dirty work and uncertain branch evidence during close 2103ms
     ✓ preserves a local feature ref changed after its cleanup proof 2155ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1307ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 873ms
     ✓ a close that landed releases the lock 1073ms
     ✓ removes the worktree before it releases the lock 1091ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1639ms
       ✓ closePr refuses when the PR base is unknown 1487ms
     ✓ leaves a worktree no workflow created, and its branch, in place 918ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 316ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 506ms
     ✓ record is present after workflows close and before the push 574ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1215ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1051ms
       ✓ a run closed by workflow-failed keeps no parked copy 1149ms
       ✓ a run closed by workflow-done keeps no parked copy 1204ms
       ✓ a FAILED run gets no row 1191ms
       ✓ a DONE run gets no row 1274ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1020ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 463ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 349ms
     ✓ puts each --line after the summary, in flag order 345ms
     ✓ --summary prints the file and keeps a copy in --outbox 341ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 357ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 14577ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 581ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 439ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2238ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 311ms
     ✓ resolves a pending ledger intent after its invocation is stale 362ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 5256ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 784ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1073ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 890ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 2959ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1307ms
     ✓ runGit names ENOBUFS when output passes the limit 438ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 472ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 947ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 2076ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 472ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 489ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 1424ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (95 tests) 40142ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (4)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 728ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 408ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 524ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 562ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 508ms
     ✓ a new run of the same FID rewrites startSha 867ms
     ✓ a resume of the same FID reuses the record 753ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 846ms
       ✓ drops a commit id that is not on the branch 944ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 938ms
       ✓ writes an empty commit list when the run has no run-commits row 848ms
       ✓ ignores a row from before the open run started 853ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1099ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1006ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 990ms
       ✓ ignores the row on origin/dev when the run there is closed 1106ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1407ms
         ✓ wins over the row on origin/dev, which is then not needed 1427ms
         ✓ wins over the row in the checkout's own log while the run is open 1041ms
         ✓ still drops a commit id that is not on the branch 1041ms
         ✓ is ignored and removed when the checkout's log shows the run closed 920ms
         ✓ is ignored when it was parked for another workflow 1043ms
         ✓ is removed once the record is rebuilt 1016ms
         ✓ is removed when the live record already stands for the open run 818ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 428ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 486ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 633ms
     ✓ a stale record without a lock is replaced 642ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 483ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1712ms
     ✓ names inherited commits and ship recovery in the refusal 407ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 496ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 461ms
   ✓ bkit worktrees remove (18)
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 621ms
       ✓ preserves staged-only mode during landed cleanup 709ms
       ✓ preserves staged-only type during landed cleanup 755ms
       ✓ preserves staged-only deletion during landed cleanup 708ms
       ✓ removes landed staged content when both index and working contents are on dev 792ms
       ✓ deletes the proved local and remote branch at their landed tips 954ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1033ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 314ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 502ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 8221ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 807ms
     ✓ workflow progress command wiring progress specialized completion producers 4643ms
     ✓ workflow progress command wiring progress gate only completions 385ms
     ✓ progress excludes noncompletions 1347ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 33494ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1070ms
     ✓ runs code.ts through its declared gate in the built checkout 953ms
     ✓ runs code.ts through its declared gate in the built checkout 929ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 761ms
     ✓ runs an audit template's project-section change through bkit:gate:min 861ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 637ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 689ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 659ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 409ms
     ✓ runs the full gate for replayed debug code 685ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 783ms
     ✓ installs local dependencies against the built target tree 911ms
     ✓ runs the configured frozen install even without root dependencies 825ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 807ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 850ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 871ms
     ✓ never pushes local dev commits missing from origin/dev 863ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1556ms
     ✓ dev moved before every push: exhausted, nothing landed 2459ms
     ✓ any other refusal is returned, not retried 1286ms
     ✓ pushToDev replays a commit range onto origin/dev 1355ms
     ✓ a replay retries on the new dev when dev moved 2215ms
     ✓ pushToDev log line names what it lands 1005ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1032ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1198ms
     ✓ a push that fails without a server answer is returned once, never retried 1053ms
     ✓ a failed fetch is returned before anything is built 345ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2876ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1603ms
     ✓ lands from a clone whose fetch refspec omits dev 1417ms
     ✓ build throwing stops the landing and removes the throwaway checkout 514ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1559ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (25 tests) 7699ms
   ✓ changedFiles (2)
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 384ms
   ✓ snapshotTree / changedBetween (5)
     ✓ snapshotting leaves the index and working tree as they were 336ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 374ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 300ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 862ms
     ✓ counts files committed since --base 468ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 384ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 515ms
     ✓ runs the --fallback gate even when no file changed, as it did before 369ms
     ✓ exits 4 when the gate could not run 401ms
     ✓ changed-since exits 81 with the holder read from the status file 539ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 350ms
     ✓ exits 1 when the gate exits 75 and writes no status file 359ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 339ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 154ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 10818ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 748ms
     ✓ a failing file absent at the base commit is the branch's 447ms
     ✓ an undeclared bkit:test:file reads unknown 406ms
     ✓ a failed base install reads unknown and removes the worktree 505ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 571ms
     ✓ copies the worktreeCopy entries into the base checkout 562ms
     ✓ a base file run that writes no report reads unknown 585ms
     ✓ a passing CI run at the exact base sha settles none without a local run 336ms
     ✓ a CI run that cannot settle the base falls back to the local run 2866ms
     ✓ a pull_request-event CI run at the base sha does not settle none 530ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 495ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 474ms
     ✓ the base test run does not inherit the hooks-off git config 495ms
     ✓ adopt follows the run's runtimeWorktrees 946ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 2031ms
   ✓ selected CI context evidence (3)
     ✓ accepts only matching complete CI receipts with nonempty logs 717ms
     ✓ validates adapted legacy and fallback context through the same receipt path 354ms
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
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (279 tests) 166902ms
   ✓ branches rebase: behaviour (32)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 562ms
     ✓ produces byte-identical output to merge=union 407ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 370ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 675ms
     ✓ refuses a lockfile whose regenerate command fails 372ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 387ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 433ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 377ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 397ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 501ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 377ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 590ms
     ✓ --mode=abort pushes when the branch has no open PR 470ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 387ms
     ✓ --open-pr carries the MCP answer and skips gh 301ms
     ✓ --mode=abort on dev pushes plainly without probing 331ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 547ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 607ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1855ms
     ✓ skip-ci HEAD on the replay is refused 322ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 878ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ scan-diff ignores a skip predating the base 306ms
     ✓ scan-diff reports a disabled test with its line 329ms
     ✓ scan-diff ignores an assertion moved within the file 331ms
     ✓ scan-diff still reports a removed assertion 321ms
     ✓ scan-diff reports an assertion re-added only outside the test file 300ms
     ✓ scan-diff finds an added pytest mark skip 331ms
     ✓ scan-diff ignores an assertion whose expectation changed 304ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 325ms
     ✓ scan-diff reports a deleted test file 364ms
   ✓ branches force-build (8)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 1836ms
     ✓ publishes local code with a CI running head before bookkeeping 2169ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2751ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1957ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1449ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 938ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 924ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 807ms
     ✓ --merge-docs skips an empty bkit:generate script 684ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 537ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 915ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1067ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 910ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1100ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1548ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ fast-forwards local dev without checking it out 615ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 796ms
     ✓ a failed install stops ship (16) 751ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 622ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 595ms
     ✓ exits 10 when the fetch fails 495ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 349ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1877ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1819ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2061ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1345ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3856ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 538ms
     ✓ reports undeclared and runs nothing with an empty script 540ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 649ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 813ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 515ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 877ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1270ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1526ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 827ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 790ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 700ms
     ✓ plan installs dependencies like build and debug 657ms
     ✓ design stops on a failed install (5) 647ms
     ✓ plan stops on a failed install (5) 669ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 630ms
     ✓ tracks origin/feat/{fid} when only the remote has it 751ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 667ms
     ✓ reports a package manager that could not run (127) apart from a failed install 832ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1430ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1521ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1617ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1370ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1489ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2886ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2655ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2448ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 1609ms
     ✓ vitest — with no report path the test file is left as it was 923ms
     ✓ a run naming files of two kinds is refused as a usage error 484ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 603ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 814ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 452ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 491ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30582ms

 Test Files  40 passed (40)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1263ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 392ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 835ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 372ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 359ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 363ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 399ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 367ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 317ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 524ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 390ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 500ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 528ms
     ✓ PASS is 0 failures with or without reports 645ms
     ✓ clears a previous attempt's reports before the gate runs 380ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 447ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 360ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1028ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 751ms
     ✓ numbers runs within the workflow's active run and per step 943ms
     ✓ tests run --file records the tested snapshot on its test-run row 705ms
     ✓ a FAIL test-run row records each failing case as file and name 452ms
     ✓ a PASS test-run row records no failed tests 931ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 737ms
     ✓ without --file no row is written and the output carries row null 706ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 393ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1104ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1487ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1128ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 830ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 792ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 729ms
     ✓ a deleted file that no file mentions passes and the log says so 469ms
     ✓ a failed importer search runs the whole check 786ms
     ✓ --changed-since=feature-base starts at the feature's start commit 834ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 922ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 671ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 1271ms
     ✓ a failing required push gate leaves the failed marker 1004ms
     ✓ uncommitted code blocks the receipt until it is committed 1077ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 903ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 424ms
     ✓ a planned test absent from a loaded report is a missing gap 417ms
     ✓ a file that fails to load is a red of kind red-not-loaded 533ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 630ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 780ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 491ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 523ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 747ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 574ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 608ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1150ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 627ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 696ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 533ms
     ✓ green: lists each gap kind, with the runner output 646ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 939ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 403ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 88854ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1367ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1480ms
     ✓ saves the failed job count without the capstone job 530ms
     ✓ a CI selection keeps the failed job names, capstone left out 1060ms
     ✓ counts the capstone job when it is the only failed job 523ms
     ✓ saves no failed job count when no job failed 521ms
     ✓ filters branch and PR discovery by configured workflow and exact head 697ms
     ✓ freezes explicit workflow run attempt and all failed job pages 563ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1264ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1760ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1228ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1579ms
     ✓ checks the named repository base and fails closed on missing evidence 796ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 781ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 812ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 432ms
       ✓ a source change past the validated head refuses (17) and names the path 372ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 428ms
       ✓ a validated sha that is not an ancestor refuses (17) 381ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 359ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 939ms
     ✓ a failed re-trigger push names the cause in the log 893ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1791ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1849ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 985ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 439ms
     ✓ gh-error: every poll errored 420ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 844ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 919ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 593ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1144ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 402ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 411ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 463ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 416ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1580ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1274ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 566ms
     ✓ re-trigger on dev only uses the record of its own FID 678ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 604ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1876ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 381ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 365ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 348ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 368ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 739ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 802ms
     ✓ debug: a failure test run is a failed run 829ms
     ✓ debug: a timed_out test run is a failed run 681ms
     ✓ debug: a startup_failure test run is a failed run 693ms
     ✓ debug: a test run still in progress or cancelled is not returned 637ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1120ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 699ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1569ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 381ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 556ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 655ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 674ms
     ✓ --file and --step go together 542ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3010ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 631ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 663ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 656ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 742ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 713ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 715ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 716ms
> [bkit] TRUNCATED HERE — 391 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (304 tests) 733ms
stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 377ms
     ✓ finishes a CI round only with its own failed job count 494ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 323ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 438ms
     ✓ reports a failed commit with exit 8 without writing the row 699ms
     ✓ a failed commit leaves no row staged in the index 825ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 793ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 729ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1031ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 459ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 724ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 311ms
     ✓ --ref exits 3 when the ref does not carry the status file 323ms
     ✓ fails on a placeholder left in the artifact 303ms
     ✓ fails when the row does not list the artifact, or carries another attempt 303ms
     ✓ fails on a missing artifact 314ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 301ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 396ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 401ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 511ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 797ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 505ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 683ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 545ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 342ms
     ✓ --attempt-of checks the row carries the derived counter 384ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 66 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 479ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 332ms
     ✓ aborts a rebase only when one is in progress 592ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 436ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 494ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 308ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 307ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 304ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 317ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 558ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 715ms
     ✓ an unwritable stats path is logged and never fails the close 575ms
     ✓ appends the completeness row before the workflow-done row 651ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 667ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 610ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 823ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 581ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 510ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 464ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 540ms
     ✓ --number without --outbox is a usage error 483ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 789ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 632ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 305ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1955ms
     ✓ --flush with nothing to record commits and pushes nothing 907ms
     ✓ --flush carries the named worktree's logs into the dev commit 1839ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2711ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 3057ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 3027ms
     ✓ closePr titles the PR by the record it carries 3153ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 5538ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3370ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2546ms
     ✓ a close that landed releases the lock 3033ms
     ✓ removes the worktree before it releases the lock 3068ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 391ms
     ✓ names the branch, not the remote-tracking ref, in each URL 322ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 341ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 369ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 908ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 553ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2140ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2140ms
       ✓ a run closed by workflow-failed keeps no parked copy 1988ms
       ✓ a run closed by workflow-done keeps no parked copy 2099ms
       ✓ a FAILED run gets no row 2128ms
       ✓ a DONE run gets no row 2155ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1931ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 424ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 309ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 316ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 467ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 323ms
     ✓ fetches the issue and its comments as GitHub returns them 360ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 463ms
     ✓ invalidates missing corrupt and unsupported progress cache 1218ms
     ✓ contains cache read and write failures as standalone degradation 427ms
     ✓ uses legacy receipts and contains receipt failures 407ms
     ✓ records an engine-action row and skips the same key + body on a re-run 415ms
     ✓ a recent identical comment counts as done (the final close comment) 948ms
     ✓ a failed post reports done false with the reason and never leaks a token 355ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 398ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 532ms
     ✓ a different marker hash posts 360ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 341ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 13056ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 99 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 4079ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3306ms
     ✓ malformed .mcp.json fails install instead of being overwritten 682ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2996ms
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 460ms
     ✓ refuses a code conflict and aborts the rebase on the spot 487ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 880ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 469ms
     ✓ produces byte-identical output to merge=union 1130ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 666ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 927ms
     ✓ refuses a lockfile whose regenerate command fails 741ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 923ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 931ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 538ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 658ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 742ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 948ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 557ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 451ms
       ✓ runs (0) with the landed path count once dev moved 867ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 478ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 906ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1469ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2042ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 560ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 728ms
     ✓ --mode=abort pushes when the branch has no open PR 1092ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 776ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 457ms
     ✓ --open-pr carries the MCP answer and skips gh 710ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1223ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1418ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2840ms
     ✓ skip-ci HEAD on the replay is refused 937ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1865ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 699ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1142ms
     ✓ a fetch that fails exits 10 459ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 573ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 639ms
     ✓ scan-diff attributes deletion to its old test ins… 614ms
     ✓ scan-diff consumes each moved assertion once and … 701ms
     ✓ scan-diff does not match identical assertions fro… 655ms
     ✓ scan-diff does not match the same leaf test name … 697ms
     ✓ scan-diff does not match a same-named test with d… 718ms
     ✓ scan-diff does not match a same-named test with c… 704ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 710ms
     ✓ --paths with no match exits 1 628ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 470ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 845ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 873ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 927ms
     ✓ scan-diff ignores a removed comment in a test file 971ms
     ✓ scan-diff ignores an assertion moved within the file 976ms
     ✓ scan-diff still reports a removed assertion 860ms
     ✓ scan-diff reports an assertion re-added only outside the test file 926ms
     ✓ scan-diff finds an added pytest mark skip 888ms
     ✓ scan-diff finds an added unittest skip 844ms
     ✓ scan-diff finds an added bare skip call 841ms
     ✓ scan-diff ignores a quoted skip in a documentation file 856ms
     ✓ scan-diff ignores a marker literal in a non-test source file 878ms
     ✓ scan-diff ignores an assertion whose expectation changed 841ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 838ms
     ✓ scan-diff reports a deleted test file 935ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 592ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3261ms
     ✓ publishes local code with a CI running head before bookkeeping 3820ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5014ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3414ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2390ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1567ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1577ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1334ms
     ✓ --merge-docs skips an empty bkit:generate script 1182ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1030ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1943ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2253ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1555ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1532ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1941ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1220ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 807ms
     ✓ exits 10 when the fetch fails 542ms
     ✓ refuses --merge-docs with --head, and an unknown --head 589ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 997ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1579ms
     ✓ a failed install stops ship (16) 1772ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 968ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 990ms
     ✓ exits 10 when the fetch fails 737ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 514ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2348ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2278ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2042ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1279ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3340ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 532ms
     ✓ reports undeclared and runs nothing with an empty script 565ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 668ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 757ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 554ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 107594ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3134ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 308ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2219ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 2577ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1597ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 2014ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2575ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2241ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3410ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 312ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1384ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1870ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2572ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1403ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1263ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2002ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2840ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2229ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2726ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2190ms
       ✓ a branch with no status.jsonl dispatches as before 2403ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2710ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3328ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 3188ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2588ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts (124 tests) 14987ms
   ✓ cursor guardrails.cjs — tiers judge the commands that run, not quoted text (10)
     ✓ a force push behind timeout, env and nice is refused 310ms
   ✓ cursor guardrails.cjs — deny, ask and secret rules read parsed words (6)
     ✓ rm -rf of root or home is refused and of a project path is allowed 1007ms
> [bkit] TRUNCATED HERE — 100 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 512ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 498ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 335ms
     ✓ .husky/pre-push: first and last lines name the log 326ms
     ✓ .husky/pre-push: the hook body runs once 331ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 622ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 561ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 557ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 789ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 711ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 696ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 711ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 805ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 679ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 778ms
     ✓ .husky/pre-push: a gate fails → no disk prune 569ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 627ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 574ms
     ✓ a stale register stops the push before any gate runs 553ms
     ✓ bkit check fails → the push stops before any gate runs 753ms
     ✓ the dependency audit runs before any gate, when its script is present 647ms
     ✓ no dependency-audit script → skipped, the gates still run 710ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1141ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 595ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 914ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 628ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 752ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 868ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1189ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 672ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 575ms
     ✓ branch with no open PR → no check, push goes on 732ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 617ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 486ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 917ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 1170ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 478ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 794ms
     ✓ untrusted .envrc still prints the direnv allow line 466ms
     ✓ no .envrc → no direnv call 946ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 1905ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1806ms
     ✓ base fetch fails → warns, gates run 2391ms
     ✓ dev push → no PR lookup 2186ms
     ✓ min push of a conflicting PR → blocked 2897ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9465ms
     ✓ records the failed job count and reads an uncounted local round as unknown 6242ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 4235ms
     ✓ finishes the first CI evidence round of the second debug run 3015ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 3224ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1312ms
     ✓ runGit names ENOBUFS when output passes the limit 475ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 499ms
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 939ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1257ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1040ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 862ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 809ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 544ms
     ✓ runs the full gate for replayed debug code 898ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1111ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 959ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 996ms
     ✓ a push that fails without a server answer is returned once, never retried 920ms
     ✓ a failed fetch is returned before anything is built 319ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1301ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1111ms
     ✓ lands from a clone whose fetch refspec omits dev 1095ms
     ✓ build throwing stops the landing and removes the throwaway checkout 371ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 140 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1508ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2195ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2677ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1187ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1000ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 878ms
     ✓ plan installs dependencies like build and debug 889ms
     ✓ design stops on a failed install (5) 1065ms
     ✓ plan stops on a failed install (5) 1200ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 898ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1344ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 968ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1063ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1961ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1698ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1962ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2054ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1781ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2344ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2370ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2750ms
> [bkit] TRUNCATED HERE — 744 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 307 lines omitted. Dropped content was NOT read.
   ✓ bkit prs open (36)
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 328ms
     ✓ retries a failed create once, and exits 5 when it fails twice 311ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 1151ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ appends the auto-route marker on an exact bkit:auto label only 320ms
     ✓ takes an explicit --subject 306ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 403ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 327ms
   ✓ bkit prs update-branch (5)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ exits 80 without updating when gh cannot read dev's required checks 383ms
   ✓ bkit prs checks (7)
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 324ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 456ms
> [bkit] TRUNCATED HERE — 401 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 22548ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 444ms
     ✓ names each net-new and worsened finding in the log and the JSON 596ms
     ✓ fails on a net score rise with no net count change 371ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 538ms
     ✓ treats a net score at or below 0.001 as float noise 495ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 492ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 373ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 370ms
     ✓ exits 4 on a dropped net field instead of silently passing 554ms
     ✓ exits 4 on no summary instead of silently passing 478ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 598ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 921ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 502ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 519ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 442ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 391ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 406ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 331ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 443ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1437ms
     ✓ a refused dev push is logged, never fails the close 1705ms
     ✓ an unreachable remote is logged, never fails the close 525ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1887ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 2759ms
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 809ms
     ✓ a failing file absent at the base commit is the branch's 482ms
     ✓ an undeclared bkit:test:file reads unknown 458ms
     ✓ a failed base install reads unknown and removes the worktree 532ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 675ms
     ✓ copies the worktreeCopy entries into the base checkout 744ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3605ms
     ✓ a pull_request-event CI run at the base sha does not settle none 720ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 638ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 650ms
     ✓ the base test run does not inherit the hooks-off git config 669ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
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
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 1665ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 1287ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 1682ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 3566ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 678ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 694ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 696ms
   ✓ cloud bootstrap fingerprint compare — adoption signal (1)
     ✓ bkit check reports a stale adopted cloud bootstrap with the template block to copy 662ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 349ms
     ✓ writes zero files (purely read-only — write-set assertion) 344ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 340ms
     ✓ reports opencode as absent when .opencode/ does not exist 344ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 761ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 949ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1047ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1160ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (30 tests) 25625ms
   ✓ verified incremental push gates (30)
     ✓ keeps the later failure when two full gates overlap on the same commit 2132ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2007ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2046ms
     ✓ does not fall back through a malformed later success receipt 1158ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 854ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 687ms
     ✓ records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was 844ms
     ✓ a gate that has not finished leaves no failed receipt 550ms
     ✓ the restore step leaves another worktree's .failed file alone 533ms
     ✓ a pending attempt whose process is gone is not treated as running 1748ms
     ✓ a tests-lock wait in the push gate leaves the receipt as it was and hands the status file on to its caller 1337ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 413ms
     ✓ does not record a committed tree 427ms
     ✓ records no proof for a failed gate or lighter gate 663ms
     ✓ requires integration proof when integration is declared 798ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1582ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 713ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 355ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1091ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 876ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 433ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 386ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 380ms
     ✓ an unpinned repo reports nulls and asks no registry 371ms
   ✓ bkit repo preflight (4)
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 802ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 389ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 57ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 770ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 1196ms
       ✓ prints nothing to stdout when every recipe succeeds 1164ms
       ✓ logs and carries on when the installed bkit has no provision verb 596ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 349ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 404ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 393ms
     ✓ --file into a missing directory is refused, not created 504ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1140ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 767ms
     ✓ stops the step when the command crashed or was misused 860ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 569ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 505ms
     ✓ follows summary cursors even when the first page is shorter than the limit 925ms
     ✓ reports excluded intervals as unread even when pagination finishes 353ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 391ms
     ✓ reports an unread remainder at the page cap 725ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 349ms
     ✓ rejects missing summaries instead of treating them as empty results 314ms
     ✓ reports a failed first page as unavailable 315ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 684ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 348ms
     ✓ follows summary cursors even when the first page is shorter than the limit 434ms
     ✓ reports excluded intervals as unread even when pagination finishes 462ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1113ms
     ✓ reports an unread remainder at the page cap 714ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 635ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 487ms
     ✓ rejects missing summaries instead of treating them as empty results 581ms
     ✓ reports a failed first page as unavailable 1089ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 900ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (4 tests) 9ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 165 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-app-store.md
[bkit-test] delete: docs/templates/bkit-audit-architecture.md
[bkit-test] delete: docs/templates/bkit-audit-ci-performance.md
[bkit-test] delete: docs/templates/bkit-audit-config.md
[bkit-test] delete: docs/templates/bkit-audit-cost.md
[bkit-test] delete: docs/templates/bkit-audit-coverage.md
[bkit-test] delete: docs/templates/bkit-audit-database.md
[bkit-test] delete: docs/templates/bkit-audit-dead-code.md
[bkit-test] delete: docs/templates/bkit-audit-deferrals.md
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/core (payload view link)
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .bkit
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

stdout | .bkit/core/engine/install/payload-links.integration.test.ts > uninstall removes the payload view links > dry-run lists the links as deleted without removing them
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] core: .bkit/.env.example
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.2.0)
[bkit-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitattributes                                   | strip-block            | markered-text — strip bkit block, preserve consumer content
.bkit/.env.example                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/version                                    | delete                 | bkit install-state manifest — removed on full/core uninstall
.bkit/allowlist.json                             | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/authoring.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/cloud.md                                   | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/cli.md                                     | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/comparison.md                              | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/install.md                                 | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/jsonl.md                                   | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/LICENSE.md                                 | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/pipeline.md                                | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/providers.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/prompts.md                                 | strip-block            | markered-text — strip bkit block, preserve consumer content
.bkit/router.md                                  | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/templates.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/trackers.md                                | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/workflows.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/README.md                                  | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.agents/context.md                               | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/docs.md                                  | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/rules.md                                 | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/skills.md                                | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/templates/bkit-audit-accessibility.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-adoption.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-agents.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-aio-seo.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-analytics.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-annotations.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-app-performance.md     | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-app-store.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-architecture.md        | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-ci-performance.md      | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-config.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-cost.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-coverage.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-database.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-dead-code.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-deferrals.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-dependencies.md        | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-issues.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-llm.md                 | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-logs.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-models.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-privacy.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-prompts.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-red-team.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-reliability.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-repo.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-security.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-slop.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-testing.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-usability.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


stdout | .bkit/core/engine/install/payload-links.integration.test.ts > uninstall removes the payload view links > leaves a real directory at the link path alone — consumer content
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] core: .bkit/.env.example
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.2.0)
[bkit-test] delete (empty after strip): AGENTS.md
[bkit-test] delete (empty after strip): .gitignore
[bkit-test] delete (empty after strip): .gitattributes
[bkit-test] delete: .bkit/.env.example
[bkit-test] delete: .bkit/version
[bkit-test] delete: .bkit/allowlist.json
[bkit-test] delete: .bkit/authoring.md
[bkit-test] delete: .bkit/cloud.md
[bkit-test] delete: .bkit/cli.md
[bkit-test] delete: .bkit/comparison.md
[bkit-test] delete: .bkit/install.md
[bkit-test] delete: .bkit/jsonl.md
[bkit-test] delete: .bkit/LICENSE.md
[bkit-test] delete: .bkit/pipeline.md
[bkit-test] delete: .bkit/providers.md
[bkit-test] delete (empty after strip): .bkit/prompts.md
[bkit-test] delete: .bkit/router.md
[bkit-test] delete: .bkit/templates.md
[bkit-test] delete: .bkit/trackers.md
[bkit-test] delete: .bkit/workflows.md
[bkit-test] delete: .bkit/README.md
[bkit-test] delete (empty after strip): .agents/context.md
[bkit-test] delete (empty after strip): .agents/docs.md
[bkit-test] delete (empty after strip): .agents/rules.md
[bkit-test] delete (empty after strip): .agents/skills.md
[bkit-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-test] delete: docs/templates/bkit-audit-accessibility.md
[bkit-test] delete: docs/templates/bkit-audit-adoption.md
[bkit-test] delete: docs/templates/bkit-audit-agents.md
[bkit-test] delete: docs/templates/bkit-audit-aio-seo.md
[bkit-test] delete: docs/templates/bkit-audit-analytics.md
[bkit-test] delete: docs/templates/bkit-audit-annotations.md
[bkit-test] delete: docs/templates/bkit-audit-app-performance.md
[bkit-test] delete: docs/templates/bkit-audit-app-store.md
[bkit-test] delete: docs/templates/bkit-audit-architecture.md
[bkit-test] delete: docs/templates/bkit-audit-ci-performance.md
[bkit-test] delete: docs/templates/bkit-audit-config.md
[bkit-test] delete: docs/templates/bkit-audit-cost.md
[bkit-test] delete: docs/templates/bkit-audit-coverage.md
[bkit-test] delete: docs/templates/bkit-audit-database.md
[bkit-test] delete: docs/templates/bkit-audit-dead-code.md
[bkit-test] delete: docs/templates/bkit-audit-deferrals.md
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

 ✓ .bkit/core/engine/install/payload-links.integration.test.ts (8 tests) 1152ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 214ms
 ✓ .bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts (8 tests) 2078ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 114ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 49ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 114ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 17ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (11 tests) 32ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (14 tests) 37ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > never writes Codex's `.agents/skills/`
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 312ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 15ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (23 tests) 109599ms
   ✓ workflow comment lifecycle across real CLI processes (23)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 3463ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 959ms
     ✓ keeps published build completion and PR links in one terminal comment 5202ms
     ✓ continues after the prepared completion source disappears 2872ms
     ✓ records preparation and session association failures despite successful delivery 2915ms
     ✓ associates startup and run across restart or starts fresh safely 3761ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 11607ms
     ✓ keeps auto and phase progress separate across worktrees 5018ms
     ✓ continues close and cleanup after lost terminal response 3948ms
     ✓ starts fresh progress after cleanup and on a fresh clone 4738ms
     ✓ preserves substantive step results under a preparation comment boundary fault 5276ms
     ✓ preserves substantive step results under a cache comment boundary fault 5477ms
     ✓ preserves substantive step results under a receipt comment boundary fault 5650ms
     ✓ preserves substantive step results under a lock comment boundary fault 5418ms
     ✓ preserves substantive step results under a read comment boundary fault 5284ms
     ✓ preserves substantive step results under a append comment boundary fault 5865ms
     ✓ preserves substantive step results under a create comment boundary fault 5778ms
     ✓ preserves substantive step results under a reconciliation comment boundary fault 5297ms
     ✓ preserves substantive step results under a diagnostic comment boundary fault 5533ms
     ✓ keeps clean build progress and completion to two comments 7273ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 5623ms
     ✓ an ad-hoc comment with no run proof exits 2 and reaches no tracker 806ms
     ✓ accepts a session minted in the main checkout from a linked worktree 1834ms
 ✓ .bkit/core/engine/audits/templates/disk-prune-worktrees.integration.test.ts (3 tests) 3809ms
   ✓ example repo step — leftover worktrees (3)
     ✓ removes what loses nothing, keeps what is in use, notes the rest 3207ms
     ✓ notes a plain folder under .worktrees, even while the checkout is busy 307ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 13992ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
     ✓ bkit-build.md held close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 780ms
       ✓ leaves the subject unchanged when bkit:auto is absent 839ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 983ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1069ms
       ✓ leaves the subject unchanged when no labels are passed 1026ms
     ✓ bkit-build.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 995ms
       ✓ leaves the subject unchanged when bkit:auto is absent 1008ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 982ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 975ms
       ✓ leaves the subject unchanged when no labels are passed 1005ms
     ✓ bkit-debug.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 936ms
       ✓ leaves the subject unchanged when bkit:auto is absent 972ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 903ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 757ms
       ✓ leaves the subject unchanged when no labels are passed 749ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.integration.test.ts (14 tests) 3211ms

 Test Files  137 passed (137)
      Tests  8449 passed | 3 skipped (8452)
   Start at  19:06:32
   Duration  545.49s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/919-worktree-setup-tries/build-holistic-gate-1.log.reports/vitest-18068.xml

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
✔ .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs (55.978208ms)
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
✔ scripts/ci/bkit-check-dependency-audit.test.mjs (54.200625ms)
✔ generates isolated workspaces for five hosts and refuses an existing destination (783.30275ms)
✔ reports an edited sentinel with no hook as unverified, never as before-edit delivery (106.648625ms)
✔ distinguishes acknowledgements before and after editing using fresh challenge tokens (491.972916ms)
✔ missing and incorrect tokens cannot prove full visibility; report does not disclose tokens (243.988375ms)
✔ read tools and unrelated writes cannot trigger the armed edit challenge (224.397291ms)
✔ post-execution control stays after-execution even if acknowledgement is observed (196.48625ms)
✔ Antigravity accepts its camelCase payload and denies only the first default invocation (286.448875ms)
✔ Cursor tests the legacy edit envelope separately from its shell envelope (223.265625ms)
✔ an after-execution acknowledgement with an unchanged sentinel never proves before-edit delivery (227.110584ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2885.634375

[bkit:gate:changed] named: bats tests/shell/bkit-gh-stub.bats tests/shell/bkit-status-holes-sweep.bats
1..13
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
ok 12 the sweep prints the summary line the lane greps for
ok 13 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/.bkit/workflows.md .bkit/core/engine/commands/workflow/worktrees.integration.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts .bkit/version .bkit/workflows.md dist/commands/workflow/worktrees.js docs/plans/202611/919-worktree-setup-tries-plan.md docs/plans/202611/logs/919-worktree-setup-tries/build-brief-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-brief-tests-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-diff-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-input-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-install-skills.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-check.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-tasks-1-log.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-tests-1-log.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-verify-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-tests-green-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/build-tests-red-1-1.md docs/plans/202611/logs/919-worktree-setup-tries/status.jsonl docs/testing.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/919-worktree-setup-tries
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 3590 of 25927 lines (253 KB of 1.7 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
