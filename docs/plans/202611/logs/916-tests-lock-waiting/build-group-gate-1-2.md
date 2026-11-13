
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 354:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 362:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 196:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 265:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 419:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 146:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 177:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 186:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 513:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 635:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 714:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 629:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 868:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1045:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1157:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1318:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1376:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 124:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/testing.md
 255:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 255:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> bkit ci slop

[bkit-ci] base af0f02ba0b6c5a735e9ee1b5747e731085663c0a (af0f02ba0b6c5a735e9ee1b5747e731085663c0a) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: af0f02ba0b6c5a735e9ee1b5747e731085663c0a
base: af0f02ba0b6c5a735e9ee1b5747e731085663c0a
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 4.7 on 10 cores: unit limits 6851ms per test, 13701ms per hook (x1.37)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 30248ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1069ms
     ✓ names each net-new and worsened finding in the log and the JSON 843ms
     ✓ fails on a net score rise with no net count change 895ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 841ms
     ✓ treats a net score at or below 0.001 as float noise 581ms
     ✓ passes when the change only resolves findings 1144ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 885ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 703ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 455ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 608ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 839ms
     ✓ exits 4 on a dropped net field instead of silently passing 528ms
     ✓ exits 4 on no summary instead of silently passing 580ms
     ✓ exits 4 on output that is not JSON instead of silently passing 533ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 912ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 935ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 780ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 853ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 801ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1668ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 624ms
     ✓ explicit globs can select ignored prose and nested checkout files 378ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 329ms
     ✓ fails (exit 1) when vale reports alerts 338ms
     ✓ exits 6 on a vale runtime error 443ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 442ms
     ✓ falls back to vale sync when the main worktree has none 351ms
     ✓ fails when vale sync cannot restore the required styles 327ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 434ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 327ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 413ms
     ✓ exits 1 naming the code file, whatever the commit message says 389ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 438ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 313ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 833ms
     ✓ exits 7 when a commit cannot be read 314ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 399ms
     ✓ exits 1 naming the files outside, whatever the commit message says 397ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 738ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 535ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 437ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 779ms
     ✓ a top-level glob in the setting does not reach into folders 409ms
     ✓ a push that changes no files is not proven a min push 410ms
     ✓ exits 7 when a commit or its base cannot be read 447ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 33333ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 570ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 449ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 546ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 533ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 831ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1046ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 400ms
     ✓ PASS is 0 failures with or without reports 423ms
     ✓ clears a previous attempt's reports before the gate runs 420ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 602ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 373ms
     ✓ a log under the outbox is named main-checkout relative in the record 436ms
     ✓ a log small enough is copied whole: not clamped, raw null 485ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 440ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 513ms
     ✓ numbers runs within the workflow's active run and per step 587ms
     ✓ without --file no row is written and the output carries row null 350ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 505ms
     ✓ a planned test that passes is a vacuous gap, exit 1 423ms
     ✓ a planned test absent from a loaded report is a missing gap 502ms
     ✓ a file that fails to load is a red of kind red-not-loaded 568ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 572ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 839ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 488ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 448ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 916ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 680ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 933ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 724ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 957ms
     ✓ green: a passed-accepted test is already landed, not a gap 541ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 557ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 553ms
     ✓ green: --group audits only that group's tasks 496ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 699ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 836ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 571ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 812ms
     ✓ green: lists each gap kind, with the runner output 586ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1244ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 474ms
       ✓ green clears an exception-only task from a human commit 383ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 35941ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 839ms
     ✓ may debug in place on dev 410ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 901ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 591ms
     ✓ a new run of the same FID rewrites startSha 1125ms
     ✓ a resume of the same FID reuses the record 1215ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 919ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 784ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1018ms
     ✓ a stale record without a lock is replaced 1017ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 910ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3355ms
     ✓ names inherited commits and ship recovery in the refusal 739ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 882ms
     ✓ ship names a missing feat branch 379ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 872ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 302ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 349ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 328ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 358ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 394ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 315ms
     ✓ never commits an entry only the main checkout's copy list names 363ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 517ms
     ✓ tells a caller inside the removed worktree where to cd 386ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1081ms
       ✓ preserves staged-only mode during landed cleanup 1063ms
       ✓ preserves staged-only type during landed cleanup 1009ms
       ✓ preserves staged-only deletion during landed cleanup 1130ms
       ✓ removes landed staged content when both index and working contents are on dev 1199ms
       ✓ deletes the proved local and remote branch at their landed tips 1459ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1550ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 541ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 486ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 649ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 913ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 38973ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 326ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 368ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 461ms
     ✓ reports a failed commit with exit 8 without writing the row 818ms
     ✓ a failed commit leaves no row staged in the index 1304ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 722ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 609ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 790ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 574ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 722ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 346ms
     ✓ --ref exits 3 when the ref does not carry the status file 337ms
     ✓ fails when the row does not list the artifact, or carries another attempt 330ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 388ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 498ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 365ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 484ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 707ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 493ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 575ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 959ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 549ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 636ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 472ms
     ✓ --attempt-of checks the row carries the derived counter 363ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 996ms
     ✓ writeStepRow refuses when a recorded path changed 1097ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 481ms
     ✓ writeStepRow appends its commit sha to the record 945ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1139ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 364ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 727ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 732ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 431ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1162ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 862ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 627ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 395ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1254ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 462ms
     ✓ does not count an artifact the run found committed when it started 538ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 344ms
     ✓ commits a package.json change outside bkit.workflows 662ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1277ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 41975ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 23367ms
     ✓ every prompt, workflow and utility agent has the three header blocks 491ms
     ✓ sync has nothing left to rewrite 15791ms
     ✓ every clause reaches the cut-off of one surface it applies to 1928ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 54525ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1101ms
     ✓ runs code.ts through its declared gate in the built checkout 1314ms
     ✓ runs code.ts through its declared gate in the built checkout 1308ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1155ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 936ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1084ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 733ms
     ✓ runs the full gate for replayed debug code 1291ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1464ms
     ✓ installs local dependencies against the built target tree 1596ms
     ✓ runs the configured frozen install even without root dependencies 1472ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1476ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1669ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1608ms
     ✓ never pushes local dev commits missing from origin/dev 1624ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2908ms
     ✓ dev moved before every push: exhausted, nothing landed 4793ms
     ✓ any other refusal is returned, not retried 2118ms
     ✓ pushToDev replays a commit range onto origin/dev 2109ms
     ✓ a replay retries on the new dev when dev moved 3345ms
     ✓ pushToDev log line names what it lands 1932ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2128ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2161ms
     ✓ a push that fails without a server answer is returned once, never retried 2038ms
     ✓ a failed fetch is returned before anything is built 754ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3637ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2349ms
     ✓ lands from a clone whose fetch refspec omits dev 3291ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1114ms
[feat/test 675b42b] gate
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 40134ms
   ✓ best effort comment friction (4)
     ✓ distinguishes fallback attempts from known delivery and lost reports 374ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2252ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 366ms
     ✓ rolls over after intervening comments external edits and deletion 457ms
     ✓ starts only new source after overflow or missing source 318ms
     ✓ uses exact new comment after a failed eligibility read 316ms
   ✓ bounded nonfatal publication (10)
     ✓ contains exhausted append and create failures without fabricated success 302ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 395ms
     ✓ reserves new comment opportunity within total delivery budget 1005ms
     ✓ attempts independent attention after routine uncertainty 412ms
     ✓ seals an acknowledged segment after a postflight intervening comment 322ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 430ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 840ms
     ✓ seals unavailable or unstable representation evidence 516ms
     ✓ uses accepted final preflight eligibility without provider atomicity 547ms
     ✓ rejects marker preserving external edits 490ms
     ✓ preserves generated first line and extracts versioned h6 section markers 469ms
     ✓ returns owned comment identity and stable representation evidence 613ms
     ✓ selects newest created comment across complete pages 621ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 497ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 430ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 451ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 483ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 638ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 465ms
     ✓ fetches the issue and its comments as GitHub returns them 481ms
     ✓ github fetch marks a closed issue terminal and an open one not 795ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 739ms
     ✓ caches exact engine source with available progress identity 523ms
     ✓ keeps original body identity separate from time and changed output 848ms
     ✓ reuses matching invocation state without adopting foreign ownership 778ms
     ✓ invalidates missing corrupt and unsupported progress cache 1619ms
     ✓ contains cache read and write failures as standalone degradation 1196ms
     ✓ uses legacy receipts and contains receipt failures 953ms
     ✓ skips issue-less runs and tracker none 374ms
     ✓ records an engine-action row and skips the same key + body on a re-run 749ms
     ✓ a recent identical comment counts as done (the final close comment) 679ms
     ✓ a failed post reports done false with the reason and never leaks a token 858ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 971ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 911ms
     ✓ a board the token cannot see is scope 590ms
     ✓ an HTTP 403 from gh is scope 860ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 921ms
     ✓ github: no block, no blockers and no further reads 849ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 867ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 333ms
     ✓ a different marker hash posts 768ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 791ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 40875ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 489ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 509ms
     ✓ brand-new untracked ledger is staged and committed 504ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 609ms
     ✓ path containing a space is staged and committed 444ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 408ms
     ✓ staging failure: exit 4 and no commit is created, no false success 359ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 372ms
     ✓ --mode=stage stages the sweep but creates no commit 426ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1314ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 692ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 722ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 397ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 369ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 430ms
     ✓ --root defaults to the working directory 414ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 733ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 746ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 654ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 631ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 445ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 40328ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2944ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3556ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 546ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 498ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 577ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4491ms
     ✓ does not fall back through a malformed later success receipt 2507ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1534ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1324ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2778ms
     ✓ requires proof even when the pushed increment changes no files 1767ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 1276ms
     ✓ does not record a committed tree 1319ms
     ✓ records no proof for a failed gate or lighter gate 1804ms
     ✓ requires integration proof when integration is declared 2446ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3698ms
> [bkit] TRUNCATED HERE — 63 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 449ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 753ms
     ✓ 6. a FID that fails the format check exits 1 384ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ the issue's Parent design link wins; audit paths are listed in order 310ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 49799ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 353ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 426ms
     ✓ retries a failed create once, and exits 5 when it fails twice 536ms
     ✓ exits 5 when the open-PR probe errors 489ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 784ms
     ✓ prs open still opens against any other base 523ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 408ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 568ms
     ✓ exits 4 when gh errors and 80 when it needs auth 663ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 301ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ passes a token-free body 305ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 342ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 399ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 663ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 551ms
     ✓ runs no merge when the PR is already MERGED 539ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1169ms
     ✓ prs merge refuses a PR whose base is main 696ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 886ms
     ✓ prs merge refuses when the PR base is unknown 566ms
     ✓ prs merge reads the base from the one pr view it already makes 896ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 515ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 686ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 890ms
     ✓ never reads dev's required checks without --only-if-required 469ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 654ms
     ✓ is not green when a check failed, naming it (exit 1) 804ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 682ms
     ✓ is not green on an empty rollup (total 0) 754ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 524ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 910ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 514ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1236ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 816ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1615ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1077ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 908ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 785ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 694ms
     ✓ an unpinned repo reports nulls and asks no registry 728ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 487ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 779ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 597ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 507ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1234ms
     ✓ keeps each context's own section banner and drops every other context's 3850ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 503ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 483ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2060ms
     ✓ filters branch and PR discovery by configured workflow and exact head 585ms
     ✓ freezes explicit workflow run attempt and all failed job pages 571ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1460ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1839ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1451ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1785ms
     ✓ checks the named repository base and fails closed on missing evidence 929ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 840ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 914ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 590ms
       ✓ a source change past the validated head refuses (17) and names the path 568ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 649ms
       ✓ --validated without --month / --fid is a usage error (2) 461ms
       ✓ a validated sha that is not an ancestor refuses (17) 481ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 585ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1046ms
     ✓ a failed re-trigger push names the cause in the log 1152ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1172ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1860ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1134ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 567ms
     ✓ gh-error: every poll errored 567ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1098ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1116ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1396ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1237ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4225ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4751ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1246ms
     ✓ re-trigger on dev only uses the record of its own FID 1917ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1701ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 339ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 351ms
     ✓ a refused capstone records FAIL with its reason 427ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 681ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1027ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 779ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 467ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1180ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1308ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 930ms
     ✓ --file and --step go together 809ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 16986ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1109ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3120ms
     ✓ a refused dev push is logged, never fails the close 3685ms
     ✓ an unreachable remote is logged, never fails the close 1140ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 2863ms
   ✓ source derivation (6)
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1185ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 821ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 897ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 762ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1284ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 756ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1095ms
     ✓ --file into a missing directory is refused, not created 504ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 458ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1421ms
     ✓ runGit names ENOBUFS when output passes the limit 2027ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1875ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests) 14354ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 339ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 451ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 410ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1808ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 970ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1385ms
     ✓ reports excluded intervals as unread even when pagination finishes 1102ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1201ms
     ✓ reports an unread remainder at the page cap 1383ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 854ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 890ms
     ✓ rejects missing summaries instead of treating them as empty results 773ms
     ✓ reports a failed first page as unavailable 1028ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 431ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 692ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 666ms
     ✓ follows summary cursors even when the first page is shorter than the limit 898ms
     ✓ reports excluded intervals as unread even when pagination finishes 634ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 818ms
     ✓ reports an unread remainder at the page cap 570ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1071ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 421ms
     ✓ rejects missing summaries instead of treating them as empty results 533ms
     ✓ reports a failed first page as unavailable 1064ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 372ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 9129ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1186ms
     ✓ counts files committed since --base 1144ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1041ms
     ✓ runs nothing and exits 0 when no file changed 411ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1213ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 833ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1663ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 581ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 6321ms
   ✓ publication ownership lock (4)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 351ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 354ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 381ms
   ✓ bkit locks acquire --kind=workflow — ship (1)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 986ms
     ✓ passes every rule on a clean head 450ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 559ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 5703ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 615ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 415ms
     ✓ resolves config from the repo root when run from a subdirectory 384ms
     ✓ exits 6 when the PUT fails 412ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 406ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 428ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 402ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 450ms
     ✓ exits 6 when the api answer is not JSON 398ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 5390ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 469ms
     ✓ passes when only another key changed, such as a branch's upstream 353ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 525ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 552ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 445ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (47 tests) 4338ms
   ✓ bkit status resume (38)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 835 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 362 lines omitted. Dropped content was NOT read.
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-567r8m/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 465ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-E80Lf4/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (62 tests) 1353ms
   ✓ SETUP_TIPS — detection (46)
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 413ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-NBe2KQ/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-RbZNZq/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Dy1jtA/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 465ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-zDZQ5i/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 1458ms
   ✓ Harvest dedup by per-kind composite identity (WS4-T2) (3)
     ✓ repeat harvest of same rows does not duplicate (idempotent) 376ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 1241ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 1052ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 793ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 1051ms
   ✓ template bkit-ci.yml, filled in (2)
     ✓ passes actionlint 327ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-I2UoCG/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 217ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 382ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 599ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 300ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 243ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 260ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 472ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-Kx8bxL/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 360ms
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

 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 392ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 201ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 208ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 227ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 103ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 117ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 168ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 282ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1473ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1436ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 171ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 212ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 161ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 143ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 132ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 120ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 84ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 107ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 139ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 126ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 122ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 176ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 211ms
(node:24102) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:24102) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:24102) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:24102) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 167ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 144ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 118ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 75ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 215ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 101ms
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

 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 129ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 62ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 152ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 169ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 119ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 130ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 109ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 98ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 106ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 657ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 68ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 50ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 126ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 40ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 49ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 72ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 36ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 45ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 50ms
(node:25750) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:25750) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 179ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 22ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 44ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 40ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 65ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 41ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 101ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 16ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 36ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 141ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 31ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 30ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 46ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794385954882.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794385954885.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794385954887.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794385954898.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 46ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 28ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 34ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 31ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 41ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 31ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 14ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 15785ms
   ✓ real workflow sources (37)
     ✓ bkit-build resolves cleanly for github 349ms
     ✓ bkit-build resolves cleanly for linear 402ms
     ✓ bkit-build resolves cleanly for jira 580ms
     ✓ bkit-ship resolves cleanly for linear 354ms
     ✓ bkit-debug resolves cleanly for github 335ms
     ✓ bkit-debug resolves cleanly for linear 395ms
     ✓ bkit-debug resolves cleanly for jira 318ms
     ✓ bkit-plan resolves cleanly for jira 307ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-design: the github render keeps the warning bullet once and the recovery in Step 1 486ms
     ✓ bkit-design: the linear render keeps the warning bullet once and the recovery in Step 1 452ms
     ✓ bkit-plan: the github render keeps the warning bullet once and the recovery in Step 1 346ms
     ✓ bkit-build: the github render keeps the warning bullet once and the recovery in Step 1 421ms
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 600ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 792ms
     ✓ bkit-debug: the github render keeps the warning bullet once and the recovery in Step 1 508ms
     ✓ bkit-debug: the linear render keeps the warning bullet once and the recovery in Step 1 446ms
     ✓ bkit-debug: the jira render keeps the warning bullet once and the recovery in Step 1 522ms
     ✓ bkit-ship: the jira render keeps the warning bullet once and the recovery in Step 1 336ms
   ✓ issue-scan call sites (#135) (12)
     ✓ bkit-plan wires a linear scan whose hits the engine reads 305ms
     ✓ bkit-plan wires a jira scan whose hits the engine reads 422ms
     ✓ bkit-debug wires a jira scan whose hits the engine reads 352ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 17ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 32ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 24ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 148ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 29ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 19ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 12ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (158 tests) 168788ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 937ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 340ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 310ms
     ✓ --lock-held checks the lock is ours 441ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 335ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 338ms
     ✓ aborts a rebase only when one is in progress 582ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 546ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 567ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 333ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 397ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 340ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 638ms
       ✓ counts subagents of an earlier chat the run's session rows name 675ms
       ✓ records no context block, and still closes, outside a Claude Code session 634ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 704ms
     ✓ records ending held and publish false on the workflow-done row 683ms
     ✓ defaults the close row to ending done 654ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 615ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 583ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 698ms
     ✓ always writes the telemetry, whatever the runtime 620ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 496ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 578ms
     ✓ an unwritable stats path is logged and never fails the close 662ms
     ✓ appends the completeness row before the workflow-done row 710ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 685ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 784ms
     ✓ writes one completeness row per close 1159ms
     ✓ leaves out the previous run's rows that share a second with this run's start 664ms
     ✓ still closes when the completeness check throws 739ms
     ✓ still closes when the completeness row write throws 763ms
     ✓ ship: run.pr, size of the squash commit, and coverage 775ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1184ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 703ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 711ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1017ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 953ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 978ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 905ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 789ms
     ✓ --record-step writes the close step's row before workflow-done 671ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 808ms
     ✓ --number without --outbox is a usage error 722ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1101ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1255ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1145ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1288ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 922ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 573ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 561ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3559ms
     ✓ --flush with nothing to record commits and pushes nothing 1887ms
     ✓ --flush carries the named worktree's logs into the dev commit 3658ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4205ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3984ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 5390ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 4827ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5393ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 4651ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4807ms
     ✓ --push on dev never carries a row whose references name another feature 4889ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 4644ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 7454ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4608ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2302ms
     ✓ rejects --push with --flush, and --flush outside ship 503ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4455ms
     ✓ preserves unlanded file deletions and ledger additions on close 8647ms
     ✓ preserves dirty work and uncertain branch evidence during close 8771ms
     ✓ preserves a local feature ref changed after its cleanup proof 9682ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4843ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1652ms
     ✓ a close that landed releases the lock 1607ms
     ✓ removes the worktree before it releases the lock 1611ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2383ms
       ✓ closePr refuses when the PR base is unknown 2539ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1611ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 471ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 313ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 741ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 367ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 331ms
     ✓ a second run's record does not let this FID's close commit 406ms
     ✓ record is present after workflows close and before the push 724ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1380ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 529ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 425ms
     ✓ puts each --line after the summary, in flag order 417ms
     ✓ --summary prints the file and keeps a copy in --outbox 402ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 404ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 238754ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 381ms
     ✓ rejects missing explicit and ambiguous existing branch selections 314ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 689ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 707ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 471ms
     ✓ a refused --continue carries git's own reason 567ms
     ✓ --file records nothing for a refused rebase 495ms
     ✓ refuses a code conflict and aborts the rebase on the spot 439ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1464ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 408ms
     ✓ produces byte-identical output to merge=union 973ms
     ✓ restores a trailing newline so the next append starts on its own line 683ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 719ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 938ms
     ✓ refuses a union that leaves a line which is not JSON 565ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 830ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1132ms
     ✓ refuses a lockfile whose regenerate command fails 772ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1161ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1153ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1099ms
     ✓ refuses and aborts when both sides changed the hand-written region 588ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 673ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 912ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1112ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 621ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 780ms
     ✓ refuses and aborts when a side deleted the install record 636ms
     ✓ refuses a conflicted doc the repo's script does not list 571ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 585ms
     ✓ removes a stale sentinel when the rebase succeeds 875ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1088ms
     ✓ resolves a conflict in each of two replayed commits across rounds 971ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 481ms
       ✓ skips (12) with no anchor 520ms
       ✓ skips (12) when the base is unreachable in this clone 654ms
       ✓ skips (12) when nothing landed since the base 563ms
       ✓ runs (0) with the landed path count once dev moved 1042ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 612ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1165ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 693ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 970ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1409ms
     ✓ runs exactly one git push 1292ms
     ✓ --set-upstream records the upstream 836ms
     ✓ refuses with no branch checked out 728ms
     ✓ --mode=dev refuses a feature checkout 823ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1715ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2944ms
     ✓ --require-ci pushes as-is when dev has not moved 1393ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2416ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3852ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 983ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1526ms
     ✓ --mode=abort pushes when the branch has no open PR 1577ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1316ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 798ms
     ✓ --open-pr carries the MCP answer and skips gh 1168ms
     ✓ --mode=abort on dev pushes plainly without probing 1348ms
     ✓ rejects an unknown mode 830ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4251ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2621ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3260ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5758ms
     ✓ skip-ci HEAD on the replay is refused 2086ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 4692ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5925ms
     ✓ a level local dev is a plain push, recording nothing extra 2496ms
     ✓ a record with no commits pushes nothing 1749ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1203ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2761ms
     ✓ a rewritten branch is refused, never forced 1753ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1006ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2643ms
     ✓ refuses a detached HEAD (exit 5) 979ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2184ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2482ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2266ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2394ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1086ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2364ms
     ✓ an up-to-date branch is a no-op 1442ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2143ms
     ✓ a fetch that fails exits 10 950ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1331ms
     ✓ scan-diff still reports a new skip when its test … 1328ms
     ✓ scan-diff reports a skip moved onto a different t… 1370ms
     ✓ scan-diff does not cancel a skip moved between am… 1220ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1380ms
     ✓ scan-diff recognizes a renamed test file 1371ms
     ✓ scan-diff recognizes a suite moved into a differe… 1239ms
     ✓ scan-diff does not let unrelated additions hide a… 1146ms
     ✓ scan-diff attributes deletion to its old test ins… 1271ms
     ✓ scan-diff consumes each moved assertion once and … 1272ms
     ✓ scan-diff does not match identical assertions fro… 1423ms
     ✓ scan-diff does not match the same leaf test name … 1420ms
     ✓ scan-diff does not match a same-named test with d… 1424ms
     ✓ scan-diff does not match a same-named test with c… 1258ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1395ms
     ✓ --paths with no match exits 1 1204ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 951ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1622ms
     ✓ --marker reads a diff over 1 MiB 1382ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1242ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 702ms
     ✓ scan-diff finds an added skip 539ms
     ✓ scan-diff ignores a skip predating the base 428ms
     ✓ scan-diff reports a disabled test with its line 484ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 436ms
     ✓ scan-diff ignores a removed comment in a test file 412ms
     ✓ scan-diff ignores an assertion moved within the file 431ms
     ✓ scan-diff still reports a removed assertion 423ms
     ✓ scan-diff reports an assertion re-added only outside the test file 434ms
     ✓ scan-diff finds an added pytest mark skip 473ms
     ✓ scan-diff finds an added unittest skip 417ms
     ✓ scan-diff finds an added bare skip call 422ms
     ✓ scan-diff ignores a quoted skip in a documentation file 429ms
     ✓ scan-diff ignores a marker literal in a non-test source file 413ms
     ✓ scan-diff ignores an assertion whose expectation changed 397ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 408ms
     ✓ scan-diff reports a deleted test file 452ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 410ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1427ms
     ✓ a title that already carries the marker is left alone 967ms
     ✓ with no open PR: pushes the marker commit and edits no title 863ms
     ✓ a re-run is deduped: no second marker commit 973ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1070ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 390ms
     ✓ --title-set skips gh entirely 575ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1163ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2103ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1140ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2497ms
     ✓ continues only the explicitly recorded target through the public merge command 1531ms
     ✓ fetches the unseen feature head before classifying the base 852ms
     ✓ fast forwards the feature before either base path is chosen 1697ms
     ✓ merges divergent feature tips without rebasing either side 1069ms
     ✓ continues the feature merge before starting a dev merge 1709ms
     ✓ publishes local code with a CI running head before bookkeeping 1975ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2637ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1724ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1198ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 323ms
     ✓ Path B once dev moved; --head checks a given commit 481ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 481ms
     ✓ --merge-docs merges dev when docs/ is behind 708ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 625ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 808ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 694ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 642ms
     ✓ --merge-docs skips an empty bkit:generate script 539ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 445ms
     ✓ --merge-docs never merges on dev itself 391ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 564ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 590ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 547ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 553ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 308ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 709ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 725ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 852ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 711ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 680ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 891ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 667ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 806ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 541ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 380ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 468ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 656ms
     ✓ a failed install stops ship (16) 586ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 472ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 436ms
     ✓ exits 10 when the fetch fails 333ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1182ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1135ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1150ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1213ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2309ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2751ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 453ms
     ✓ local: names unpushed dev as the cause when the branch carries it 524ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 570ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1469ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1347ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 984ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4068ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 946ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1119ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1038ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 672ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1430ms
     ✓ land removes the worktree when only the copied .env is untracked 1304ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1109ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1193ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1721ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1109ms
     ✓ landPr refuses a main-based PR without retrying 560ms
     ✓ landPr refuses when the PR base is unknown 565ms
     ✓ PR not open (closed): stops (17) at once, no retry 693ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 417ms
     ✓ --attempt names the merge round in a fix commit 375ms
     ✓ commits a rewritten and a deleted tracked file 418ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 346ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 359ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 448ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 313ms

 Test Files  173 passed (173)
      Tests  7418 passed | 2 skipped (7420)
   Start at  18:30:10
   Duration  239.69s (tests 96%, import 1%, setup 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/916-tests-lock-waiting/build-group-gate-1-2.log.reports/vitest-9236.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.62 |    83.39 |   95.12 |   91.02 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.14 |    86.65 |   95.19 |   95.06 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.45 |    71.42 |     100 |   97.19 | ...00,320,417-418 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |    97.5 |    95.31 |     100 |   98.46 | 325               
 .../checks/before |   94.55 |    88.63 |   95.55 |   97.81 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |      84 |    73.33 |     100 |     100 | ...39,147,155-174 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   93.38 |    93.75 |    87.5 |   93.61 | 194-202           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |   89.65 |    84.31 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.89 |   97.05 |   97.28 | ...51,487,539-542 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.51 |    44.92 |   58.75 |   47.93 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.13 |    30.65 |   33.33 |   33.33 | 354-382,564-1072  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.06 |    84.75 |   96.44 |   93.55 |                   
  branches.ts      |   89.58 |    83.48 |   98.81 |   91.23 | ...3256,3281,3424 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.38 |    94.69 |     100 |    98.8 | 240,557           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 206,311,380       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   92.09 |    86.44 |   92.59 |   94.03 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.01 |    88.42 |     100 |   93.01 | ...1444,1460-1461 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |      92 |    85.07 |   99.16 |   93.12 | ...2597,2629-2633 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    89.9 |    83.04 |   90.82 |    91.1 | ...1963,1968,1970 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   67.34 |     65.7 |   75.36 |   68.82 | ...1376,1379-1380 
 engine/install    |   91.47 |    82.52 |   92.94 |   94.53 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.68 |    93.48 |   98.95 |   97.38 |                   
  status.ts        |   97.94 |    97.87 |     100 |     100 | 122,153,266,341   
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1777,1820,2266 
 engine/render     |   90.61 |    82.85 |   98.36 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.44 |     97.2 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.93 |    85.49 |   95.47 |   90.54 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1718-1800,1805 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.62% ( 19296/21529 )
Branches     : 83.39% ( 14697/17624 )
Functions    : 95.12% ( 3082/3240 )
Lines        : 91.02% ( 16940/18610 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 551 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 214 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 245 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 202 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 197 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 188 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 72 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 232 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 199 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 192 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 202 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 197 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 203 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 202 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 877 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 507 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 16 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 22 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 15 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 33 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 47 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 602 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 359 ms
ok 30 refresh drops a file deleted in the index from the build # in 370 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 405 ms
ok 32 a key removed from the env file is unset on the next run # in 171 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 144 ms
ok 34 non-BKIT_ keys are skipped # in 142 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 155 ms
ok 36 a failed unsetenv is retried on the next run # in 175 ms
ok 37 logs key names only, never values # in 144 ms
ok 38 missing env file exits 0 without calling launchctl # in 25 ms
ok 39 the sweep prints the summary line the lane greps for # in 286 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (116.234708ms)
✔ shell cancellation waits for SIGTERM cleanup (169.866041ms)
✔ direct cancellation waits for SIGINT cleanup (125.47725ms)
✔ shell cancellation waits for SIGINT cleanup (171.298791ms)
✔ direct cancellation waits for SIGHUP cleanup (118.32675ms)
✔ shell cancellation waits for SIGHUP cleanup (168.02375ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (390.900042ms)
✔ shell cancellation follows a worker orphaned by a nested shell (233.058917ms)
✔ direct cancellation preserves a nested machine-lock owner (448.421ms)
✔ shell cancellation preserves a nested machine-lock owner (466.562167ms)
✔ nested shell cancellation preserves a nested machine-lock owner (456.342709ms)
✔ a hard process-group timeout reaches a shell command during cleanup (86.85025ms)
✔ ships a command-scoped sleep prevention wrapper (0.065583ms)
✔ preserves arguments, output and nonzero exit status (44.979667ms)
✔ runs an entire shell chain and retains its failure (28.075458ms)
✔ reports a missing command as 127 (29.672625ms)
✔ requires a command (23.944833ms)
✔ non-macOS platform selection runs commands without sleep prevention (39.774125ms)
✔ hard timeout escalation reaches a command that ignores TERM (142.806833ms)
✔ forwards POSIX cancellation to the command and releases the assertion (56.271625ms)
✔ holds a real macOS assertion only while the command runs (65.446458ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3419.272042
> [bkit] TRUNCATED — kept 1811 of 3668 lines (135 KB of 282 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
