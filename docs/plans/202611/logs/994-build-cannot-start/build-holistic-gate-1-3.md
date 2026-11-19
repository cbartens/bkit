
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts dist/commands/workflow/branches.js docs/plans/202611/logs/994-build-cannot-start/build-holistic-gate-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/994-build-cannot-start/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts dist/commands/workflow/branches.js docs/plans/202611/logs/994-build-cannot-start/build-holistic-gate-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/994-build-cannot-start/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (215 tests) 50757ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 1085ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 569ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 395ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 346ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 356ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 347ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 340ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 374ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 679ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 311ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 322ms
     ✓ PASS is 0 failures with or without reports 403ms
     ✓ clears a previous attempt's reports before the gate runs 304ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 352ms
     ✓ a log under the outbox is named main-checkout relative in the record 347ms
     ✓ a log small enough is copied whole: not clamped, raw null 314ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 300ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 743ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 669ms
     ✓ numbers runs within the workflow's active run and per step 675ms
     ✓ tests run --file records the tested snapshot on its test-run row 411ms
     ✓ a FAIL test-run row records each failing case as file and name 399ms
     ✓ a PASS test-run row records no failed tests 733ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 363ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 514ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 463ms
     ✓ changed-since with no changed files writes a PASS row and runs nothing 363ms
     ✓ the nothing-to-run row records the tested snapshot 467ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1237ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1537ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 796ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 549ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 461ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 447ms
     ✓ a failed importer search runs the whole check 580ms
     ✓ --changed-since=feature-base starts at the feature's start commit 568ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 703ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 393ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 528ms
     ✓ a failing required push gate leaves the failed marker 356ms
     ✓ uncommitted code blocks the receipt until it is committed 680ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 486ms
     ✓ only the required push gate records a receipt 432ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 645ms
   ✓ bkit tests red / green (49)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 338ms
     ✓ a planned test that passes is a vacuous gap, exit 1 540ms
     ✓ a planned test absent from a loaded report is a missing gap 344ms
     ✓ a file that fails to load is a red of kind red-not-loaded 555ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 394ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 521ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 525ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 824ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 642ms
     ✓ red keeps a test standing whose lines match a code step's recorded change 446ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1170ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 464ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 670ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 364ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 522ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 552ms
       ✓ tests red records from as the owner when an unbuilt task between the two names the test 419ms
       ✓ tests green lists a takeover whose nearest earlier task has no red as taken over from the owner 745ms
       ✓ tests red records no from when no earlier task naming the test has a baseline 335ms
       ✓ a resumed tests red skips a taken-over entry 415ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 465ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 859ms
     ✓ green: a passed-accepted test is already landed, not a gap 341ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 694ms
     ✓ tests a code step changed (7)
       ✓ green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap 357ms
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 410ms
       ✓ green leaves a changed test the plan no longer names out of changed 1013ms
       ✓ green leaves a test out of changed when a later red replaced the code step's change 532ms
       ✓ green gives a changed test whose red recorded its file missing every line of the test as added 306ms
       ✓ green prints an empty changed list and no Changed by a code step section when no code step changed a test 358ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 406ms
     ✓ green: --group audits only that group's tasks 366ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 409ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 433ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 372ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 571ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 410ms
     ✓ green: lists each gap kind, with the runner output 366ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 625ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (67 tests) 92851ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 2702ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 12911ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1603ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 933ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 712ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1073ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1415ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1809ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 861ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 678ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 649ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 655ms
     ✓ design installs dependencies like build and debug 729ms
     ✓ plan installs dependencies like build and debug 720ms
     ✓ design stops on a failed install (5) 700ms
     ✓ plan stops on a failed install (5) 801ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 753ms
     ✓ tracks origin/feat/{fid} when only the remote has it 813ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 747ms
     ✓ reports a package manager that could not run (127) apart from a failed install 750ms
   ✓ bkit worktrees setup — mint (resume) (36)
     ✓ rebases onto origin/dev and clears a stale sentinel 1613ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 2005ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 2347ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1835ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1541ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1738ms
     ✓ a plan-closed branch with a leftover push (2)
       ✓ a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts 2726ms
       ✓ a code conflict beside the plan logs still stops the start, and the reason names the rule 1948ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1203ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1334ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1424ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1134ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1597ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1658ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1841ms
     ✓ commits leftovers when a copy entry points outside the checkout 1562ms
     ✓ never commits the entries setup copies in from the main checkout 1640ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1547ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 783ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 735ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 960ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 971ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 949ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 963ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1071ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1306ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1289ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 575ms
     ✓ leaves a clean worktree's history alone 1291ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1833ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1988ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1962ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 2044ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 2257ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 2064ms
     ✓ does not mark a resumed worktree it did not create 870ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 611ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 447ms
   ✓ bkit worktrees setup — the unpushed-dev check reads the checked-out branch as a branch (2)
     ✓ adopts plan on a branch named like a top-level path that carries no unpushed dev work 312ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 555ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 915ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1266ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 825ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (193 tests) 97772ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 303ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1023ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 327ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 332ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 476ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 367ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 412ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 456ms
       ✓ counts subagents of an earlier chat the run's session rows name 409ms
       ✓ records no context block, and still closes, outside a Claude Code session 418ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 431ms
     ✓ records ending held and publish false on the workflow-done row 557ms
     ✓ defaults the close row to ending done 668ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 708ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 593ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 794ms
     ✓ always writes the telemetry, whatever the runtime 457ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 339ms
     ✓ appends the completeness row before the workflow-done row 353ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 369ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 321ms
     ✓ writes one completeness row per close 570ms
     ✓ leaves out the previous run's rows that share a second with this run's start 318ms
     ✓ still closes when the completeness check throws 319ms
     ✓ still closes when the completeness row write throws 332ms
     ✓ ship: run.pr, size of the squash commit, and coverage 426ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 608ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 354ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 307ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 451ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 416ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 440ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 376ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 435ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 324ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 499ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 496ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 523ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 465ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 356ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1042ms
     ✓ --flush with nothing to record commits and pushes nothing 556ms
     ✓ --flush carries the named worktree's logs into the dev commit 1028ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1511ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 2609ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 2025ms
     ✓ closePr titles the PR by the record it carries 2138ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 482ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 347ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 904ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 445ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 536ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1893ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1537ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1317ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1376ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1278ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1256ms
     ✓ --push on dev never carries a row whose references name another feature 1172ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1078ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2127ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1306ms
     ✓ --push commits in the named worktree, not the checkout it runs from 595ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1426ms
     ✓ preserves unlanded file deletions and ledger additions on close 2781ms
     ✓ preserves dirty work and uncertain branch evidence during close 2790ms
     ✓ preserves a local feature ref changed after its cleanup proof 2839ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1514ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1188ms
     ✓ a close that landed releases the lock 1362ms
     ✓ removes the worktree before it releases the lock 1230ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1927ms
       ✓ closePr refuses when the PR base is unknown 2041ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1232ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 464ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 658ms
     ✓ a second run's record does not let this FID's close commit 360ms
     ✓ record is present after workflows close and before the push 633ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1354ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1370ms
       ✓ a run closed by workflow-failed keeps no parked copy 1417ms
       ✓ a run closed by workflow-done keeps no parked copy 1398ms
       ✓ a FAILED run gets no row 1342ms
       ✓ a DONE run gets no row 1329ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1220ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 372ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 349ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 556ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 422ms
     ✓ puts each --line after the summary, in flag order 412ms
     ✓ --summary prints the file and keeps a copy in --outbox 385ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 387ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 56980ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 867ms
   ✓ preserves the requested event for selected-workflow verification 686ms
   ✓ requires selected other-workflow success at the exact pushed head 1469ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1119ms
     ✓ saves the failed job count without the capstone job 363ms
     ✓ a CI selection keeps the failed job names, capstone left out 947ms
     ✓ counts the capstone job when it is the only failed job 356ms
     ✓ saves no failed job count when no job failed 355ms
     ✓ filters branch and PR discovery by configured workflow and exact head 502ms
     ✓ freezes explicit workflow run attempt and all failed job pages 357ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 867ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1100ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 314ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 485ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 303ms
     ✓ rejects a workflow result count smaller than its returned records 304ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 749ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1010ms
     ✓ checks the named repository base and fails closed on missing evidence 558ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 458ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 504ms
     ✓ rejects MCP capstone jobs belonging to another run 685ms
     ✓ --fetch refreshes origin/<branch> before gating 317ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 323ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 404ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 653ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1057ms
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 581ms
     ✓ a failed re-trigger push names the cause in the log 1252ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 884ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1075ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 568ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 534ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 535ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 367ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 648ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 697ms
     ✓ CLI: verdict JSON, body scan, exit codes 523ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 376ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 740ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 889ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 919ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 946ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 339ms
     ✓ re-trigger on dev only uses the record of its own FID 441ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 563ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 454ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1169ms
   ✓ bkit runs revalidate (7)
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1280ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 544ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 549ms
     ✓ debug: a failure test run is a failed run 537ms
     ✓ debug: a timed_out test run is a failed run 529ms
     ✓ debug: a startup_failure test run is a failed run 618ms
     ✓ debug: a test run still in progress or cancelled is not returned 599ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 536ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 494ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 961ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 348ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 422ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 413ms
     ✓ --file and --step go together 338ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1584ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 361ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 305ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 326ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 402ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 364ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 378ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 421ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 420ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 419ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (103 tests) 53166ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (9)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 975ms
     ✓ refuses design, plan and build in place in a submodule's main checkout on feat/{fid} 1006ms
     ✓ says so when the adopted worktree has no hooks directory 511ms
     ✓ does not report a ~ hooks directory that exists 400ms
     ✓ names no package install for a missing hooks directory outside the checkout 407ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 410ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 501ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (26)
     ✓ in-place debug on dev writes the shared-checkout record 574ms
     ✓ debug in place on dev from a linked worktree records its own checkout 607ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 548ms
     ✓ a new run of the same FID rewrites startSha 908ms
     ✓ a resume of the same FID reuses the record 688ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 959ms
       ✓ drops a commit id that is not on the branch 943ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 884ms
       ✓ writes an empty commit list when the run has no run-commits row 984ms
       ✓ ignores a row from before the open run started 1046ms
       ✓ restores the commits from the row on origin/dev when the handover landed 1336ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 1412ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 1247ms
       ✓ ignores the row on origin/dev when the run there is closed 1219ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 999ms
         ✓ wins over the row on origin/dev, which is then not needed 1338ms
         ✓ wins over the row in the checkout's own log while the run is open 1029ms
         ✓ still drops a commit id that is not on the branch 1083ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1042ms
         ✓ is ignored when it was parked for another workflow 1121ms
         ✓ is removed once the record is rebuilt 1072ms
         ✓ is removed when the live record already stands for the open run 976ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 512ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 721ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 818ms
     ✓ a stale record without a lock is replaced 968ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 914ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3378ms
     ✓ names inherited commits and ship recovery in the refusal 784ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 849ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 768ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ ship resumes without fetching or rebasing, and copies the configured list 304ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 335ms
   ✓ bkit worktrees remove (20)
     ✓ preserves a marked worktree with uncommitted changes and its marker 346ms
     ✓ --branch (14)
       ✓ preserves staged-only content during landed cleanup 684ms
       ✓ preserves staged-only mode during landed cleanup 719ms
       ✓ preserves staged-only type during landed cleanup 648ms
       ✓ preserves staged-only deletion during landed cleanup 635ms
       ✓ removes landed staged content when both index and working contents are on dev 802ms
       ✓ deletes the proved local and remote branch at their landed tips 791ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1186ms
       ✓ removes the worktree and local branch when a later dev commit changed the branch's file 1220ms
       ✓ deletes the remote branch when a later dev commit changed the branch's file 1171ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 457ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (171 tests) 39384ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 555ms
     ✓ a failed commit leaves no row staged in the index 401ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 422ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 425ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 550ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 442ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 602ms
   ✓ bkit steps finish (21)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 348ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 457ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 309ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 531ms
     ✓ writeStepRow refuses when a recorded path changed 848ms
     ✓ writeStepRow appends its commit sha to the record 554ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 867ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 672ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 623ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 604ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 342ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1071ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 812ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 509ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 321ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 776ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 315ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 436ms
     ✓ the tests step's finish passes its own group's and taken-over tests 661ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 510ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 521ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 490ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 656ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 348ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 632ms
     ✓ refuses a later code step that changes a BLOCKED change again 458ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 675ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 649ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 400ms
     ✓ the refusal of a re-change says the logged reason is already recorded 486ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 320ms
     ✓ a mixed refusal names both tests and words the problem for each kind 336ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 313ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 450ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 494ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 351ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 522ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 458ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 565ms
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 63320ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 10261ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 1566ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 1350ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 848ms
     ✓ node — with no report path the test file is left as it was 9527ms
     ✓ bats — with no report path the test file is left as it was 1577ms
     ✓ node — with no report path the test file is left as it was 1664ms
     ✓ vitest — with no report path the test file is left as it was 1064ms
     ✓ a run naming files of two kinds is refused as a usage error 562ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 799ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 951ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 527ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 605ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30684ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 22127ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 973ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1112ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 830ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 905ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 902ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 604ms
     ✓ runs the full gate for replayed debug code 1020ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1150ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 943ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 985ms
     ✓ a push that fails without a server answer is returned once, never retried 963ms
     ✓ a failed fetch is returned before anything is built 339ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1505ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1235ms
     ✓ lands from a clone whose fetch refspec omits dev 1170ms
     ✓ build throwing stops the landing and removes the throwaway checkout 422ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 9984ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 625ms
     ✓ a failing file absent at the base commit is the branch's 365ms
     ✓ an undeclared bkit:test:file reads unknown 346ms
     ✓ a failed base install reads unknown and removes the worktree 353ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 493ms
     ✓ copies the worktreeCopy entries into the base checkout 496ms
     ✓ a base file run that writes no report reads unknown 478ms
     ✓ a CI run that cannot settle the base falls back to the local run 2542ms
     ✓ a pull_request-event CI run at the base sha does not settle none 571ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 515ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 512ms
     ✓ the base test run does not inherit the hooks-off git config 488ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 834ms
     ✓ counts files committed since --base 410ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 551ms
     ✓ runs nothing and exits 0 when no file changed 346ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 593ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 441ms
     ✓ refuses a code conflict and aborts the rebase on the spot 468ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 973ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 404ms
     ✓ produces byte-identical output to merge=union 877ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 585ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 881ms
     ✓ refuses a lockfile whose regenerate command fails 562ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 788ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 716ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 401ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 457ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 698ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1031ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 695ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 733ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1106ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 335ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1020ms
     ✓ --mode=abort pushes when the branch has no open PR 608ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 441ms
     ✓ --open-pr carries the MCP answer and skips gh 311ms
     ✓ --mode=abort on dev pushes plainly without probing 378ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 723ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 813ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1761ms
     ✓ skip-ci HEAD on the replay is refused 385ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1791ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 431ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 714ms
     ✓ a fetch that fails exits 10 327ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 361ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 402ms
     ✓ scan-diff attributes deletion to its old test ins… 386ms
     ✓ scan-diff consumes each moved assertion once and … 392ms
     ✓ scan-diff does not match identical assertions fro… 417ms
     ✓ scan-diff does not match the same leaf test name … 445ms
     ✓ scan-diff does not match a same-named test with d… 405ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 410ms
     ✓ scan-diff ignores a removed comment in a test file 391ms
     ✓ scan-diff ignores an assertion moved within the file 388ms
     ✓ scan-diff still reports a removed assertion 387ms
     ✓ scan-diff reports an assertion re-added only outside the test file 397ms
     ✓ scan-diff finds an added pytest mark skip 442ms
     ✓ scan-diff finds an added unittest skip 388ms
     ✓ scan-diff finds an added bare skip call 376ms
     ✓ scan-diff ignores a quoted skip in a documentation file 429ms
     ✓ scan-diff ignores a marker literal in a non-test source file 425ms
     ✓ scan-diff ignores an assertion whose expectation changed 372ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 399ms
     ✓ scan-diff reports a deleted test file 390ms
   ✓ branches force-build (8)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 2008ms
     ✓ publishes local code with a CI running head before bookkeeping 2613ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3304ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1957ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1336ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 853ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 931ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 753ms
     ✓ --merge-docs skips an empty bkit:generate script 622ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 591ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 974ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1134ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 998ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 997ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1213ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 694ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 504ms
     ✓ exits 10 when the fetch fails 327ms
     ✓ refuses --merge-docs with --head, and an unknown --head 377ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 678ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1074ms
     ✓ a failed install stops ship (16) 1020ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1025ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1213ms
     ✓ exits 10 when the fetch fails 949ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 637ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1625ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1719ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1574ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1024ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2488ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 560ms
     ✓ reports undeclared and runs nothing with an empty script 472ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 590ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 692ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 543ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 4063ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1318ms
     ✓ runGit names ENOBUFS when output passes the limit 619ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 583ms
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
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
     ✓ keeps published build completion and PR links in one terminal comment 3798ms
     ✓ continues after the prepared completion source disappears 2360ms
     ✓ records preparation and session association failures despite successful delivery 2564ms
     ✓ associates startup and run across restart or starts fresh safely 3432ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 9447ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 756ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 449ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 321ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 488ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 305ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 301ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 399ms
     ✓ an unwritable stats path is logged and never fails the close 395ms
     ✓ appends the completeness row before the workflow-done row 435ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 429ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 509ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 760ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 514ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 438ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 366ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 488ms
     ✓ --number without --outbox is a usage error 459ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 572ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 539ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 384ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1290ms
     ✓ --flush with nothing to record commits and pushes nothing 696ms
     ✓ --flush carries the named worktree's logs into the dev commit 1138ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1536ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 2184ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 2243ms
     ✓ closePr titles the PR by the record it carries 2049ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 3254ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1643ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1355ms
     ✓ a close that landed releases the lock 1914ms
     ✓ removes the worktree before it releases the lock 1518ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 1897ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1310ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 479ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 675ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1393ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1576ms
       ✓ a run closed by workflow-failed keeps no parked copy 1505ms
       ✓ a run closed by workflow-done keeps no parked copy 1501ms
       ✓ a FAILED run gets no row 1344ms
       ✓ a DONE run gets no row 1405ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1457ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 454ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 475ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 441ms
     ✓ .husky/pre-push: first and last lines name the log 855ms
     ✓ .husky/pre-push: the hook body runs once 633ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 563ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 471ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 577ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 561ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 511ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 556ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 443ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 496ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 504ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 772ms
     ✓ .husky/pre-push: a gate fails → no disk prune 492ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 501ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 468ms
     ✓ a stale register stops the push before any gate runs 435ms
     ✓ bkit check fails → the push stops before any gate runs 463ms
     ✓ the dependency audit runs before any gate, when its script is present 609ms
     ✓ no dependency-audit script → skipped, the gates still run 458ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 564ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 491ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 547ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 475ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 933ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 630ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 732ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 670ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 516ms
     ✓ branch with no open PR → no check, push goes on 861ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 517ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 366ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 733ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 982ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 401ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 419ms
     ✓ untrusted .envrc still prints the direnv allow line 418ms
     ✓ no .envrc → no direnv call 541ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 1559ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1539ms
     ✓ base fetch fails → warns, gates run 2068ms
     ✓ dev push → no PR lookup 1800ms
     ✓ min push of a conflicting PR → blocked 2382ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 94257ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2398ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1492ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 1697ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1010ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1258ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2236ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2025ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3545ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 338ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1410ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1572ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2015ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1689ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1411ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2024ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2265ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2487ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2632ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 3060ms
       ✓ a branch with no status.jsonl dispatches as before 2176ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 3013ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 4132ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2742ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2985ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 10380ms
     ✓ records the failed job count and reads an uncounted local round as unknown 7764ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 5248ms
     ✓ finishes the first CI evidence round of the second debug run 2862ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 372ms
     ✓ refuses a code conflict and aborts the rebase on the spot 385ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 973ms
     ✓ produces byte-identical output to merge=union 858ms
     ✓ restores a trailing newline so the next append starts on its own line 485ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 580ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 717ms
     ✓ refuses a lockfile whose regenerate command fails 624ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 735ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 762ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 546ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 562ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 617ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 741ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 402ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 327ms
       ✓ runs (0) with the landed path count once dev moved 640ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 408ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 715ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 811ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1209ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 319ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 688ms
     ✓ --mode=abort pushes when the branch has no open PR 645ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 604ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 333ms
     ✓ --open-pr carries the MCP answer and skips gh 403ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 590ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 861ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2336ms
     ✓ skip-ci HEAD on the replay is refused 513ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1492ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 490ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 738ms
     ✓ a fetch that fails exits 10 346ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 429ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 412ms
     ✓ scan-diff attributes deletion to its old test ins… 426ms
     ✓ scan-diff consumes each moved assertion once and … 427ms
     ✓ scan-diff does not match identical assertions fro… 404ms
     ✓ scan-diff does not match the same leaf test name … 418ms
     ✓ scan-diff does not match a same-named test with d… 490ms
     ✓ scan-diff does not match a same-named test with c… 451ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 404ms
     ✓ --paths with no match exits 1 358ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 312ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 609ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 555ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 450ms
     ✓ scan-diff ignores a removed comment in a test file 485ms
     ✓ scan-diff ignores an assertion moved within the file 485ms
     ✓ scan-diff still reports a removed assertion 388ms
     ✓ scan-diff reports an assertion re-added only outside the test file 438ms
     ✓ scan-diff finds an added pytest mark skip 475ms
     ✓ scan-diff finds an added unittest skip 425ms
     ✓ scan-diff finds an added bare skip call 413ms
     ✓ scan-diff ignores a quoted skip in a documentation file 504ms
     ✓ scan-diff ignores a marker literal in a non-test source file 540ms
     ✓ scan-diff ignores an assertion whose expectation changed 555ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 503ms
     ✓ scan-diff reports a deleted test file 510ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 331ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 2253ms
     ✓ publishes local code with a CI running head before bookkeeping 2366ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3147ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2247ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1515ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 993ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 925ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 798ms
     ✓ --merge-docs skips an empty bkit:generate script 607ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 613ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1457ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1252ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1097ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 942ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1108ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 653ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 527ms
     ✓ exits 10 when the fetch fails 392ms
     ✓ refuses --merge-docs with --head, and an unknown --head 421ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 716ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1035ms
     ✓ a failed install stops ship (16) 806ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 609ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 595ms
     ✓ exits 10 when the fetch fails 439ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded file type changes in the shared landed comparison 363ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2731ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2971ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2076ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1393ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3682ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 841ms
     ✓ reports undeclared and runs nothing with an empty script 754ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 999ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1300ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 807ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1220ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2270ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1957ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1187ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 621ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 748ms
     ✓ plan installs dependencies like build and debug 853ms
     ✓ design stops on a failed install (5) 960ms
     ✓ plan stops on a failed install (5) 893ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 740ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1189ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 616ms
     ✓ reports a package manager that could not run (127) apart from a failed install 784ms
   ✓ bkit worktrees setup — mint (resume) (36)
     ✓ rebases onto origin/dev and clears a stale sentinel 1914ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2378ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1922ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2011ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2228ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3447ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2560ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3181ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2289ms
     ✓ saves the failed job count without the capstone job 549ms
     ✓ a CI selection keeps the failed job names, capstone left out 2043ms
     ✓ counts the capstone job when it is the only failed job 735ms
     ✓ saves no failed job count when no job failed 636ms
     ✓ filters branch and PR discovery by configured workflow and exact head 794ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1132ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1629ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1809ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1330ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1532ms
     ✓ checks the named repository base and fails closed on missing evidence 869ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 825ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1053ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 639ms
       ✓ a source change past the validated head refuses (17) and names the path 565ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 608ms
       ✓ --validated without --month / --fid is a usage error (2) 417ms
       ✓ a validated sha that is not an ancestor refuses (17) 512ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 569ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1169ms
     ✓ a failed re-trigger push names the cause in the log 1489ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1735ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2221ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1269ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 551ms
     ✓ gh-error: every poll errored 451ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1208ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1095ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 756ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1430ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 469ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 454ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 448ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 431ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1627ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1522ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 644ms
     ✓ re-trigger on dev only uses the record of its own FID 795ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 852ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (21)
     ✓ BRIEF phases take the argument as the issue 307ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 466ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 311ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 381ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 428ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 435ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 626ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 888ms
     ✓ debug: a failure test run is a failed run 1086ms
     ✓ debug: a timed_out test run is a failed run 722ms
     ✓ debug: a startup_failure test run is a failed run 745ms
     ✓ debug: a test run still in progress or cancelled is not returned 946ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 719ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 672ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1490ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 488ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 688ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 796ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 808ms
     ✓ --file and --step go together 634ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 3681ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 728ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 682ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 660ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 784ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 817ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 868ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 816ms
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 929ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 329ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 343ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 517ms
     ✓ finishes a CI round only with its own failed job count 538ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 511ms
     ✓ done --group writes group on the row 326ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 564ms
     ✓ carries extra fields, parsed as JSON when they are JSON 372ms
     ✓ reports a failed commit with exit 8 without writing the row 740ms
     ✓ a failed commit leaves no row staged in the index 565ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 760ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 749ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1065ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 518ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 922ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 359ms
     ✓ --ref reads the status file as committed on that ref, not from disk 422ms
     ✓ --ref exits 3 when the ref does not carry the status file 367ms
     ✓ fails on a placeholder left in the artifact 388ms
     ✓ fails when the row's verdict differs from the artifact's 329ms
     ✓ fails when the row does not list the artifact, or carries another attempt 390ms
     ✓ fails on a missing artifact 329ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 340ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 425ms
   ✓ bkit steps finish (21)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 357ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 584ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 935ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 611ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1025ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 607ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 736ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 447ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 376ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1009ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 417ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 386ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 312ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 735ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 427ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 615ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 403ms
     ✓ PASS is 0 failures with or without reports 563ms
     ✓ clears a previous attempt's reports before the gate runs 391ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 405ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 388ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1179ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 654ms
     ✓ numbers runs within the workflow's active run and per step 1180ms
     ✓ tests run --file records the tested snapshot on its test-run row 554ms
     ✓ a FAIL test-run row records each failing case as file and name 857ms
     ✓ a PASS test-run row records no failed tests 1198ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 732ms
     ✓ without --file no row is written and the output carries row null 575ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 475ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1478ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1638ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1316ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 1073ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 731ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 814ms
     ✓ a deleted file that no file mentions passes and the log says so 512ms
     ✓ a failed importer search runs the whole check 832ms
     ✓ --changed-since=feature-base starts at the feature's start commit 937ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 734ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 594ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 594ms
     ✓ a failing required push gate leaves the failed marker 506ms
     ✓ uncommitted code blocks the receipt until it is committed 913ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 588ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 636ms
     ✓ a planned test absent from a loaded report is a missing gap 1175ms
     ✓ a file that fails to load is a red of kind red-not-loaded 707ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 671ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 751ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 431ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 550ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 661ms
     ✓ takeover (8)
       ✓ tests red records a failing takeover as red with from 650ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 665ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 757ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 602ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 725ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 610ms
     ✓ green: lists each gap kind, with the runner output 526ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1028ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 404ms
       ✓ green clears an exception-only task from a human commit 305ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (107 tests) 32710ms
   ✓ best effort comment friction (4)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 732ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 542ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 518ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 528ms
     ✓ fetches the issue and its comments as GitHub returns them 763ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 591ms
     ✓ invalidates missing corrupt and unsupported progress cache 873ms
     ✓ contains cache read and write failures as standalone degradation 595ms
     ✓ uses legacy receipts and contains receipt failures 521ms
     ✓ records an engine-action row and skips the same key + body on a re-run 645ms
     ✓ a recent identical comment counts as done (the final close comment) 495ms
     ✓ a failed post reports done false with the reason and never leaks a token 598ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 939ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 500ms
     ✓ a different marker hash posts 537ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 713ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 35322ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 509ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 364ms
     ✓ retries a failed create once, and exits 5 when it fails twice 443ms
     ✓ exits 5 when the open-PR probe errors 559ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 383ms
     ✓ prs open still opens against any other base 980ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 484ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 767ms
     ✓ exits 4 when gh errors and 80 when it needs auth 749ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 416ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 440ms
     ✓ runs no merge when the PR is already MERGED 548ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 496ms
     ✓ prs merge refuses a PR whose base is main 891ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 378ms
     ✓ prs merge refuses when the PR base is unknown 577ms
     ✓ prs merge reads the base from the one pr view it already makes 896ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 463ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 728ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 706ms
     ✓ never reads dev's required checks without --only-if-required 651ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ exits 80 without updating when gh cannot read dev's required checks 378ms
   ✓ bkit prs checks (7)
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 381ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 560ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 304ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 37372ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 885ms
     ✓ names each net-new and worsened finding in the log and the JSON 732ms
     ✓ fails on a net score rise with no net count change 1125ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 980ms
     ✓ treats a net score at or below 0.001 as float noise 894ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 809ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 397ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 799ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 883ms
     ✓ exits 4 on a dropped net field instead of silently passing 749ms
     ✓ exits 4 on no summary instead of silently passing 760ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 982ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 758ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 733ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 776ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 713ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 650ms
     ✓ fails (exit 1) when vale reports alerts 685ms
     ✓ exits 6 on a vale runtime error 902ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 796ms
     ✓ falls back to vale sync when the main worktree has none 551ms
     ✓ fails when vale sync cannot restore the required styles 535ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 316ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 375ms
     ✓ exits 1 naming the files outside, whatever the commit message says 359ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 653ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 397ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 344ms
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 1023ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1166ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1292ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1394ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 411 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 381 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 400ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 326ms
     ✓ staging failure: exit 4 and no commit is created, no false success 323ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 372ms
     ✓ a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit 545ms
> [bkit] TRUNCATED HERE — 118 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (168 tests) 15680ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 7542ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 566ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 452ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 24620ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 835ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 858ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 503ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 450ms
     ✓ completes missing subagent attribution before a real append 441ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 488ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2458ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 505ms
     ✓ resolves a pending ledger intent after its invocation is stale 604ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 398ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 324ms
     ✓ prepares afresh when nothing landed and a foreign row followed 358ms
     ✓ receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again 359ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 9292ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 1401ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 2084ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1870ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (33 tests) 21209ms
   ✓ changedFiles (2)
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 401ms
   ✓ snapshotTree / changedBetween (5)
     ✓ snapshotting leaves the index and working tree as they were 431ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 520ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 380ms
   ✓ importersOf (4)
     ✓ importersOf returns null when the base tree cannot be searched 303ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 985ms
     ✓ counts files committed since --base 880ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 860ms
     ✓ runs nothing and exits 0 when no file changed 532ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 847ms
     ✓ runs the --fallback gate even when no file changed, as it did before 901ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 532ms
     ✓ exits 4 when the gate could not run 972ms
     ✓ changed-since exits 81 with the holder read from the status file 868ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 883ms
     ✓ exits 1 when the gate exits 75 and writes no status file 923ms
   ✓ tests changed default base (8)
     ✓ lists a file the subagent committed after the last step-done commit 819ms
     ✓ lists the same file when it is left uncommitted 947ms
     ✓ leaves out a file only the previous step's own commit touched 898ms
     ✓ lists the subagent's file when a later commit sweeps in an uncommitted step-done row 874ms
     ✓ lists the subagent's committed file when another feature's run is also in progress 1123ms
     ✓ on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit 1010ms
     ✓ on an in-place shared-branch run with a second run in progress and a dirty status file leaves out another agent's commit 1267ms
     ✓ lists the subagent's committed file on an adopted branch when another feature's run is also in progress 1094ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 8572ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 314ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 423ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 540ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 13325ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 543ms
     ✓ keeps each context's own section banner and drops every other context's 1259ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 472ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 389ms
     ✓ --base narrows the range to the commits after a group's start sha 344ms
     ✓ diff from a group start covers only the group's commits 357ms
     ✓ an empty range writes a one-line note and zero numbers 344ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 489ms
     ✓ --reset-log empties the step's clamp log before the record lands 808ms
     ✓ whole: nothing omitted and no copy kept 349ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 358ms
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 331ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 670ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 692ms
     ✓ featureBase uses the origin/dev meeting point when there is no local dev 315ms
     ✓ context diff without --base leaves out an unpushed local dev commit 474ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 14235ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1059ms
     ✓ a failing file absent at the base commit is the branch's 642ms
     ✓ an undeclared bkit:test:file reads unknown 511ms
     ✓ a failed base install reads unknown and removes the worktree 571ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 670ms
     ✓ copies the worktreeCopy entries into the base checkout 676ms
     ✓ a base file run that writes no report reads unknown 656ms
     ✓ a passing CI run at the exact base sha settles none without a local run 440ms
     ✓ a CI run that cannot settle the base falls back to the local run 3693ms
     ✓ a pull_request-event CI run at the base sha does not settle none 704ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 691ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 680ms
     ✓ the base test run does not inherit the hooks-off git config 670ms
     ✓ adopt follows the run's runtimeWorktrees 1438ms
     ✓ worktreeInstall off reads unknown 409ms
 ✓ .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts (25 tests) 16318ms
   ✓ bkit [auto route] marker comes from the re-read labels (25)
     ✓ bkit-build.md held close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 1384ms
       ✓ leaves the subject unchanged when bkit:auto is absent 1328ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 1312ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1115ms
       ✓ leaves the subject unchanged when no labels are passed 1075ms
     ✓ bkit-build.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 988ms
       ✓ leaves the subject unchanged when bkit:auto is absent 984ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 1066ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 959ms
       ✓ leaves the subject unchanged when no labels are passed 1003ms
     ✓ bkit-debug.md publish close (6)
       ✓ threads the marker onto the close subject when the issue carries bkit:auto 945ms
       ✓ leaves the subject unchanged when bkit:auto is absent 1021ms
       ✓ does not arm the route on the near-miss label bkit:auto-paused 960ms
       ✓ does not arm the route on the near-miss label no-bkit:auto 1052ms
       ✓ leaves the subject unchanged when no labels are passed 1110ms
 ✓ .bkit/core/engine/commands/lib.test.ts (79 tests) 4984ms
   ✓ repo facts on a real repository (5)
     ✓ a host-made linked worktree holds the run 422ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1341ms
     ✓ runGit names ENOBUFS when output passes the limit 737ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 789ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 315ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 8305ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 755ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 434ms
     ✓ stops the step when the command crashed or was misused 821ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2411ms
     ✓ ship gates on CI and merges the pinned head 3882ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 8173ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 1010ms
     ✓ workflow progress command wiring progress specialized completion producers 3804ms
     ✓ workflow progress command wiring progress gate only completions 547ms
     ✓ progress excludes noncompletions 1548ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 8764ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 2618ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 1538ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 4606ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (27 tests) 4221ms
   ✓ publication ownership lock (4)
     ✓ reclaims only a proven dead matching process identity 342ms
   ✓ bkit locks release (6)
     ✓ locks release removes the FID shared-checkout record 359ms
     ✓ locks release from a linked worktree removes the FID record under that worktree's git dir 374ms
 ✓ .bkit/core/engine/commands/workflow/step-base.test.ts (7 tests) 3451ms
   ✓ stepBase (7)
     ✓ returns the commit that holds the last step-done row 554ms
     ✓ with a step name returns the commit of the row before that step's latest row 507ms
     ✓ falls back to the run start commit, and null with no run 497ms
     ✓ returns the parentSha of an uncommitted row even after a later commit sweeps it in 350ms
     ✓ with no file on a feat/{FID} branch, picks that FID's run when another run is in progress 523ms
     ✓ skips a build-takeover row written inside the step it measures 412ms
     ✓ with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress 606ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 4550ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 641ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 987ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 379ms
     ✓ challenge gate without --base sizes only the branch's own lines 589ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (48 tests) 3393ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 323ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 371ms
     ✓ currency emits no hunk outside the matched set 313ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 475ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (78 tests) 3405ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 3011ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 316ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (90 tests) 2577ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 537ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 2028ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (304 tests) 558ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 611ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 2092ms
   ✓ runLines (5)
     ✓ counts deleted lines into changed 327ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 541ms
     ✓ is null when first is not an ancestor of last, or either is missing 407ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1613ms
   ✓ plan close: archive before overwrite (2)
     ✓ runs under zsh for a plan with a superseded canonical 306ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1584ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 210ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 121ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (21 tests) 123ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 98ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (329 tests) 360ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 159ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (38 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 45ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 4ms

 Test Files  56 passed (56)
      Tests  4390 passed (4390)
   Start at  23:23:28
   Duration  419.23s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/994-build-cannot-start/build-holistic-gate-3.log.reports/vitest-92946.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/branches.test.ts .bkit/core/engine/commands/workflow/branches.ts dist/commands/workflow/branches.js docs/plans/202611/logs/994-build-cannot-start/build-holistic-gate-1-2.md docs/plans/202611/logs/994-build-cannot-start/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/994-build-cannot-start/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/994-build-cannot-start/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2754 of 14023 lines (196 KB of 952 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
