
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts .bkit/friction.jsonl dist/commands/workflow/worktrees.js docs/observability.md docs/plans/202611/1055-worktree-removal-says-plan.md docs/plans/202611/logs/1055-worktree-removal-says/build-brief-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-brief-tests-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-diff-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-input-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-install-skills.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-check.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-tasks-1-log.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-tests-1-log.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-tests-green-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-tests-red-1-1.md docs/testing.md


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts .bkit/friction.jsonl dist/commands/workflow/worktrees.js docs/observability.md docs/plans/202611/1055-worktree-removal-says-plan.md docs/plans/202611/logs/1055-worktree-removal-says/build-brief-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-brief-tests-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-diff-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-input-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-install-skills.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-check.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-tasks-1-log.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-tests-1-log.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-tests-green-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-tests-red-1-1.md docs/testing.md

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 93724ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1789ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 661ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 1221ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 678ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 517ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 708ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 737ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1452ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 774ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1057ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 934ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1534ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 780ms
     ✓ PASS is 0 failures with or without reports 1444ms
     ✓ clears a previous attempt's reports before the gate runs 1051ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1527ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 980ms
     ✓ a log under the outbox is named main-checkout relative in the record 1064ms
     ✓ a log small enough is copied whole: not clamped, raw null 1032ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 913ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1242ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 780ms
     ✓ numbers runs within the workflow's active run and per step 1570ms
     ✓ tests run --file records the tested snapshot on its test-run row 1159ms
     ✓ a FAIL test-run row records each failing case as file and name 1301ms
     ✓ a PASS test-run row records no failed tests 1391ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 989ms
     ✓ without --file no row is written and the output carries row null 643ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 881ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 946ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 418ms
     ✓ the nothing-to-run row records the tested snapshot 488ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1406ms
     ✓ --since-pass-of skips failing runs and steps it does not name 2019ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 2422ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 2219ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1331ms
     ✓ changed-since refuses a sha that names no commit 320ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1347ms
     ✓ a deleted file that no file mentions passes and the log says so 576ms
     ✓ a failed importer search runs the whole check 954ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1669ms
     ✓ --changed-since=feature-base with no origin/dev meeting point measures from origin/dev and says so 313ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 1316ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 841ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 851ms
     ✓ a failing required push gate leaves the failed marker 754ms
     ✓ uncommitted code blocks the receipt until it is committed 1239ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1331ms
     ✓ only the required push gate records a receipt 905ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 1079ms
   ✓ bkit tests red / green (46)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 680ms
     ✓ a planned test that passes is a vacuous gap, exit 1 582ms
     ✓ a planned test absent from a loaded report is a missing gap 589ms
     ✓ a file that fails to load is a red of kind red-not-loaded 728ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 629ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 741ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 537ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 909ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 986ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 641ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 668ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1058ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 677ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 549ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 801ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 742ms
       ✓ a resumed tests red skips a taken-over entry 624ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 642ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1075ms
     ✓ green: a passed-accepted test is already landed, not a gap 657ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 734ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 760ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 700ms
       ✓ green leaves a changed test the plan no longer names out of changed 1085ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 800ms
       ✓ green lists a changed test when test-first is not enforced 313ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 571ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 591ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 548ms
     ✓ green: --group audits only that group's tasks 507ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 647ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 688ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 621ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 750ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 576ms
     ✓ green: lists each gap kind, with the runner output 542ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 996ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 351ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 112931ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1873ms
   ✓ preserves the requested event for selected-workflow verification 1117ms
   ✓ requires selected other-workflow success at the exact pushed head 2117ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 3165ms
     ✓ saves the failed job count without the capstone job 1380ms
     ✓ a CI selection keeps the failed job names, capstone left out 2054ms
     ✓ counts the capstone job when it is the only failed job 1530ms
     ✓ saves no failed job count when no job failed 771ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1524ms
     ✓ freezes explicit workflow run attempt and all failed job pages 2005ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1857ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2806ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 604ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 687ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 996ms
     ✓ rejects a workflow result count smaller than its returned records 991ms
     ✓ validates normalized fallback evidence against the requested identity 459ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 1555ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1532ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2138ms
     ✓ checks the named repository base and fails closed on missing evidence 987ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 897ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1030ms
     ✓ rejects MCP capstone jobs belonging to another run 1433ms
     ✓ --fetch refreshes origin/<branch> before gating 631ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 635ms
       ✓ a source change past the validated head refuses (17) and names the path 531ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 626ms
       ✓ --validated without --month / --fid is a usage error (2) 440ms
       ✓ a validated sha that is not an ancestor refuses (17) 522ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 521ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1288ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1153ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 672ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1521ms
     ✓ a failed re-trigger push names the cause in the log 1602ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2142ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2625ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1689ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 689ms
     ✓ gh-error: every poll errored 575ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1440ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1327ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 884ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1678ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 1366ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 433ms
     ✓ CLI: verdict JSON, body scan, exit codes 1003ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 659ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 356ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 365ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 398ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 398ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 427ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1385ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1567ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1302ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1405ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 557ms
     ✓ re-trigger on dev only uses the record of its own FID 1091ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1182ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 1077ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 480ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 328ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1306ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 371ms
       ✓ without --repo no call gains a --repo flag 465ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 2054ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 320ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 319ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 419ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 338ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 333ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 367ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 653ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 704ms
     ✓ debug: a failure test run is a failed run 723ms
     ✓ debug: a timed_out test run is a failed run 692ms
     ✓ debug: a startup_failure test run is a failed run 916ms
     ✓ debug: a test run still in progress or cancelled is not returned 708ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 698ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 921ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1236ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 346ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 547ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 698ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 633ms
     ✓ --file and --step go together 525ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2870ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 587ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 620ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 622ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 716ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 666ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 688ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 692ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 686ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 703ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (328 tests) 344ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (121 tests) 26479ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 380ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 324ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 307ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 329ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 778ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 433ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 359ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 394ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 392ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 372ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 353ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 533ms
     ✓ --path records its commit on the run's record, like every other commit mode 538ms
     ✓ a recorded ledger commits only the rows the run appended 759ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 932ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 740ms
     ✓ commitBookkeeping refuses when a recorded path changed 368ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 545ms
     ✓ under --mode=commit counts the squashed paths as something to commit 554ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 398ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 328ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 333ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 451ms
     ✓ a source file in the range: exit 7, path listed 339ms
     ✓ another FID's plan file in the range: exit 7 372ms
     ✓ from not an ancestor of to: exit 7 300ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 573ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 375ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 476ms
   ✓ bkit ledgers append --operation (6)
     ✓ keeps ledger operation intents and receipts out of committed book paths 428ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests) 52667ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 430ms
     ✓ finishes a CI round only with its own failed job count 363ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 329ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 432ms
     ✓ reports a failed commit with exit 8 without writing the row 741ms
     ✓ a failed commit leaves no row staged in the index 994ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 657ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1101ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 513ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 472ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 621ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 305ms
     ✓ --ref exits 3 when the ref does not carry the status file 363ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 375ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 365ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 331ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 429ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 570ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 407ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 551ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 798ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 487ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 490ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 353ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 687ms
     ✓ writeStepRow refuses when a recorded path changed 818ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 395ms
     ✓ writeStepRow appends its commit sha to the record 729ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 921ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 582ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 535ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 558ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 360ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 914ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 630ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 506ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 334ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 783ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 326ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 318ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 545ms
     ✓ the tests step's finish passes its own group's and taken-over tests 725ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 541ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 536ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 523ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 574ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 405ms
     ✓ the refusal names the BLOCKED line the engine reads 311ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 760ms
     ✓ refuses a later code step that changes a BLOCKED change again 547ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 729ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 875ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 392ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 624ms
     ✓ the refusal of a re-change says the logged reason is already recorded 571ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 359ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 409ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 373ms
     ✓ the same contradicted finish run again adds no second task or row 422ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 383ms
     ✓ a mixed refusal names both tests and words the problem for each kind 444ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 453ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 337ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 562ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 697ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 492ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 752ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 638ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 321ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 327ms
     ✓ does not count an artifact the run found committed when it started 416ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 430ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 746ms
   ✓ bkit steps stub --result-file (12)
     ✓ renders and verifies the header of every prompt that declares one 401ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (82 tests) 64ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1527ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 2497ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 12763ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 472ms
     ✓ keeps each context's own section banner and drops every other context's 1136ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 303ms
     ✓ finalise derives verdict, artifacts, configured contexts and clamp records 394ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 503ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 361ms
     ✓ --base narrows the range to the commits after a group's start sha 354ms
     ✓ diff from a group start covers only the group's commits 388ms
     ✓ an empty range writes a one-line note and zero numbers 341ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 444ms
     ✓ --reset-log empties the step's clamp log before the record lands 675ms
     ✓ whole: nothing omitted and no copy kept 308ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 316ms
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 314ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 620ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 668ms
     ✓ context diff without --base leaves out an unpushed local dev commit 409ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 2928ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 2066ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 410ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (190 tests) 164167ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 418ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1408ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 369ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 306ms
     ✓ writes no limits for a workflow with no ask point 323ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 402ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 416ms
       ✓ a new run in the same chat gets its own session row 354ms
       ✓ writes none outside Claude Code 318ms
     ✓ opens the next run after a finished one, and after another workflow's run 372ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 491ms
     ✓ design / plan / build / debug book in the current worktree 460ms
     ✓ --lock-held checks the lock is ours 523ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 333ms
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 478ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 391ms
     ✓ aborts a rebase only when one is in progress 688ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 465ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 528ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 399ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 428ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 417ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 349ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 341ms
     ✓ a debug run in SOAK mode always needs a handover 352ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 826ms
       ✓ counts subagents of an earlier chat the run's session rows name 797ms
       ✓ records no context block, and still closes, outside a Claude Code session 656ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 648ms
     ✓ records ending held and publish false on the workflow-done row 771ms
     ✓ defaults the close row to ending done 693ms
     ✓ refuses an unknown ending 312ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 685ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 765ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 688ms
     ✓ always writes the telemetry, whatever the runtime 616ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 582ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 768ms
     ✓ an unwritable stats path is logged and never fails the close 718ms
     ✓ appends the completeness row before the workflow-done row 841ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 781ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 657ms
     ✓ writes one completeness row per close 1279ms
     ✓ leaves out the previous run's rows that share a second with this run's start 701ms
     ✓ still closes when the completeness check throws 727ms
     ✓ still closes when the completeness row write throws 681ms
     ✓ ship: run.pr, size of the squash commit, and coverage 867ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1262ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 738ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 679ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1089ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1130ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1110ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 877ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 822ms
     ✓ --record-step writes the close step's row before workflow-done 672ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 676ms
     ✓ --number without --outbox is a usage error 705ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 1028ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 988ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1103ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1107ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 908ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 524ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 456ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3035ms
     ✓ --flush with nothing to record commits and pushes nothing 1530ms
     ✓ --flush carries the named worktree's logs into the dev commit 2736ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 3339ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 4090ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 3632ms
     ✓ closePr titles the PR by the record it carries 3214ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 843ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 692ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 1067ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 847ms
       ✓ --ref, no push → route stop, no message 442ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 922ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2019ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3429ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2333ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2772ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2208ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2300ms
     ✓ --push on dev never carries a row whose references name another feature 1947ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1759ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3505ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2370ms
     ✓ --push commits in the named worktree, not the checkout it runs from 967ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2193ms
     ✓ preserves unlanded file deletions and ledger additions on close 4478ms
     ✓ preserves dirty work and uncertain branch evidence during close 4411ms
     ✓ preserves a local feature ref changed after its cleanup proof 4404ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2446ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1864ms
     ✓ a close that landed releases the lock 2392ms
     ✓ removes the worktree before it releases the lock 2319ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3292ms
       ✓ closePr refuses when the PR base is unknown 2899ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2134ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 339ms
     ✓ names the branch, not the remote-tracking ref, in each URL 323ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 710ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 406ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2450ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2299ms
       ✓ a run closed by workflow-failed keeps no parked copy 1922ms
       ✓ a run closed by workflow-done keeps no parked copy 1972ms
       ✓ a FAILED run gets no row 2031ms
       ✓ a DONE run gets no row 2000ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1895ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 347ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 3845ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1323ms
     ✓ runGit names ENOBUFS when output passes the limit 687ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 638ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 456ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 783ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 308ms
     ✓ challenge gate without --base sizes only the branch's own lines 389ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 825ms
> [bkit] TRUNCATED HERE — 67 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1158ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1315ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 978ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1026ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1034ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 639ms
     ✓ runs the full gate for replayed debug code 992ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1210ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1171ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1214ms
     ✓ a push that fails without a server answer is returned once, never retried 1106ms
     ✓ a failed fetch is returned before anything is built 406ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1682ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1371ms
     ✓ lands from a clone whose fetch refspec omits dev 1433ms
     ✓ build throwing stops the landing and removes the throwaway checkout 476ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 793ms
     ✓ a failing file absent at the base commit is the branch's 446ms
     ✓ an undeclared bkit:test:file reads unknown 411ms
     ✓ a failed base install reads unknown and removes the worktree 477ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 609ms
     ✓ copies the worktreeCopy entries into the base checkout 543ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3294ms
     ✓ a pull_request-event CI run at the base sha does not settle none 595ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 590ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 549ms
     ✓ the base test run does not inherit the hooks-off git config 553ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 859ms
     ✓ counts files committed since --base 473ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 705ms
     ✓ runs nothing and exits 0 when no file changed 424ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 704ms
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1279ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1493ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2164ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1086ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 817ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 841ms
     ✓ plan installs dependencies like build and debug 813ms
     ✓ design stops on a failed install (5) 848ms
     ✓ plan stops on a failed install (5) 857ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 838ms
     ✓ tracks origin/feat/{fid} when only the remote has it 980ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 790ms
     ✓ reports a package manager that could not run (127) apart from a failed install 979ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1866ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1505ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1661ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1501ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1548ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2092ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1937ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2487ms
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 727ms
     ✓ refuses a code conflict and aborts the rebase on the spot 735ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1704ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 461ms
     ✓ produces byte-identical output to merge=union 1174ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 807ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1867ms
     ✓ refuses a lockfile whose regenerate command fails 1504ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1033ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1286ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 585ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 809ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 909ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1177ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 743ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 575ms
       ✓ runs (0) with the landed path count once dev moved 1094ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 580ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1178ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2185ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3098ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 822ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1640ms
     ✓ --mode=abort pushes when the branch has no open PR 1169ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1336ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 724ms
     ✓ --open-pr carries the MCP answer and skips gh 1010ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1482ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1311ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3081ms
     ✓ skip-ci HEAD on the replay is refused 968ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2166ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 696ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1108ms
     ✓ a fetch that fails exits 10 528ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 601ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 525ms
     ✓ scan-diff attributes deletion to its old test ins… 474ms
     ✓ scan-diff consumes each moved assertion once and … 610ms
     ✓ scan-diff does not match identical assertions fro… 669ms
     ✓ scan-diff does not match the same leaf test name … 627ms
     ✓ scan-diff does not match a same-named test with d… 642ms
     ✓ scan-diff does not match a same-named test with c… 654ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 653ms
     ✓ --paths with no match exits 1 602ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 468ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 856ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 878ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 676ms
     ✓ scan-diff ignores a removed comment in a test file 631ms
     ✓ scan-diff ignores an assertion moved within the file 638ms
     ✓ scan-diff still reports a removed assertion 646ms
     ✓ scan-diff reports an assertion re-added only outside the test file 636ms
     ✓ scan-diff finds an added pytest mark skip 697ms
     ✓ scan-diff finds an added unittest skip 615ms
     ✓ scan-diff finds an added bare skip call 619ms
     ✓ scan-diff ignores a quoted skip in a documentation file 631ms
     ✓ scan-diff ignores a marker literal in a non-test source file 654ms
     ✓ scan-diff ignores an assertion whose expectation changed 639ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 645ms
     ✓ scan-diff reports a deleted test file 691ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 520ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3166ms
     ✓ publishes local code with a CI running head before bookkeeping 3627ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4789ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2906ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2020ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1431ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1338ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1107ms
     ✓ --merge-docs skips an empty bkit:generate script 962ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 935ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1396ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1739ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1384ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1375ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1852ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1012ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 737ms
     ✓ exits 10 when the fetch fails 468ms
     ✓ refuses --merge-docs with --head, and an unknown --head 521ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 879ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1206ms
     ✓ a failed install stops ship (16) 1178ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 963ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 964ms
     ✓ exits 10 when the fetch fails 699ms
   ✓ shared landed comparison (5)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 521ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2231ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1966ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2078ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1127ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3124ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 451ms
     ✓ reports undeclared and runs nothing with an empty script 411ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 444ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 555ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 393ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 1079ms
     ✓ vitest — with no report path the test file is left as it was 667ms
     ✓ a run naming files of two kinds is refused as a usage error 326ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 413ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 495ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 401ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 348ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30415ms

 Test Files  40 passed (40)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --attempt=next advances with each row, so the next parentSha differs 444ms
     ✓ carries extra fields, parsed as JSON when they are JSON 335ms
     ✓ reports a failed commit with exit 8 without writing the row 737ms
     ✓ a failed commit leaves no row staged in the index 702ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 572ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 517ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 694ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 434ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 731ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 308ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ writes attempt 0 rather than dropping it 309ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 320ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 321ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 430ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 667ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 425ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 695ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 584ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 417ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 428ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 417ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 405ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 340ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 336ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 620ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 449ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 483ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 465ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 701ms
     ✓ PASS is 0 failures with or without reports 577ms
     ✓ clears a previous attempt's reports before the gate runs 568ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 358ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 370ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 997ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 456ms
     ✓ numbers runs within the workflow's active run and per step 846ms
     ✓ tests run --file records the tested snapshot on its test-run row 464ms
     ✓ a FAIL test-run row records each failing case as file and name 415ms
     ✓ a PASS test-run row records no failed tests 827ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 429ms
     ✓ without --file no row is written and the output carries row null 324ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 334ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 956ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1115ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 844ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 617ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 596ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 632ms
     ✓ a deleted file that no file mentions passes and the log says so 390ms
     ✓ a failed importer search runs the whole check 661ms
     ✓ --changed-since=feature-base starts at the feature's start commit 705ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 607ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 499ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 514ms
     ✓ a failing required push gate leaves the failed marker 452ms
     ✓ uncommitted code blocks the receipt until it is committed 722ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 513ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 390ms
     ✓ a planned test absent from a loaded report is a missing gap 403ms
     ✓ a file that fails to load is a red of kind red-not-loaded 542ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 503ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 648ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 404ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 703ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 576ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 483ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 505ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 618ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 504ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 601ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 514ms
     ✓ green: lists each gap kind, with the runner output 491ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 861ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 19933ms
   ✓ the dispatch seam on a real worktree (7)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1179ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (328 tests) 294ms
stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 372ms
     ✓ invalidates missing corrupt and unsupported progress cache 710ms
     ✓ contains cache read and write failures as standalone degradation 355ms
     ✓ uses legacy receipts and contains receipt failures 322ms
     ✓ records an engine-action row and skips the same key + body on a re-run 312ms
     ✓ a failed post reports done false with the reason and never leaks a token 305ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 353ms
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 379ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 317ms
     ✓ aborts a rebase only when one is in progress 536ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 540ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 524ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 315ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 301ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 352ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 397ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 449ms
     ✓ an unwritable stats path is logged and never fails the close 434ms
     ✓ appends the completeness row before the workflow-done row 527ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 477ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 559ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 803ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 493ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 496ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 441ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 478ms
     ✓ --number without --outbox is a usage error 434ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 646ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 675ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 528ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1720ms
     ✓ --flush with nothing to record commits and pushes nothing 918ms
     ✓ --flush carries the named worktree's logs into the dev commit 1688ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1955ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 2242ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 3108ms
     ✓ closePr titles the PR by the record it carries 2229ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 3428ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1947ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1501ms
     ✓ a close that landed releases the lock 2062ms
     ✓ removes the worktree before it releases the lock 2093ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 2589ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1659ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 548ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 355ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1816ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1790ms
       ✓ a run closed by workflow-failed keeps no parked copy 1730ms
       ✓ a run closed by workflow-done keeps no parked copy 1670ms
       ✓ a FAILED run gets no row 1657ms
       ✓ a DONE run gets no row 1759ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1617ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 304ms
> [bkit] TRUNCATED HERE — 71 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 630ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 355ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 330ms
     ✓ explicit `bkit help` prints the same usage and exits 0 330ms
     ✓ `bkit check --claude` (stray module flag) errors 343ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 348ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 707ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 708ms
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 2776ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 2593ms
     ✓ malformed .mcp.json fails install instead of being overwritten 504ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2453ms
> [bkit] TRUNCATED HERE — 779 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 287 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 30591ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 673ms
     ✓ names each net-new and worsened finding in the log and the JSON 684ms
     ✓ fails on a net score rise with no net count change 420ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 887ms
     ✓ treats a net score at or below 0.001 as float noise 620ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 472ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 308ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 753ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 725ms
     ✓ exits 4 on a dropped net field instead of silently passing 877ms
     ✓ exits 4 on no summary instead of silently passing 963ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 923ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1246ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 620ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 625ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 685ms
     ✓ explicit globs can select ignored prose and nested checkout files 386ms
     ✓ fails (exit 1) when vale reports alerts 516ms
     ✓ exits 6 on a vale runtime error 305ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 379ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 797ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 381ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 436ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 352ms
> [bkit] TRUNCATED HERE — 384 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 172 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 812ms
     ✓ passes every rule on a clean head 371ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 420ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (286 tests) 248772ms
   ✓ branches rebase: behaviour (32)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 499ms
     ✓ refuses a code conflict and aborts the rebase on the spot 436ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1030ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 385ms
     ✓ produces byte-identical output to merge=union 1016ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 753ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1173ms
     ✓ refuses a lockfile whose regenerate command fails 754ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 894ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 810ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 477ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 532ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 633ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 822ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 470ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 401ms
       ✓ runs (0) with the landed path count once dev moved 724ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 389ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 766ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1190ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1863ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 479ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 861ms
     ✓ --mode=abort pushes when the branch has no open PR 1088ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 634ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 426ms
     ✓ --open-pr carries the MCP answer and skips gh 546ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 864ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1298ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2696ms
     ✓ skip-ci HEAD on the replay is refused 696ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1621ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 599ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 910ms
     ✓ a fetch that fails exits 10 414ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 507ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 508ms
     ✓ scan-diff attributes deletion to its old test ins… 531ms
     ✓ scan-diff consumes each moved assertion once and … 595ms
     ✓ scan-diff does not match identical assertions fro… 550ms
     ✓ scan-diff does not match the same leaf test name … 510ms
     ✓ scan-diff does not match a same-named test with d… 506ms
     ✓ scan-diff does not match a same-named test with c… 524ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 543ms
     ✓ --paths with no match exits 1 494ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 396ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 742ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 652ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 512ms
     ✓ scan-diff ignores a removed comment in a test file 522ms
     ✓ scan-diff ignores an assertion moved within the file 525ms
     ✓ scan-diff still reports a removed assertion 496ms
     ✓ scan-diff reports an assertion re-added only outside the test file 486ms
     ✓ scan-diff finds an added pytest mark skip 545ms
     ✓ scan-diff finds an added unittest skip 466ms
     ✓ scan-diff finds an added bare skip call 466ms
     ✓ scan-diff ignores a quoted skip in a documentation file 500ms
     ✓ scan-diff ignores a marker literal in a non-test source file 505ms
     ✓ scan-diff ignores an assertion whose expectation changed 508ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 488ms
     ✓ scan-diff reports a deleted test file 498ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 404ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 2624ms
     ✓ publishes local code with a CI running head before bookkeeping 3017ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4024ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2701ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1893ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1265ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1217ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1124ms
     ✓ --merge-docs skips an empty bkit:generate script 1363ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1237ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1807ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2104ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1617ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1568ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1940ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1093ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 748ms
     ✓ exits 10 when the fetch fails 446ms
     ✓ refuses --merge-docs with --head, and an unknown --head 495ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 910ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1179ms
     ✓ a failed install stops ship (16) 1031ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 980ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 966ms
     ✓ exits 10 when the fetch fails 812ms
   ✓ shared landed comparison (5)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 618ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1778ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1753ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1574ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1036ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3080ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 976ms
     ✓ reports undeclared and runs nothing with an empty script 1000ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1153ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1339ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1099ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
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

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > install copies the template set into .bkit/templates/ > a second run writes no copy; a stale or stray copy is a write in dry-run and live alike
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
[bkit-test] Running core payload pass
[bkit-test] Running bkit docs pass
[bkit-test] Running template copies pass

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > uninstall > removes the consumer's .bkit/templates/ copies
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
[bkit-test] delete: .bkit/core (payload view link)
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .bkit
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > the sample configs do not act as live configs in a consumer > ships the sample configs under non-discoverable names
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

 ✓ .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts (39 tests) 5677ms
   ✓ dogfood authoring advisories — each file gets the sections whose scope names it (27)
     ✓ claude: doc gets § All Agent-Read Files, § Docs 462ms
     ✓ claude: agent-read file gets § All Agent-Read Files 312ms
     ✓ claude: files no agent reads get no authoring advisory 381ms
     ✓ cursor: doc gets § All Agent-Read Files, § Docs 541ms
     ✓ cursor: files no agent reads get no authoring advisory 372ms
     ✓ codex: doc gets § All Agent-Read Files, § Docs 429ms
     ✓ codex: files no agent reads get no authoring advisory 358ms
     ✓ opencode: doc gets § All Agent-Read Files, § Docs 489ms
     ✓ opencode: files no agent reads get no authoring advisory 354ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 207ms
stdout | .bkit/core/engine/install/template-copies.integration.test.ts > the sample configs do not act as live configs in a consumer > leaves a staged template copy unchanged under plain lint-staged
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

 ✓ .bkit/core/engine/install/template-copies.integration.test.ts (19 tests) 9739ms
   ✓ install copies the template set into .bkit/templates/ (3)
     ✓ copies exactly the set, raw, keeping each file's mode, with no hash record 378ms
     ✓ a second run writes no copy; a stale or stray copy is a write in dry-run and live alike 367ms
   ✓ uninstall (1)
     ✓ removes the consumer's .bkit/templates/ copies 426ms
   ✓ the sample configs do not act as live configs in a consumer (2)
     ✓ ships the sample configs under non-discoverable names 466ms
     ✓ leaves a staged template copy unchanged under plain lint-staged 8015ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 747ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 155ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests) 1167ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (38 tests) 164ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (7 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 87ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 272ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 10020ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 2635ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 2020ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 5363ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.integration.test.ts (14 tests) 6110ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (62 tests) 116268ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 2125ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 13104ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1186ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 948ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 884ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1418ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1616ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2073ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 962ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 726ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 342ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 723ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 773ms
     ✓ design installs dependencies like build and debug 762ms
     ✓ plan installs dependencies like build and debug 732ms
     ✓ design stops on a failed install (5) 869ms
     ✓ plan stops on a failed install (5) 824ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1067ms
     ✓ tracks origin/feat/{fid} when only the remote has it 913ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 734ms
     ✓ reports a package manager that could not run (127) apart from a failed install 879ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1847ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3084ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 2835ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2266ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1916ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 2290ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2426ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2665ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2271ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2440ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3723ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2640ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3990ms
     ✓ commits leftovers when a copy entry points outside the checkout 3225ms
     ✓ never commits the entries setup copies in from the main checkout 3009ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 3152ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1551ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1505ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1969ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 2094ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 2086ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 2116ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2049ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2317ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2422ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1023ms
     ✓ leaves a clean worktree's history alone 1688ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1831ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 2339ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1919ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 2509ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 2368ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2006ms
     ✓ does not mark a resumed worktree it did not create 802ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (1)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 439ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 499ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 818ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1091ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 684ms
 ✓ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (23 tests) 77657ms
   ✓ workflow comment lifecycle across real CLI processes (23)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 4578ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 1372ms
     ✓ keeps published build completion and PR links in one terminal comment 6896ms
     ✓ continues after the prepared completion source disappears 3295ms
     ✓ records preparation and session association failures despite successful delivery 3821ms
     ✓ associates startup and run across restart or starts fresh safely 5122ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 9779ms
     ✓ keeps auto and phase progress separate across worktrees 3548ms
     ✓ continues close and cleanup after lost terminal response 3364ms
     ✓ starts fresh progress after cleanup and on a fresh clone 3396ms
     ✓ preserves substantive step results under a preparation comment boundary fault 3134ms
     ✓ preserves substantive step results under a cache comment boundary fault 2760ms
     ✓ preserves substantive step results under a receipt comment boundary fault 2749ms
     ✓ preserves substantive step results under a lock comment boundary fault 2686ms
     ✓ preserves substantive step results under a read comment boundary fault 2648ms
     ✓ preserves substantive step results under a append comment boundary fault 2685ms
     ✓ preserves substantive step results under a create comment boundary fault 2697ms
     ✓ preserves substantive step results under a reconciliation comment boundary fault 2667ms
     ✓ preserves substantive step results under a diagnostic comment boundary fault 2760ms
     ✓ keeps clean build progress and completion to two comments 3949ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 2549ms
     ✓ an ad-hoc comment with no run proof exits 2 and reaches no tracker 348ms
     ✓ accepts a session minted in the main checkout from a linked worktree 853ms

 Test Files  47 passed (47)
      Tests  4168 passed (4168)
   Start at  22:32:15
   Duration  319.45s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1055-worktree-removal-says/build-holistic-gate-1.log.reports/vitest-17596.xml

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/worktrees.test.ts .bkit/core/engine/commands/workflow/worktrees.ts .bkit/friction.jsonl dist/commands/workflow/worktrees.js docs/observability.md docs/plans/202611/1055-worktree-removal-says-plan.md docs/plans/202611/logs/1055-worktree-removal-says/build-brief-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-brief-tests-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-diff-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-input-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-install-skills.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-check.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-tasks-1-log.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-tests-1-log.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-plan-verify-holistic-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-tests-green-1-1.md docs/plans/202611/logs/1055-worktree-removal-says/build-tests-red-1-1.md docs/testing.md
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2055 of 4721 lines (150 KB of 367 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
