
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 359:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 367:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 495:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 871:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 525:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 647:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 789:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 633:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 872:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1053:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1163:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1255:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1497:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1557:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 373:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 468:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 523:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 602:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 257:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 390:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 430:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 501:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> bkit ci slop

[bkit-ci] base dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 (dd8b4390c4bbba6cc0bffdd59303832b8dc6d826) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
base: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 4.3 on 10 cores: unit limits 6650ms per test, 13300ms per hook (x1.33)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 52823ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 823ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 709ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 635ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 362ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 706ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 759ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 488ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 926ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1547ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1015ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 389ms
     ✓ PASS is 0 failures with or without reports 479ms
     ✓ clears a previous attempt's reports before the gate runs 330ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 675ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 616ms
     ✓ a log under the outbox is named main-checkout relative in the record 432ms
     ✓ a log small enough is copied whole: not clamped, raw null 608ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 334ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 982ms
     ✓ numbers runs within the workflow's active run and per step 578ms
     ✓ without --file no row is written and the output carries row null 337ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 933ms
     ✓ a planned test that passes is a vacuous gap, exit 1 610ms
     ✓ a planned test absent from a loaded report is a missing gap 854ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1199ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1198ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 370ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1108ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 762ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 915ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 352ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1559ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 865ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1471ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1637ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2619ms
     ✓ green: a passed-accepted test is already landed, not a gap 1054ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1232ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 968ms
     ✓ green: --group audits only that group's tasks 824ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1134ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1104ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1019ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1231ms
     ✓ green: lists each gap kind, with the runner output 926ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1802ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 780ms
       ✓ green clears an exception-only task from a human commit 610ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 55499ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 676ms
     ✓ names each net-new and worsened finding in the log and the JSON 918ms
     ✓ fails on a net score rise with no net count change 618ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 937ms
     ✓ treats a net score at or below 0.001 as float noise 1015ms
     ✓ passes when the change only resolves findings 1163ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1083ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 481ms
     ✓ skips (exit 0) when the base resolves to HEAD 350ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2143ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 559ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 825ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 739ms
     ✓ exits 4 on a dropped net field instead of silently passing 914ms
     ✓ exits 4 on no summary instead of silently passing 662ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1167ms
     ✓ exits 5 when the base worktree cannot be created 416ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1026ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1156ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1249ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 954ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1192ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2440ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 338ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 891ms
     ✓ explicit globs can select ignored prose and nested checkout files 495ms
     ✓ fails closed when the git index cannot be read 413ms
     ✓ fails closed when a selected prose source cannot be read 350ms
     ✓ fails when vale is not installed 356ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 533ms
     ✓ fails (exit 1) when vale reports alerts 541ms
     ✓ exits 6 on a vale runtime error 438ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 550ms
     ✓ falls back to vale sync when the main worktree has none 489ms
     ✓ fails when vale sync cannot restore the required styles 731ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 805ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 642ms
     ✓ is a usage error when the commit cannot be read 396ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 558ms
     ✓ exits 1 naming the code file, whatever the commit message says 547ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 651ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 549ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1252ms
     ✓ exits 7 when a commit cannot be read 524ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 1238ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1314ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1598ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 897ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 808ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1284ms
     ✓ a top-level glob in the setting does not reach into folders 652ms
     ✓ a push that changes no files is not proven a min push 576ms
     ✓ exits 7 when a commit or its base cannot be read 724ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 705ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 755ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 667ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 752ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 865ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 736ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 724ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 952ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 819ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 720ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 798ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 940ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 1114ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 56695ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ design and plan in place on main are refused 318ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1610ms
     ✓ may debug in place on dev 794ms
     ✓ never in place on main 359ms
     ✓ adopts in place when the session is already on feat/{fid} 725ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1087ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 700ms
     ✓ a new run of the same FID rewrites startSha 1230ms
     ✓ a resume of the same FID reuses the record 1594ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1299ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 875ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1220ms
     ✓ a stale record without a lock is replaced 1260ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1154ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4408ms
     ✓ names inherited commits and ship recovery in the refusal 1280ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1757ms
     ✓ ship names a missing feat branch 418ms
     ✓ ship on dev refuses with the releases-stay-manual text 320ms
     ✓ refuses dev / main as the ship branch 377ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1866ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 437ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 359ms
     ✓ fails with a fetch error when there is no origin to rebase onto 493ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 438ms
       ✓ checks no disk when there are no cleanup step files 755ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 671ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 872ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 432ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 321ms
     ✓ never commits an entry only the main checkout's copy list names 519ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 436ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 774ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 411ms
     ✓ tells a caller inside the removed worktree where to cd 705ms
     ✓ fails with its own exit code when git cannot remove a marked path 1052ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 2639ms
       ✓ preserves staged-only mode during landed cleanup 1955ms
       ✓ preserves staged-only type during landed cleanup 1680ms
       ✓ preserves staged-only deletion during landed cleanup 1835ms
       ✓ removes landed staged content when both index and working contents are on dev 1771ms
       ✓ deletes the proved local and remote branch at their landed tips 2035ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2741ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 856ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 888ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 448ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 993ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1495ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (108 tests) 71730ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 32332ms
     ✓ every prompt, workflow and utility agent has the three header blocks 996ms
     ✓ sync has nothing left to rewrite 33183ms
     ✓ every clause reaches the cut-off of one surface it applies to 3694ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 529ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 483ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 71796ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 418ms
     ✓ finishes a CI round only with its own failed job count 462ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 458ms
     ✓ done --group writes group on the row 326ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 491ms
     ✓ carries extra fields, parsed as JSON when they are JSON 450ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 536ms
     ✓ needs a message unless --commit=none 383ms
     ✓ reports a failed commit with exit 8 without writing the row 1003ms
     ✓ a failed commit leaves no row staged in the index 2029ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 767ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 938ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1063ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 711ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1000ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 326ms
     ✓ --ref reads the status file as committed on that ref, not from disk 373ms
     ✓ --ref exits 3 when the ref does not carry the status file 527ms
     ✓ fails on a placeholder left in the artifact 376ms
     ✓ fails when the row's verdict differs from the artifact's 446ms
     ✓ fails when the row does not list the artifact, or carries another attempt 498ms
     ✓ fails on a missing artifact 419ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 390ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 312ms
     ✓ fails a run-tests row missing its scope, and an empty scope 688ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 306ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 614ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 342ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 343ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 542ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 775ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1044ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1081ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 777ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 852ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2016ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 867ms
     ✓ --post needs --number; without --post there is no tracker key 310ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 359ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 547ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 943ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1249ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 754ms
       ✓ gate --issue without --fid is a usage error 693ms
     ✓ --attempt-of checks the row carries the derived counter 800ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1886ms
     ✓ writeStepRow refuses when a recorded path changed 1960ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 813ms
     ✓ writeStepRow appends its commit sha to the record 1536ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1678ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 589ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1111ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 984ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 1248ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 684ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1912ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1455ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 1283ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 691ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 2484ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 353ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 719ms
     ✓ does not count an artifact the run found committed when it started 1155ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 1219ms
     ✓ commits a package.json change outside bkit.workflows 1875ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 2867ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 402ms
     ✓ renders and verifies the header of every prompt that declares one 553ms
     ✓ refuses line breaks in header-bound result values 376ms
     ✓ retains special verdict judgments and legacy stub behavior 438ms
     ✓ reads held audit keys from the linked worktree's own ledger 352ms
     ✓ audit result render keeps an existing anchored report intact 606ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 101857ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1346ms
     ✓ runs code.ts through its declared gate in the built checkout 1630ms
     ✓ runs code.ts through its declared gate in the built checkout 2500ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2216ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1426ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1432ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1765ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1279ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1027ms
     ✓ runs the full gate for replayed debug code 1504ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2102ms
     ✓ installs local dependencies against the built target tree 2179ms
     ✓ runs the configured frozen install even without root dependencies 2351ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2604ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 3020ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 3174ms
     ✓ never pushes local dev commits missing from origin/dev 2668ms
     ✓ dev moved: rebuilds on the new dev and pushes again 7046ms
     ✓ dev moved before every push: exhausted, nothing landed 7831ms
     ✓ any other refusal is returned, not retried 3575ms
     ✓ pushToDev replays a commit range onto origin/dev 3636ms
     ✓ a replay retries on the new dev when dev moved 8014ms
     ✓ pushToDev log line names what it lands 4783ms
     ✓ runs no git hooks in the throwaway checkout, and says so 3917ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 4608ms
     ✓ a push that fails without a server answer is returned once, never retried 4086ms
     ✓ a failed fetch is returned before anything is built 2450ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 4903ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3273ms
     ✓ lands from a clone whose fetch refspec omits dev 6644ms
     ✓ build throwing stops the landing and removes the throwaway checkout 2796ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 81767ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 982ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 969ms
     ✓ always writes the marker, even with no plan 614ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1164ms
     ✓ writes the jira marker shape, taking the tracker from package.json 696ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 1130ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1273ms
     ✓ retries a failed create once, and exits 5 when it fails twice 983ms
     ✓ exits 5 when the open-PR probe errors 617ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1037ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 337ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 521ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 961ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1077ms
     ✓ refuses a bad --state or --number 1247ms
   ✓ bkit prs scan-body (10)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 305ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 327ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 690ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 1010ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 674ms
     ✓ runs no merge when the PR is already MERGED 757ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1366ms
     ✓ prs merge refuses a PR whose base is main 729ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 824ms
     ✓ prs merge refuses when the PR base is unknown 636ms
     ✓ prs merge reads the base from the one pr view it already makes 582ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 868ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1197ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 800ms
     ✓ never reads dev's required checks without --only-if-required 558ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 2447ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 1736ms
     ✓ is not green when a check failed, naming it (exit 1) 932ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1075ms
     ✓ is not green on an empty rollup (total 0) 1060ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1720ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 2446ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 852ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 879ms
     ✓ needs --scan or --scan-result 508ms
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests | 1 failed) 92324ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 794ms
     ✓ continues after friction and diagnostic writes fail without recursion 695ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 934ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 6680ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ starts only new source after overflow or missing source 508ms
     ✓ keeps standalone fallback exact and unassociated calls conservative 430ms
     ✓ uses exact new comment after a failed eligibility read 897ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 550ms
     ✓ recognizes append success within budget without unnecessary resend 631ms
     ✓ preserves a human correction after lost append recognition and a later report 665ms
     ✓ contains exhausted append and create failures without fabricated success 598ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 1337ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 462ms
     ✓ reserves new comment opportunity within total delivery budget 1726ms
     ✓ contains preparation state lock and reconciliation exceptions 666ms
     ✓ attempts independent attention after routine uncertainty 1075ms
     ✓ seals an acknowledged segment after a postflight intervening comment 969ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ HTTP 429  -> rate-limit 3ms
     ✓ HTTP 500  -> http-500 3ms
     ✓ network errors: DNS failure, refused connection, timeout 3ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 760ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 959ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 973ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1093ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 635ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 889ms
     ✓ fetches the issue and its comments as GitHub returns them 824ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ posts through GraphQL commentCreate with the API key as Authorization 534ms
     ✓ no key -> auth, and fetch is never called 708ms
     ✓ GraphQL errors map by code; DNS failure is network 968ms
     ✓ fetches title, url, state, labels, description and comments 309ms
   ✓ jira client (MCP over HTTP) (6)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 366ms
     ✓ splits a body over 32,767 characters into consecutive comments 260ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 299ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 528ms
     ✓ jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not 288ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ keeps original body identity separate from time and changed output 1423ms
     ✓ reuses matching invocation state without adopting foreign ownership 4811ms
     × invalidates missing corrupt and unsupported progress cache 9888ms
     ✓ contains cache read and write failures as standalone degradation 1922ms
     ✓ uses legacy receipts and contains receipt failures 1803ms
     ✓ skips issue-less runs and tracker none 1837ms
     ✓ records an engine-action row and skips the same key + body on a re-run 2591ms
     ✓ a recent identical comment counts as done (the final close comment) 1260ms
     ✓ a failed post reports done false with the reason and never leaks a token 1325ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1443ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 1025ms
     ✓ a different marker hash posts 1795ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1137ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 251ms
     ✓ fetchIssue pages comments past the first page 264ms
   ✓ jira: HTML comment pages and non-string bodies (2)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ an ADF comment or description body reads as text, never a JSON blob 473ms
[feat/test b6ef6a3] gate
 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests | 1 failed) 134072ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 839ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 737ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 660ms
     ✓ staging failure: exit 4 and no commit is created, no false success 1118ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1354ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 826ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 660ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 726ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 184ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 118ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 235ms
     ✓ root that is not a directory or not a repo exits 3 40ms
     ✓ --root defaults to the working directory 669ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 1733ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 684ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1457ms
> [bkit] TRUNCATED HERE — 56 lines omitted. Dropped content was NOT read.
     ✓ --dry-run counts without writing 96ms
     ✓ a second run changes nothing 184ms
     ✓ refuses an unknown --ledger with a usage error 8ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 8ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 1217ms
   ❯ bkit ledgers append --invocation (5)
     × rejects conflicting attribution and retains legacy writer restrictions 7123ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 1838ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 4641ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ keeps ledger operation intents and receipts out of committed book paths 4081ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 715ms
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests | 2 failed) 120290ms
   ❯ workflow shell fences (4)
     ✓ finds the fences: every phase workflow has some 5ms
     ✓ de-indents a list-nested fence and replaces placeholders 2ms
     × every fence parses under bash -n 60057ms
     × every fence parses under zsh -n 60034ms
   ✓ workflow shell fences — no raw git, gh, jq or file copies (11)
     ✓ every raw call is a bkit verb, bar the named allow-list 11ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ flags B=$(git branch --show-current) 0ms
     ✓ flags X=$("DUMMY" counters run | jq -er .run) 0ms
     ✓ flags rm -f "DUMMY/.rebase-failed" 0ms
     ✓ flags cp "a.md" "b.md" || exit 1 0ms
     ✓ flags cd "DUMMY" && git diff --quiet HEAD~1 HEAD 0ms
     ✓ passes "DUMMY" branches push --mode=plain 0ms
     ✓ passes echo "digit 1 gh-pages" 0ms
 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests | 2 failed) 123776ms
   ❯ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 5950ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 7025ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 770ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 1053ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 944ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 8067ms
     ✓ does not fall back through a malformed later success receipt 5729ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 2607ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 6241ms
     × executes the full gate and carries its proof across bookkeeping and empty commits 12416ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 11447ms
     ✓ requires proof even when the pushed increment changes no files 5017ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 3187ms
     ✓ does not record a committed tree 3762ms
     ✓ records no proof for a failed gate or lighter gate 6366ms
     ✓ requires integration proof when integration is declared 10514ms
     × rejects new code, a mixed push, new branches with code, and non-ancestor old heads 12648ms
     ✓ invalidates proof when the gate definition changes 7578ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 2993ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
(node:13378) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:13378) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests | 1 failed) 48736ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 6ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ flags an expired, over-long or stale acceptance 148ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 735ms
     ✓ rejects an --unreachable value that is neither fail nor warn 204ms
   ❯ shipped copy-and-own test files (6)
     ✓ finds the shipped .test.mjs files 1ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 2127ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 650ms
     × ci/bkit-test-awake.test.mjs passes when run on its own 30077ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 12333ms
   ✓ capstone env wiring checks (3)
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 2719ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1340ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2573ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1714ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1199ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1359ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1741ms
     ✓ an unpinned repo reports nulls and asks no registry 1804ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1511ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1415ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1588ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1048ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 27289ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 2487ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1039ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1281ms
     ✓ reports excluded intervals as unread even when pagination finishes 1277ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1657ms
     ✓ reports an unread remainder at the page cap 1673ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1552ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1825ms
     ✓ rejects missing summaries instead of treating them as empty results 1935ms
     ✓ reports a failed first page as unavailable 747ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 830ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 927ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1186ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1662ms
     ✓ reports excluded intervals as unread even when pagination finishes 875ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 703ms
     ✓ reports an unread remainder at the page cap 1400ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 825ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1214ms
     ✓ rejects missing summaries instead of treating them as empty results 744ms
     ✓ reports a failed first page as unavailable 503ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 920ms
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 24364ms
   ✓ normFlag (11)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 549ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 661ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 399ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 640ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 607ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1276ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 706ms
     ✓ --file into a missing directory is refused, not created 731ms
   ✓ bkit runtime assert (8)
     ✓ derives runtimeHeadless from the row's runtime; the row never stores it 300ms
     ✓ an empty runtime -> exit 5, naming the unresolved field 537ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ none branch feat/anything-goes with no feature row for its issue -> issue-less, FID anything-goes verbatim 792ms
     ✓ github branch feat/abc-x with no feature row for its issue -> issue-less, FID abc-x verbatim 420ms
     ✓ github branch feat/dev-ci-failures with no feature row for its issue -> issue-less, FID dev-ci-failures verbatim 349ms
     ✓ linear branch feat/dev-ci-failures with no feature row for its issue -> issue-less, FID dev-ci-failures verbatim 314ms
     ✓ jira branch feat/dev-ci-failures with no feature row for its issue -> issue-less, FID dev-ci-failures verbatim 466ms
     ✓ a branch with no issues.jsonl at all is issue-less 423ms
     ✓ a feature row for another issue does not link, and a row for the same issue links any FID with it 1089ms
> [bkit] TRUNCATED HERE — 97 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 582ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 2201ms
     ✓ 6. a FID that fails the format check exits 1 391ms
     ✓ a missing title or prompt file exits 7 856ms
   ✓ bkit fids plans (2)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 410ms
     ✓ resolves config from the repo root when run from a subdirectory 397ms
     ✓ exits 6 when the PUT fails 478ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 532ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 548ms
     ✓ asks a human to log in when gh is not authenticated 588ms
     ✓ is a missing-dependency error when gh is not installed 364ms
     ✓ exits 3 when gh repo view names no repository 425ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 497ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 457ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 624ms
     ✓ exits 6 when the api answer is not JSON 586ms
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests | 1 failed) 232709ms
   ✓ Markdown CI references (5)
     ✓ preserves the identity of actions/runs/123 4ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 3498ms
     ✓ saves the failed job count without the capstone job 553ms
     ✓ counts the capstone job when it is the only failed job 671ms
     ✓ saves no failed job count when no job failed 843ms
     ✓ counts fallback evidence jobs without the capstone job 398ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 426ms
     ✓ filters branch and PR discovery by configured workflow and exact head 792ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1106ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1617ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2067ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 56ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 30ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 36ms
     ✓ rate_limit returns the requested fixture state 50ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 47ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 122ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 165ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 34ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2366ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 3278ms
     ✓ checks the named repository base and fails closed on missing evidence 1522ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1275ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1968ms
     ✓ rejects MCP capstone jobs belonging to another run 1997ms
     ✓ accepts a green capstone at the head (exit 0) and says so 165ms
     ✓ rejects a failed run (12) 238ms
     ✓ rejects no run at the head (10) 123ms
     ✓ rejects runs that have not completed (11) 108ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 303ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 215ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 747ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 207ms
       ✓ both floor steps failing is regenerable 341ms
       ✓ any failed step off the list makes the whole result unregenerable 208ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 217ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 178ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 238ms
       ✓ a timed-out step counts as failed 190ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 364ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 212ms
       ✓ refusals other than a failed run carry no failed steps 145ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 263ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 157ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 137ms
     ✓ tells an API error (20) from no run (10) 400ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 240ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 170ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 157ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 7ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 142ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ a malformed ciRequired falls back to none, never crashes 147ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 378ms
     ✓ missing --head is a usage error (2) 6ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 43ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 145ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 95ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 154ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 142ms
       ✓ without --event the newer green pull_request run masks the failed push run 160ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 346ms
       ✓ a run still in progress whose capstone already passed passes 261ms
       ✓ a capstone still running is in progress (11) 172ms
       ✓ a failed capstone fails (12) even when every other job passed 147ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 301ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 267ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 976ms
       ✓ a source change past the validated head refuses (17) and names the path 837ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 900ms
       ✓ --validated equal to --head is the plain head check 145ms
       ✓ --validated without --month / --fid is a usage error (2) 765ms
       ✓ a validated sha that is not an ancestor refuses (17) 744ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ no push run yet inside the absent window keeps waiting 3ms
     ✓ still in progress at --max-minutes -> 4 6ms
     ✓ two API errors are retried; the third in a row -> 20 2ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 707ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 889ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 2ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 2ms
     ✓ found stops polling; every poll erroring is err with allErrored 1ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 1ms
     ✓ PR completed = no open checks; run targets are head-anchored 2ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 280ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 180ms
     ✓ CLI: a failed gh workflow run exits 5 259ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1268ms
     ✓ CLI: usage errors exit 2 32ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1040ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2303ms
     ✓ a failed re-trigger push names the cause in the log 2059ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2970ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 5303ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2177ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1429ms
     ✓ gh-error: every poll errored 1117ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2605ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2036ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 3351ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 3514ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 20751ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 14662ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 3122ms
     ✓ re-trigger on dev only uses the record of its own FID 3573ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 3855ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 282ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 976ms
     ✓ an empty or unreadable sha is an error, not a clean result 452ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 2114ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1071ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 2500ms
     ✓ a refused capstone records FAIL with its reason 959ms
     ✓ an unreadable PR is an API error (20) with no head 255ms
     ✓ takes exactly one of --head, --pr, --squash-of 167ms
   ❯ bkit runs revalidate (7)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ without --repo no call gains a --repo flag 4678ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 4ms
     × requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 7349ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 3329ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 1205ms
     ✓ refuses an unknown --reason 2067ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 2030ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1522ms
     ✓ ref uppercases a Linear or Jira key 2ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1547ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 2372ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1727ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 3351ms
     ✓ --file and --step go together 2434ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1276ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 5312ms
     ✓ a refused dev push is logged, never fails the close 5588ms
     ✓ an unreachable remote is logged, never fails the close 2626ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 14529ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1744ms
     ✓ counts files committed since --base 1531ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1028ms
     ✓ runs nothing and exits 0 when no file changed 534ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1314ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1736ms
     ✓ keeps each context's own section banner and drops every other context's 4870ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 1287ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 634ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --reset-log empties the log; without it records accumulate 306ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 731ms
     ✓ removes a stale failure file once every recipe succeeds 638ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 590ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ finalise totals a rendered fetch per context (table vs raw) 485ms
     ✓ finalise totals a rendered fetch's origBytes as the bytes the block printed 823ms
     ✓ finalise with no artifacts is FAIL 319ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 1690ms
   ✓ bkit context diff (10)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 858ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1663ms
     ✓ runGit keeps output past Node's 1MB default 557ms
     ✓ runGit names ENOBUFS when output passes the limit 3965ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 36105ms
   ✓ bkit issues labels (25)
     ✓ a new phase drops the old phase, next:* and bkit:failed, keeps bkit:auto and foreign labels 438ms
     ✓ debug is a phase: it replaces the phase it debugs and clears bkit:failed 439ms
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 556ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 554ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 1130ms
     ✓ refuses an unknown phase or on/off value 330ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ posts the printed body; an identical recent comment is not posted twice 1198ms
     ✓ renders audit comments from validated result and preserves tracker adapters 1407ms
     ✓ a failed post exits 0 with done false and the reason 406ms
     ✓ prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback 413ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 905ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ a malformed board target is refused before any label is written 379ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 978ms
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests | 3 failed) 9585ms
   ❯ publication ownership lock (4)
     × serializes publication for one target and invocation 448ms
     × bounds acquisition and preserves unverifiable owners 464ms
     × reclaims only a proven dead matching process identity 1104ms
     ✓ releases only its delivery token on every exit 764ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses while the holder's run stepped in the last 30 minutes 272ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 446ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 510ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 187ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 291ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1651ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2374ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 686ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 6685ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1413ms
     ✓ passes every rule on a clean head 451ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 500ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (49 tests) 6232ms
   ✓ bkit decisions compose (26)
     ✓ base check all with no items recommends Stop 309ms
     ✓ base check all in adopt mode adds the merge sentence 331ms
     ✓ Try again is offered for every base verdict 584ms
     ✓ a missing or malformed base check is a usage error that names the problem 427ms
   ✓ bkit decisions apply --by=headless (3)
     ✓ labels the runtime from the main checkout's Cursor marker when run in a build worktree 495ms
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 468ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 754ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 587ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 1116ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (77 tests) 5768ms
   ✓ source derivation (6)
> [bkit] TRUNCATED HERE — 190 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1441ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 315ms
     ✓ limits execSync and execFileSync the same way 610ms
     ✓ stops a child that ignores SIGTERM at the remaining time 302ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 711 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 373 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 152ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 189ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 157ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 135ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 627ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 589ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 533ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (37 tests) 653ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 305ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 360ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 375ms
(node:39766) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:39766) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:39766) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:39766) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 309ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 184ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 351ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 551ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 311ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 227ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 244ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 394ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 479ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 408ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 680ms
   ✓ fetchAsset (2)
     ✓ returns the body of a 200 419ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 121ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 787ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 814ms
   ✓ buildSummary (62)
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 352ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 241ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 328ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 667ms
   ✓ KN-19-for-opencode — writeTier2JsonContained throws on malformed .opencode/opencode.json (2)
     ✓ writeTier2JsonContained throws on malformed destination JSON (KN-19) 444ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 247ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 80ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 340ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 53ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 245ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794712705767.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794712705773.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794712705780.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794712705813.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 72ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 67ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 163ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 138ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 57ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 113ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 71ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 116ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 99ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 49ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 159ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 137ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 129ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 88ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 89ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 120ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 120ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 88ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 95ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 56ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 47ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 79ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 81ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 52ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 54ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 46ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 25ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 42ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 19ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 20ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 19ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 17ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 44ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 21ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 23ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 24ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 23ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 15ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 329762ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 314ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1166ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 325ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 306ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 546ms
       ✓ a new run in the same chat gets its own session row 381ms
       ✓ writes none outside Claude Code 726ms
     ✓ opens the next run after a finished one, and after another workflow's run 560ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 610ms
     ✓ design / plan / build / debug book in the current worktree 757ms
     ✓ refuses when the lock is live, writing no row 377ms
     ✓ --lock-held checks the lock is ours 378ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 314ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 314ms
   ✓ bkit workflows start — resume facts (11)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 536ms
     ✓ openDecision gate is null without the header 350ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 619ms
     ✓ writes no row when status.jsonl does not exist 447ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 336ms
     ✓ aborts a rebase only when one is in progress 596ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 485ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 745ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 432ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 448ms
     ✓ --max-exceeded says a handover is due without any sentinel 302ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 326ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 425ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 533ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 315ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 309ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 418ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 357ms
     ✓ a debug run in SOAK mode always needs a handover 469ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1099ms
       ✓ counts subagents of an earlier chat the run's session rows name 1193ms
       ✓ records no context block, and still closes, outside a Claude Code session 1280ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1177ms
     ✓ records ending held and publish false on the workflow-done row 1614ms
     ✓ defaults the close row to ending done 1137ms
     ✓ refuses an unknown ending 395ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1138ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1622ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1287ms
     ✓ always writes the telemetry, whatever the runtime 1037ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1170ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1181ms
     ✓ an unwritable stats path is logged and never fails the close 2329ms
     ✓ appends the completeness row before the workflow-done row 1646ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1499ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1419ms
     ✓ writes one completeness row per close 1894ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1210ms
     ✓ still closes when the completeness check throws 1143ms
     ✓ still closes when the completeness row write throws 1101ms
     ✓ refuses without status.jsonl and writes nothing 451ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1405ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2164ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1260ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1281ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1800ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1969ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2224ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2404ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 2841ms
     ✓ --record-step writes the close step's row before workflow-done 2003ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 2018ms
     ✓ --number without --outbox is a usage error 1231ms
     ✓ --flush is ship only 963ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 2284ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 2346ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 2419ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 3004ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 2851ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 741ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 762ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 5252ms
     ✓ --flush with nothing to record commits and pushes nothing 4028ms
     ✓ --flush carries the named worktree's logs into the dev commit 7699ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 16165ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 16507ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 13096ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 11488ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 25561ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 13906ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 11273ms
     ✓ --push on dev never carries a row whose references name another feature 8998ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 7268ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 15190ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 5851ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2920ms
     ✓ rejects --push with --flush, and --flush outside ship 547ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 6005ms
     ✓ preserves unlanded file deletions and ledger additions on close 14316ms
     ✓ preserves dirty work and uncertain branch evidence during close 20441ms
     ✓ preserves a local feature ref changed after its cleanup proof 5768ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2209ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3016ms
     ✓ a close that landed releases the lock 2923ms
     ✓ removes the worktree before it releases the lock 1790ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2340ms
       ✓ closePr refuses when the PR base is unknown 2891ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1490ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 513ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 777ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 404ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 423ms
     ✓ a second run's record does not let this FID's close commit 487ms
     ✓ record is present after workflows close and before the push 991ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2442ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 341ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1191ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 963ms
     ✓ puts each --line after the summary, in flag order 561ms
     ✓ --summary prints the file and keeps a copy in --outbox 529ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 420ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 448488ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 450ms
     ✓ rejects missing explicit and ambiguous existing branch selections 435ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 893ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 792ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 679ms
     ✓ a refused --continue carries git's own reason 1316ms
     ✓ --file records nothing for a refused rebase 911ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1079ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2255ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 520ms
     ✓ produces byte-identical output to merge=union 1462ms
     ✓ restores a trailing newline so the next append starts on its own line 1128ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 769ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1057ms
     ✓ refuses a union that leaves a line which is not JSON 726ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 941ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1301ms
     ✓ refuses a lockfile whose regenerate command fails 1126ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1312ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1584ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1650ms
     ✓ refuses and aborts when both sides changed the hand-written region 1123ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1177ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1821ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1852ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 924ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1707ms
     ✓ refuses and aborts when a side deleted the install record 1099ms
     ✓ refuses a conflicted doc the repo's script does not list 888ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1101ms
     ✓ removes a stale sentinel when the rebase succeeds 1309ms
     ✓ exits 4 when no rebase is in progress 429ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 3123ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1769ms
   ✓ branches anchor-stamp (19)
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 477ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 807ms
       ✓ skips (12) with no anchor 737ms
       ✓ skips (12) when the base is unreachable in this clone 1007ms
       ✓ skips (12) when nothing landed since the base 906ms
       ✓ runs (0) with the landed path count once dev moved 1443ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 918ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1788ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1130ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1524ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2453ms
     ✓ runs exactly one git push 2165ms
     ✓ --set-upstream records the upstream 1816ms
     ✓ refuses with no branch checked out 1122ms
     ✓ --mode=dev refuses a feature checkout 1067ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 4667ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 5903ms
     ✓ --require-ci pushes as-is when dev has not moved 2218ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3974ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 7137ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1312ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1880ms
     ✓ --mode=abort pushes when the branch has no open PR 2271ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1680ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 2141ms
     ✓ --open-pr carries the MCP answer and skips gh 2690ms
     ✓ --mode=abort on dev pushes plainly without probing 1919ms
     ✓ rejects an unknown mode 3280ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 15287ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 9141ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 9685ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 11181ms
     ✓ skip-ci HEAD on the replay is refused 4166ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 15560ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 20941ms
     ✓ a level local dev is a plain push, recording nothing extra 9078ms
     ✓ a record with no commits pushes nothing 3079ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 2035ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 6530ms
     ✓ a rewritten branch is refused, never forced 2689ms
     ✓ refuses dev and main with exit 21 and pushes nothing 2159ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 4208ms
     ✓ refuses a detached HEAD (exit 5) 2648ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 4337ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 3596ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 3272ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 4533ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 2264ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 5312ms
     ✓ an up-to-date branch is a no-op 2162ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2832ms
     ✓ a fetch that fails exits 10 1747ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1856ms
     ✓ scan-diff still reports a new skip when its test … 1539ms
     ✓ scan-diff reports a skip moved onto a different t… 1759ms
     ✓ scan-diff does not cancel a skip moved between am… 1491ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1575ms
     ✓ scan-diff recognizes a renamed test file 2297ms
     ✓ scan-diff recognizes a suite moved into a differe… 2255ms
     ✓ scan-diff does not let unrelated additions hide a… 1210ms
     ✓ scan-diff attributes deletion to its old test ins… 1359ms
     ✓ scan-diff consumes each moved assertion once and … 2185ms
     ✓ scan-diff does not match identical assertions fro… 3417ms
     ✓ scan-diff does not match the same leaf test name … 1650ms
     ✓ scan-diff does not match a same-named test with d… 1625ms
     ✓ scan-diff does not match a same-named test with c… 1661ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 3815ms
     ✓ --paths with no match exits 1 2093ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 2358ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 4872ms
     ✓ --marker reads a diff over 1 MiB 3776ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1378ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 807ms
     ✓ scan-diff finds an added skip 831ms
     ✓ scan-diff ignores a skip predating the base 498ms
     ✓ scan-diff reports a disabled test with its line 690ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 478ms
     ✓ scan-diff ignores a removed comment in a test file 482ms
     ✓ scan-diff ignores an assertion moved within the file 468ms
     ✓ scan-diff still reports a removed assertion 559ms
     ✓ scan-diff reports an assertion re-added only outside the test file 669ms
     ✓ scan-diff finds an added pytest mark skip 1610ms
     ✓ scan-diff finds an added unittest skip 992ms
     ✓ scan-diff finds an added bare skip call 559ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1091ms
     ✓ scan-diff ignores a marker literal in a non-test source file 662ms
     ✓ scan-diff ignores an assertion whose expectation changed 796ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 558ms
     ✓ scan-diff reports a deleted test file 567ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 350ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1484ms
     ✓ a title that already carries the marker is left alone 960ms
     ✓ with no open PR: pushes the marker commit and edits no title 1087ms
     ✓ a re-run is deduped: no second marker commit 1392ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1120ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 333ms
     ✓ --title-set skips gh entirely 585ms
     ✓ refuses dev and main (exit 21) 370ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1489ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2260ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1444ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3766ms
     ✓ continues only the explicitly recorded target through the public merge command 3064ms
     ✓ fetches the unseen feature head before classifying the base 1455ms
     ✓ fast forwards the feature before either base path is chosen 2273ms
     ✓ merges divergent feature tips without rebasing either side 1359ms
     ✓ continues the feature merge before starting a dev merge 1930ms
     ✓ publishes local code with a CI running head before bookkeeping 4069ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2695ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3102ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1506ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 413ms
     ✓ Path B once dev moved; --head checks a given commit 632ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 826ms
     ✓ --merge-docs merges dev when docs/ is behind 802ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1035ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1646ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1376ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1035ms
     ✓ --merge-docs skips an empty bkit:generate script 839ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1105ms
     ✓ --merge-docs never merges on dev itself 1043ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1853ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 3157ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 3191ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 2453ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 664ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1776ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1895ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2318ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2179ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1812ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2245ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1930ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 2750ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 970ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 517ms
     ✓ refuses --merge-docs with --head, and an unknown --head 309ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 772ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1259ms
     ✓ a failed install stops ship (16) 787ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 534ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 498ms
     ✓ exits 10 when the fetch fails 379ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 305ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1583ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1672ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1455ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 3394ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2707ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4153ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 755ms
     ✓ local: names unpushed dev as the cause when the branch carries it 822ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 680ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1597ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2300ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1325ms
     ✓ uses tree entry equivalence for design and plan land cleanup 7005ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1494ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2108ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1459ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1031ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1890ms
     ✓ land removes the worktree when only the copied .env is untracked 1469ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1314ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1419ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2239ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 4377ms
     ✓ landPr refuses a main-based PR without retrying 817ms
     ✓ landPr refuses when the PR base is unknown 644ms
     ✓ PR not open (closed): stops (17) at once, no retry 789ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 461ms
     ✓ --attempt names the merge round in a fix commit 435ms
     ✓ commits a rewritten and a deleted tracked file 605ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 744ms
     ✓ reports undeclared and runs nothing with no scripts 1401ms
     ✓ reports undeclared and runs nothing with an empty script 572ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 652ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 602ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 365ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own
Error: /Users/christian/.local/share/fnm/node-versions/v24.16.0/installation/bin/node /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs did not finish within 30000 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:131:17

Caused by: Error: spawnSync /Users/christian/.local/share/fnm/node-versions/v24.16.0/installation/bin/node ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:131:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync /Users/christian/.local/share/fnm/node-versions/v24.16.0/installation/bin/node', path: '/Users/christian/.local/share/fnm/node-versions/v24.16.0/installation/bin/node', spawnargs: [ '/Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts > workflow shell fences > every fence parses under bash -n
Error: bash -n /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-fence-syntax-i8j0s8/bkit-ship.md-none-109.sh did not finish within 87 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:90:15
 ❯ syntaxErrors .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:87:17
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:111:12

Caused by: Error: spawnSync bash ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:90:15
 ❯ syntaxErrors .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:87:17
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:111:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync bash', path: 'bash', spawnargs: [ '-n', '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-fence-syntax-i8j0s8/bkit-ship.md-none-109.sh' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts > workflow shell fences > every fence parses under zsh -n
Error: zsh -n /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-fence-syntax-i8j0s8/bkit-plan.md-github-418.sh did not finish within 98 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:90:15
 ❯ syntaxErrors .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:87:17
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:115:12

Caused by: Error: spawnSync zsh ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:90:15
 ❯ syntaxErrors .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:87:17
 ❯ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:115:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync zsh', path: 'zsh', spawnargs: [ '-n', '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-fence-syntax-i8j0s8/bkit-plan.md-github-418.sh' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/commands/ci/push-gate.test.ts > verified incremental push gates > executes the full gate and carries its proof across bookkeeping and empty commits
Error: git -c user.name=Test -c user.email=t@t add -A did not finish within 45 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ git .bkit/core/engine/commands/ci/push-gate.test.ts:18:18
 ❯ commit .bkit/core/engine/commands/ci/push-gate.test.ts:30:3
 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts:199:19

Caused by: Error: spawnSync git ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ git .bkit/core/engine/commands/ci/push-gate.test.ts:18:18
 ❯ commit .bkit/core/engine/commands/ci/push-gate.test.ts:30:3
 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts:199:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync git', path: 'git', spawnargs: [ '-c', 'user.name=Test', '-c', 'user.email=t@t', 'add', '-A' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/commands/ci/push-gate.test.ts > verified incremental push gates > rejects new code, a mixed push, new branches with code, and non-ancestor old heads
Error: git diff --name-only -z --no-renames 4f4cefa355ad85153a50457f37810ac30e69b1a8 e35da8dd2facca4bb590d7862db608571e8d6747 -- docs/plans/*/logs/*/* .bkit/friction.jsonl .bkit/stats.jsonl docs/plans/*/logs/*/*.jsonl docs/*.jsonl .bkit/*.jsonl docs/roadmap.md docs/deferrals.jsonl docs/failures.jsonl docs/knowledge.jsonl docs/decisions.jsonl skills-lock.json .agents/skills/* .claude/skills/* .cursor/skills/* .opencode/skills/* :(glob)docs/*.md :(glob)docs/plans/** :(glob)docs/audits/** did not finish within 412 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ gitRaw .bkit/core/engine/commands/workflow/ledgers.ts:175:15
 ❯ diff .bkit/core/engine/commands/workflow/ledgers.ts:2217:5
 ❯ changedOutside .bkit/core/engine/commands/workflow/ledgers.ts:2231:16
 ❯ minPushOutside .bkit/core/engine/commands/ci/ci.ts:646:16
 ❯ minPushUpdates .bkit/core/engine/commands/ci/ci.ts:750:38
 ❯ Object.minPush [as run] .bkit/core/engine/commands/ci/ci.ts:682:12
 ❯ runCommand .bkit/core/engine/commands/lib.ts:950:29
 ❯ run .bkit/core/engine/commands/ci/push-gate.test.ts:64:24
 ❯ min .bkit/core/engine/commands/ci/push-gate.test.ts:73:3

Caused by: Error: spawnSync git ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ gitRaw .bkit/core/engine/commands/workflow/ledgers.ts:175:15
 ❯ diff .bkit/core/engine/commands/workflow/ledgers.ts:2217:5
 ❯ changedOutside .bkit/core/engine/commands/workflow/ledgers.ts:2231:16
 ❯ minPushOutside .bkit/core/engine/commands/ci/ci.ts:646:16
 ❯ minPushUpdates .bkit/core/engine/commands/ci/ci.ts:750:38
 ❯ Object.minPush [as run] .bkit/core/engine/commands/ci/ci.ts:682:12
 ❯ runCommand .bkit/core/engine/commands/lib.ts:950:29

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync git', path: 'git', spawnargs: [ 'diff', '--name-only', '-z', '--no-renames', '4f4cefa355ad85153a50457f37810ac30e69b1a8', 'e35da8dd2facca4bb590d7862db608571e8d6747', '--', 'docs/plans/*/logs/*/*', '.bkit/friction.jsonl', '.bkit/stats.jsonl', 'docs/plans/*/logs/*/*.jsonl', 'docs/*.jsonl', '.bkit/*.jsonl', 'docs/roadmap.md', 'docs/deferrals.jsonl', 'docs/failures.jsonl', 'docs/knowledge.jsonl', 'docs/decisions.jsonl', 'skills-lock.json', '.agents/skills/*', '.claude/skills/*', '.cursor/skills/*', '.opencode/skills/*', ':(glob)docs/*.md', ':(glob)docs/plans/**', ':(glob)docs/audits/**' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers append --invocation > rejects conflicting attribution and retains legacy writer restrictions
Error: git rev-parse --path-format=absolute --git-common-dir did not finish within 539 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ runGit .bkit/core/engine/commands/lib.ts:988:15
 ❯ git .bkit/core/engine/commands/lib.ts:1006:15
 ❯ outboxRoot .bkit/core/engine/commands/lib.ts:1133:18
 ❯ invocationDir .bkit/core/engine/commands/lib.ts:627:16
 ❯ resolveInvocation .bkit/core/engine/commands/lib.ts:743:15
 ❯ runCommand .bkit/core/engine/commands/lib.ts:935:24
 ❯ run .bkit/core/engine/commands/workflow/ledgers.test.ts:66:22
 ❯ appendWith .bkit/core/engine/commands/workflow/ledgers.test.ts:1841:12
 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:1866:25

Caused by: Error: spawnSync git ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ runGit .bkit/core/engine/commands/lib.ts:988:15
 ❯ git .bkit/core/engine/commands/lib.ts:1006:15
 ❯ outboxRoot .bkit/core/engine/commands/lib.ts:1133:18
 ❯ invocationDir .bkit/core/engine/commands/lib.ts:627:16
 ❯ resolveInvocation .bkit/core/engine/commands/lib.ts:743:15
 ❯ runCommand .bkit/core/engine/commands/lib.ts:935:24
 ❯ run .bkit/core/engine/commands/workflow/ledgers.test.ts:66:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync git', path: 'git', spawnargs: [ 'rev-parse', '--path-format=absolute', '--git-common-dir' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > serializes publication for one target and invocation
AssertionError: expected null not to be null
 ❯ ownedPublication .bkit/core/engine/commands/workflow/locks.test.ts:89:20
     87| }
     88| function ownedPublication(lock: PublicationLock | null): PublicationLo…
     89|   expect(lock).not.toBeNull();
       |                    ^
     90|   if (!lock) throw new Error("expected owned publication lock");
     91|   return lock;
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:100:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > bounds acquisition and preserves unverifiable owners
AssertionError: expected null not to be null
 ❯ ownedPublication .bkit/core/engine/commands/workflow/locks.test.ts:89:20
     87| }
     88| function ownedPublication(lock: PublicationLock | null): PublicationLo…
     89|   expect(lock).not.toBeNull();
       |                    ^
     90|   if (!lock) throw new Error("expected owned publication lock");
     91|   return lock;
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:118:19

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > reclaims only a proven dead matching process identity
TypeError: Cannot read properties of null (reading 'owner')
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:152:17
    150|     expect(child.status).toBe(0);
    151|     const dead: PublicationLock = JSON.parse(child.stdout.trim());
    152|     expect(dead.owner.pid).not.toBe(process.pid);
       |                 ^
    153|     const reclaimed = ownedPublication(await api.acquire(cwd, options)…
    154|     expect(reclaimed).not.toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs revalidate > requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse
Error: git -c user.email=t@t -c user.name=t push -q origin feat/7-x did not finish within 555 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ gitIn .bkit/core/engine/commands/workflow/runs.test.ts:96:3
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:3150:5

Caused by: Error: spawnSync git ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ gitIn .bkit/core/engine/commands/workflow/runs.test.ts:96:3
 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:3150:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync git', path: 'git', spawnargs: [ '-c', 'user.email=t@t', '-c', 'user.name=t', 'push', '-q', 'origin', 'feat/7-x' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > postCommentOnce > invalidates missing corrupt and unsupported progress cache
Error: Test timed out in 6866ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:1904:3
    1902|   });
    1903|
    1904|   it("invalidates missing corrupt and unsupported progress cache", asy…
       |   ^
    1905|     const missing = progressFixture();
    1906|     const corrupt = progressFixture();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  7 failed | 171 passed (178)
      Tests  11 failed | 7746 passed | 2 skipped (7759)
   Start at  13:13:38
   Duration  449.71s (tests 96%, setup 2%, import 1%, transform 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/887-review-doc-starters/run-tests-4.log.reports/vitest-43698.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.46 |    82.21 |   94.47 |   89.95 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.06 |     86.8 |   95.53 |   94.56 |                   
  auth.ts          |   99.04 |    94.94 |     100 |     100 | ...05,215,228,241 
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.71 |    72.47 |     100 |   97.23 | ...05,325,423-424 
  managed.ts       |    81.7 |    87.87 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   93.29 |    90.97 |     100 |   92.81 | ...28,544,557,580 
 .../checks/before |   94.55 |    88.63 |   95.55 |   97.81 |                   
  context-fetch.ts |    98.8 |    91.95 |     100 |     100 | ...17,539,553,600 
  env.ts           |   90.16 |    79.62 |     100 |   91.83 | 176-181,188-196   
  files.ts         |   92.64 |    89.74 |   93.75 |   98.11 | 129               
  index.ts         |      84 |    73.33 |     100 |     100 | ...39,147,155-174 
  mcp.ts           |     100 |    96.96 |     100 |     100 | 81                
  repo.ts          |   93.38 |    93.75 |    87.5 |   93.61 | 194-202           
  version.ts       |   96.87 |    82.35 |     100 |     100 | 18-20,34,61-62    
 engine/commands   |    88.6 |    83.24 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.13 |   96.42 |   94.53 | ...20-823,870-885 
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
 ...mands/workflow |   90.01 |    82.84 |   95.28 |   91.55 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.61 |    83.89 |   98.07 |   97.31 | ...82,387,464,653 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   94.23 |    73.84 |     100 |   93.75 | 47-48,51          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   82.63 |    77.19 |    92.3 |   85.31 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.08 |    88.35 |     100 |   93.07 | ...1454,1470-1471 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |   81.71 |    74.21 |   92.64 |    83.1 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |   88.79 |    81.76 |    92.3 |    90.8 | ...2359,2361,2405 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.82 |     66.4 |   86.66 |   88.27 | ...47,364,395,399 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests-jump.ts    |   94.73 |    68.18 |     100 |     100 | 17-25,34-36       
  tests.ts         |   96.84 |    90.03 |   96.59 |   98.21 | ...2262,2358-2360 
  tracker.ts       |   89.71 |     81.1 |   96.77 |   91.81 | ...2159,2185-2190 
  workflows.ts     |   93.87 |    83.43 |   98.71 |    95.5 | ...1741,1971,2720 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1391,1394-1395 
 engine/install    |   91.18 |    81.74 |   92.93 |   94.32 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.52 |    90.06 |     100 |     100 | ...35,340,346-347 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   52.17 |    31.25 |   33.33 |   58.33 | ...24-159,172-189 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |   89.14 |    80.57 |    87.5 |   92.96 | ...26-346,370,589 
 engine/ledgers    |   95.44 |    91.86 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.71 |    97.7 |   97.92 | 855,881-887,921   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1849,2007,2368 
 engine/render     |   90.63 |    82.85 |   98.36 |   92.74 |                   
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
 engine/tools      |   89.88 |    85.41 |   95.85 |   90.67 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.56 |    85.89 |   96.01 |    91.5 | ...1806-1891,1896 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.46% ( 20928/23657 )
Branches     : 82.21% ( 16250/19765 )
Functions    : 94.47% ( 3352/3548 )
Lines        : 89.95% ( 18357/20406 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 2086 of 4249 lines (147 KB of 321 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
