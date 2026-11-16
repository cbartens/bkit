
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 887-review-doc-starters build-group-gate-4 is waiting for tests (up to 1200s), 1st in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 40046, since 20:10:04), last run took 13m49s

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
 518:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 640:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 782:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 389:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 429:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 500:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

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

[test-timeout-budget] load average 12.5 on 10 cores: unit limits 10750ms per test, 21500ms per hook (x2.15)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 67420ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1127ms
     ✓ names each net-new and worsened finding in the log and the JSON 1424ms
     ✓ fails on a net score rise with no net count change 945ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1202ms
     ✓ treats a net score at or below 0.001 as float noise 1610ms
     ✓ passes when the change only resolves findings 1195ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 836ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 486ms
     ✓ skips (exit 0) when the base resolves to HEAD 578ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2076ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1143ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 405ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 947ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1288ms
     ✓ exits 4 on a dropped net field instead of silently passing 1043ms
     ✓ exits 4 on no summary instead of silently passing 1034ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1193ms
     ✓ exits 5 when the base worktree cannot be created 545ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1279ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1687ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2334ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2300ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2016ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2451ms
   ✓ bkit ci prose — file selection (7)
     ✓ does not follow a directory symlink replacing tracked prose 481ms
     ✓ defaults to every markdown file outside node_modules 316ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 875ms
     ✓ explicit globs can select ignored prose and nested checkout files 916ms
     ✓ fails closed when the git index cannot be read 435ms
     ✓ fails closed when a selected prose source cannot be read 386ms
     ✓ fails when vale is not installed 323ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 564ms
     ✓ fails (exit 1) when vale reports alerts 601ms
     ✓ exits 6 on a vale runtime error 770ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 851ms
     ✓ falls back to vale sync when the main worktree has none 703ms
     ✓ fails when vale sync cannot restore the required styles 579ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 773ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 618ms
     ✓ is a usage error when the commit cannot be read 425ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 708ms
     ✓ exits 1 naming the code file, whatever the commit message says 627ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 791ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 529ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1235ms
     ✓ exits 7 when a commit cannot be read 453ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 1112ms
     ✓ exits 1 naming the files outside, whatever the commit message says 733ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1155ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 670ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 546ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1771ms
     ✓ a top-level glob in the setting does not reach into folders 823ms
     ✓ a push that changes no files is not proven a min push 560ms
     ✓ exits 7 when a commit or its base cannot be read 660ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 617ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 987ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 798ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 774ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 1136ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 1059ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 1498ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 1246ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 1159ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 1021ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 1201ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 1002ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 938ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 67038ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1035ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 826ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1036ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 997ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 595ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 587ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 698ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 938ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1427ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 938ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 657ms
     ✓ PASS is 0 failures with or without reports 897ms
     ✓ clears a previous attempt's reports before the gate runs 697ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 757ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1263ms
     ✓ a log under the outbox is named main-checkout relative in the record 950ms
     ✓ a log small enough is copied whole: not clamped, raw null 1113ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 709ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1020ms
     ✓ numbers runs within the workflow's active run and per step 1006ms
     ✓ without --file no row is written and the output carries row null 626ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 398ms
     ✓ plan-check refuses DEPENDS ON a later group 313ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 439ms
     ✓ plan-check follows bkit.workflows.tasks 313ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1889ms
     ✓ a planned test that passes is a vacuous gap, exit 1 805ms
     ✓ a planned test absent from a loaded report is a missing gap 1025ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1253ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1049ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 512ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1757ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 803ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 913ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1613ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1142ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1835ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1043ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1327ms
     ✓ green: a passed-accepted test is already landed, not a gap 1346ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1054ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 354ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 895ms
     ✓ green: --group audits only that group's tasks 909ms
     ✓ green: --group naming a group with no tasks is refused 530ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1339ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1706ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1625ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1905ms
     ✓ green: lists each gap kind, with the runner output 1365ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2610ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 716ms
       ✓ green clears an exception-only task from a human commit 691ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 72090ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 484ms
     ✓ adopts the main checkout even when called from a linked worktree 511ms
     ✓ design refuses to work in place on dev 345ms
     ✓ plan refuses to work in place on dev 335ms
     ✓ build refuses to work in place on dev 313ms
     ✓ design and plan in place on main are refused 520ms
     ✓ still adopts a cloud session branch whose upstream is main 458ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1571ms
     ✓ may debug in place on dev 793ms
     ✓ adopts in place when the session is already on feat/{fid} 550ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2764ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1657ms
     ✓ a new run of the same FID rewrites startSha 2014ms
     ✓ a resume of the same FID reuses the record 2189ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1410ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1870ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1920ms
     ✓ a stale record without a lock is replaced 2084ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1722ms
     ✓ refuses inherited unpublished dev commits in every ship mode 6213ms
     ✓ names inherited commits and ship recovery in the refusal 1918ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2041ms
     ✓ ship names a missing feat branch 700ms
     ✓ refuses dev / main as the ship branch 306ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 2073ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 613ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 515ms
     ✓ fails with a fetch error when there is no origin to rebase onto 632ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 554ms
       ✓ checks no disk when there are no cleanup step files 556ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 799ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 673ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 509ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 442ms
     ✓ never commits an entry only the main checkout's copy list names 569ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 718ms
   ✓ bkit worktrees remove (18)
     ✓ answers absent when there is no worktree 336ms
     ✓ leaves a worktree without the marker in place 417ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 765ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 397ms
     ✓ tells a caller inside the removed worktree where to cd 514ms
     ✓ fails with its own exit code when git cannot remove a marked path 394ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 2121ms
       ✓ preserves staged-only mode during landed cleanup 1723ms
       ✓ preserves staged-only type during landed cleanup 1949ms
       ✓ preserves staged-only deletion during landed cleanup 1738ms
       ✓ removes landed staged content when both index and working contents are on dev 3071ms
       ✓ deletes the proved local and remote branch at their landed tips 2876ms
       ✓ retains the remote branch when origin refuses its conditional deletion 3271ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 713ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 775ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 410ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 643ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1449ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1751ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 80680ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 1123ms
     ✓ finishes a CI round only with its own failed job count 879ms
   ✓ progress command output (4)
     ✓ done prints progressLine 321ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 640ms
     ✓ done --group writes group on the row 515ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 827ms
     ✓ build-group-start records parentSha and group 304ms
     ✓ carries extra fields, parsed as JSON when they are JSON 496ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 343ms
     ✓ reports a failed commit with exit 8 without writing the row 1165ms
     ✓ a failed commit leaves no row staged in the index 1435ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1545ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1217ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1320ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1010ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1244ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 696ms
     ✓ --ref reads the status file as committed on that ref, not from disk 799ms
     ✓ --ref exits 3 when the ref does not carry the status file 602ms
     ✓ fails on a placeholder left in the artifact 609ms
     ✓ fails when the row's verdict differs from the artifact's 603ms
     ✓ fails when the row does not list the artifact, or carries another attempt 682ms
     ✓ fails on a missing artifact 562ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 590ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 335ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 413ms
     ✓ fails a run-tests row missing its scope, and an empty scope 692ms
     ✓ names every missing field at once 358ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 976ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 325ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 321ms
     ✓ records the header's Strategy on the row 456ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 311ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 887ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 945ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1141ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1396ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 975ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1500ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1874ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1106ms
     ✓ --post needs --number; without --post there is no tracker key 378ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 321ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 505ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1106ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 697ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 983ms
       ✓ gate --issue without --fid is a usage error 317ms
       ✓ gate --issue="" under none keeps today's check 335ms
     ✓ --attempt-of checks the row carries the derived counter 526ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1328ms
     ✓ writeStepRow refuses when a recorded path changed 2293ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 873ms
     ✓ writeStepRow appends its commit sha to the record 1456ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2449ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 606ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1813ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1964ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 1727ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 877ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 2334ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1327ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 946ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 1170ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 2387ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 380ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 669ms
     ✓ does not count an artifact the run found committed when it started 1252ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 554ms
     ✓ commits a package.json change outside bkit.workflows 833ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1900ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 721ms
     ✓ renders and verifies the header of every prompt that declares one 441ms
     ✓ refuses line breaks in header-bound result values 485ms
     ✓ reads held audit keys from the linked worktree's own ledger 327ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 105048ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2728ms
     ✓ runs code.ts through its declared gate in the built checkout 2492ms
     ✓ runs code.ts through its declared gate in the built checkout 2612ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 3403ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2956ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2200ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 2020ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2784ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1388ms
     ✓ runs the full gate for replayed debug code 2686ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2904ms
     ✓ installs local dependencies against the built target tree 3547ms
     ✓ runs the configured frozen install even without root dependencies 3868ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 3170ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 3067ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2991ms
     ✓ never pushes local dev commits missing from origin/dev 3332ms
     ✓ dev moved: rebuilds on the new dev and pushes again 5333ms
     ✓ dev moved before every push: exhausted, nothing landed 10505ms
     ✓ any other refusal is returned, not retried 3551ms
     ✓ pushToDev replays a commit range onto origin/dev 4208ms
     ✓ a replay retries on the new dev when dev moved 6173ms
     ✓ pushToDev log line names what it lands 2987ms
     ✓ runs no git hooks in the throwaway checkout, and says so 3575ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 3669ms
     ✓ a push that fails without a server answer is returned once, never retried 3305ms
     ✓ a failed fetch is returned before anything is built 1467ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 4349ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2337ms
     ✓ lands from a clone whose fetch refspec omits dev 3640ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1762ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 52826ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 1010ms
     ✓ continues after friction and diagnostic writes fail without recursion 658ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 1208ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 4535ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 677ms
     ✓ starts only new source after overflow or missing source 663ms
     ✓ uses exact new comment after a failed eligibility read 403ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 349ms
     ✓ recognizes append success within budget without unnecessary resend 365ms
     ✓ preserves a human correction after lost append recognition and a later report 634ms
     ✓ contains exhausted append and create failures without fabricated success 1010ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 586ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 378ms
     ✓ reserves new comment opportunity within total delivery budget 1299ms
     ✓ contains preparation state lock and reconciliation exceptions 351ms
     ✓ attempts independent attention after routine uncertainty 605ms
     ✓ seals an acknowledged segment after a postflight intervening comment 799ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 512ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 487ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 594ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 505ms
     ✓ fetches the issue and its comments as GitHub returns them 606ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1195ms
     ✓ invalidates missing corrupt and unsupported progress cache 1729ms
     ✓ contains cache read and write failures as standalone degradation 812ms
     ✓ uses legacy receipts and contains receipt failures 964ms
     ✓ skips issue-less runs and tracker none 377ms
     ✓ records an engine-action row and skips the same key + body on a re-run 790ms
     ✓ a recent identical comment counts as done (the final close comment) 620ms
     ✓ a failed post reports done false with the reason and never leaks a token 565ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 711ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 762ms
     ✓ a different marker hash posts 673ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 548ms
[feat/test c3386d5] gate
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 52788ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 577ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1036ms
     ✓ retries a failed create once, and exits 5 when it fails twice 799ms
     ✓ exits 5 when the open-PR probe errors 506ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 653ms
     ✓ prs open refuses --base=main 312ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 581ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 648ms
     ✓ exits 4 when gh errors and 80 when it needs auth 646ms
   ✓ bkit prs scan-body (10)
     ✓ flags [no ci] in the landed commit body (exit 1) 318ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 306ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 555ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 334ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 477ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 439ms
     ✓ runs no merge when the PR is already MERGED 510ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 702ms
     ✓ prs merge refuses a PR whose base is main 643ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 665ms
     ✓ prs merge refuses when the PR base is unknown 569ms
     ✓ prs merge reads the base from the one pr view it already makes 457ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 462ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 571ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1099ms
     ✓ exits 2 on a bad --number 369ms
     ✓ never reads dev's required checks without --only-if-required 721ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 402ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 498ms
     ✓ is not green when a check failed, naming it (exit 1) 457ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 584ms
     ✓ is not green on an empty rollup (total 0) 628ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 416ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1109ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 592ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 935ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 615ms
     ✓ staging failure: exit 4 and no commit is created, no false success 528ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 504ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 478ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 579ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 412ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1689ms
> [bkit] TRUNCATED HERE — 66 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 52438ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 5393ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 6016ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 788ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 679ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 590ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4965ms
     ✓ does not fall back through a malformed later success receipt 3316ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1658ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 2073ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 3000ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 4130ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 890ms
     ✓ does not record a committed tree 1072ms
     ✓ records no proof for a failed gate or lighter gate 2149ms
     ✓ requires integration proof when integration is declared 1861ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 4198ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 4318ms
     ✓ saves the failed job count without the capstone job 962ms
     ✓ counts the capstone job when it is the only failed job 910ms
     ✓ saves no failed job count when no job failed 954ms
     ✓ counts fallback evidence jobs without the capstone job 332ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 465ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1292ms
     ✓ freezes explicit workflow run attempt and all failed job pages 790ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2898ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2825ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2854ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 4143ms
     ✓ checks the named repository base and fails closed on missing evidence 1986ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1705ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 2007ms
     ✓ rejects MCP capstone jobs belonging to another run 2401ms
     ✓ --fetch refreshes origin/<branch> before gating 1027ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 496ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 340ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 321ms
     ✓ tells an API error (20) from no run (10) 542ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 380ms
     ✓ config (5)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1002ms
       ✓ a source change past the validated head refuses (17) and names the path 1395ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1781ms
       ✓ --validated without --month / --fid is a usage error (2) 1042ms
       ✓ a validated sha that is not an ancestor refuses (17) 1118ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 773ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2194ms
     ✓ a failed re-trigger push names the cause in the log 2245ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2033ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3178ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2079ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 769ms
     ✓ gh-error: every poll errored 844ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1995ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1700ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 2357ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1878ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 5025ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 5071ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1611ms
     ✓ re-trigger on dev only uses the record of its own FID 2126ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1512ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 404ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 743ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 624ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 788ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 894ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1334ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1693ms
     ✓ --file and --step go together 1171ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 707ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 629ms
     ✓ gh not on PATH -> exit 127, 'gh not found on PATH' 516ms
   ✓ bkit runtime detect — worktree path and contract (5)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 690ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1240ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1104ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 799ms
     ✓ --file into a missing directory is refused, not created 1359ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 650ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 842ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1648ms
     ✓ reports excluded intervals as unread even when pagination finishes 748ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1082ms
     ✓ reports an unread remainder at the page cap 935ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 728ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 540ms
     ✓ rejects missing summaries instead of treating them as empty results 858ms
     ✓ reports a failed first page as unavailable 709ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 549ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1490ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1757ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1040ms
     ✓ reports excluded intervals as unread even when pagination finishes 1205ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1988ms
     ✓ reports an unread remainder at the page cap 602ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1278ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 547ms
     ✓ rejects missing summaries instead of treating them as empty results 1156ms
     ✓ reports a failed first page as unavailable 1087ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 594ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 54141ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1583ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 757ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2208ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1168ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 819ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 814ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1217ms
     ✓ an unpinned repo reports nulls and asks no registry 691ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 389ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 509ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 597ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 511ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 414ms
     ✓ resolves config from the repo root when run from a subdirectory 356ms
     ✓ exits 6 when the PUT fails 543ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 611ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 560ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 482ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 436ms
     ✓ exits 6 when the api answer is not JSON 431ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 43417ms
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 420ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 670ms
     ✓ 6. a FID that fails the format check exits 1 348ms
     ✓ a missing title or prompt file exits 7 302ms
   ✓ bkit fids design --description-file --prompt-file (5)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 22441ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 406ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 552ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 401ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 361ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ posts the printed body; an identical recent comment is not posted twice 526ms
     ✓ renders audit comments from validated result and preserves tracker adapters 989ms
     ✓ a failed post exits 0 with done false and the reason 480ms
     ✓ prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback 420ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 461ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1192ms
     ✓ counts files committed since --base 1715ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 844ms
     ✓ runs nothing and exits 0 when no file changed 414ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1132ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 2515ms
     ✓ keeps each context's own section banner and drops every other context's 4936ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 643ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 462ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 371ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1237ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3453ms
     ✓ a refused dev push is logged, never fails the close 4079ms
     ✓ an unreachable remote is logged, never fails the close 1425ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 25213ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (38 tests) 8638ms
   ✓ bkit challenge merge (32)
     ✓ leaves the plan unchanged when plan-check fails 426ms
     ✓ routes unfixable HIGH to pause 313ms
     ✓ a finding whose round-1 task is ticked done but comes back in round 2 gets a new task 316ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 375ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 312ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 1241ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1514ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 553ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 11497ms
   ✓ --json on every registered command (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 387ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1411ms
     ✓ runGit names ENOBUFS when output passes the limit 3014ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 3557ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1326ms
     ✓ passes every rule on a clean head 564ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 507ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (49 tests) 5523ms
   ✓ bkit decisions compose (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ --month is used as given 822ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 398ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 440ms
   ✓ bkit locks acquire --kind=workflow — ship (1)
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 365ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 366ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 443ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 476ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (89 tests) 1793ms
   ✓ .bkit/templates/context/ (89)
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
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
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1556ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 376ms
     ✓ limits execSync and execFileSync the same way 627ms
     ✓ stops a child that ignores SIGTERM at the remaining time 307ms
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
> [bkit] TRUNCATED HERE — 286 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 913ms
   ✓ readChangelogVersionDelta (5)
     ✓ resolves CHANGELOG.md from the built dist/ layout 323ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 736ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 1222ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 952ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 435ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (275 tests) 1028ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (55 tests) 253ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 761ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 425ms
(node:54533) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:54533) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1219ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 703ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 625ms
   ✓ this repo adopts its own templates (79)
     ✓ .github/workflows/bkit-cloud.yml 371ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 1133ms
   ✓ rendered workflow comment contracts (7)
     ✓ renders nonfatal comment fallback friction and attempted delivery gates 359ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 969ms
   ✓ bkit completeness check (6)
     ✓ always exits 0 on a holey run 384ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 373ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1772ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1724ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 310ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 461ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 547ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 341ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 414ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 168ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (34 tests) 124ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 122ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 344ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-0d38Dm/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 166ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 259ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 224ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 397ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 323ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 451ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 408ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 73ms
 ✓ .bkit/core/engine/render/trackers.test.ts (107 tests) 875ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 285ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 411ms
(node:57881) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:57881) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:57881) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:57881) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 295ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 175ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 123ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-K0x0ao/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 226ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 361ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 208ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (69 tests) 242ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 283ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 52ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 92ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 73ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 163ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 174ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 231ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 124ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 151ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 209ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 126ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 77ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 67ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 86ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 43ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 257ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 139ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 238ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794652213741.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794652213747.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794652213750.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794652213770.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 52ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 105ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 292ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 296ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 250ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 184ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 255ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 229ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 79ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 56ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 88ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 54ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 57ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 71ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 101ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 64ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 18ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 74ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 46ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 76ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 51ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 73ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 54ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 159ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 92ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 54ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 75ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 33ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 104ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 41ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 67ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 23ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 163ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 75ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 29ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 54ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 13ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 14ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 256428ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 724ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2160ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 483ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 383ms
     ✓ writes no limits for a workflow with no ask point 445ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 401ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 448ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 694ms
       ✓ a new run in the same chat gets its own session row 496ms
       ✓ writes none outside Claude Code 566ms
     ✓ opens the next run after a finished one, and after another workflow's run 517ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 522ms
     ✓ design / plan / build / debug book in the current worktree 667ms
     ✓ refuses when the lock is live, writing no row 388ms
     ✓ --lock-held checks the lock is ours 1417ms
     ✓ rejects an unknown workflow 519ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 856ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 737ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a new run has no last step and no open decision 411ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 395ms
     ✓ an OPEN decision of an earlier run never resurfaces 352ms
     ✓ an OPEN decision mid-build prints its header fields 339ms
     ✓ openDecision carries the Gate header 399ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 388ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 946ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 413ms
     ✓ openDecision gate is null without the header 346ms
     ✓ openDecision gate ignores a Gate line below the header 419ms
     ✓ reads Test attempt from a tests pause 410ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 502ms
     ✓ writes no row when status.jsonl does not exist 527ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 623ms
     ✓ aborts a rebase only when one is in progress 1284ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1055ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1000ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 707ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 846ms
     ✓ --max-exceeded says a handover is due without any sentinel 496ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 495ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 745ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 677ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 357ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 307ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 428ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 340ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 356ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 378ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 688ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 951ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 442ms
     ✓ bkit workflows fail treats an empty --next-step as absent 473ms
     ✓ a debug run in SOAK mode always needs a handover 673ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 2308ms
       ✓ counts subagents of an earlier chat the run's session rows name 1586ms
       ✓ records no context block, and still closes, outside a Claude Code session 1584ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1430ms
     ✓ records ending held and publish false on the workflow-done row 1558ms
     ✓ defaults the close row to ending done 1440ms
     ✓ refuses an unknown ending 433ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1423ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1361ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1678ms
     ✓ always writes the telemetry, whatever the runtime 1178ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 908ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1126ms
     ✓ an unwritable stats path is logged and never fails the close 1711ms
     ✓ appends the completeness row before the workflow-done row 1296ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1204ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1617ms
     ✓ writes one completeness row per close 3103ms
     ✓ leaves out the previous run's rows that share a second with this run's start 2054ms
     ✓ still closes when the completeness check throws 2085ms
     ✓ still closes when the completeness row write throws 1891ms
     ✓ refuses without status.jsonl and writes nothing 372ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1327ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2604ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1871ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1358ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 2140ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1853ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2519ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1480ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 2200ms
     ✓ --record-step writes the close step's row before workflow-done 1241ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1216ms
     ✓ --number without --outbox is a usage error 1724ms
     ✓ --flush is ship only 512ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1680ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 2045ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 2120ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 2112ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1336ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 684ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 582ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3855ms
     ✓ --flush with nothing to record commits and pushes nothing 2727ms
     ✓ --flush carries the named worktree's logs into the dev commit 4231ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4673ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 4903ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 5638ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 4103ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5410ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 5160ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 5105ms
     ✓ --push on dev never carries a row whose references name another feature 4765ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 4350ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 8639ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4412ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1945ms
     ✓ rejects --push with --flush, and --flush outside ship 375ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 5880ms
     ✓ preserves unlanded file deletions and ledger additions on close 11077ms
     ✓ preserves dirty work and uncertain branch evidence during close 10147ms
     ✓ preserves a local feature ref changed after its cleanup proof 8952ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 5353ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3433ms
     ✓ a close that landed releases the lock 3019ms
     ✓ removes the worktree before it releases the lock 2347ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3908ms
       ✓ closePr refuses when the PR base is unknown 2962ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1689ms
   ✓ bkit workflows promote (7)
     ✓ exits 12 when there is no versioned draft 358ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 390ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1239ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 443ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 3501ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1845ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 1805ms
     ✓ a second run's record does not let this FID's close commit 1697ms
     ✓ record is present after workflows close and before the push 1982ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3992ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 347ms
     ✓ a run with no issue holds the prompt alone 344ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 865ms
     ✓ --plan is appended when the file exists and skipped when it does not 526ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 684ms
     ✓ a missing prompt file exits 13 317ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1121ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 891ms
     ✓ puts each --line after the summary, in flag order 931ms
     ✓ --summary prints the file and keeps a copy in --outbox 927ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1077ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 343ms
     ✓ a folder outside the outbox sessions folder is kept 356ms
     ✓ without --session-dir prints no sessionRemoved 306ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 372309ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1122ms
     ✓ rejects missing explicit and ambiguous existing branch selections 850ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1388ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1224ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 835ms
     ✓ a refused --continue carries git's own reason 1087ms
     ✓ --file records nothing for a refused rebase 958ms
     ✓ refuses a code conflict and aborts the rebase on the spot 981ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2063ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1403ms
     ✓ produces byte-identical output to merge=union 1885ms
     ✓ restores a trailing newline so the next append starts on its own line 1146ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1381ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1565ms
     ✓ refuses a union that leaves a line which is not JSON 1032ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1577ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1718ms
     ✓ refuses a lockfile whose regenerate command fails 1506ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2052ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1860ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 2231ms
     ✓ refuses and aborts when both sides changed the hand-written region 1195ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1620ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 2164ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 2262ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1324ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1587ms
     ✓ refuses and aborts when a side deleted the install record 1286ms
     ✓ refuses a conflicted doc the repo's script does not list 987ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 987ms
     ✓ removes a stale sentinel when the rebase succeeds 1361ms
     ✓ exits 4 when no rebase is in progress 468ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2180ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1430ms
   ✓ branches anchor-stamp (19)
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 471ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 984ms
       ✓ skips (12) with no anchor 897ms
       ✓ skips (12) when the base is unreachable in this clone 902ms
       ✓ skips (12) when nothing landed since the base 844ms
       ✓ runs (0) with the landed path count once dev moved 1965ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 989ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 2881ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1469ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1922ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2581ms
     ✓ runs exactly one git push 1693ms
     ✓ --set-upstream records the upstream 1742ms
     ✓ refuses with no branch checked out 1254ms
     ✓ --mode=dev refuses a feature checkout 1122ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2759ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 4446ms
     ✓ --require-ci pushes as-is when dev has not moved 1548ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3361ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4805ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1365ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1900ms
     ✓ --mode=abort pushes when the branch has no open PR 1600ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1452ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1146ms
     ✓ --open-pr carries the MCP answer and skips gh 1254ms
     ✓ --mode=abort on dev pushes plainly without probing 1233ms
     ✓ rejects an unknown mode 1137ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4715ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2256ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2983ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6527ms
     ✓ skip-ci HEAD on the replay is refused 1985ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 4655ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4768ms
     ✓ a level local dev is a plain push, recording nothing extra 2819ms
     ✓ a record with no commits pushes nothing 1284ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 909ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2615ms
     ✓ a rewritten branch is refused, never forced 1572ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1751ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2474ms
     ✓ refuses a detached HEAD (exit 5) 1258ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2702ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2738ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1824ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 3143ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1013ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3001ms
     ✓ an up-to-date branch is a no-op 1873ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2841ms
     ✓ a fetch that fails exits 10 934ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1389ms
     ✓ scan-diff still reports a new skip when its test … 1539ms
     ✓ scan-diff reports a skip moved onto a different t… 1495ms
     ✓ scan-diff does not cancel a skip moved between am… 1225ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1681ms
     ✓ scan-diff recognizes a renamed test file 1760ms
     ✓ scan-diff recognizes a suite moved into a differe… 1412ms
     ✓ scan-diff does not let unrelated additions hide a… 1557ms
     ✓ scan-diff attributes deletion to its old test ins… 1555ms
     ✓ scan-diff consumes each moved assertion once and … 1332ms
     ✓ scan-diff does not match identical assertions fro… 1410ms
     ✓ scan-diff does not match the same leaf test name … 1866ms
     ✓ scan-diff does not match a same-named test with d… 1452ms
     ✓ scan-diff does not match a same-named test with c… 1625ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1478ms
     ✓ --paths with no match exits 1 1114ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 845ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 2513ms
     ✓ --marker reads a diff over 1 MiB 1487ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1863ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1197ms
     ✓ scan-diff finds an added skip 1312ms
     ✓ scan-diff ignores a skip predating the base 1583ms
     ✓ scan-diff reports a disabled test with its line 1247ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1299ms
     ✓ scan-diff ignores a removed comment in a test file 1396ms
     ✓ scan-diff ignores an assertion moved within the file 1036ms
     ✓ scan-diff still reports a removed assertion 1049ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1522ms
     ✓ scan-diff finds an added pytest mark skip 1272ms
     ✓ scan-diff finds an added unittest skip 933ms
     ✓ scan-diff finds an added bare skip call 1700ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1320ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1045ms
     ✓ scan-diff ignores an assertion whose expectation changed 885ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1391ms
     ✓ scan-diff reports a deleted test file 1001ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 490ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1540ms
     ✓ a title that already carries the marker is left alone 911ms
     ✓ with no open PR: pushes the marker commit and edits no title 1235ms
     ✓ a re-run is deduped: no second marker commit 1636ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1725ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 731ms
     ✓ --title-set skips gh entirely 761ms
     ✓ refuses dev and main (exit 21) 427ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 2277ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2870ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 2109ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 9925ms
     ✓ continues only the explicitly recorded target through the public merge command 4606ms
     ✓ fetches the unseen feature head before classifying the base 3166ms
     ✓ fast forwards the feature before either base path is chosen 5171ms
     ✓ merges divergent feature tips without rebasing either side 3450ms
     ✓ continues the feature merge before starting a dev merge 3168ms
     ✓ publishes local code with a CI running head before bookkeeping 3281ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5437ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3491ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2057ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 591ms
     ✓ Path B once dev moved; --head checks a given commit 931ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1062ms
     ✓ --merge-docs merges dev when docs/ is behind 1049ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1025ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1557ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1552ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1242ms
     ✓ --merge-docs skips an empty bkit:generate script 1064ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1001ms
     ✓ --merge-docs never merges on dev itself 989ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1353ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1419ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1379ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1229ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 625ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1333ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1582ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1993ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1259ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1191ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1621ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1332ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1247ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 806ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 579ms
     ✓ exits 10 when the fetch fails 352ms
     ✓ refuses --merge-docs with --head, and an unknown --head 440ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 797ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1112ms
     ✓ a failed install stops ship (16) 941ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1072ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 720ms
     ✓ exits 10 when the fetch fails 597ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 396ms
     ✓ preserves unlanded file type changes in the shared landed comparison 378ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 436ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1967ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1976ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1847ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2057ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3751ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4764ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 672ms
     ✓ local: names unpushed dev as the cause when the branch carries it 822ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 892ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2093ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2053ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1460ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6537ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1910ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1630ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1517ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 938ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2521ms
     ✓ land removes the worktree when only the copied .env is untracked 2344ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1820ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2033ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2985ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1948ms
     ✓ landPr refuses a main-based PR without retrying 681ms
     ✓ landPr refuses when the PR base is unknown 730ms
     ✓ PR not open (closed): stops (17) at once, no retry 939ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 860ms
     ✓ --attempt names the merge round in a fix commit 758ms
     ✓ commits a rewritten and a deleted tracked file 709ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 633ms
     ✓ reports undeclared and runs nothing with no scripts 559ms
     ✓ reports undeclared and runs nothing with an empty script 414ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 572ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 676ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 522ms

 Test Files  178 passed (178)
      Tests  7742 passed | 2 skipped (7744)
   Start at  20:26:44
   Duration  374.23s (tests 96%, import 2%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/887-review-doc-starters/build-group-gate-4-1.log.reports/vitest-81149.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.55 |    82.32 |    94.5 |   90.04 |                   
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
 engine/commands   |    88.6 |    83.37 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.38 |   96.42 |   94.53 | ...20-823,870-885 
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
 ...mands/workflow |   90.15 |       83 |   95.33 |   91.69 |                   
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
  locks.ts         |   94.01 |    89.47 |   96.15 |    95.8 | ...96-198,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.08 |    88.35 |     100 |   93.07 | ...1454,1470-1471 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.49 |   92.64 |   83.42 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |    88.9 |    81.86 |    92.3 |    90.8 | ...2359,2361,2405 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.82 |     66.4 |   86.66 |   88.27 | ...47,364,395,399 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests-jump.ts    |   94.73 |    68.18 |     100 |     100 | 17-25,34-36       
  tests.ts         |   96.84 |    90.03 |   96.59 |   98.21 | ...2262,2358-2360 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
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
Statements   : 88.55% ( 20950/23657 )
Branches     : 82.32% ( 16271/19765 )
Functions    : 94.5% ( 3353/3548 )
Lines        : 90.04% ( 18374/20406 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 382 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 363 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 345 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 350 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 332 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 351 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 166 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 340 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 344 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 335 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 335 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 341 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 391 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 349 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1181 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 907 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 45 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 38 ms
ok 19 stub: the response selector is cleared before running its body # in 30 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 36 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 45 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 35 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 28 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 36 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 27 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 62 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 85 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 801 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 591 ms
ok 30 refresh drops a file deleted in the index from the build # in 549 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 469 ms
ok 32 a key removed from the env file is unset on the next run # in 327 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 251 ms
ok 34 non-BKIT_ keys are skipped # in 250 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 265 ms
ok 36 a failed unsetenv is retried on the next run # in 317 ms
ok 37 logs key names only, never values # in 237 ms
ok 38 missing env file exits 0 without calling launchctl # in 48 ms
ok 39 the sweep prints the summary line the lane greps for # in 534 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 18 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (152.645375ms)
✔ shell cancellation waits for SIGTERM cleanup (216.315083ms)
✔ direct cancellation waits for SIGINT cleanup (150.644666ms)
✔ shell cancellation waits for SIGINT cleanup (238.867417ms)
✔ direct cancellation waits for SIGHUP cleanup (153.022542ms)
✔ shell cancellation waits for SIGHUP cleanup (215.560625ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (469.332958ms)
✔ shell cancellation follows a worker orphaned by a nested shell (290.442917ms)
✔ direct cancellation preserves a nested machine-lock owner (649.598458ms)
✔ shell cancellation preserves a nested machine-lock owner (687.656291ms)
✔ nested shell cancellation preserves a nested machine-lock owner (696.24725ms)
✔ a hard process-group timeout reaches a shell command during cleanup (133.642583ms)
✔ ships a command-scoped sleep prevention wrapper (0.169625ms)
✔ preserves arguments, output and nonzero exit status (103.028125ms)
✔ runs an entire shell chain and retains its failure (61.109584ms)
✔ reports a missing command as 127 (53.157375ms)
✔ requires a command (50.337625ms)
✔ non-macOS platform selection runs commands without sleep prevention (79.559416ms)
✔ hard timeout escalation reaches a command that ignores TERM (191.481125ms)
✔ forwards POSIX cancellation to the command and releases the assertion (91.43025ms)
✔ holds a real macOS assertion only while the command runs (165.246167ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4910.674042
> [bkit] TRUNCATED — kept 1890 of 3763 lines (135 KB of 289 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
