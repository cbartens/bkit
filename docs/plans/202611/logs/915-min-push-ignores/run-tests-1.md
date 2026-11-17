
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 66455, since 14:44:10), last run took 11m44s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 66455, since 14:44:10), last run took 11m44s

> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/159 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 358:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 366:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 196:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 265:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 434:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 517:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 639:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 722:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 1047:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1159:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1251:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1493:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1553:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 124:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/templates/docs/testing.md
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 345:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 385:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 456:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 251:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 380:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 420:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 491:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> bkit ci slop

[bkit-ci] base 263f04b7c30c06833042d1dbb5031941bfb77b3d (263f04b7c30c06833042d1dbb5031941bfb77b3d) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 263f04b7c30c06833042d1dbb5031941bfb77b3d
base: 263f04b7c30c06833042d1dbb5031941bfb77b3d
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 5.7 on 10 cores: unit limits 7350ms per test, 14700ms per hook (x1.47)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 46207ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 317ms
     ✓ adopts the main checkout even when called from a linked worktree 401ms
     ✓ design and plan in place on main are refused 319ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1038ms
     ✓ may debug in place on dev 475ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 869ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 785ms
     ✓ a new run of the same FID rewrites startSha 1417ms
     ✓ a resume of the same FID reuses the record 1379ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 887ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 968ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1245ms
     ✓ a stale record without a lock is replaced 1338ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1019ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3854ms
     ✓ names inherited commits and ship recovery in the refusal 949ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1122ms
     ✓ ship names a missing feat branch 438ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1051ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 381ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 404ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 435ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 447ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 424ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 364ms
     ✓ never commits an entry only the main checkout's copy list names 406ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 527ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 485ms
     ✓ tells a caller inside the removed worktree where to cd 519ms
     ✓ fails with its own exit code when git cannot remove a marked path 500ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 2066ms
       ✓ preserves staged-only mode during landed cleanup 1325ms
       ✓ preserves staged-only type during landed cleanup 1843ms
       ✓ preserves staged-only deletion during landed cleanup 1880ms
       ✓ removes landed staged content when both index and working contents are on dev 1700ms
       ✓ deletes the proved local and remote branch at their landed tips 1840ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1996ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 710ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 699ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 338ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 515ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1069ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 48126ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1654ms
     ✓ names each net-new and worsened finding in the log and the JSON 761ms
     ✓ fails on a net score rise with no net count change 813ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 853ms
     ✓ treats a net score at or below 0.001 as float noise 1018ms
     ✓ passes when the change only resolves findings 776ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1290ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1022ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 495ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 323ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1224ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1073ms
     ✓ exits 4 on a dropped net field instead of silently passing 873ms
     ✓ exits 4 on no summary instead of silently passing 699ms
     ✓ exits 4 on output that is not JSON instead of silently passing 890ms
     ✓ exits 5 when the base worktree cannot be created 383ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1161ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1009ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 921ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 982ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 966ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1675ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 843ms
     ✓ explicit globs can select ignored prose and nested checkout files 439ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 452ms
     ✓ fails (exit 1) when vale reports alerts 433ms
     ✓ exits 6 on a vale runtime error 433ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 466ms
     ✓ falls back to vale sync when the main worktree has none 450ms
     ✓ fails when vale sync cannot restore the required styles 486ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 469ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 396ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 448ms
     ✓ exits 1 naming the code file, whatever the commit message says 691ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 584ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 1286ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1037ms
     ✓ exits 7 when a commit cannot be read 425ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 479ms
     ✓ exits 1 naming the files outside, whatever the commit message says 558ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1398ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1301ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 485ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1129ms
     ✓ a top-level glob in the setting does not reach into folders 697ms
     ✓ a push that changes no files is not proven a min push 518ms
     ✓ exits 7 when a commit or its base cannot be read 529ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 654ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 593ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 645ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 595ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 720ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 678ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 699ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 636ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 512ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 559ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 605ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 752ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 819ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 47813ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 770ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 565ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 384ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 826ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 426ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 611ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 357ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1013ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1112ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 418ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 643ms
     ✓ PASS is 0 failures with or without reports 742ms
     ✓ clears a previous attempt's reports before the gate runs 530ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 835ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 738ms
     ✓ a log under the outbox is named main-checkout relative in the record 858ms
     ✓ a log small enough is copied whole: not clamped, raw null 572ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 489ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 602ms
     ✓ numbers runs within the workflow's active run and per step 677ms
     ✓ without --file no row is written and the output carries row null 418ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 684ms
     ✓ a planned test that passes is a vacuous gap, exit 1 623ms
     ✓ a planned test absent from a loaded report is a missing gap 507ms
     ✓ a file that fails to load is a red of kind red-not-loaded 702ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 870ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 963ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 571ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 549ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1324ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1566ms
       ✓ a later unproven result never replaces a proven red of the same lines 395ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1149ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 960ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1639ms
     ✓ green: a passed-accepted test is already landed, not a gap 1107ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 843ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1173ms
     ✓ green: --group audits only that group's tasks 898ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1047ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 865ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1790ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 957ms
     ✓ green: lists each gap kind, with the runner output 708ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1519ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 600ms
       ✓ green clears an exception-only task from a human commit 512ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 52734ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 630ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 553ms
     ✓ done --group writes group on the row 447ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 546ms
     ✓ carries extra fields, parsed as JSON when they are JSON 367ms
     ✓ reports a failed commit with exit 8 without writing the row 879ms
     ✓ a failed commit leaves no row staged in the index 1241ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 911ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 820ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1206ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 855ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 878ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 357ms
     ✓ --ref reads the status file as committed on that ref, not from disk 434ms
     ✓ --ref exits 3 when the ref does not carry the status file 436ms
     ✓ fails on a placeholder left in the artifact 365ms
     ✓ fails when the row's verdict differs from the artifact's 342ms
     ✓ fails when the row does not list the artifact, or carries another attempt 352ms
     ✓ fails on a missing artifact 398ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 382ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 309ms
     ✓ fails a run-tests row missing its scope, and an empty scope 501ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 570ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 420ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 376ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 634ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 742ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 587ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 696ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1067ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 678ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 410ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 832ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 641ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 537ms
       ✓ gate --issue without --fid is a usage error 893ms
     ✓ --attempt-of checks the row carries the derived counter 464ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1167ms
     ✓ writeStepRow refuses when a recorded path changed 2150ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 1231ms
     ✓ writeStepRow appends its commit sha to the record 1207ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1718ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 462ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1027ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 837ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 497ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1620ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 990ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 670ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 513ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1423ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 539ms
     ✓ does not count an artifact the run found committed when it started 613ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 392ms
     ✓ commits a package.json change outside bkit.workflows 660ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1246ms
 ❯ .bkit/core/engine/commands/land.test.ts (45 tests | 1 failed) 68542ms
   ✓ landBackoffMs (2)
     ✓ doubles from the start wait, caps it, and jitters down by at most half 4ms
     ✓ ten tries wait at most three minutes in all 1ms
   ✓ devMoved / devRefused (3)
     ✓ dev moved before or while the push was sent: retry 1ms
     ✓ a server refusal (hook, ruleset, HTTP 403): the PR route 1ms
     ✓ no server answer: neither 1ms
   ✓ devRefRace (2)
     ✓ another fetch moved or holds origin/dev: retry 1ms
     ✓ any other fetch failure, or another ref: not a race 1ms
   ✓ landDir (6)
     ✓ names the throwaway beside the feature worktrees 1ms
     ✓ refuses "../x" as a feature id 2ms
     ✓ refuses "a/b" as a feature id 9ms
     ✓ refuses "" as a feature id 2ms
     ✓ refuses ".hidden" as a feature id 21ms
     ✓ refuses "a..b" as a feature id 1ms
   ✓ withoutHooks (1)
     ✓ points core.hooksPath nowhere for the call, then restores the environment 1ms
   ❯ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1918ms
     ✓ runs code.ts through its declared gate in the built checkout 1708ms
     ✓ runs code.ts through its declared gate in the built checkout 1629ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1387ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1661ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1453ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1380ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1496ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1006ms
     ✓ runs the full gate for replayed debug code 1538ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1784ms
     ✓ installs local dependencies against the built target tree 2042ms
     ✓ runs the configured frozen install even without root dependencies 1827ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1814ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1822ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1900ms
     ✓ never pushes local dev commits missing from origin/dev 1982ms
     ✓ dev moved: rebuilds on the new dev and pushes again 5257ms
     × dev moved before every push: exhausted, nothing landed 7628ms
     ✓ any other refusal is returned, not retried 2840ms
     ✓ pushToDev replays a commit range onto origin/dev 2383ms
     ✓ a replay retries on the new dev when dev moved 4048ms
     ✓ pushToDev log line names what it lands 2085ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2124ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2270ms
     ✓ a push that fails without a server answer is returned once, never retried 2292ms
     ✓ a failed fetch is returned before anything is built 684ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2981ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2028ms
     ✓ lands from a clone whose fetch refspec omits dev 2609ms
     ✓ build throwing stops the landing and removes the throwaway checkout 918ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 29942ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ github: "fix ABC-12" names no issue (source none) 434ms
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 494ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 451ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1634ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 487ms
     ✓ 2. an issue-less run takes any feat/ slug 307ms
     ✓ 3. a FID logged for the issue on origin/dev, even when the working tree lacks it 501ms
     ✓ 3. several FIDs logged for the issue exit 4 and list them 387ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 528ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 435ms
     ✓ 5. an issue-less mint a finished run used takes the next free suffix 539ms
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 358ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 558ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 431ms
     ✓ none: no link and no own design doc (exit 1, nulls); a named audit path must exist 402ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 42331ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 829ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 707ms
     ✓ always writes the marker, even with no plan 698ms
     ✓ writes the linear marker shape, taking the tracker from package.json 467ms
     ✓ writes the jira marker shape, taking the tracker from package.json 488ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 486ms
     ✓ refuses a PR from dev, main, or the base itself 415ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 590ms
     ✓ retries a failed create once, and exits 5 when it fails twice 599ms
     ✓ exits 5 when the open-PR probe errors 427ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 578ms
     ✓ prs open still opens against any other base 463ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 431ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 669ms
     ✓ exits 4 when gh errors and 80 when it needs auth 575ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 321ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 639ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 534ms
     ✓ runs no merge when the PR is already MERGED 528ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 703ms
     ✓ prs merge refuses a PR whose base is main 429ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 535ms
     ✓ prs merge refuses when the PR base is unknown 660ms
     ✓ prs merge reads the base from the one pr view it already makes 444ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 393ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 417ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 531ms
     ✓ never reads dev's required checks without --only-if-required 420ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 490ms
     ✓ is not green when a check failed, naming it (exit 1) 463ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 541ms
     ✓ is not green on an empty rollup (total 0) 484ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 436ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 725ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 405ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 449ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 420ms
     ✓ staging failure: exit 4 and no commit is created, no false success 436ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 412ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 401ms
> [bkit] TRUNCATED HERE — 66 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 349ms
     ✓ continues after friction and diagnostic writes fail without recursion 326ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 517ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2969ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 446ms
     ✓ starts only new source after overflow or missing source 362ms
     ✓ uses exact new comment after a failed eligibility read 349ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 303ms
     ✓ contains exhausted append and create failures without fabricated success 353ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 445ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 353ms
     ✓ reserves new comment opportunity within total delivery budget 949ms
     ✓ attempts independent attention after routine uncertainty 416ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 743ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 532ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 507ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 480ms
     ✓ fetches the issue and its comments as GitHub returns them 684ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1121ms
     ✓ invalidates missing corrupt and unsupported progress cache 1776ms
     ✓ contains cache read and write failures as standalone degradation 1074ms
     ✓ uses legacy receipts and contains receipt failures 875ms
     ✓ skips issue-less runs and tracker none 624ms
     ✓ records an engine-action row and skips the same key + body on a re-run 847ms
     ✓ a recent identical comment counts as done (the final close comment) 574ms
     ✓ a failed post reports done false with the reason and never leaks a token 509ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 635ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 528ms
     ✓ a different marker hash posts 641ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 563ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 97332ms
   ✓ the corpus matches the instructions store (8)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2428ms
     ✓ filters branch and PR discovery by configured workflow and exact head 846ms
     ✓ freezes explicit workflow run attempt and all failed job pages 623ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2192ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2318ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1650ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2182ms
     ✓ checks the named repository base and fails closed on missing evidence 1126ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 960ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1023ms
     ✓ rejects MCP capstone jobs belonging to another run 1521ms
     ✓ --fetch refreshes origin/<branch> before gating 678ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 938ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 313ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1021ms
       ✓ a source change past the validated head refuses (17) and names the path 704ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 894ms
       ✓ --validated without --month / --fid is a usage error (2) 491ms
       ✓ a validated sha that is not an ancestor refuses (17) 620ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 673ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1268ms
     ✓ a failed re-trigger push names the cause in the log 1546ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1534ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2292ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1219ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 673ms
     ✓ gh-error: every poll errored 593ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1165ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1099ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1634ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1341ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3608ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3811ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1023ms
     ✓ re-trigger on dev only uses the record of its own FID 1245ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1199ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 498ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 711ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 588ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 382ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 886ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1038ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1085ms
     ✓ --file and --step go together 782ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 766ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 604ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1013ms
     ✓ reports excluded intervals as unread even when pagination finishes 635ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 704ms
     ✓ reports an unread remainder at the page cap 550ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1084ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 389ms
     ✓ rejects missing summaries instead of treating them as empty results 590ms
     ✓ reports a failed first page as unavailable 495ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 393ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 595ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 580ms
     ✓ follows summary cursors even when the first page is shorter than the limit 711ms
     ✓ reports excluded intervals as unread even when pagination finishes 737ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 814ms
     ✓ reports an unread remainder at the page cap 805ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 536ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 552ms
     ✓ rejects missing summaries instead of treating them as empty results 899ms
     ✓ reports a failed first page as unavailable 876ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 876ms
[feat/test d049862] gate
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:10508) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 910ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2585ms
     ✓ a refused dev push is logged, never fails the close 4007ms
     ✓ an unreachable remote is logged, never fails the close 1279ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 43767ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 4021ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 5054ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 696ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 515ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 512ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4320ms
     ✓ does not fall back through a malformed later success receipt 2945ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1526ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1452ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2657ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 3421ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 787ms
     ✓ does not record a committed tree 1008ms
     ✓ records no proof for a failed gate or lighter gate 1722ms
     ✓ requires integration proof when integration is declared 1883ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3504ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 976ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1091ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1430ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 683ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1299ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 865ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 849ms
     ✓ an unpinned repo reports nulls and asks no registry 1022ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 627ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 828ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 808ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 764ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 784ms
     ✓ resolves config from the repo root when run from a subdirectory 795ms
     ✓ exits 6 when the PUT fails 813ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 765ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 555ms
     ✓ asks a human to log in when gh is not authenticated 628ms
     ✓ is a missing-dependency error when gh is not installed 308ms
     ✓ exits 3 when gh repo view names no repository 383ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 548ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 495ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 506ms
     ✓ exits 6 when the api answer is not JSON 623ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 19406ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 852ms
     ✓ keeps each context's own section banner and drops every other context's 3136ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 506ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 410ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 697ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 778ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 452ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 467ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 472ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 557ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 568ms
     ✓ --file into a missing directory is refused, not created 395ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1129ms
     ✓ counts files committed since --base 862ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 806ms
     ✓ runs nothing and exits 0 when no file changed 330ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 633ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (93 tests) 13453ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 662ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 425ms
     ✓ board is null with a reason for {} 423ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 6128ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1357ms
     ✓ runGit names ENOBUFS when output passes the limit 1109ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1294ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 328ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 323ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 333ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 876ms
     ✓ passes every rule on a clean head 377ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 501ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (38 tests) 5709ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 693ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1326ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 472ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 3006ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 536ms
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 336ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 396ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 484ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 414ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 3445ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 846 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 140 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 775ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 658ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 593ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 390ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 470ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 381ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 254ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 389ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 219ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 222ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-39khg0/architecture.md — skipping (expected exactly one start/end)

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-At3sev/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

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

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 223ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 290ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 254ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 294ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 450ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 178ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 177ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 89ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 178ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 200ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 269ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 225ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 130ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 226ms
(node:43885) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:43885) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:43885) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:43885) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 126ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 81ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 94ms
(node:43927) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:43927) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 135ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 240ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 105ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 115ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 184ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 126ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 151ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 104ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 112ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 88ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 83ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 94ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 89ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 141ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 103ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 89ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 77ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 70ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 53ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 143ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 36ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 51ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 50ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 60ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 109ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 57ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 37ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 51ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 90ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 98ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 45ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 56ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 47ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 36ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 45ms
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

 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 56ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 97ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 33ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794545872954.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794545872960.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794545872961.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 26ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794545872973.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 47ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 29ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 53ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 33ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 28ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 24ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 26ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 20ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 27ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 184ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 121ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 131ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 135ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 77ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 21ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 137ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 21ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 58ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 159ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 44ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 188021ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 514ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1602ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 382ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 363ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 408ms
       ✓ a new run in the same chat gets its own session row 329ms
     ✓ opens the next run after a finished one, and after another workflow's run 397ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 372ms
     ✓ design / plan / build / debug book in the current worktree 322ms
     ✓ --lock-held checks the lock is ours 324ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 432ms
   ✓ bkit workflows start — resume facts (8)
     ✓ an OPEN decision of an earlier run never resurfaces 308ms
     ✓ reads Test attempt from a tests pause 319ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 411ms
     ✓ aborts a rebase only when one is in progress 669ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 614ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 610ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 483ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 463ms
     ✓ --max-exceeded says a handover is due without any sentinel 375ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 323ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 438ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 465ms
     ✓ a debug run in SOAK mode always needs a handover 363ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 852ms
       ✓ counts subagents of an earlier chat the run's session rows name 841ms
       ✓ records no context block, and still closes, outside a Claude Code session 862ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 929ms
     ✓ records ending held and publish false on the workflow-done row 874ms
     ✓ defaults the close row to ending done 852ms
     ✓ refuses an unknown ending 367ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 875ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 845ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 843ms
     ✓ always writes the telemetry, whatever the runtime 759ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 627ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 774ms
     ✓ an unwritable stats path is logged and never fails the close 778ms
     ✓ appends the completeness row before the workflow-done row 916ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1116ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 2021ms
     ✓ writes one completeness row per close 1872ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1710ms
     ✓ still closes when the completeness check throws 1551ms
     ✓ still closes when the completeness row write throws 1259ms
     ✓ refuses without status.jsonl and writes nothing 460ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1132ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1760ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 922ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1127ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1277ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1077ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1414ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1184ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1122ms
     ✓ --record-step writes the close step's row before workflow-done 871ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 905ms
     ✓ --number without --outbox is a usage error 1009ms
     ✓ --flush is ship only 330ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1217ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1201ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1335ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1307ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1159ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 532ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 466ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2956ms
     ✓ --flush with nothing to record commits and pushes nothing 1527ms
     ✓ --flush carries the named worktree's logs into the dev commit 2801ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3829ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3474ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4485ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 4376ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4651ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3904ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4093ms
     ✓ --push on dev never carries a row whose references name another feature 4101ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3494ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 7456ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4062ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1613ms
     ✓ rejects --push with --flush, and --flush outside ship 371ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4239ms
     ✓ preserves unlanded file deletions and ledger additions on close 9235ms
     ✓ preserves dirty work and uncertain branch evidence during close 7900ms
     ✓ preserves a local feature ref changed after its cleanup proof 7603ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4362ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3443ms
     ✓ a close that landed releases the lock 4659ms
     ✓ removes the worktree before it releases the lock 4915ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5520ms
       ✓ closePr refuses when the PR base is unknown 3513ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2325ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 312ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 331ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 615ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 339ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 894ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 397ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 366ms
     ✓ a second run's record does not let this FID's close commit 457ms
     ✓ record is present after workflows close and before the push 889ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1781ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 316ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 618ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 473ms
     ✓ puts each --line after the summary, in flag order 484ms
     ✓ --summary prints the file and keeps a copy in --outbox 598ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 523ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 285757ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 777ms
     ✓ rejects missing explicit and ambiguous existing branch selections 598ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1028ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 833ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 612ms
     ✓ a refused --continue carries git's own reason 720ms
     ✓ --file records nothing for a refused rebase 611ms
     ✓ refuses a code conflict and aborts the rebase on the spot 539ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1341ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 559ms
     ✓ produces byte-identical output to merge=union 1315ms
     ✓ restores a trailing newline so the next append starts on its own line 851ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 701ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1111ms
     ✓ refuses a union that leaves a line which is not JSON 736ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1000ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1406ms
     ✓ refuses a lockfile whose regenerate command fails 1143ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1374ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1296ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1309ms
     ✓ refuses and aborts when both sides changed the hand-written region 770ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 901ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1089ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1317ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 712ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 913ms
     ✓ refuses and aborts when a side deleted the install record 727ms
     ✓ refuses a conflicted doc the repo's script does not list 669ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 689ms
     ✓ removes a stale sentinel when the rebase succeeds 1128ms
     ✓ exits 4 when no rebase is in progress 333ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2281ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1228ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1705ms
       ✓ skips (12) with no anchor 767ms
       ✓ skips (12) when the base is unreachable in this clone 773ms
       ✓ skips (12) when nothing landed since the base 958ms
       ✓ runs (0) with the landed path count once dev moved 1439ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 866ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1425ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1049ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1215ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1668ms
     ✓ runs exactly one git push 1587ms
     ✓ --set-upstream records the upstream 941ms
     ✓ refuses with no branch checked out 774ms
     ✓ --mode=dev refuses a feature checkout 760ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1876ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2924ms
     ✓ --require-ci pushes as-is when dev has not moved 1268ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2316ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3220ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 894ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1056ms
     ✓ --mode=abort pushes when the branch has no open PR 1224ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1140ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 717ms
     ✓ --open-pr carries the MCP answer and skips gh 1029ms
     ✓ --mode=abort on dev pushes plainly without probing 1003ms
     ✓ rejects an unknown mode 668ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3419ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1705ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2705ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4706ms
     ✓ skip-ci HEAD on the replay is refused 2110ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3818ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4718ms
     ✓ a level local dev is a plain push, recording nothing extra 1890ms
     ✓ a record with no commits pushes nothing 1757ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 983ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1828ms
     ✓ a rewritten branch is refused, never forced 1353ms
     ✓ refuses dev and main with exit 21 and pushes nothing 917ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2195ms
     ✓ refuses a detached HEAD (exit 5) 1076ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2186ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2337ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1841ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2165ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1016ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2173ms
     ✓ an up-to-date branch is a no-op 1303ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2274ms
     ✓ a fetch that fails exits 10 769ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1137ms
     ✓ scan-diff still reports a new skip when its test … 1373ms
     ✓ scan-diff reports a skip moved onto a different t… 1031ms
     ✓ scan-diff does not cancel a skip moved between am… 1846ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1277ms
     ✓ scan-diff recognizes a renamed test file 1450ms
     ✓ scan-diff recognizes a suite moved into a differe… 1123ms
     ✓ scan-diff does not let unrelated additions hide a… 1022ms
     ✓ scan-diff attributes deletion to its old test ins… 1367ms
     ✓ scan-diff consumes each moved assertion once and … 1243ms
     ✓ scan-diff does not match identical assertions fro… 1066ms
     ✓ scan-diff does not match the same leaf test name … 1068ms
     ✓ scan-diff does not match a same-named test with d… 1115ms
     ✓ scan-diff does not match a same-named test with c… 998ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1117ms
     ✓ --paths with no match exits 1 1038ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 739ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1396ms
     ✓ --marker reads a diff over 1 MiB 1224ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1399ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1212ms
     ✓ scan-diff finds an added skip 1146ms
     ✓ scan-diff ignores a skip predating the base 1172ms
     ✓ scan-diff reports a disabled test with its line 1164ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1081ms
     ✓ scan-diff ignores a removed comment in a test file 1204ms
     ✓ scan-diff ignores an assertion moved within the file 1133ms
     ✓ scan-diff still reports a removed assertion 1146ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1321ms
     ✓ scan-diff finds an added pytest mark skip 1348ms
     ✓ scan-diff finds an added unittest skip 1146ms
     ✓ scan-diff finds an added bare skip call 1180ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1498ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1026ms
     ✓ scan-diff ignores an assertion whose expectation changed 1351ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1238ms
     ✓ scan-diff reports a deleted test file 1573ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 643ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2020ms
     ✓ a title that already carries the marker is left alone 1263ms
     ✓ with no open PR: pushes the marker commit and edits no title 1348ms
     ✓ a re-run is deduped: no second marker commit 1655ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1683ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 578ms
     ✓ --title-set skips gh entirely 956ms
     ✓ refuses dev and main (exit 21) 389ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1593ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2419ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1422ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2872ms
     ✓ continues only the explicitly recorded target through the public merge command 1935ms
     ✓ fetches the unseen feature head before classifying the base 1360ms
     ✓ fast forwards the feature before either base path is chosen 2185ms
     ✓ merges divergent feature tips without rebasing either side 1156ms
     ✓ continues the feature merge before starting a dev merge 2063ms
     ✓ publishes local code with a CI running head before bookkeeping 2338ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3015ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1853ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1345ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 364ms
     ✓ Path B once dev moved; --head checks a given commit 597ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 596ms
     ✓ --merge-docs merges dev when docs/ is behind 722ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 686ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 953ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 872ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 761ms
     ✓ --merge-docs skips an empty bkit:generate script 669ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 596ms
     ✓ --merge-docs never merges on dev itself 565ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 762ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 754ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 712ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 786ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 431ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1005ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1142ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1271ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 979ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 962ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1196ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 894ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1025ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 714ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 491ms
     ✓ exits 10 when the fetch fails 313ms
     ✓ refuses --merge-docs with --head, and an unknown --head 354ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 637ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 834ms
     ✓ a failed install stops ship (16) 755ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 679ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 606ms
     ✓ exits 10 when the fetch fails 469ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 327ms
     ✓ preserves unlanded file type changes in the shared landed comparison 351ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 335ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1736ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2030ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1503ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1823ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4158ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 5285ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 671ms
     ✓ local: names unpushed dev as the cause when the branch carries it 903ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 848ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1844ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2161ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1447ms
     ✓ uses tree entry equivalence for design and plan land cleanup 7042ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1402ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1829ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1650ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 948ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2547ms
     ✓ land removes the worktree when only the copied .env is untracked 1967ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1370ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2425ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2862ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1658ms
     ✓ landPr refuses a main-based PR without retrying 683ms
     ✓ landPr refuses when the PR base is unknown 752ms
     ✓ PR not open (closed): stops (17) at once, no retry 864ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 566ms
     ✓ --attempt names the merge round in a fix commit 532ms
     ✓ commits a rewritten and a deleted tracked file 634ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 663ms
     ✓ reports undeclared and runs nothing with no scripts 506ms
     ✓ reports undeclared and runs nothing with an empty script 486ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 522ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 656ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 620ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed
Error: Test timed out in 7350ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/land.test.ts:440:3
    438|   });
    439|
    440|   it("dev moved before every push: exhausted, nothing landed", async (…
       |   ^
    441|     const { root, remote, dir } = fixture();
    442|     const res = await pushToDev({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 175 passed (176)
      Tests  1 failed | 7601 passed | 2 skipped (7604)
   Start at  14:55:14
   Duration  287.35s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/915-min-push-ignores/run-tests-1.log.reports/vitest-31324.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.48 |    82.23 |   94.36 |   89.93 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.03 |    86.68 |   95.57 |   94.48 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.42 |     100 |    97.2 | ...01,321,418-419 
  managed.ts       |    81.7 |    87.87 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   93.61 |    91.21 |     100 |   93.12 | ...33,550,563,594 
 .../checks/before |   94.55 |    88.63 |   95.55 |   97.81 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |      84 |    73.33 |     100 |     100 | ...39,147,155-174 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   93.38 |    93.75 |    87.5 |   93.61 | 194-202           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |    88.6 |     83.2 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.06 |   96.42 |   94.53 | ...18-821,868-883 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |      96 |    87.42 |    90.9 |   98.16 |                   
  ci.ts            |   97.35 |    88.36 |   95.74 |   98.89 | 273,769,849,1026  
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   94.06 |    84.12 |     100 |     100 | ...19,171,173,212 
 ...mmands/install |    47.2 |    44.69 |   57.14 |   47.59 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.02 |    30.65 |   33.33 |   33.21 | 355-383,565-1078  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   90.03 |    82.82 |   95.12 |   91.54 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.34 |    96.18 |     100 |   99.06 | 314,694           
  decisions.ts     |   94.38 |    83.15 |      98 |   97.21 | ...63,368,445,632 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.09 |    86.93 |   97.43 |    95.6 | ...1299,1314-1324 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.21 |    86.84 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.01 |    88.42 |     100 |   93.01 | ...1444,1460-1461 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.45 |   92.64 |   83.42 | ...3087,3119-3123 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |   88.97 |    81.85 |    92.3 |   90.78 | ...2357,2359,2403 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.03 |    90.27 |    94.2 |   96.33 | ...32-638,661,684 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.49 |    82.65 |    97.4 |    95.1 | ...1773,1947,2679 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1388,1391-1392 
 engine/install    |   91.88 |     83.3 |   93.33 |   94.85 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.52 |    90.06 |     100 |     100 | ...35,340,346-347 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   95.44 |    91.83 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.63 |    97.7 |   97.92 | 851,877-883,917   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1858,2016,2377 
 engine/render     |   90.61 |    82.85 |   98.36 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.44 |    97.23 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.93 |    85.49 |   95.47 |   90.54 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1717-1799,1804 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.48% ( 20643/23330 )
Branches     : 82.23% ( 16000/19457 )
Functions    : 94.36% ( 3283/3479 )
Lines        : 89.93% ( 18119/20147 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1847 of 3498 lines (132 KB of 268 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
