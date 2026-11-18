
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts dist/commands/workflow/workflows.js docs/plans/202611/811-publish-dev-refused-plan.md docs/plans/202611/logs/811-publish-dev-refused/build-brief-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-brief-tests-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-diff-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-tests-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-tests-green-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-tests-red-1-1.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts dist/commands/workflow/workflows.js docs/plans/202611/811-publish-dev-refused-plan.md docs/plans/202611/logs/811-publish-dev-refused/build-brief-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-brief-tests-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-diff-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-tests-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-tests-green-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-tests-red-1-1.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 43502ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 486ms
     ✓ finishes a CI round only with its own failed job count 432ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 341ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 452ms
     ✓ reports a failed commit with exit 8 without writing the row 1007ms
     ✓ a failed commit leaves no row staged in the index 580ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 655ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 710ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 744ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 499ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 826ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 330ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 316ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 438ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 315ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 355ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 584ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 357ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 346ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 523ms
     ✓ writeStepRow refuses when a recorded path changed 662ms
     ✓ writeStepRow appends its commit sha to the record 441ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 744ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 386ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 366ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 385ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 570ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 379ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 455ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 301ms
     ✓ the tests step's finish passes its own group's and taken-over tests 406ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 334ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 380ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 578ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 670ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 404ms
     ✓ the refusal names the BLOCKED line the engine reads 322ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 744ms
     ✓ refuses a later code step that changes a BLOCKED change again 550ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 782ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 799ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 336ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 449ms
     ✓ the refusal of a re-change says the logged reason is already recorded 418ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 336ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 429ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 371ms
     ✓ the same contradicted finish run again adds no second task or row 427ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 348ms
     ✓ a mixed refusal names both tests and words the problem for each kind 378ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 398ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 325ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 560ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 679ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 439ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 587ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 540ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 322ms
     ✓ does not count an artifact the run found committed when it started 439ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 499ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 775ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 314ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 55388ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1583ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 553ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 558ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 345ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 363ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 365ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1030ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 554ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 492ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 423ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 706ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 517ms
     ✓ PASS is 0 failures with or without reports 751ms
     ✓ clears a previous attempt's reports before the gate runs 313ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 312ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 382ms
     ✓ a log under the outbox is named main-checkout relative in the record 397ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 708ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 442ms
     ✓ numbers runs within the workflow's active run and per step 763ms
     ✓ tests run --file records the tested snapshot on its test-run row 409ms
     ✓ a FAIL test-run row records each failing case as file and name 365ms
     ✓ a PASS test-run row records no failed tests 727ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 370ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 523ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 481ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 818ms
     ✓ --since-pass-of skips failing runs and steps it does not name 942ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 719ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 558ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 496ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 543ms
     ✓ a deleted file that no file mentions passes and the log says so 399ms
     ✓ a failed importer search runs the whole check 582ms
     ✓ --changed-since=feature-base starts at the feature's start commit 612ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 512ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 388ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 386ms
     ✓ a failing required push gate leaves the failed marker 361ms
     ✓ uncommitted code blocks the receipt until it is committed 638ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 359ms
     ✓ only the required push gate records a receipt 411ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 508ms
   ✓ bkit tests red / green (46)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 939ms
     ✓ a planned test that passes is a vacuous gap, exit 1 480ms
     ✓ a planned test absent from a loaded report is a missing gap 616ms
     ✓ a file that fails to load is a red of kind red-not-loaded 766ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 553ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 781ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 409ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 426ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1174ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 430ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 568ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 794ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 683ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 560ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 571ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 862ms
       ✓ a resumed tests red skips a taken-over entry 574ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 654ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 758ms
     ✓ green: a passed-accepted test is already landed, not a gap 598ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 442ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 501ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 485ms
       ✓ green leaves a changed test the plan no longer names out of changed 530ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 546ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 390ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 456ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 455ms
     ✓ green: --group audits only that group's tasks 404ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 481ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 548ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 455ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 583ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 463ms
     ✓ green: lists each gap kind, with the runner output 461ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 923ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 327ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests) 22112ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 378ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 343ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 680ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 337ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 321ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 324ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 324ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 448ms
     ✓ --path records its commit on the run's record, like every other commit mode 433ms
     ✓ a recorded ledger commits only the rows the run appended 644ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 795ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 725ms
     ✓ commitBookkeeping refuses when a recorded path changed 373ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 422ms
     ✓ under --mode=commit counts the squashed paths as something to commit 436ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 303ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 374ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 517ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 365ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 373ms
   ✓ bkit ledgers append --operation (6)
     ✓ keeps ledger operation intents and receipts out of committed book paths 436ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 11287ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 370ms
     ✓ keeps each context's own section banner and drops every other context's 1023ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 410ms
   ✓ bkit context diff (10)
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 426ms
     ✓ --reset-log empties the step's clamp log before the record lands 659ms
     ✓ whole: nothing omitted and no copy kept 302ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 356ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 578ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 679ms
     ✓ context diff without --base leaves out an unpushed local dev commit 485ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (75 tests) 64ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1458ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 2417ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3035ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 75489ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1257ms
   ✓ preserves the requested event for selected-workflow verification 948ms
   ✓ requires selected other-workflow success at the exact pushed head 1922ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1683ms
     ✓ saves the failed job count without the capstone job 489ms
     ✓ a CI selection keeps the failed job names, capstone left out 1121ms
     ✓ counts the capstone job when it is the only failed job 717ms
     ✓ saves no failed job count when no job failed 514ms
     ✓ filters branch and PR discovery by configured workflow and exact head 824ms
     ✓ freezes explicit workflow run attempt and all failed job pages 545ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 984ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1187ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 368ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 366ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 380ms
     ✓ rejects a workflow result count smaller than its returned records 345ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 951ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1160ms
     ✓ checks the named repository base and fails closed on missing evidence 628ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 539ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 579ms
     ✓ rejects MCP capstone jobs belonging to another run 796ms
     ✓ --fetch refreshes origin/<branch> before gating 384ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 310ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 469ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 470ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1078ms
   ✓ bkit runs dispatch (21)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 489ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1079ms
     ✓ a failed re-trigger push names the cause in the log 1101ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1415ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1601ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 891ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 433ms
     ✓ gh-error: every poll errored 426ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 825ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 859ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 614ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1044ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 950ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 374ms
     ✓ CLI: verdict JSON, body scan, exit codes 845ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 638ms
     ✓ CLI: dispatch without a run's invocation is refused, and nothing is polled or committed 388ms
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 398ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 336ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 390ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 366ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 1223ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1386ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1184ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1193ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 464ms
     ✓ re-trigger on dev only uses the record of its own FID 565ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 718ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 601ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 310ms
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1214ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 302ms
       ✓ without --repo no call gains a --repo flag 369ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1538ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 379ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 310ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 654ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 613ms
     ✓ debug: a failure test run is a failed run 626ms
     ✓ debug: a timed_out test run is a failed run 596ms
     ✓ debug: a startup_failure test run is a failed run 719ms
     ✓ debug: a test run still in progress or cancelled is not returned 595ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 647ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 603ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1140ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 427ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 604ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 634ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 672ms
     ✓ --file and --step go together 519ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2593ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 598ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 606ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 552ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 656ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 619ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 560ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 509ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 509ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 500ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 1771ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 356ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 19665ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 750ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 829ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 506ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 410ms
     ✓ completes missing subagent attribution before a real append 402ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 434ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2426ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 450ms
     ✓ resolves a pending ledger intent after its invocation is stale 499ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 323ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 6980ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 1084ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1466ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1055ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 3237ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1313ms
     ✓ runGit names ENOBUFS when output passes the limit 516ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 514ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 24ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1285ms
   ✓ runLines (5)
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 381ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 2952ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 400ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 662ms
     ✓ challenge gate without --base sizes only the branch's own lines 319ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 827ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 2075ms
   ✓ bkit tasks currency (6)
     ✓ currency judges base...against (origin/dev), not base...HEAD 305ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 5286ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 652ms
     ✓ workflow progress command wiring progress specialized completion producers 2534ms
     ✓ progress excludes noncompletions 996ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1348ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (189 tests) 115176ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 329ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1160ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 330ms
     ✓ design / plan / build / debug book in the current worktree 301ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 365ms
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 387ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 420ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 394ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 426ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 467ms
       ✓ counts subagents of an earlier chat the run's session rows name 471ms
       ✓ records no context block, and still closes, outside a Claude Code session 439ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 447ms
     ✓ records ending held and publish false on the workflow-done row 442ms
     ✓ defaults the close row to ending done 440ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 436ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 424ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 437ms
     ✓ always writes the telemetry, whatever the runtime 386ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 315ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 379ms
     ✓ an unwritable stats path is logged and never fails the close 367ms
     ✓ appends the completeness row before the workflow-done row 434ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 399ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 442ms
     ✓ writes one completeness row per close 715ms
     ✓ leaves out the previous run's rows that share a second with this run's start 341ms
     ✓ still closes when the completeness check throws 374ms
     ✓ still closes when the completeness row write throws 554ms
     ✓ ship: run.pr, size of the squash commit, and coverage 486ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 654ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 427ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 355ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 469ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 447ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 433ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 395ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 415ms
     ✓ --record-step writes the close step's row before workflow-done 303ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 340ms
     ✓ --number without --outbox is a usage error 348ms
   ✓ bkit workflows handover (31)
     ✓ --push commits and pushes the record on the feature branch without a handover 856ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 839ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 794ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 799ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 601ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1624ms
     ✓ --flush with nothing to record commits and pushes nothing 1048ms
     ✓ --flush carries the named worktree's logs into the dev commit 1735ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2466ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 2518ms
     ✓ closePr titles the PR by the record it carries 2672ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 703ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 545ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 870ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 619ms
       ✓ --ref, no push → route stop, no message 376ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 708ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1677ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1988ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1676ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2111ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1618ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1755ms
     ✓ --push on dev never carries a row whose references name another feature 1613ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1481ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3197ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1982ms
     ✓ --push commits in the named worktree, not the checkout it runs from 955ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2023ms
     ✓ preserves unlanded file deletions and ledger additions on close 4071ms
     ✓ preserves dirty work and uncertain branch evidence during close 3477ms
     ✓ preserves a local feature ref changed after its cleanup proof 3638ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1882ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1473ms
     ✓ a close that landed releases the lock 1972ms
     ✓ removes the worktree before it releases the lock 1811ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2489ms
       ✓ closePr refuses when the PR base is unknown 2026ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1375ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 465ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 307ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 810ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 443ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 389ms
     ✓ a second run's record does not let this FID's close commit 509ms
     ✓ record is present after workflows close and before the push 823ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1534ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1495ms
       ✓ a run closed by workflow-failed keeps no parked copy 1480ms
       ✓ a run closed by workflow-done keeps no parked copy 1565ms
       ✓ a FAILED run gets no row 1531ms
       ✓ a DONE run gets no row 1533ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1417ms
   ✓ bkit workflows input (10)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 317ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 532ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 417ms
     ✓ puts each --line after the summary, in flag order 417ms
     ✓ --summary prints the file and keeps a copy in --outbox 432ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 443ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 10105ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 663ms
     ✓ a failing file absent at the base commit is the branch's 387ms
     ✓ a failed base install reads unknown and removes the worktree 383ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 506ms
     ✓ copies the worktreeCopy entries into the base checkout 504ms
     ✓ a base file run that writes no report reads unknown 541ms
     ✓ a CI run that cannot settle the base falls back to the local run 2690ms
     ✓ a pull_request-event CI run at the base sha does not settle none 581ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 507ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 495ms
     ✓ the base test run does not inherit the hooks-off git config 481ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 590ms
     ✓ counts files committed since --base 659ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 404ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 472ms
     ✓ runs the --fallback gate even when no file changed, as it did before 395ms
> [bkit] TRUNCATED HERE — 81 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1125ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1387ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1847ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1084ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 798ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 743ms
     ✓ plan installs dependencies like build and debug 752ms
     ✓ design stops on a failed install (5) 738ms
     ✓ plan stops on a failed install (5) 740ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 740ms
     ✓ tracks origin/feat/{fid} when only the remote has it 881ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 747ms
     ✓ reports a package manager that could not run (127) apart from a failed install 874ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1581ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1249ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1475ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1345ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1359ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1819ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1491ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1638ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 1057ms
     ✓ vitest — with no report path the test file is left as it was 625ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 390ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 480ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 384ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 351ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30415ms

 Test Files  38 passed (38)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 435ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 368ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 501ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 393ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 620ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 308ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 504ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 378ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 387ms
     ✓ PASS is 0 failures with or without reports 421ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 319ms
   ✓ bkit tests run --artifact (5)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ a log under the outbox is named main-checkout relative in the record 404ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 682ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 476ms
     ✓ numbers runs within the workflow's active run and per step 676ms
     ✓ tests run --file records the tested snapshot on its test-run row 394ms
     ✓ a FAIL test-run row records each failing case as file and name 332ms
     ✓ a PASS test-run row records no failed tests 640ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 361ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 534ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 418ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 881ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1004ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 691ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 478ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 509ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 553ms
     ✓ a failed importer search runs the whole check 657ms
     ✓ --changed-since=feature-base starts at the feature's start commit 822ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 466ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 409ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 494ms
     ✓ a failing required push gate leaves the failed marker 461ms
     ✓ uncommitted code blocks the receipt until it is committed 507ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 356ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 368ms
     ✓ a planned test that passes is a vacuous gap, exit 1 308ms
     ✓ a file that fails to load is a red of kind red-not-loaded 382ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 393ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 614ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 325ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 302ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 647ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 365ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 397ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 514ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 433ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 485ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 377ms
     ✓ green: lists each gap kind, with the runner output 433ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 678ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 61577ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 733ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1380ms
     ✓ saves the failed job count without the capstone job 911ms
     ✓ a CI selection keeps the failed job names, capstone left out 1055ms
     ✓ counts the capstone job when it is the only failed job 416ms
     ✓ saves no failed job count when no job failed 380ms
     ✓ filters branch and PR discovery by configured workflow and exact head 530ms
     ✓ freezes explicit workflow run attempt and all failed job pages 496ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 934ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1186ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 816ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1078ms
     ✓ checks the named repository base and fails closed on missing evidence 589ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 544ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 626ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 595ms
     ✓ a failed re-trigger push names the cause in the log 595ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 895ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1287ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 616ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 556ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 563ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 373ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 758ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1000ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 946ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 420ms
     ✓ re-trigger on dev only uses the record of its own FID 630ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 743ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1336ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 545ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 542ms
     ✓ debug: a failure test run is a failed run 576ms
     ✓ debug: a timed_out test run is a failed run 544ms
     ✓ debug: a startup_failure test run is a failed run 534ms
     ✓ debug: a test run still in progress or cancelled is not returned 522ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 511ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 515ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1012ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 363ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 490ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 499ms
     ✓ --file and --step go together 382ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2318ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 413ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 382ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 366ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 451ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 426ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 442ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 519ms
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 331ms
     ✓ finishes a CI round only with its own failed job count 329ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 302ms
     ✓ a failed commit leaves no row staged in the index 484ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 498ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 518ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 501ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 490ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 368ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 301ms
   ✓ bkit steps finish (17)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 352ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 378ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 688ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 441ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 330ms
     ✓ invalidates missing corrupt and unsupported progress cache 600ms
     ✓ contains cache read and write failures as standalone degradation 325ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (189 tests) 98402ms
   ✓ bkit workflows start (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (12)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 369ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 435ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 315ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 335ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ always writes the telemetry, whatever the runtime 358ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 381ms
     ✓ an unwritable stats path is logged and never fails the close 374ms
     ✓ appends the completeness row before the workflow-done row 466ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 437ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 454ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 621ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 382ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 323ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 304ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 336ms
     ✓ --number without --outbox is a usage error 304ms
   ✓ bkit workflows handover (31)
     ✓ --push commits and pushes the record on the feature branch without a handover 406ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 516ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 369ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1295ms
     ✓ --flush with nothing to record commits and pushes nothing 677ms
     ✓ --flush carries the named worktree's logs into the dev commit 1147ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1434ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1910ms
     ✓ closePr titles the PR by the record it carries 1635ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 3189ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1691ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1284ms
     ✓ a close that landed releases the lock 1764ms
     ✓ removes the worktree before it releases the lock 2191ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 1804ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1422ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 426ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 682ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1711ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1513ms
       ✓ a run closed by workflow-failed keeps no parked copy 1350ms
       ✓ a run closed by workflow-done keeps no parked copy 1348ms
       ✓ a FAILED run gets no row 1444ms
       ✓ a DONE run gets no row 1623ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1419ms
   ✓ bkit workflows input (10)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 308ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 535ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 362ms
     ✓ puts each --line after the summary, in flag order 349ms
     ✓ --summary prints the file and keeps a copy in --outbox 385ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 372ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests) 17734ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 498ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 333ms
     ✓ --path records its commit on the run's record, like every other commit mode 490ms
     ✓ a recorded ledger commits only the rows the run appended 598ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 629ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 543ms
     ✓ commitBookkeeping refuses when a recorded path changed 316ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 364ms
     ✓ under --mode=commit counts the squashed paths as something to commit 369ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 457ms
   ✓ bkit ledgers append --operation (6)
     ✓ keeps ledger operation intents and receipts out of committed book paths 319ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 2433ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (75 tests) 39ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 10202ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 340ms
     ✓ keeps each context's own section banner and drops every other context's 794ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 483ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 341ms
     ✓ --base narrows the range to the commits after a group's start sha 337ms
     ✓ diff from a group start covers only the group's commits 392ms
     ✓ an empty range writes a one-line note and zero numbers 317ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 426ms
     ✓ --reset-log empties the step's clamp log before the record lands 601ms
   ✓ featureBase (#960) (7)
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 490ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 592ms
     ✓ context diff without --base leaves out an unpushed local dev commit 381ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 18031ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 660ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 575ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 352ms
     ✓ completes missing subagent attribution before a real append 358ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 362ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2202ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 344ms
     ✓ resolves a pending ledger intent after its invocation is stale 375ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 6984ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 918ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1545ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1225ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 6446ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 502ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 43783ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 820ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 569ms
     ✓ always writes the marker, even with no plan 322ms
     ✓ writes the linear marker shape, taking the tracker from package.json 303ms
     ✓ writes the jira marker shape, taking the tracker from package.json 370ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 522ms
     ✓ refuses a PR from dev, main, or the base itself 504ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 497ms
     ✓ retries a failed create once, and exits 5 when it fails twice 927ms
     ✓ exits 5 when the open-PR probe errors 497ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 885ms
     ✓ prs open still opens against any other base 330ms
     ✓ exits 6 when the created PR's base is not --base 405ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 3127ms
     ✓ refuses merged entry when current feature evidence cannot be read 598ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 585ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 325ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 417ms
     ✓ --number reads one PR, mergeable included 501ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 348ms
     ✓ exits 4 when gh errors and 80 when it needs auth 451ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 429ms
     ✓ classifies a refused merge with a new dev conflict as integration 778ms
     ✓ returns an explicit terminal reason for other merge refusals 944ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 546ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 457ms
     ✓ drops the force-build marker from the title subject 609ms
     ✓ takes an explicit --subject 560ms
     ✓ runs no merge when the PR is already MERGED 478ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 716ms
     ✓ prs merge refuses a PR whose base is main 424ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 971ms
     ✓ prs merge refuses when the PR base is unknown 356ms
     ✓ prs merge reads the base from the one pr view it already makes 625ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 822ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 509ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 624ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 760ms
     ✓ never reads dev's required checks without --only-if-required 487ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1108ms
     ✓ updates when a dev ruleset requires status checks 574ms
     ✓ updates when dev's branch protection requires status checks 699ms
     ✓ ignores dev rulesets that require no checks 522ms
     ✓ updates when the repo cannot be resolved 546ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 674ms
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 1084ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 962ms
     ✓ is not green when a check failed, naming it (exit 1) 1135ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 574ms
     ✓ is not green on an empty rollup (total 0) 965ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 595ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 683ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 998ms
     ✓ is a no-op when the title already says so 750ms
     ✓ strips the marker, with or without its bkit prefix 802ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1419ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 54374ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 731ms
     ✓ may debug in place on dev 355ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 825ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 728ms
     ✓ a new run of the same FID rewrites startSha 1243ms
     ✓ a resume of the same FID reuses the record 1144ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1423ms
       ✓ drops a commit id that is not on the branch 1401ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1338ms
       ✓ writes an empty commit list when the run has no run-commits row 1387ms
       ✓ ignores a row from before the open run started 1399ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1584ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1411ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1616ms
       ✓ ignores the row on origin/dev when the run there is closed 1770ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1560ms
         ✓ wins over the row on origin/dev, which is then not needed 1207ms
         ✓ wins over the row in the checkout's own log while the run is open 1289ms
         ✓ still drops a commit id that is not on the branch 1069ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1220ms
         ✓ is ignored when it was parked for another workflow 1251ms
         ✓ is removed once the record is rebuilt 1627ms
         ✓ is removed when the live record already stands for the open run 1290ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 817ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 763ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 988ms
     ✓ a stale record without a lock is replaced 1083ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 828ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2785ms
     ✓ names inherited commits and ship recovery in the refusal 675ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 732ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 741ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 305ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 324ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 327ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 341ms
   ✓ addAllButCopied (3)
     ✓ never commits an entry only the main checkout's copy list names 317ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 354ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 802ms
       ✓ preserves staged-only mode during landed cleanup 709ms
       ✓ preserves staged-only type during landed cleanup 664ms
       ✓ preserves staged-only deletion during landed cleanup 780ms
       ✓ removes landed staged content when both index and working contents are on dev 897ms
       ✓ deletes the proved local and remote branch at their landed tips 911ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1667ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 397ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 339ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 496ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (279 tests) 214843ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 331ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 327ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 505ms
     ✓ produces byte-identical output to merge=union 666ms
     ✓ restores a trailing newline so the next append starts on its own line 547ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 559ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 758ms
     ✓ refuses a union that leaves a line which is not JSON 397ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 491ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 602ms
     ✓ refuses a lockfile whose regenerate command fails 594ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 663ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 635ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 634ms
     ✓ refuses and aborts when both sides changed the hand-written region 374ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 431ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 526ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 688ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 362ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 456ms
     ✓ refuses and aborts when a side deleted the install record 345ms
     ✓ refuses a conflicted doc the repo's script does not list 339ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 349ms
     ✓ removes a stale sentinel when the rebase succeeds 402ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 619ms
     ✓ resolves a conflict in each of two replayed commits across rounds 547ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no anchor 352ms
       ✓ skips (12) when the base is unreachable in this clone 351ms
       ✓ runs (0) with the landed path count once dev moved 521ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 582ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 392ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 469ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 682ms
     ✓ runs exactly one git push 762ms
     ✓ --set-upstream records the upstream 397ms
     ✓ refuses with no branch checked out 349ms
     ✓ --mode=dev refuses a feature checkout 355ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 774ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1069ms
     ✓ --require-ci pushes as-is when dev has not moved 420ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 869ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1291ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 360ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 582ms
     ✓ --mode=abort pushes when the branch has no open PR 602ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 487ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 314ms
     ✓ --open-pr carries the MCP answer and skips gh 402ms
     ✓ --mode=abort on dev pushes plainly without probing 410ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1369ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 653ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 713ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1805ms
     ✓ skip-ci HEAD on the replay is refused 505ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1366ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2232ms
     ✓ a level local dev is a plain push, recording nothing extra 1087ms
     ✓ a record with no commits pushes nothing 851ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 548ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1058ms
     ✓ a rewritten branch is refused, never forced 638ms
     ✓ refuses dev and main with exit 21 and pushes nothing 398ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 773ms
     ✓ refuses a detached HEAD (exit 5) 322ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 677ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 698ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 662ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 904ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 326ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 735ms
     ✓ an up-to-date branch is a no-op 554ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 737ms
     ✓ a fetch that fails exits 10 303ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 386ms
     ✓ scan-diff still reports a new skip when its test … 410ms
     ✓ scan-diff reports a skip moved onto a different t… 361ms
     ✓ scan-diff does not cancel a skip moved between am… 347ms
     ✓ scan-diff does not spend an unchanged duplicate t… 338ms
     ✓ scan-diff recognizes a renamed test file 338ms
     ✓ scan-diff recognizes a suite moved into a differe… 384ms
     ✓ scan-diff does not let unrelated additions hide a… 396ms
     ✓ scan-diff attributes deletion to its old test ins… 344ms
     ✓ scan-diff consumes each moved assertion once and … 399ms
     ✓ scan-diff does not match identical assertions fro… 410ms
     ✓ scan-diff does not match the same leaf test name … 405ms
     ✓ scan-diff does not match a same-named test with d… 471ms
     ✓ scan-diff does not match a same-named test with c… 460ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 450ms
     ✓ --paths with no match exits 1 472ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 418ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 661ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 688ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 432ms
     ✓ --marker reads a diff over 1 MiB 451ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 480ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 455ms
     ✓ scan-diff finds an added skip 442ms
     ✓ scan-diff ignores a skip predating the base 431ms
     ✓ scan-diff reports a disabled test with its line 511ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 544ms
     ✓ scan-diff ignores a removed comment in a test file 550ms
     ✓ scan-diff ignores an assertion moved within the file 603ms
     ✓ scan-diff still reports a removed assertion 581ms
     ✓ scan-diff reports an assertion re-added only outside the test file 465ms
     ✓ scan-diff finds an added pytest mark skip 507ms
     ✓ scan-diff finds an added unittest skip 476ms
     ✓ scan-diff finds an added bare skip call 431ms
     ✓ scan-diff ignores a quoted skip in a documentation file 457ms
     ✓ scan-diff ignores a marker literal in a non-test source file 440ms
     ✓ scan-diff ignores an assertion whose expectation changed 418ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 446ms
     ✓ scan-diff reports a deleted test file 459ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 357ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 971ms
     ✓ a title that already carries the marker is left alone 781ms
     ✓ with no open PR: pushes the marker commit and edits no title 876ms
     ✓ a re-run is deduped: no second marker commit 1004ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1311ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 554ms
     ✓ --title-set skips gh entirely 738ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1051ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1844ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1175ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2380ms
     ✓ continues only the explicitly recorded target through the public merge command 1629ms
     ✓ fetches the unseen feature head before classifying the base 1375ms
     ✓ fast forwards the feature before either base path is chosen 2604ms
     ✓ merges divergent feature tips without rebasing either side 1394ms
     ✓ continues the feature merge before starting a dev merge 2102ms
     ✓ publishes local code with a CI running head before bookkeeping 2710ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3588ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2060ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1616ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 510ms
     ✓ Path B once dev moved; --head checks a given commit 662ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 662ms
     ✓ --merge-docs merges dev when docs/ is behind 944ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1094ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1391ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1151ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 918ms
     ✓ --merge-docs skips an empty bkit:generate script 1010ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 828ms
     ✓ --merge-docs never merges on dev itself 774ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1244ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 965ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 872ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 843ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 457ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1285ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1227ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1883ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2118ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2636ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3486ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 2313ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1586ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1023ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 947ms
     ✓ exits 10 when the fetch fails 597ms
     ✓ refuses --merge-docs with --head, and an unknown --head 540ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 965ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1597ms
     ✓ a failed install stops ship (16) 1336ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1534ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1084ms
     ✓ exits 10 when the fetch fails 773ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 532ms
     ✓ preserves unlanded file type changes in the shared landed comparison 539ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 410ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 696ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2400ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2087ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2044ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2306ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4902ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 6069ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 824ms
     ✓ local: names unpushed dev as the cause when the branch carries it 991ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1029ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2767ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2461ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1804ms
     ✓ uses tree entry equivalence for design and plan land cleanup 7343ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2287ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2467ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2195ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1324ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2859ms
     ✓ land removes the worktree when only the copied .env is untracked 2626ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2294ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2512ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3644ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2819ms
     ✓ landPr refuses a main-based PR without retrying 824ms
     ✓ landPr refuses when the PR base is unknown 994ms
     ✓ PR not open (closed): stops (17) at once, no retry 1511ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 888ms
     ✓ --attempt names the merge round in a fix commit 908ms
     ✓ commits a rewritten and a deleted tracked file 886ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1091ms
     ✓ reports undeclared and runs nothing with no scripts 503ms
     ✓ reports undeclared and runs nothing with an empty script 573ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 646ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 669ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 524ms
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 110450ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3636ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 362ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1444ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 1535ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1090ms
     ✓ feat/** path — bkit_gate outcomes (10)
       ✓ github feat run passes the gate through the real bkit and stub gh 1464ms
       ✓ label removed gives label-absent, skip and a summary row 2002ms
       ✓ %s recorded fetch reply carrying bkit:auto passes the gate 3090ms
       ✓ jira marker AB2-12 dispatches 2569ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 1875ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value 2335ms
       ✓ exit 80 reason=%s is unreadable with that reason and exits green 2271ms
       ✓ %s fetch output is unreadable reason=output-unparseable 1988ms
       ✓ absent node_modules/.bin/bkit warns bkit unavailable and exits green 647ms
       ✓ feat branch with no marker and no feature row gives no-issue 1429ms
     ✓ dev path — engine parse of the squash subject and merged-PR body (7)
       ✓ dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row 3771ms
       ✓ linear-shaped FID under the github tracker gives no-issue and no dispatch 2358ms
       ✓ dev subject naming several issues is a no-FID no-op 2769ms
       ✓ dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green 376ms
       ✓ dev arm passes the gate for a closed issue that still carries bkit:auto 3065ms
       ✓ dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches 2629ms
       ✓ traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/ 5427ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 3530ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 2630ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2710ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2178ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3141ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1136ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1249ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2018ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 1517ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 2150ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 2001ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1104ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2030ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2566ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2183ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 3259ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2513ms
       ✓ a branch with no status.jsonl dispatches as before 2585ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2292ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3089ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2169ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2936ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 2466ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 2252ms
   ✓ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     ✓ pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 2784ms
     ✓ no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 2984ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4605ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1316ms
     ✓ runGit names ENOBUFS when output passes the limit 936ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 953ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 336ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3220ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 4253ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 520ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 949ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 326ms
     ✓ challenge gate without --base sizes only the branch's own lines 470ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 17452ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 909ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 2250ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 442ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 325ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1523ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 67ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 130910ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 1822ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 20002ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1736ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1489ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 983ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1645ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2148ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2797ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1356ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1062ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 318ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 792ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1231ms
     ✓ design installs dependencies like build and debug 1226ms
     ✓ plan installs dependencies like build and debug 1671ms
     ✓ design stops on a failed install (5) 1535ms
     ✓ plan stops on a failed install (5) 1534ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1184ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1691ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1624ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1193ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2198ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 3093ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 3112ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2365ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 2241ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 2340ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2030ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2157ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1583ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1701ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2246ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1590ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2292ms
     ✓ commits leftovers when a copy entry points outside the checkout 2486ms
     ✓ never commits the entries setup copies in from the main checkout 2672ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2269ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 1147ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 1160ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1511ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1499ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 1501ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1628ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1504ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1881ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2391ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 1095ms
     ✓ leaves a clean worktree's history alone 2278ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 3146ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 3002ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3424ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3044ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 3407ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2718ms
     ✓ does not mark a resumed worktree it did not create 1157ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 353ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 1174ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 2072ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 2289ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1536ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 67ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 27581ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 3393ms
     ✓ a foreign commit made mid-run never reaches the remote 4087ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 3718ms
     ✓ push from a level local dev is a plain push 1906ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 3656ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 2283ms
     ✓ two records on dev: each push selects its own FID's commits 2912ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 1243ms
     ✓ close commit tree excludes foreign files 2161ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 2221ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1714ms
   ✓ runLines (5)
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 506ms
     ✓ is null when first is not an ancestor of last, or either is missing 317ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 118ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (20 tests) 124ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 12111ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 865ms
     ✓ a failing file absent at the base commit is the branch's 437ms
     ✓ an undeclared bkit:test:file reads unknown 393ms
     ✓ a failed base install reads unknown and removes the worktree 489ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 780ms
     ✓ copies the worktreeCopy entries into the base checkout 648ms
     ✓ a base file run that writes no report reads unknown 562ms
     ✓ a passing CI run at the exact base sha settles none without a local run 369ms
     ✓ a CI run that cannot settle the base falls back to the local run 3354ms
     ✓ a pull_request-event CI run at the base sha does not settle none 724ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 636ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 560ms
     ✓ the base test run does not inherit the hooks-off git config 420ms
     ✓ adopt follows the run's runtimeWorktrees 1011ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 7877ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 746ms
     ✓ workflow progress command wiring progress specialized completion producers 4033ms
     ✓ workflow progress command wiring progress gate only completions 475ms
     ✓ progress excludes noncompletions 1575ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 3438ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 344ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 384ms
     ✓ currency emits no hunk outside the matched set 402ms
     ✓ currency exits 0 with no hunks when no task matches 315ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 572ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 40717ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1147ms
     ✓ names each net-new and worsened finding in the log and the JSON 1536ms
     ✓ fails on a net score rise with no net count change 1285ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 762ms
     ✓ treats a net score at or below 0.001 as float noise 906ms
     ✓ passes when the change only resolves findings 1231ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 937ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 762ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 437ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 632ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 749ms
     ✓ exits 4 on a dropped net field instead of silently passing 1031ms
     ✓ exits 4 on no summary instead of silently passing 591ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1024ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 748ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1541ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 738ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 715ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 777ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1925ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1135ms
     ✓ explicit globs can select ignored prose and nested checkout files 866ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 376ms
     ✓ fails (exit 1) when vale reports alerts 510ms
     ✓ exits 6 on a vale runtime error 759ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 518ms
     ✓ falls back to vale sync when the main worktree has none 716ms
     ✓ fails when vale sync cannot restore the required styles 849ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 418ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 366ms
     ✓ exits 1 naming the code file, whatever the commit message says 323ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 317ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 624ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 338ms
     ✓ exits 1 naming the files outside, whatever the commit message says 364ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 756ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 443ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 451ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 786ms
     ✓ a top-level glob in the setting does not reach into folders 433ms
     ✓ a push that changes no files is not proven a min push 387ms
     ✓ exits 7 when a commit or its base cannot be read 398ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 360ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 336ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 488ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 389ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 430ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 488ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 545ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 556ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 544ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 442ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 443ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 573ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 646ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 2040ms
 ✓ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts (18 tests) 28638ms
   ✓ tests lock through a consumer's wrapped gate (15)
     ✓ a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself 2027ms
     ✓ tests run --file appends no test-run row when it exits 81 on a held tests lock 1379ms
     ✓ tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock 1193ms
     ✓ tests changed with an unwritable lock dir exits 4 naming the path 1030ms
     ✓ tests run waits for a held tests lock and runs the gate once the holder finishes 1659ms
     ✓ a real lock wait through bkit tests run exits 81 and names the holder 1368ms
     ✓ tests run holds the tests lock for the whole gate, so a second tests run waits 2367ms
     ✓ tests red runs its test file without waiting for a held tests lock 1805ms
     ✓ tests run under CI=true never waits on a held tests lock 1948ms
     ✓ tests run under CI=1 never waits on a held tests lock 1185ms
     ✓ tests run with an unwritable lock dir exits 4 naming the path 905ms
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 1002ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1097ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1208ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1335ms
   ✓ bkit tests jump (3)
     ✓ tests jump moves a waiting run to the front of the tests line 4169ms
     ✓ tests jump refuses a run name no waiting run carries 2117ms
     ✓ tests jump refuses a run name two waiting runs share 840ms
 ✓ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (9 tests) 65029ms
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9964ms
     ✓ records the failed job count and reads an uncounted local round as unknown 7403ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 5225ms
     ✓ finishes the first CI evidence round of the second debug run 3475ms
     ✓ checks the complete selected CI fix sequence against green and red final runs 9014ms
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 11166ms
     ✓ preserves local and repro overrides across actual workflow command sequences 14390ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 4387ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 4021ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 514ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 72ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 68ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 11675ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 459ms
     ✓ CI=true -> GITHUB_ACTION 376ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 705ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 444ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 595ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 378ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 526ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 506ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 564ms
     ✓ re-derives per call: one run's answer does not leak into the next 688ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 993ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 381ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 340ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 404ms
     ✓ --file into a missing directory is refused, not created 531ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 9404ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 1213ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 440ms
     ✓ stops the step when the command crashed or was misused 1027ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2698ms
     ✓ ship gates on CI and merges the pinned head 4023ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 8008ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 2346ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 1631ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 4029ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 429ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 13573ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
     ✓ bkit-build.md held close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 1066ms
       ✓ leaves the subject unchanged when bkit:auto is absent 974ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 982ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1000ms
       ✓ leaves the subject unchanged when no labels are passed 995ms
     ✓ bkit-build.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 912ms
       ✓ leaves the subject unchanged when bkit:auto is absent 837ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 743ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 703ms
       ✓ leaves the subject unchanged when no labels are passed 820ms
     ✓ bkit-debug.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 973ms
       ✓ leaves the subject unchanged when bkit:auto is absent 907ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 937ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 899ms
       ✓ leaves the subject unchanged when no labels are passed 811ms
 ✓ .bkit/core/engine/audits/workflows/close-squash.integration.test.ts (15 tests) 47522ms
   ✓ bkit-design.md local close squash (6)
     ✓ lands past another session's uncommitted edit to a file the close changes, and keeps the edit 4422ms
     ✓ lands without pushing local dev's own commits, and leaves local dev where it was 3780ms
     ✓ leaves the main checkout on its branch and moves only the dev pointer 3410ms
     ✓ keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc 1831ms
     ✓ commits only the squash and bookkeeping, never another session's staged doc 3428ms
     ✓ lands this run's doc and then removes the branch, leaving unrelated edits alone 3423ms
   ✓ bkit-plan.md local close squash (6)
     ✓ lands past another session's uncommitted edit to a file the close changes, and keeps the edit 3310ms
     ✓ lands without pushing local dev's own commits, and leaves local dev where it was 3667ms
     ✓ leaves the main checkout on its branch and moves only the dev pointer 3519ms
     ✓ keeps feat/{FID} and pushes nothing when the squash does not carry this run's doc 1747ms
     ✓ commits only the squash and bookkeeping, never another session's staged doc 3262ms
     ✓ lands this run's doc and then removes the branch, leaving unrelated edits alone 3185ms
   ✓ bkit-design.md close with no issue (1)
     ✓ lands an issue-less run with a FID-only marker 3513ms
   ✓ bkit-build.md held close (2)
     ✓ held close leaves origin refs unchanged, keeps the branch and worktree, releases the lock 2682ms
     ✓ held close records the rows, summary and worktree-only roadmap row 2341ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 188ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1360ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 49ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (16 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (23 tests) 109848ms
   ✓ workflow comment lifecycle across real CLI processes (23)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 4156ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 1247ms
     ✓ keeps published build completion and PR links in one terminal comment 5857ms
     ✓ continues after the prepared completion source disappears 3475ms
     ✓ records preparation and session association failures despite successful delivery 3278ms
     ✓ associates startup and run across restart or starts fresh safely 4943ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 13398ms
     ✓ keeps auto and phase progress separate across worktrees 6359ms
     ✓ continues close and cleanup after lost terminal response 5516ms
     ✓ starts fresh progress after cleanup and on a fresh clone 5187ms
     ✓ preserves substantive step results under a preparation comment boundary fault 5837ms
     ✓ preserves substantive step results under a cache comment boundary fault 5792ms
     ✓ preserves substantive step results under a receipt comment boundary fault 5974ms
     ✓ preserves substantive step results under a lock comment boundary fault 5350ms
     ✓ preserves substantive step results under a read comment boundary fault 5121ms
     ✓ preserves substantive step results under a append comment boundary fault 5426ms
     ✓ preserves substantive step results under a create comment boundary fault 4485ms
     ✓ preserves substantive step results under a reconciliation comment boundary fault 3356ms
     ✓ preserves substantive step results under a diagnostic comment boundary fault 4212ms
     ✓ keeps clean build progress and completion to two comments 5578ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 3745ms
     ✓ an ad-hoc comment with no run proof exits 2 and reaches no tracker 477ms
     ✓ accepts a session minted in the main checkout from a linked worktree 1076ms
 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (134 tests) 185872ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 554ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 1097ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 1237ms
     ✓ .husky/pre-push: empty stdin → gates still run 1124ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1497ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 879ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 694ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1278ms
     ✓ .husky/pre-push: first and last lines name the log 475ms
     ✓ .husky/pre-push: the hook body runs once 757ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 437ms
     ✓ tag delete alongside that tag → still skipped 422ms
     ✓ tag on a commit no origin branch holds → gates run 1064ms
     ✓ tag pushed with a branch → gates run 1201ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 475ms
     ✓ release branch and a tag, both already tested → still skipped 473ms
     ✓ branch with files no origin dev / main tip has → gates run 1248ms
     ✓ dev push with the files origin/dev already has → gates run 970ms
     ✓ main push with the files origin/main already has → gates run 1158ms
     ✓ no origin dev / main ref fetched → a branch push gates 1182ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 763ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 770ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2504ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 2050ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1901ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1918ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1083ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1174ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1241ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1197ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2068ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1674ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 1629ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 1208ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 678ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 557ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 616ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 694ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 610ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 745ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 529ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 763ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 657ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1225ms
     ✓ .husky/pre-push: a gate fails → no disk prune 823ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 646ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 580ms
     ✓ a stale register stops the push before any gate runs 581ms
     ✓ bkit check fails → the push stops before any gate runs 529ms
     ✓ the dependency audit runs before any gate, when its script is present 616ms
     ✓ no dependency-audit script → skipped, the gates still run 547ms
     ✓ no register script → skipped, the gates still run 569ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 778ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 767ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 756ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 670ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 916ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 731ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 870ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 720ms
   ✓ graphify register pre-push gate (18)
     ✓ push to another branch → no check, push goes on 492ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 435ms
     ✓ branch with an open PR into dev, register current → push goes on 443ms
     ✓ branch with no open PR → no check, push goes on 663ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 641ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 446ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 861ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 821ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 698ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1590ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3444ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 3460ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 2320ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3755ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2335ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 2223ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2251ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3086ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2722ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3258ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2020ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3571ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3524ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2198ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4247ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2036ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2279ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3167ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2720ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3347ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2559ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 2588ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1935ms
     ✓ .husky/pre-push: a code push still runs them 2280ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 1909ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 577ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 1475ms
     ✓ untrusted .envrc still prints the direnv allow line 682ms
     ✓ no .envrc → no direnv call 1259ms
     ✓ direnv not on PATH → gates run, no warning 1894ms
     ✓ CI set → no direnv call 828ms
     ✓ delete-only push through direnv exec → exit 0, no gate 652ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1755ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1959ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 2010ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 2932ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 2330ms
     ✓ open PR that merges cleanly → gates run, no message 1991ms
     ✓ no open PR → no fetch, gates run 1726ms
     ✓ gh not on PATH → warns, gates run 1740ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1734ms
     ✓ base fetch fails → warns, gates run 1896ms
     ✓ dev push → no PR lookup 1838ms
     ✓ min push of a conflicting PR → blocked 2066ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2682ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 2462ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 2447ms
     ✓ fork PR with the same head branch name → ignored, gates run 1862ms
     ✓ shallow clone → no base fetch, warns, gates run 2418ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 2062ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 2308ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 3135ms

 Test Files  57 passed (57)
      Tests  4461 passed (4461)
   Start at  10:45:04
   Duration  419.50s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/811-publish-dev-refused/build-group-gate-1-1.log.reports/vitest-80086.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts dist/commands/workflow/workflows.js docs/plans/202611/811-publish-dev-refused-plan.md docs/plans/202611/logs/811-publish-dev-refused/build-brief-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-brief-tests-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-diff-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-tasks-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-tests-1-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-tests-green-1-1.md docs/plans/202611/logs/811-publish-dev-refused/build-tests-red-1-1.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2394 of 12954 lines (179 KB of 878 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
