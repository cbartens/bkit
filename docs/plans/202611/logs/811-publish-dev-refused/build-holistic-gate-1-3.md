
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl dist/commands/workflow/workflows.js docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-2.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl dist/commands/workflow/workflows.js docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-2.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 28208ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 397ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 459ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 406ms
     ✓ a new run of the same FID rewrites startSha 574ms
     ✓ a resume of the same FID reuses the record 554ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 765ms
       ✓ drops a commit id that is not on the branch 702ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 667ms
       ✓ writes an empty commit list when the run has no run-commits row 717ms
       ✓ ignores a row from before the open run started 688ms
       ✓ restores the commits from the row on origin/dev when the handover landed 887ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 973ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 760ms
       ✓ ignores the row on origin/dev when the run there is closed 848ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 750ms
         ✓ wins over the row on origin/dev, which is then not needed 869ms
         ✓ wins over the row in the checkout's own log while the run is open 738ms
         ✓ still drops a commit id that is not on the branch 744ms
         ✓ is ignored and removed when the checkout's log shows the run closed 743ms
         ✓ is ignored when it was parked for another workflow 787ms
         ✓ is removed once the record is rebuilt 747ms
         ✓ is removed when the live record already stands for the open run 648ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 314ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 318ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 469ms
     ✓ a stale record without a lock is replaced 571ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 395ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1413ms
     ✓ names inherited commits and ship recovery in the refusal 461ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 572ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 432ms
   ✓ bkit worktrees remove (18)
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 379ms
       ✓ preserves staged-only mode during landed cleanup 364ms
       ✓ preserves staged-only type during landed cleanup 380ms
       ✓ preserves staged-only deletion during landed cleanup 386ms
       ✓ removes landed staged content when both index and working contents are on dev 420ms
       ✓ deletes the proved local and remote branch at their landed tips 448ms
       ✓ retains the remote branch when origin refuses its conditional deletion 611ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 300ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (210 tests) 35958ms
   ✓ CI evidence test rounds (5)
     ✓ runs local gates only after current-generation remediation or soak 786ms
   ✓ bkit tests run (14)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 391ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 403ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 404ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 469ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 313ms
     ✓ PASS is 0 failures with or without reports 369ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 423ms
     ✓ numbers runs within the workflow's active run and per step 419ms
     ✓ a PASS test-run row records no failed tests 435ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 328ms
   ✓ bkit tests run --changed-since (17)
     ✓ changed-since runs the changed gate on changed files and writes a test-run row 461ms
     ✓ changed-since runs the --gate whole when bkit:gate:changed is undeclared 594ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 639ms
     ✓ --since-pass-of skips failing runs and steps it does not name 723ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 443ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 401ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 561ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 553ms
     ✓ a failed importer search runs the whole check 356ms
     ✓ --changed-since=feature-base starts at the feature's start commit 400ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 664ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 763ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 409ms
     ✓ a failing required push gate leaves the failed marker 517ms
     ✓ uncommitted code blocks the receipt until it is committed 689ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 431ms
     ✓ only the required push gate records a receipt 353ms
     ✓ a gate that gave up on the tests lock exits 81 from the status file and records no receipt 728ms
   ✓ bkit tests red / green (46)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 508ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 318ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 364ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 301ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 426ms
     ✓ per-test proof (4)
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 551ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 327ms
     ✓ takeover (5)
       ✓ tests red records a passing pre-run takeover as updated against the run start 500ms
       ✓ a resumed tests red skips a taken-over entry 319ms
       ✓ tests green lists takenOver and never counts it as a gap or unproven 346ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 727ms
     ✓ tests a code step changed (7)
       ✓ green gives each changed test the line diff of its own lines since its baseline and whether it is additive 425ms
     ✓ green: --group audits only that group's tasks 403ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 308ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 574ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 336ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 346ms
     ✓ green: lists each gap kind, with the runner output 418ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 583ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (232 tests) 46438ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 674ms
   ✓ preserves the requested event for selected-workflow verification 555ms
   ✓ requires selected other-workflow success at the exact pushed head 968ms
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1161ms
     ✓ saves the failed job count without the capstone job 590ms
     ✓ a CI selection keeps the failed job names, capstone left out 700ms
     ✓ counts the capstone job when it is the only failed job 306ms
     ✓ filters branch and PR discovery by configured workflow and exact head 329ms
     ✓ freezes explicit workflow run attempt and all failed job pages 332ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 607ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 729ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 609ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 640ms
     ✓ checks the named repository base and fails closed on missing evidence 373ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 343ms
     ✓ rejects MCP capstone jobs belonging to another run 443ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 776ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 724ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1044ms
   ✓ bkit runs dispatch (21)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 454ms
     ✓ a failed re-trigger push names the cause in the log 1101ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 778ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1180ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 527ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 445ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 394ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 505ms
     ✓ a hand-off in the re-poll resumes from the saved receipt with no second re-trigger commit 593ms
     ✓ CLI: verdict JSON, body scan, exit codes 370ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 534ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 667ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 643ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 621ms
     ✓ re-trigger on dev only uses the record of its own FID 308ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 338ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (15)
     ✓ --wait (4)
       ✓ waits for a run still going at the squash commit, then judges and records it 1111ms
   ✓ bkit runs revalidate (7)
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 773ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 469ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 444ms
     ✓ debug: a failure test run is a failed run 732ms
     ✓ debug: a timed_out test run is a failed run 459ms
     ✓ debug: a startup_failure test run is a failed run 448ms
     ✓ debug: a test run still in progress or cancelled is not returned 614ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 454ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 946ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1186ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 1374ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 362ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 346ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 349ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 414ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 407ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 423ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 427ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run on a suppressed re-trigger 410ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found on a suppressed re-trigger 386ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 26422ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 452ms
     ✓ a failed commit leaves no row staged in the index 753ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 460ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 721ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 868ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 420ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 476ms
   ✓ bkit steps finish (17)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 335ms
   ✓ bkit steps finish --post (4)
     ✓ a re-run of the same step and body is deduped: nothing posted again 400ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 314ms
     ✓ writeStepRow refuses when a recorded path changed 382ms
     ✓ writeStepRow appends its commit sha to the record 315ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 423ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 374ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 324ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 305ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 379ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 415ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 361ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 323ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 346ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 66008ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 995ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 6746ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 761ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 649ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 586ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 766ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1110ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1297ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 654ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 523ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 612ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 752ms
     ✓ design installs dependencies like build and debug 722ms
     ✓ plan installs dependencies like build and debug 544ms
     ✓ design stops on a failed install (5) 537ms
     ✓ plan stops on a failed install (5) 592ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 679ms
     ✓ tracks origin/feat/{fid} when only the remote has it 759ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 569ms
     ✓ reports a package manager that could not run (127) apart from a failed install 800ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 1209ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 1839ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 1784ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1331ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1364ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1370ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 935ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1059ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1004ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 937ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1314ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1133ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1622ms
     ✓ commits leftovers when a copy entry points outside the checkout 1309ms
     ✓ never commits the entries setup copies in from the main checkout 1170ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1679ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 577ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 716ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 942ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 923ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 928ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 933ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 905ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1043ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1117ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 556ms
     ✓ leaves a clean worktree's history alone 1138ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1398ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1592ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1596ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1838ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 2006ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1679ms
     ✓ does not mark a resumed worktree it did not create 817ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 482ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 747ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1012ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 651ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests) 14081ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 369ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ a recorded ledger commits only the rows the run appended 359ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 482ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 482ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 317ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 372ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 17156ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 1881ms
     ✓ a foreign commit made mid-run never reaches the remote 2291ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 2405ms
     ✓ push from a level local dev is a plain push 1194ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 2305ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 1220ms
     ✓ two records on dev: each push selects its own FID's commits 1925ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 937ms
     ✓ close commit tree excludes foreign files 1379ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 1618ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 19010ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 540ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 393ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2190ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 346ms
     ✓ resolves a pending ledger intent after its invocation is stale 356ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 8063ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 1440ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 1698ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1432ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 12924ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 577ms
     ✓ a failing file absent at the base commit is the branch's 313ms
     ✓ an undeclared bkit:test:file reads unknown 374ms
     ✓ a failed base install reads unknown and removes the worktree 416ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 548ms
     ✓ copies the worktreeCopy entries into the base checkout 658ms
     ✓ no origin/dev ref reads unknown 355ms
     ✓ a base file run that writes no report reads unknown 590ms
     ✓ a passing CI run at the exact base sha settles none without a local run 429ms
     ✓ a CI run that cannot settle the base falls back to the local run 4036ms
     ✓ a pull_request-event CI run at the base sha does not settle none 751ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 622ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 634ms
     ✓ the base test run does not inherit the hooks-off git config 662ms
     ✓ adopt follows the run's runtimeWorktrees 1301ms
     ✓ worktreeInstall off reads unknown 321ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/repo/test-file-script.integration.test.ts (17 tests) 58528ms
   ✓ bkit:test:file runs every test file kind into a JUnit report (9)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs reports its named test passed 9398ms
     ✓ bats — tests/shell/bkit-gh-stub.bats reports its named test passed 1249ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed 1085ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… reports its named test passed 639ms
     ✓ node — with no report path the test file is left as it was 8945ms
     ✓ bats — with no report path the test file is left as it was 1417ms
     ✓ node — with no report path the test file is left as it was 1468ms
     ✓ vitest — with no report path the test file is left as it was 783ms
     ✓ a run naming files of two kinds is refused as a usage error 377ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 464ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 564ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 346ms
     ✓ bats — tests/shell/bkit-gh-stub.bats lints clean 305ms
     ✓ node — scripts/harvest/bkit-harvest.test.mjs lints clean 473ms
     ✓ vitest — .bkit/core/engine/audits/repo/config-ke… lints clean 406ms
   ✓ bkit:test:file ends a node --test file whose test awaits a child that never exits (1)
     ✓ node — a test awaiting a child that never exits fails within the limit 30601ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 8521ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 935ms
     ✓ workflow progress command wiring progress specialized completion producers 3816ms
     ✓ workflow progress command wiring progress gate only completions 365ms
     ✓ progress excludes noncompletions 2105ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 5257ms
   ✓ repo facts on a real repository (4)
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 316ms
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 427ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1349ms
     ✓ runGit names ENOBUFS when output passes the limit 1045ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 837ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 342ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 5609ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 741ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1060ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 413ms
     ✓ challenge gate without --base sizes only the branch's own lines 456ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 15974ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 519ms
     ✓ keeps each context's own section banner and drops every other context's 1106ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 478ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 368ms
     ✓ --base narrows the range to the commits after a group's start sha 389ms
     ✓ diff from a group start covers only the group's commits 351ms
     ✓ an empty range writes a one-line note and zero numbers 367ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 788ms
     ✓ --reset-log empties the step's clamp log before the record lands 1267ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 563ms
     ✓ whole: nothing omitted and no copy kept 537ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 534ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 697ms
     ✓ featureBase picks the origin/dev meeting point when local dev equals origin/dev 387ms
     ✓ featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 461ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 925ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 779ms
     ✓ featureBase uses the origin/dev meeting point when there is no local dev 315ms
     ✓ context diff without --base leaves out an unpushed local dev commit 536ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 3494ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 457ms
     ✓ currency leaves run logs out: a symbol named only in another plan's log matches no task 302ms
     ✓ currency emits no hunk outside the matched set 406ms
     ✓ currency exits 0 with no hunks when no task matches 360ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 520ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3952ms
   ✓ bkit decisions compose (40)
     ✓ Try again is offered for every base verdict 324ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 3358ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 337ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 3042ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 522ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 344ms
     ✓ judges codeChanged between the compared same-scope rounds 325ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 3092ms
   ✓ bkit status resume (43)
     ✓ design: a completed step resumes at the next one 342ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 2981ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 393ms
     ✓ counts deleted lines into changed 585ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 870ms
     ✓ is null when first is not an ancestor of last, or either is missing 530ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (25 tests) 12409ms
   ✓ changedFiles (2)
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 535ms
   ✓ snapshotTree / changedBetween (5)
     ✓ the tested snapshot holds uncommitted and untracked files 321ms
     ✓ snapshotting leaves the index and working tree as they were 497ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 553ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 417ms
   ✓ importersOf (4)
     ✓ importersOf lists the unchanged files that mention a deleted file's name 327ms
     ✓ importersOf leaves out a file that no longer exists 327ms
     ✓ importersOf returns null when the base tree cannot be searched 344ms
   ✓ tests changed (13)
     ✓ runs bkit:gate:changed with the changed files as its arguments 754ms
     ✓ counts files committed since --base 902ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 617ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 575ms
     ✓ runs the --fallback gate even when no file changed, as it did before 552ms
     ✓ exits 4 when the gate could not run 617ms
     ✓ changed-since exits 81 with the holder read from the status file 652ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 1269ms
     ✓ exits 1 when the gate exits 75 and writes no status file 1202ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 2247ms
   ✓ check — hole classes (27)
     ✓ never requires the workflows start call, which a fresh run cannot journal 337ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 1704ms
   ✓ SETUP_TIPS — detection (66)
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 371ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (190 tests) 97588ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 471ms
   ✓ bkit workflows close (26)
     ✓ writes one completeness row per close 416ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 383ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 324ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 353ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 345ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 392ms
     ✓ --record-step writes the close step's row before workflow-done 313ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 314ms
     ✓ --number without --outbox is a usage error 311ms
   ✓ bkit workflows handover (32)
     ✓ --push commits and pushes the record on the feature branch without a handover 447ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 445ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 489ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 494ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 357ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1024ms
     ✓ --flush with nothing to record commits and pushes nothing 480ms
     ✓ --flush carries the named worktree's logs into the dev commit 822ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 1201ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 1654ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 1289ms
     ✓ closePr titles the PR by the record it carries 1288ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 300ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 623ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 345ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 415ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1075ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1281ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1012ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1088ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 2393ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1214ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1040ms
     ✓ a close that landed releases the lock 1383ms
     ✓ removes the worktree before it releases the lock 1440ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 383ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 306ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 319ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 694ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 384ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2325ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2219ms
       ✓ a run closed by workflow-failed keeps no parked copy 2371ms
       ✓ a run closed by workflow-done keeps no parked copy 3887ms
       ✓ a FAILED run gets no row 2721ms
       ✓ a DONE run gets no row 2643ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2453ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 482ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 985ms
     ✓ a missing summary file exits 13 before anything is written 303ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 361ms
     ✓ a folder outside the outbox sessions folder is kept 333ms
     ✓ without --session-dir prints no sessionRemoved 301ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 52 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 8740ms
     ✓ continues after the prepared completion source disappears 5721ms
     ✓ records preparation and session association failures despite successful delivery 4933ms
     ✓ associates startup and run across restart or starts fresh safely 6411ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 14114ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 152148ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 4616ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 432ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 4329ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 4575ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 2930ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 3362ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 4469ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 3342ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 4635ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 418ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1880ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2111ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 3194ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1958ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1804ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2819ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2483ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 3081ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 3061ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2975ms
       ✓ a branch with no status.jsonl dispatches as before 2552ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 3142ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3454ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2580ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2865ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 10641ms
     ✓ records the failed job count and reads an uncounted local round as unknown 8315ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 5045ms
     ✓ finishes the first CI evidence round of the second debug run 2911ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 1349ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1363ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 1767ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 973ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1161ms
     ✓ .husky/pre-push: first and last lines name the log 572ms
     ✓ .husky/pre-push: the hook body runs once 678ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 678ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 786ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1023ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1069ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 751ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1318ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1366ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 1245ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 862ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 871ms
     ✓ .husky/pre-push: a gate fails → no disk prune 872ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1473ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1014ms
     ✓ a stale register stops the push before any gate runs 1058ms
     ✓ bkit check fails → the push stops before any gate runs 689ms
     ✓ the dependency audit runs before any gate, when its script is present 710ms
     ✓ no dependency-audit script → skipped, the gates still run 832ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1153ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1894ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1135ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 1380ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1502ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 2152ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1305ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1142ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 1035ms
     ✓ branch with no open PR → no check, push goes on 1069ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 708ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 464ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1217ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ trusted .envrc → the gate sees its variables 1435ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 493ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 664ms
     ✓ untrusted .envrc still prints the direnv allow line 629ms
     ✓ no .envrc → no direnv call 715ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh not on PATH → warns, gates run 2259ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1941ms
     ✓ base fetch fails → warns, gates run 4473ms
     ✓ dev push → no PR lookup 2951ms
     ✓ min push of a conflicting PR → blocked 3494ms
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ openDecision carries the Source changed header 364ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 513ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 344ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 306ms
     ✓ aborts a rebase only when one is in progress 644ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 550ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 662ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 478ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 473ms
     ✓ --max-exceeded says a handover is due without any sentinel 335ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 310ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 397ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 419ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 471ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 401ms
     ✓ a debug run in SOAK mode always needs a handover 380ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 489ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 684ms
     ✓ an unwritable stats path is logged and never fails the close 609ms
     ✓ appends the completeness row before the workflow-done row 627ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 603ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 714ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1119ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 664ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 616ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 584ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 762ms
     ✓ --number without --outbox is a usage error 698ms
     ✓ --flush is ship only 315ms
   ✓ bkit workflows handover (32)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 359ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 326ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2096ms
     ✓ --flush with nothing to record commits and pushes nothing 1219ms
     ✓ --flush carries the named worktree's logs into the dev commit 2109ms
     ✓ --flush refused by dev with the PR path failing keeps the record and exits 10 2469ms
     ✓ --flush refused by dev publishes the FAILED record through a PR 3972ms
     ✓ --flush refused by dev links the handover comment at dev once the PR merged 2915ms
     ✓ closePr titles the PR by the record it carries 2752ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 5070ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3075ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1692ms
     ✓ a close that landed releases the lock 2529ms
     ✓ removes the worktree before it releases the lock 2412ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 306ms
     ✓ names the branch, not the remote-tracking ref, in each URL 316ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 332ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 341ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 796ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 495ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 2439ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 2468ms
       ✓ a run closed by workflow-failed keeps no parked copy 2851ms
       ✓ a run closed by workflow-done keeps no parked copy 2667ms
       ✓ a FAILED run gets no row 2684ms
       ✓ a DONE run gets no row 3198ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2485ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 571ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 45637ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1197ms
     ✓ names each net-new and worsened finding in the log and the JSON 1791ms
     ✓ fails on a net score rise with no net count change 1279ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1702ms
     ✓ treats a net score at or below 0.001 as float noise 1374ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 748ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 533ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 844ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1036ms
     ✓ exits 4 on a dropped net field instead of silently passing 1425ms
     ✓ exits 4 on no summary instead of silently passing 1175ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1145ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 869ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 914ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 980ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 667ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 431ms
     ✓ fails (exit 1) when vale reports alerts 508ms
     ✓ exits 6 on a vale runtime error 727ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 557ms
     ✓ falls back to vale sync when the main worktree has none 481ms
     ✓ fails when vale sync cannot restore the required styles 449ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 470ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 428ms
     ✓ exits 1 naming the files outside, whatever the commit message says 378ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 801ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 470ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 431ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 625ms
     ✓ refuses a code conflict and aborts the rebase on the spot 658ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2033ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 701ms
     ✓ produces byte-identical output to merge=union 1819ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1220ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1358ms
     ✓ refuses a lockfile whose regenerate command fails 1641ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1626ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1582ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 870ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1101ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1225ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1208ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 754ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 629ms
       ✓ runs (0) with the landed path count once dev moved 1050ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 563ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1115ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1496ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2573ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 769ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1748ms
     ✓ --mode=abort pushes when the branch has no open PR 1944ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1381ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 605ms
     ✓ --open-pr carries the MCP answer and skips gh 1758ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1230ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1532ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4253ms
     ✓ skip-ci HEAD on the replay is refused 1028ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2398ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 956ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1373ms
     ✓ a fetch that fails exits 10 583ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 709ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 779ms
     ✓ scan-diff attributes deletion to its old test ins… 749ms
     ✓ scan-diff consumes each moved assertion once and … 646ms
     ✓ scan-diff does not match identical assertions fro… 769ms
     ✓ scan-diff does not match the same leaf test name … 794ms
     ✓ scan-diff does not match a same-named test with d… 718ms
     ✓ scan-diff does not match a same-named test with c… 769ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 749ms
     ✓ --paths with no match exits 1 590ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 545ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 899ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1034ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 812ms
     ✓ scan-diff ignores a removed comment in a test file 766ms
     ✓ scan-diff ignores an assertion moved within the file 597ms
     ✓ scan-diff still reports a removed assertion 733ms
     ✓ scan-diff reports an assertion re-added only outside the test file 700ms
     ✓ scan-diff finds an added pytest mark skip 829ms
     ✓ scan-diff finds an added unittest skip 690ms
     ✓ scan-diff finds an added bare skip call 690ms
     ✓ scan-diff ignores a quoted skip in a documentation file 781ms
     ✓ scan-diff ignores a marker literal in a non-test source file 987ms
     ✓ scan-diff ignores an assertion whose expectation changed 712ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 741ms
     ✓ scan-diff reports a deleted test file 738ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 613ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 4883ms
     ✓ publishes local code with a CI running head before bookkeeping 4872ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5610ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3809ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2564ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2012ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1822ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1486ms
     ✓ --merge-docs skips an empty bkit:generate script 1423ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1242ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2323ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2395ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2042ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1794ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1988ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1401ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 976ms
     ✓ exits 10 when the fetch fails 559ms
     ✓ refuses --merge-docs with --head, and an unknown --head 610ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1285ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2037ms
     ✓ a failed install stops ship (16) 1801ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1345ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1380ms
     ✓ exits 10 when the fetch fails 978ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 642ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2784ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2729ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2568ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1880ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 4456ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 682ms
     ✓ reports undeclared and runs nothing with an empty script 533ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 737ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 853ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 766ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 889ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1043ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1137ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1298ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1508ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2623ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3178ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1746ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1592ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 1664ms
     ✓ plan installs dependencies like build and debug 1254ms
     ✓ design stops on a failed install (5) 1048ms
     ✓ plan stops on a failed install (5) 1036ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1002ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1220ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 946ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1260ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2770ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2029ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2353ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 2135ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 2570ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3246ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2416ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3385ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 978ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1010ms
     ✓ retries a failed create once, and exits 5 when it fails twice 740ms
     ✓ exits 5 when the open-PR probe errors 1058ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1182ms
     ✓ prs open still opens against any other base 778ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 887ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 837ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1372ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 638ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 958ms
     ✓ runs no merge when the PR is already MERGED 949ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1144ms
     ✓ prs merge refuses a PR whose base is main 648ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1320ms
     ✓ prs merge refuses when the PR base is unknown 727ms
     ✓ prs merge reads the base from the one pr view it already makes 1166ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 1207ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 820ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1407ms
     ✓ never reads dev's required checks without --only-if-required 832ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 918ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 1327ms
     ✓ is not green when a check failed, naming it (exit 1) 1427ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1497ms
     ✓ is not green on an empty rollup (total 0) 1143ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1225ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1171ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 895ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 2266ms
     ✓ saves the failed job count without the capstone job 1109ms
     ✓ a CI selection keeps the failed job names, capstone left out 1196ms
     ✓ counts the capstone job when it is the only failed job 821ms
     ✓ saves no failed job count when no job failed 808ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1114ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1005ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1504ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1972ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1304ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1731ms
     ✓ checks the named repository base and fails closed on missing evidence 971ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 812ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 906ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 547ms
       ✓ a source change past the validated head refuses (17) and names the path 358ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 433ms
       ✓ --validated without --month / --fid is a usage error (2) 303ms
       ✓ a validated sha that is not an ancestor refuses (17) 391ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 420ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 855ms
     ✓ a failed re-trigger push names the cause in the log 1637ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 2316ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2109ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1104ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 375ms
     ✓ gh-error: every poll errored 370ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1118ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 762ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 532ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 975ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 356ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 320ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 371ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 367ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1322ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1422ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 524ms
     ✓ re-trigger on dev only uses the record of its own FID 493ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 581ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1140ms
   ✓ bkit runs context (21)
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 1733ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 1559ms
     ✓ debug: a failure test run is a failed run 1343ms
     ✓ debug: a timed_out test run is a failed run 1146ms
     ✓ debug: a startup_failure test run is a failed run 948ms
     ✓ debug: a test run still in progress or cancelled is not returned 1325ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 1430ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 1441ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 2262ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 367ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 451ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 526ms
     ✓ --file and --step go together 311ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2141ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 398ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 433ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 457ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 611ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 713ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 731ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 693ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1132ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 414ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 419ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 621ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 638ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 593ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 416ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 808ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 403ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 922ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 722ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 391ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 415ms
     ✓ PASS is 0 failures with or without reports 568ms
     ✓ clears a previous attempt's reports before the gate runs 477ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 387ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 392ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1319ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 497ms
     ✓ numbers runs within the workflow's active run and per step 1057ms
     ✓ tests run --file records the tested snapshot on its test-run row 569ms
     ✓ a FAIL test-run row records each failing case as file and name 511ms
     ✓ a PASS test-run row records no failed tests 991ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 545ms
     ✓ without --file no row is written and the output carries row null 416ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 407ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1407ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1471ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 1637ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 992ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 1004ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 1022ms
     ✓ a deleted file that no file mentions passes and the log says so 432ms
     ✓ a failed importer search runs the whole check 1420ms
     ✓ --changed-since=feature-base starts at the feature's start commit 1199ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 816ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 1231ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 629ms
     ✓ a failing required push gate leaves the failed marker 1191ms
     ✓ uncommitted code blocks the receipt until it is committed 1016ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 1257ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 1290ms
     ✓ a planned test absent from a loaded report is a missing gap 819ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1409ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1132ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1237ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1223ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 682ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1577ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 1340ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 1355ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 1380ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 858ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1095ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 681ms
     ✓ green: lists each gap kind, with the runner output 654ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1762ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 374ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 37926ms
   ✓ best effort comment friction (4)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1076ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 780ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 513ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 627ms
     ✓ fetches the issue and its comments as GitHub returns them 645ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1026ms
     ✓ invalidates missing corrupt and unsupported progress cache 1023ms
     ✓ contains cache read and write failures as standalone degradation 431ms
     ✓ uses legacy receipts and contains receipt failures 1077ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1059ms
     ✓ a recent identical comment counts as done (the final close comment) 927ms
     ✓ a failed post reports done false with the reason and never leaks a token 758ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 818ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 738ms
     ✓ a different marker hash posts 580ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 355ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 18379ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 414 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/modules/core.integration.test.ts (165 tests) 16273ms
   ✓ deterministic bookkeeping contracts in a fresh consumer (1)
     ✓ installs and upgrades fresh consumers with deterministic bookkeeping contracts 8042ms
   ✓ shared hook behaviour footprint (fresh install and upgrade) (3)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 639ms
     ✓ upgrades shipped registrations without dropping consumer hook groups or permissions 530ms
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 25381ms
   ✓ the dispatch seam on a real worktree (7)
     ✓ a call launched from a git hook writes no engine-call row 784ms
     ✓ branches rebase finishes a rebase paused on a commit that carries the run's status file 838ms
   ✓ explicit invocation on real worktrees (3)
     ✓ resumes explicit invocation across two real worktrees without identity leakage 574ms
     ✓ keeps invocation events and engine-call rows inside the issuing worktree after receipt loss 404ms
     ✓ completes missing subagent attribution before a real append 481ms
   ✓ replay-safe ledger appends on real files (8)
     ✓ reconciles lost append response at each durable checkpoint without duplicate rows 520ms
     ✓ serializes concurrent append operations and blocks partial uncertain ledger writes 2515ms
     ✓ keeps rendered audit report appended rows and tracker draft counts identical 689ms
     ✓ resolves a pending ledger intent after its invocation is stale 645ms
     ✓ appends the printed audit ledgerRows verbatim under the standalone invocation 475ms
     ✓ refuses to re-append a partly landed block after a foreign writer appended 320ms
     ✓ prepares afresh when nothing landed and a foreign row followed 342ms
     ✓ receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again 349ms
   ✓ persistent CI handoff on a real local remote (3)
     ✓ resumes nonwaiting CI polls without resetting attempts or duplicating retrigger 9507ms
     ✓ blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it 1937ms
     ✓ does not push a second re-trigger copy after a lost push response on a shared branch 2066ms
   ✓ bounded correction on real ledgers (1)
     ✓ resumes corrected substep and blocks exhausted unauthorized or uncertain effects 1505ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (167 tests) 58024ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 468ms
     ✓ finishes a CI round only with its own failed job count 455ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 330ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 466ms
     ✓ reports a failed commit with exit 8 without writing the row 786ms
     ✓ a failed commit leaves no row staged in the index 1149ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1227ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 946ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1305ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 934ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1052ms
   ✓ bkit steps gate (8)
     ✓ fails when the row does not list the artifact, or carries another attempt 313ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 334ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 402ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 430ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 370ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 314ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 533ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 677ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 469ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 563ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 876ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 513ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 590ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 420ms
     ✓ --attempt-of checks the row carries the derived counter 302ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 788ms
     ✓ writeStepRow refuses when a recorded path changed 789ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 395ms
     ✓ writeStepRow appends its commit sha to the record 808ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1093ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (46)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 303ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 588ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 527ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 509ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 320ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 884ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 734ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 553ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 401ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 913ms
     ✓ refuses the execute step when it changes another group's planned test, exit 11 361ms
     ✓ refuses the gaps-remediate step when it changes another group's planned test, exit 11 305ms
     ✓ the tests step's finish refuses an earlier task's changed planned test with exit 11 573ms
     ✓ the tests step's finish passes its own group's and taken-over tests 724ms
     ✓ lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row 545ms
     ✓ lets a code step through when its BLOCKED line names the changed test by the last segment of its name 643ms
     ✓ lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test 749ms
     ✓ records only the changed test when a BLOCKED line also names an unchanged one 600ms
     ✓ refuses only the changed planned tests no BLOCKED line of the log names 388ms
     ✓ the refusal names the BLOCKED line the engine reads 333ms
     ✓ passes a later code step that leaves a BLOCKED change as it is 900ms
     ✓ refuses a later code step that changes a BLOCKED change again 636ms
     ✓ records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line 793ms
     ✓ uses a red the tests step recorded after a code step's change as the baseline 851ms
     ✓ refuses a code step that writes a planned test whose red recorded its file missing, exit 11 340ms
     ✓ the refusal of a restored BLOCKED change names the recorded change as the lines to put back 584ms
     ✓ the refusal of a re-change says the logged reason is already recorded 572ms
     ✓ refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11 335ms
     ✓ a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11 640ms
     ✓ the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it 682ms
     ✓ the same contradicted finish run again adds no second task or row 608ms
     ✓ exit 11 names no contradiction and adds no task while the owning task is open 423ms
     ✓ a mixed refusal names both tests and words the problem for each kind 462ms
     ✓ a chain of takeovers gives one contradiction, from the latest owner 454ms
     ✓ refuses a code step whose BLOCKED-named change renames a planned test away, exit 11 376ms
     ✓ records the baseline blob on a BLOCKED-named change that only adds lines 542ms
     ✓ passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block 697ms
     ✓ still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11 487ms
     ✓ passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red 737ms
     ✓ passes group 2's tests step that creates the file a group 1 test was recorded missing in 676ms
     ✓ a changedTests record on a non-code-step row does not move the lock's baseline 326ms
     ✓ the exit 11 refusal says verify reads a BLOCKED change's added lines 377ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 345ms
     ✓ does not count an artifact the run found committed when it started 442ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 415ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 781ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (91 tests) 66211ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 856ms
     ✓ may debug in place on dev 455ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 916ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 831ms
     ✓ a new run of the same FID rewrites startSha 1558ms
     ✓ a resume of the same FID reuses the record 1129ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 1538ms
       ✓ drops a commit id that is not on the branch 1484ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 1356ms
       ✓ writes an empty commit list when the run has no run-commits row 1579ms
       ✓ ignores a row from before the open run started 1815ms
       ✓ restores the commits from the row on origin/dev when the handover landed 2049ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 2256ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 2166ms
       ✓ ignores the row on origin/dev when the run there is closed 2280ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 1875ms
         ✓ wins over the row on origin/dev, which is then not needed 2462ms
         ✓ wins over the row in the checkout's own log while the run is open 1806ms
         ✓ still drops a commit id that is not on the branch 1952ms
         ✓ is ignored and removed when the checkout's log shows the run closed 1846ms
         ✓ is ignored when it was parked for another workflow 1812ms
         ✓ is removed once the record is rebuilt 2078ms
         ✓ is removed when the live record already stands for the open run 1564ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 824ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 803ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1338ms
     ✓ a stale record without a lock is replaced 1170ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 930ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2962ms
     ✓ names inherited commits and ship recovery in the refusal 696ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1091ms
     ✓ ship names a missing feat branch 582ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 925ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 330ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 315ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 337ms
   ✓ addAllButCopied (3)
     ✓ never commits an entry only the main checkout's copy list names 319ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 409ms
     ✓ tells a caller inside the removed worktree where to cd 320ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 961ms
       ✓ preserves staged-only mode during landed cleanup 859ms
       ✓ preserves staged-only type during landed cleanup 883ms
       ✓ preserves staged-only deletion during landed cleanup 901ms
       ✓ removes landed staged content when both index and working contents are on dev 976ms
       ✓ deletes the proved local and remote branch at their landed tips 1098ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1473ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 418ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 430ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 658ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (116 tests) 13539ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 495ms
     ✓ keeps each context's own section banner and drops every other context's 1231ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 305ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 513ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 363ms
     ✓ --base narrows the range to the commits after a group's start sha 370ms
     ✓ diff from a group start covers only the group's commits 384ms
     ✓ an empty range writes a one-line note and zero numbers 359ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 506ms
     ✓ --reset-log empties the step's clamp log before the record lands 795ms
     ✓ whole: nothing omitted and no copy kept 367ms
   ✓ featureBase (#960) (7)
     ✓ featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 371ms
     ✓ featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 645ms
     ✓ featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 756ms
     ✓ context diff without --base leaves out an unpushed local dev commit 495ms
 ✓ .bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts (3 tests) 8203ms
   ✓ the planned-test lock across groups (1)
     ✓ a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed 2601ms
   ✓ a takeover of an earlier task's planned test (2)
     ✓ a takeover across groups lets the next code step finish 1540ms
     ✓ a mid-build contradiction adds a takeover task and the next code step finishes 4060ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 12313ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 686ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 557ms
     ✓ CI=true -> GITHUB_ACTION 400ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 405ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 382ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 403ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 760ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 1102ms
     ✓ LOCAL -> runtimeHeadless=false 356ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 599ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 406ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 572ms
     ✓ UNKNOWN -> runtimeHeadless=false 373ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 586ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 385ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 349ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 567ms
     ✓ re-derives per call: one run's answer does not leak into the next 331ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 438ms
 ✓ .bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts (10 tests) 29635ms
   ✓ the push of a debug run in place on dev sends only the run's commits (4)
     ✓ push from an ahead local dev lands only the run commits 3897ms
     ✓ a foreign commit made mid-run never reaches the remote 3942ms
     ✓ feature-mode push on dev with a record never pushes the foreign commit 3747ms
     ✓ push from a level local dev is a plain push 1764ms
   ✓ the dev push lands on a moved origin and only with the run's own record (3)
     ✓ a local dev one remote commit behind origin/dev lands by replay, not a rejected push 4132ms
     ✓ with the record gone, the dev push refuses and the foreign commit stays local 2366ms
     ✓ two records on dev: each push selects its own FID's commits 3267ms
   ✓ the commits of a debug run in place on dev carry only the run's own paths (3)
     ✓ foreign staged and untracked files survive a run commit 1462ms
     ✓ close commit tree excludes foreign files 2341ms
     ✓ debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not 2715ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (116 tests) 25672ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 357ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 342ms
     ✓ brand-new untracked ledger is staged and committed 317ms
     ✓ path containing a space is staged and committed 314ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 330ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 667ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 444ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 436ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 440ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 486ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 460ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 336ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 491ms
     ✓ --path records its commit on the run's record, like every other commit mode 513ms
     ✓ a recorded ledger commits only the rows the run appended 763ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 862ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 652ms
     ✓ commitBookkeeping refuses when a recorded path changed 323ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 443ms
     ✓ under --mode=commit counts the squashed paths as something to commit 480ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 326ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 317ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 313ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 422ms
     ✓ a source file in the range: exit 7, path listed 353ms
     ✓ another FID's plan file in the range: exit 7 325ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 557ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 320ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 421ms
     ✓ the correction-events file has mode 0600 327ms
   ✓ bkit ledgers append --operation (6)
     ✓ keeps ledger operation intents and receipts out of committed book paths 502ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 14022ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 827ms
     ✓ a failing file absent at the base commit is the branch's 504ms
     ✓ an undeclared bkit:test:file reads unknown 424ms
     ✓ a failed base install reads unknown and removes the worktree 498ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 707ms
     ✓ copies the worktreeCopy entries into the base checkout 698ms
     ✓ a base file run that writes no report reads unknown 712ms
     ✓ a passing CI run at the exact base sha settles none without a local run 435ms
     ✓ a CI run that cannot settle the base falls back to the local run 3851ms
     ✓ a pull_request-event CI run at the base sha does not settle none 768ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 662ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 784ms
     ✓ the base test run does not inherit the hooks-off git config 700ms
     ✓ adopt follows the run's runtimeWorktrees 1403ms
     ✓ worktreeInstall off reads unknown 382ms
 ✓ .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts (5 tests) 8827ms
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 686ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 472ms
     ✓ stops the step when the command crashed or was misused 1209ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
     ✓ ship pushes the held branch and opens a dev PR 2381ms
     ✓ ship gates on CI and merges the pinned head 4076ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 9096ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 340ms
   ✓ bkit issues comment --post (7)
     ✓ renders audit comments from validated result and preserves tracker adapters 487ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 578ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (44 tests) 4258ms
   ✓ bkit challenge gate (6)
     ✓ challenge gate writes a challenge-gate row 523ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 808ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 392ms
     ✓ challenge gate without --base sizes only the branch's own lines 512ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4646ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1330ms
     ✓ runGit names ENOBUFS when output passes the limit 931ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 864ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 355ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 3738ms
 ✓ .bkit/core/engine/commands/workflow/progress.integration.test.ts (12 tests) 8458ms
   ✓ workflow progress command wiring (12)
     ✓ progress loop attempts and grants 1030ms
     ✓ workflow progress command wiring progress specialized completion producers 3783ms
     ✓ workflow progress command wiring progress gate only completions 459ms
     ✓ progress excludes noncompletions 1809ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (77 tests) 3436ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (52 tests) 1985ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (46 tests) 2939ms
   ✓ bkit tasks currency (6)
     ✓ currency matches a task on a moved symbol 356ms
     ✓ currency emits no hunk outside the matched set 313ms
     ✓ currency exits 0 with no hunks when no task matches 345ms
     ✓ currency judges base...against (origin/dev), not base...HEAD 552ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (104 tests) 2774ms
   ✓ bkit status invocation (7)
     ✓ binds group and attempt and registers setup, remediation and ship steps 306ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (82 tests) 1020ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (85 tests) 2489ms
   ✓ bkit counters route --point (9)
     ✓ takes each point's default limit and asks when nothing is set 441ms
   ✓ bkit counters progress (19)
     ✓ judges codeChanged on source only, from the rounds' parent commits 310ms
     ✓ judges codeChanged between the compared same-scope rounds 329ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (79 tests) 1636ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (48 tests) 1962ms
   ✓ runLines (5)
     ✓ counts deleted lines into changed 350ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 602ms
     ✓ is null when first is not an ancestor of last, or either is missing 314ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 119ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 381ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (301 tests) 687ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 84ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 243ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (20 tests) 114ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 504ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 221ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 143ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 82ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 46ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 46ms
 ✓ .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts (6 tests) 1607ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (16 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 227ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.integration.test.ts (14 tests) 3615ms

 Test Files  60 passed (60)
      Tests  4477 passed (4477)
   Start at  13:10:50
   Duration  517.94s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/811-publish-dev-refused/build-holistic-gate-3.log.reports/vitest-89864.xml

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/workflows.ts .bkit/friction.jsonl dist/commands/workflow/workflows.js docs/plans/202611/logs/811-publish-dev-refused/build-holistic-gate-1-2.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-gaps-remediate-holistic-1-2-log.md docs/plans/202611/logs/811-publish-dev-refused/build-plan-verify-holistic-1-3.md docs/plans/202611/logs/811-publish-dev-refused/status.jsonl
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/811-publish-dev-refused
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2629 of 13058 lines (188 KB of 883 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
