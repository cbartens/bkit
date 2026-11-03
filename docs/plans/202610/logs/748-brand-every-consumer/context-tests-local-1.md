
> @cbartens/bkit@6.0.0 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm bkit:gate:static-unit && pnpm test:integration


> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/168 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 132:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 350:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 358:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 154:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 223:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 377:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 149:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 175:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 182:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 446:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 822:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 481:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 601:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 674:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 133:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 159:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 600:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 822:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 991:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1093:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1254:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1312:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 123:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 361:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 401:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 472:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 361:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 401:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 472:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 46 warnings and 0 suggestions in 149 files.
passed: true
skipped: null
files: 149

> @cbartens/bkit@6.0.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> bkit ci slop

[bkit-ci] base 9fe3aaf590bf743321b7d6671880959e4b3ec94f (9fe3aaf590bf743321b7d6671880959e4b3ec94f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 9fe3aaf590bf743321b7d6671880959e4b3ec94f
base: 9fe3aaf590bf743321b7d6671880959e4b3ec94f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 63.9 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (135 tests) 64344ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 446ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 462ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 424ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 502ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 421ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 432ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 654ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 604ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 742ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 438ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 600ms
     ✓ PASS is 0 failures with or without reports 535ms
     ✓ clears a previous attempt's reports before the gate runs 462ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 504ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 649ms
     ✓ a log under the outbox is named main-checkout relative in the record 696ms
     ✓ a log small enough is copied whole: not clamped, raw null 723ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 400ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 579ms
     ✓ numbers runs within the workflow's active run and per step 1082ms
     ✓ without --file no row is written and the output carries row null 827ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 421ms
     ✓ plan-check refuses DEPENDS ON a later group 387ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 417ms
     ✓ plan-check matches a Markdown heading symbol 442ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 342ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 375ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 335ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 692ms
     ✓ plan-check refuses an unmapped matrix row 407ms
     ✓ plan-check refuses a delete with no supersession row 741ms
     ✓ plan-check refuses a matrix row mapped to two tasks 629ms
     ✓ plan-check refuses a task no matrix row maps to 310ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 615ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 314ms
     ✓ plan-check refuses a Task cell naming an undefined task 451ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 595ms
     ✓ plan-check refuses a group with 6 tasks 303ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 318ms
     ✓ plan-check report lists groups, not a verdict 306ms
     ✓ plan-check follows bkit.workflows.tasks 420ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 518ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1037ms
     ✓ a planned test that passes is a vacuous gap, exit 1 877ms
     ✓ a planned test absent from a loaded report is a missing gap 811ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1736ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1594ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 1136ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1369ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 898ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1118ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 633ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1931ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1287ms
       ✓ a later unproven result never replaces a proven red of the same lines 443ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1677ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1670ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 952ms
     ✓ green: a passed-accepted test is already landed, not a gap 1040ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 930ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 494ms
     ✓ green refuses a plan with no task markers 744ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 993ms
     ✓ green: --group audits only that group's tasks 761ms
     ✓ green: --group naming a group with no tasks is refused 528ms
     ✓ green: a code fence never closed is the reason, not missing task markers 397ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1016ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1080ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 944ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 926ms
     ✓ green: lists each gap kind, with the runner output 834ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2478ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1480ms
       ✓ green clears an exception-only task from a human commit 967ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 76222ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1681ms
     ✓ names each net-new and worsened finding in the log and the JSON 1775ms
     ✓ fails on a net score rise with no net count change 1445ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1635ms
     ✓ treats a net score at or below 0.001 as float noise 1408ms
     ✓ passes when the change only resolves findings 1483ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1577ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 742ms
     ✓ skips (exit 0) when the base resolves to HEAD 885ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2737ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1381ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 694ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1431ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1465ms
     ✓ exits 4 on a dropped net field instead of silently passing 1663ms
     ✓ exits 4 on no summary instead of silently passing 2132ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1712ms
     ✓ exits 5 when the base worktree cannot be created 986ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1611ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 3743ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2923ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2483ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2960ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 3596ms
   ✓ bkit ci prose — file selection (3)
     ✓ defaults to every markdown file outside node_modules 390ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 403ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 562ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 925ms
     ✓ fails (exit 1) when vale reports alerts 824ms
     ✓ exits 6 on a vale runtime error 734ms
     ✓ skips with exit 0 when no file matches 394ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1043ms
     ✓ falls back to vale sync when the main worktree has none 774ms
     ✓ fails when vale sync cannot restore the required styles 823ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 1471ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 999ms
     ✓ is a usage error when the commit cannot be read 698ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 1039ms
     ✓ exits 1 naming the code file, whatever the commit message says 963ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 1283ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 815ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 2211ms
     ✓ exits 7 when a commit cannot be read 1055ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 1420ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1245ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 2381ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1315ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 1361ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 2551ms
     ✓ a top-level glob in the setting does not reach into folders 1181ms
     ✓ a push that changes no files is not proven a min push 1684ms
     ✓ exits 7 when a commit or its base cannot be read 1383ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 76375ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 319ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 313ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 904ms
     ✓ adopts the main checkout even when called from a linked worktree 1112ms
     ✓ design refuses to work in place on dev 662ms
     ✓ plan refuses to work in place on dev 790ms
     ✓ build refuses to work in place on dev 606ms
     ✓ ship refuses to work in place on dev 462ms
     ✓ build in place on main is refused 484ms
     ✓ design and plan in place on main are refused 1131ms
     ✓ still adopts a cloud session branch whose upstream is main 933ms
     ✓ refuses a detached HEAD 615ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 1235ms
     ✓ never in place on main 418ms
     ✓ refuses a detached HEAD before anything else 369ms
     ✓ adopts in place when the session is already on feat/{fid} 2119ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2870ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 2521ms
     ✓ a new run of the same FID rewrites startSha 5897ms
     ✓ a resume of the same FID reuses the record 4020ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 3297ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 3021ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 3313ms
     ✓ a stale record without a lock is replaced 3981ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2798ms
     ✓ ship names a missing feat branch 1313ms
     ✓ ship on dev refuses with the releases-stay-manual text 467ms
     ✓ refuses dev / main as the ship branch 356ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 2718ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 1195ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 734ms
     ✓ fails with a fetch error when there is no origin to rebase onto 1021ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 719ms
       ✓ checks no disk when there are no cleanup step files 895ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 1054ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 1089ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 878ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 468ms
     ✓ never commits an entry only the main checkout's copy list names 1291ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 322ms
     ✓ resolves the same marker from inside the worktree 576ms
   ✓ bkit worktrees remove (12)
     ✓ answers absent when there is no worktree 621ms
     ✓ leaves a worktree without the marker in place 730ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 1004ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 679ms
     ✓ tells a caller inside the removed worktree where to cd 803ms
     ✓ fails with its own exit code when git cannot remove a marked path 542ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 2269ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 1405ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 1425ms
       ✓ a branch already gone everywhere is reported deleted 1030ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 424ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1638ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 2209ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 79031ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 1512ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 1220ms
     ✓ brand-new untracked ledger is staged and committed 1255ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 1234ms
     ✓ path containing a space is staged and committed 1373ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 955ms
     ✓ staging failure: exit 4 and no commit is created, no false success 990ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1044ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 901ms
     ✓ --mode=stage stages the sweep but creates no commit 904ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 4002ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 1264ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 1218ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 753ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 731ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 643ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 331ms
     ✓ --root defaults to the working directory 948ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 2356ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 1621ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 1229ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 981ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 926ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 449ms
     ✓ a path outside the checkout exits 6 with nothing committed 642ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 1117ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 525ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 2610ms
     ✓ --path records its commit on the run's record, like every other commit mode 2052ms
     ✓ a recorded ledger commits only the rows the run appended 3125ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 3792ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 2713ms
     ✓ commitBookkeeping refuses when a recorded path changed 1894ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1874ms
     ✓ under --mode=commit counts the squashed paths as something to commit 1974ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 1457ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 764ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 1266ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 765ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 485ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 510ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 559ms
     ✓ carries untracked ledgers too 504ms
     ✓ keeps rows on separate lines when the destination has no final newline 533ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 1098ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 1994ms
     ✓ a source file in the range: exit 7, path listed 1469ms
     ✓ another FID's plan file in the range: exit 7 1257ms
     ✓ from not an ancestor of to: exit 7 1007ms
     ✓ unknown commit exits 3; a missing flag exits 2 727ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 330ms
     ✓ append keeps a row's own repo 328ms
     ✓ append refuses a supplied schema or bkit 357ms
     ✓ append refuses a flat top-level field the top section moved into by 316ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 396ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 369ms
     ✓ append bumps a round-second mint 336ms
     ✓ append refuses a writer not listed for the kind 510ms
     ✓ append starts a new line when the ledger lacks its final newline 311ms
     ✓ append creates the ledger and its directory 318ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 393ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 372ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 523ms
     ✓ triage keeps an own-cycle deferral exempt 570ms
     ✓ triage marks an unjustified deferral lazy 993ms
     ✓ triage writes an unjustified row with a minted ts 625ms
     ✓ triage writes no row for a closed deferral 559ms
     ✓ triage reports an adjudicated unjustified row outside exempt 395ms
     ✓ triage ignores another feature's deferral rows 508ms
     ✓ triage writes nothing when the FID has no deferral row 419ms
     ✓ triage refuses a plan with no task blocks 649ms
     ✓ triage refuses a plan whose task blocks do not parse 688ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 410ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (109 tests) 109267ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 1490ms
     ✓ done --group writes group on the row 1109ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1811ms
     ✓ --commit=none writes the row and leaves it uncommitted 667ms
     ✓ build-group-start records parentSha and group 671ms
     ✓ carries extra fields, parsed as JSON when they are JSON 1038ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 355ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 441ms
     ✓ refuses an empty artifact 435ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 366ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 361ms
     ✓ rejects ["--verdict=MAYBE"] 393ms
     ✓ rejects ["--strategy=YOLO"] 456ms
     ✓ rejects ["--failures=-1"] 355ms
     ✓ rejects ["--field=verdict=PASS"] 350ms
     ✓ rejects ["--status=SKIPPED"] 330ms
     ✓ needs a message unless --commit=none 386ms
     ✓ reports a failed commit with exit 8 without writing the row 1051ms
     ✓ a failed commit leaves no row staged in the index 2401ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1616ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1363ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1231ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 988ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1626ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 528ms
     ✓ a missing artifact exits 4 606ms
     ✓ empty artifact exits 0 729ms
     ✓ pending artifact exits 1 377ms
     ✓ no marker artifact exits 2 433ms
     ✓ disallowed artifact exits 3 378ms
     ✓ bad failures artifact exits 4 546ms
     ✓ a required field that is absent is invalid (re-prompt) 491ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 384ms
     ✓ only reads above the marker 336ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 888ms
     ✓ fails when no row was written for the step 319ms
     ✓ --ref reads the status file as committed on that ref, not from disk 1247ms
     ✓ --ref exits 3 when the ref does not carry the status file 1146ms
     ✓ fails on a placeholder left in the artifact 1081ms
     ✓ fails when the row's verdict differs from the artifact's 1297ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1468ms
     ✓ fails on a missing artifact 1105ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 1167ms
     ✓ refuses a negative or non-integer attempt (2) 586ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 499ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 422ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 376ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 463ms
     ✓ fails a diagnose row missing its strategy, passes with it 1002ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1428ms
     ✓ names every missing field at once 876ms
     ✓ asks nothing of a step that writes none of them 398ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ re-asks (exit 6) when a field the prompt declares is missing 372ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 422ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 516ms
     ✓ a true | false header field is true when any agent sets it true 385ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 713ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 1579ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 2528ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1779ms
     ✓ --post needs --number; without --post there is no tracker key 938ms
   ✓ bkit steps stub (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ checks the FID's shape for the wired tracker 365ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 1005ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 465ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1749ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1467ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 947ms
       ✓ gate --issue without --fid is a usage error 403ms
       ✓ gate --issue="" under none keeps today's check 464ms
     ✓ --attempt-of checks the row carries the derived counter 917ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1583ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 799ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2329ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 922ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1118ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1586ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1437ms
     ✓ an unpinned repo reports nulls and asks no registry 1437ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1245ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1296ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1129ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1789ms
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 329ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 675ms
     ✓ 6. a FID that fails the format check exits 1 377ms
   ✓ bkit fids plans (2)
     ✓ none: no plan file at all 344ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1219ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1350ms
     ✓ a push that fails without a server answer is returned once, never retried 1059ms
     ✓ a failed fetch is returned before anything is built 602ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2178ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2016ms
     ✓ lands from a clone whose fetch refspec omits dev 1683ms
     ✓ build throwing stops the landing and removes the throwaway checkout 903ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 2360ms
     ✓ resolves config from the repo root when run from a subdirectory 3018ms
     ✓ exits 6 when the PUT fails 3439ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 2805ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 2237ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1975ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1958ms
     ✓ exits 6 when the api answer is not JSON 1842ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 47809ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 2775ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 2242ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1848ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1897ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 2045ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1891ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1814ms
     ✓ --file into a missing directory is refused, not created 1700ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 991ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1208ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1279ms
     ✓ exits 5 when the open-PR probe errors 605ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1106ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 331ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 551ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 797ms
     ✓ exits 4 when gh errors and 80 when it needs auth 959ms
     ✓ refuses a bad --state or --number 426ms
   ✓ bkit prs scan-body (10)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 384ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 417ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 576ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 921ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 1633ms
     ✓ runs no merge when the PR is already MERGED 1285ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1539ms
     ✓ prs merge refuses a PR whose base is main 827ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 707ms
     ✓ prs merge refuses when the PR base is unknown 1499ms
     ✓ prs merge reads the base from the one pr view it already makes 1295ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 746ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1100ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 870ms
     ✓ never reads dev's required checks without --only-if-required 1155ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 2952ms
     ✓ is not green when a check failed, naming it (exit 1) 2357ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 2664ms
     ✓ is not green on an empty rollup (total 0) 1976ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 2430ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 2643ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1858ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 432ms
     ✓ source file is not treated as gate config 392ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 529ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 2044ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 2353ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 3469ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 2996ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 2836ms
     ✓ fetches the issue and its comments as GitHub returns them 2279ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ records an engine-action row and skips the same key + body on a re-run 2763ms
     ✓ a recent identical comment counts as done (the final close comment) 1944ms
     ✓ a failed post reports done false with the reason and never leaks a token 2196ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 2147ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 406ms
     ✓ a different marker hash posts 1207ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 738ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 376ms
     ✓ fetchIssue pages comments past the first page 337ms
   ✓ jira: HTML comment pages and non-string bodies (2)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (171 tests) 170565ms
   ✓ bkit runs gate (68)
     ✓ rejects a failed run (12) 351ms
     ✓ rejects a green run at a superseded head (14), given --branch 364ms
     ✓ --fetch refreshes origin/<branch> before gating 1920ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 311ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 356ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 416ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 316ms
       ✓ both floor steps failing is regenerable 321ms
       ✓ any failed step off the list makes the whole result unregenerable 365ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 347ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 381ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 363ms
       ✓ a timed-out step counts as failed 325ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 504ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 306ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ refuses when any of several required lanes was skipped 354ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 413ms
     ✓ tells an API error (20) from no run (10) 509ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 330ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --event (5)
       ✓ --event push selects the green push run beside an in-flight pull_request run 391ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 309ms
       ✓ without --event the newer green pull_request run masks the failed push run 329ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 571ms
       ✓ a run still in progress whose capstone already passed passes 594ms
       ✓ a capstone still running is in progress (11) 334ms
       ✓ a failed capstone fails (12) even when every other job passed 652ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 887ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 707ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1848ms
       ✓ a source change past the validated head refuses (17) and names the path 1325ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1750ms
       ✓ --validated equal to --head is the plain head check 387ms
       ✓ --validated without --month / --fid is a usage error (2) 1165ms
       ✓ a validated sha that is not an ancestor refuses (17) 1709ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1402ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 713ms
     ✓ CLI: a failed gh workflow run exits 5 667ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1639ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1441ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2596ms
     ✓ a failed re-trigger push names the cause in the log 2624ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2477ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 4462ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2118ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1350ms
     ✓ gh-error: every poll errored 1104ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2050ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2657ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 2533ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 2546ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 6378ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 5889ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1498ms
     ✓ re-trigger on dev only uses the record of its own FID 2176ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 2068ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ flags [skip ci] inherited into the landed commit body 301ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 506ms
     ✓ an empty or unreadable sha is an error, not a clean result 332ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 1164ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 990ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 865ms
     ✓ a refused capstone records FAIL with its reason 1571ms
     ✓ an unreadable PR is an API error (20) with no head 1049ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1612ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 4603ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 3551ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 3462ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1988ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2403ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2183ms
     ✓ --file and --step go together 2208ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 13502ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 13485ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 21357ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 405ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 738ms
     ✓ builds the two board payloads from bkit.tracker.github.project 370ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ Step 1 with the workflow heading and the tree link 373ms
     ✓ renders header fields in the order the flags were given 908ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 447ms
   ✓ bkit issues comment --post (6)
     ✓ skips tracker none and an issue-less FID 523ms
     ✓ posts the printed body; an identical recent comment is not posted twice 547ms
     ✓ a failed post exits 0 with done false and the reason 460ms
     ✓ prints commentFile: the multi-line comment byte-for-byte, for the MCP fallback 306ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 470ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ min runs only min steps; max runs both 869ms
     ✓ --scope runs only that file's steps 314ms
     ✓ a failing or throwing step is reported and the next step still runs 645ms
     ✓ a broken file is reported and the other file's steps still run 481ms
     ✓ drops an invalid step and runs the valid ones 368ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 1196ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2364ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 696ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (11 tests) 12108ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1304ms
     ✓ counts files committed since --base 1593ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1503ms
     ✓ runs nothing and exits 0 when no file changed 626ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 916ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1755ms
       ✓ falls back to event.before when gh prints unparseable output 636ms
       ✓ reports last-green-run as the source when the green head is an ancestor 892ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1348ms
         ✓ tests ancestry against --head, not HEAD 2149ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2144ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 23666ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1420ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2689ms
     ✓ a refused dev push is logged, never fails the close 3503ms
     ✓ an unreachable remote is logged, never fails the close 1561ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 7249ms
   ✓ bkit skills prune (10)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 844ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1011ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 919ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1026ms
     ✓ runs from the checkout top even when called from a subfolder 726ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1303ms
     ✓ passes every rule on a clean head 675ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 971ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 5341ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1892ms
     ✓ keeps each context's own section banner and drops every other context's 4203ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 633ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 392ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 434ms
     ✓ removes a stale failure file once every recipe succeeds 360ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 537ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 831ms
   ✓ lookupLatestPublished (3)
     ✓ is null when pnpm fails or prints something that is not a version 488ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 7630ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --month is used as given 340ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 531ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 428ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 468ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 400ms
     ✓ passes when only another key changed, such as a branch's upstream 432ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 843ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 798ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 814ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (31 tests) 6521ms
   ✓ bkit status resume (31)
> [bkit] TRUNCATED HERE — 195 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ ship gate against the template's job names (2)
     ✓ finds the capstone among the template's jobs and passes when it is green 460ms
     ✓ refuses when the template's capstone job fails 458ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (15 tests) 2432ms
   ✓ frictionRow (3)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 806 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 542 lines omitted. Dropped content was NOT read.
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
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 169ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 57ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 72ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 22ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 81ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 63ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 11ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ an OPEN decision mid-build prints its header fields 777ms
     ✓ reads Test attempt from a tests pause 908ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 1292ms
     ✓ writes no row when status.jsonl does not exist 883ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 929ms
     ✓ aborts a rebase only when one is in progress 2190ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1682ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 2349ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 1231ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1503ms
     ✓ --max-exceeded says a handover is due without any sentinel 989ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 748ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1454ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 1367ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 670ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 593ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 410ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 592ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 557ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 895ms
     ✓ a debug run in SOAK mode always needs a handover 951ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1557ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 2083ms
     ✓ an unwritable stats path is logged and never fails the close 2339ms
     ✓ appends the completeness row before the workflow-done row 2259ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1851ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 2245ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 3286ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1988ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1427ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 1249ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1098ms
     ✓ --number without --outbox is a usage error 1131ms
     ✓ --flush is ship only 631ms
   ✓ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 665ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 631ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2836ms
     ✓ --flush with nothing to record commits and pushes nothing 2379ms
     ✓ --flush carries the named worktree's logs into the dev commit 2289ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4988ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3449ms
     ✓ a close that landed releases the lock 5008ms
     ✓ removes the worktree before it releases the lock 5616ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 826ms
     ✓ names the branch, not the remote-tracking ref, in each URL 721ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 758ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 836ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1516ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 625ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 885ms
     ✓ record is present after workflows close and before the push 1980ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2552ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 421ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --summary prints the file and keeps a copy in --outbox 1035ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 884ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 314ms
     ✓ without --session-dir prints no sessionRemoved 320ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 319306ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 1827ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1789ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2258ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1949ms
     ✓ produces byte-identical output to merge=union 4200ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 2642ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2907ms
     ✓ refuses a lockfile whose regenerate command fails 2564ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1951ms
     ✓ removes a stale sentinel when the rebase succeeds 2475ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 1417ms
       ✓ runs (0) with the landed path count once dev moved 2612ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1319ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 3491ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 4816ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 5784ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1603ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2042ms
     ✓ --mode=abort pushes when the branch has no open PR 2738ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 3078ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1214ms
     ✓ --open-pr carries the MCP answer and skips gh 1724ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2385ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2624ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6218ms
     ✓ skip-ci HEAD on the replay is refused 1341ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2289ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 2470ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 3416ms
     ✓ a fetch that fails exits 10 1369ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1639ms
     ✓ --paths with no match exits 1 1602ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1114ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 2599ms
     ✓ --marker reads a diff over 1 MiB 1672ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 2217ms
     ✓ scan-diff ignores a removed comment in a test file 1969ms
     ✓ scan-diff ignores an assertion moved within the file 1833ms
     ✓ scan-diff still reports a removed assertion 1605ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1829ms
     ✓ scan-diff finds an added pytest mark skip 1738ms
     ✓ scan-diff finds an added unittest skip 1517ms
     ✓ scan-diff finds an added bare skip call 1804ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1575ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1505ms
     ✓ scan-diff ignores an assertion whose expectation changed 1137ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1000ms
     ✓ scan-diff reports a deleted test file 1076ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 808ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1572ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 5454ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1898ms
     ✓ --merge-docs skips an empty bkit:generate script 1314ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1171ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1801ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1980ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1504ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1651ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 918ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 695ms
     ✓ exits 10 when the fetch fails 508ms
     ✓ refuses --merge-docs with --head, and an unknown --head 568ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1117ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1483ms
     ✓ a failed install stops ship (16) 1076ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 555ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 510ms
     ✓ exits 10 when the fetch fails 369ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 892ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 794ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1107ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1067ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 681ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1038ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 446ms
     ✓ reports undeclared and runs nothing with an empty script 519ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 621ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 687ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 436ms
> [bkit] TRUNCATED HERE — 103 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.92 |    85.46 |   95.47 |   90.53 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 433 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1490 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 772 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 28 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 31 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 24 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 21 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 29 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 19 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 46 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 69 ms
ok 25 refresh builds the register from the staged files, not HEAD or unstaged edits # in 537 ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
ok 30 an empty value unsets the key instead of setting an empty string # in 219 ms
ok 31 non-BKIT_ keys are skipped # in 190 ms
ok 32 one failing key does not stop the others and the exit status is non-zero # in 190 ms
ok 33 a failed unsetenv is retried on the next run # in 211 ms
ok 34 logs key names only, never values # in 170 ms
ok 35 missing env file exits 0 without calling launchctl # in 31 ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
> vitest run integration.test

[test-timeout-budget] load average 22.4 on 10 cores: unit limits 11194ms per test, 22387ms per hook (x2.24)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 135 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 1926ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 1713ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 2143ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 4635ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 772ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 719ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 780ms
 ✓ .bkit/core/engine/audits/workflows/close-squash.integration.test.ts (15 tests) 57135ms
   ✓ bkit-design.md local close squash (6)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (37 tests) 57269ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (32)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3283ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 888ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 2306ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 3559ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 1410ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1749ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 1543ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 1466ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 1593ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 419ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1728ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 2086ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 2063ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1509ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1891ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1194ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 1984ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 1805ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 1893ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2368ms
       ✓ a branch with no status.jsonl dispatches as before 1898ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 1644ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3506ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1840ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1543ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 2504ms
     ✓ vitest — with no report path the test file is left as it was 1285ms
     ✓ a run naming files of two kinds is refused as a usage error 587ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 831ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 997ms
   ✓ bkit:lint:file passes a test file its linter does not cover (3)
     ✓ bats — tests/gh-stub-smoke.bats lints clean 579ms
> [bkit] TRUNCATED HERE — 83 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 963ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 431ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 433ms
     ✓ explicit `bkit help` prints the same usage and exits 0 389ms
     ✓ `bkit check --claude` (stray module flag) errors 588ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 507ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1120ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1129ms
> [bkit] TRUNCATED HERE — 82 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 472ms
     ✓ writes zero files (purely read-only — write-set assertion) 468ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 454ms
     ✓ reports opencode as absent when .opencode/ does not exist 444ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 639ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 1829ms
       ✓ prints nothing to stdout when every recipe succeeds 951ms
       ✓ logs and carries on when the installed bkit has no provision verb 774ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 855ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 591ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 683ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 942ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 733ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 581ms
     ✓ .husky/pre-push: first and last lines name the log 701ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 868ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 599ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 679ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 789ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1183ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 720ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 949ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 618ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 1008ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1502ms
     ✓ .husky/pre-push: a gate fails → no disk prune 732ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 935ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 669ms
     ✓ a stale register stops the push before any gate runs 609ms
     ✓ bkit check fails → the push stops before any gate runs 826ms
     ✓ the dependency audit runs before any gate, when its script is present 776ms
     ✓ no dependency-audit script → skipped, the gates still run 1154ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 838ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 623ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1077ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 615ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 794ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 733ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 768ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 830ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 456ms
     ✓ branch with no open PR → no check, push goes on 467ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 460ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 831ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 828ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1238ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 840ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2097ms
     ✓ `run` holds the lock for the command and passes its exit status on 1177ms
stdout | .bkit/core/engine/install/modules/core.integration.test.ts > migrateBrandedScriptNames (via seedCorePackageJsonScripts) > renames old bkit script keys and keeps custom values
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 150 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 166 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 198 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 179 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 206 lines omitted. Dropped content was NOT read.
     ✓ denies the first touch with the checklist as the reason 346ms
     ✓ allows the retry (dedup) after the first deny 437ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ subagents are NOT exempt — an agent_id payload still gets the checklist 515ms
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 963ms
> [bkit] TRUNCATED HERE — 250 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 627ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 773ms
     ✓ stops the step when the command crashed or was misused 1350ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 212 lines omitted. Dropped content was NOT read.
     ✓ CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare 805ms
     ✓ clears every GIT_* variable, so the same init stays in the temp dir 1016ms
     ✓ fails the run when a test writes an identity into the checkout, and removes it 1032ms
     ✓ fails the run when a test sets core.bare in the checkout, and puts it back 849ms
stdout | .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
[test] core: .bkit/allowlist.json
> [bkit] TRUNCATED HERE — 228 lines omitted. Dropped content was NOT read.
     ✓ antigravity: BKIT_GATEGUARD=deny blocks the first touch with the checklist 425ms
     ✓ antigravity: deny mode allows the retry (dedup lets the second call through) 445ms
   ✓ gateguard behaviour parity — no-op and fail-open (10)
     ✓ claude: subagents are NOT exempt 354ms
     ✓ cursor: subagents are NOT exempt 323ms
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 187 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 163 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 126 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] write version pin: .bkit/version (6.0.0)

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-BaXSN5/bkit
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 183 lines omitted. Dropped content was NOT read.
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] [dry-run] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

stdout | .bkit/core/engine/install/modules/opencode.integration.test.ts > runOpencodeModule — staging zero-footprint on failure (KN-12, Task 2.2) > after a successful install, .opencode/ exists; uninstalling leaves zero footprint
[bkit-install] write: .opencode/agents/bkit-audit-generate.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-install] write: .opencode/agents/bkit-build-install-skills.md
[bkit-install] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-install] write: .opencode/agents/bkit-build-plan-current.md
[bkit-install] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-install] write: .opencode/agents/bkit-build-plan-tests.md
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .opencode/agents/bkit-design-generate.md
[bkit-install] write: .opencode/agents/bkit-design-organise.md
[bkit-install] write: .opencode/agents/bkit-design-review-1.md
[bkit-install] write: .opencode/agents/bkit-design-review-2.md
[bkit-install] write: .opencode/agents/bkit-design-spike.md
[bkit-install] write: .opencode/agents/bkit-design-update.md
[bkit-install] write: .opencode/agents/bkit-plan-generate.md
[bkit-install] write: .opencode/agents/bkit-plan-review-1.md
[bkit-install] write: .opencode/agents/bkit-plan-review-2.md
[bkit-install] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-install] write: .opencode/agents/bkit-plan-update.md
[bkit-install] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-install] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-install] write: .opencode/commands/bkit-auto.md
[bkit-install] write: .opencode/commands/bkit-build.md
[bkit-install] write: .opencode/commands/bkit-debug.md
[bkit-install] write: .opencode/commands/bkit-design.md
[bkit-install] write: .opencode/commands/bkit-plan.md
[bkit-install] write: .opencode/commands/bkit-ship.md
[bkit-install] opencode: .opencode/opencode.json
[bkit-install] opencode: .opencode/plugin/bkit-gateguard.js
[bkit-install] opencode: .opencode/plugin/bkit-readguard.js
[bkit-install] opencode: .opencode/plugin/bkit-rules.js

 ✓ .bkit/core/engine/install/modules/opencode.integration.test.ts (37 tests) 1049ms
stdout | .bkit/core/engine/install/modules/claude.integration.test.ts > Scenario: .bkit/.env.example (owned) and .envrc (template) > re-install overwrites a consumer-edited .bkit/.env.example (owned), in dry-run and live alike
[bkit-test] write: .claude/commands/bkit-auto.md
[bkit-test] write: .claude/commands/bkit-build.md
[bkit-test] write: .claude/commands/bkit-debug.md
[bkit-test] write: .claude/commands/bkit-design.md
[bkit-test] write: .claude/commands/bkit-plan.md
[bkit-test] write: .claude/commands/bkit-ship.md
[bkit-test] write: .claude/agents/bkit-audit-generate.md
[bkit-test] write: .claude/agents/bkit-build-challenge-1.md
[bkit-test] write: .claude/agents/bkit-build-challenge-2.md
[bkit-test] write: .claude/agents/bkit-build-install-skills.md
[bkit-test] write: .claude/agents/bkit-build-plan-convert.md
[bkit-test] write: .claude/agents/bkit-build-plan-current.md
[bkit-test] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-test] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-test] write: .claude/agents/bkit-build-plan-tests.md
[bkit-test] write: .claude/agents/bkit-build-plan-verify.md
[bkit-test] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-test] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-test] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-test] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-test] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-test] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-test] write: .claude/agents/bkit-design-generate.md
[bkit-test] write: .claude/agents/bkit-design-organise.md
[bkit-test] write: .claude/agents/bkit-design-review-1.md
[bkit-test] write: .claude/agents/bkit-design-review-2.md
[bkit-test] write: .claude/agents/bkit-design-spike.md
[bkit-test] write: .claude/agents/bkit-design-update.md
[bkit-test] write: .claude/agents/bkit-plan-generate.md
[bkit-test] write: .claude/agents/bkit-plan-review-1.md
[bkit-test] write: .claude/agents/bkit-plan-review-2.md
[bkit-test] write: .claude/agents/bkit-plan-scope-check.md
[bkit-test] write: .claude/agents/bkit-plan-update.md
[bkit-test] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-test] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-test] write: .claude/agents/bkit-ship-update-docs.md
[bkit-test] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-test] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-test] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-test] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-test] write: .claude/agents/bkit-utility-update-failures.md
[bkit-test] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-test] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-test] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-test] claude: CLAUDE.md
[bkit-test] claude: .claude/settings.json
[bkit-test] claude: .claude/hooks/bkit-preflight.sh
[bkit-test] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-test] claude: .claude/hooks/bkit-readguard.cjs
[bkit-test] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-test] claude: .mcp.json
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-test] [dry-run] claude: .bkit/.env.example
[bkit-test] claude: .bkit/.env.example
[bkit-test] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)

 ✓ .bkit/core/engine/install/modules/claude.integration.test.ts (31 tests) 698ms
 ✓ .bkit/core/engine/install/placeholders.integration.test.ts (6 tests) 728ms
 ✓ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (16 tests) 1017ms
 ✓ .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts (51 tests) 4256ms
   ✓ cursor guardrails.cjs — shell reads of secret files (22)
     ✓ asks on curl/wget to unknown hosts; allows tooling hosts from shipped list 322ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 310ms
stdout | .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > the default module set does NOT ship cloud scaffolding
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
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
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
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
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
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh
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
[bkit-install] write version pin: .bkit/version (6.0.0)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > AGENTS.md: bkit block stripped, consumer rules preserved byte-identical
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > .husky/pre-commit: heavily customised legacy fixture preserved byte-identically
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > package.json: a full uninstall leaves every script and devDep, bkit defaults included (#489)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .cursor/hooks.json
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-rules.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: removed bkit install-state block
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > JSON file (.claude/settings.json) has bkit scope stripped by uninstall (format: json semantics)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)

 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (9 tests) 267ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > round-trip: uninstall is idempotent on heavy-customised consumer
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > round-trip: uninstall is idempotent on heavy-customised consumer
[bkit-uninstall-surgical-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > fixture AGENTS.md consumer content is byte-identical after strip (regression guard)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips the bkit block from bkit-gateguard.js, preserving the consumer's driver (markered-text)
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips bkit-managed scope from opencode.json; deletes when empty after strip
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) removes .opencode/agents/ and .opencode/commands/ bkit-prefix mirrors
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] preserve: .opencode/plugin/bkit-gateguard.js (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .claude/commands/bkit-build.md
[bkit-uninstall-surgical-test] delete mirror: .claude/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] prune empty dir: .claude/commands
[bkit-uninstall-surgical-test] prune empty dir: .claude/agents

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > deletes a bkit-seeded markdown husk (AGENTS.md reduced to a lone H1) (#255 P2-15)
[bkit-uninstall-surgical-test] delete (empty after strip): AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > preserves a consumer-customised AGENTS.md (content outside the bkit block survives)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > removes exactly ONE provider block; the other provider remains intact
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama]

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > updates bkit.providers.opencode.installed array in package.json
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama]

 ✓ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (12 tests) 492ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > re-points bkit.providers.opencode.default when the active provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama] bkit.providers.opencode.default=ollama
[bkit-uninstall] write: .opencode/agents/bkit-audit-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-uninstall] write: .opencode/agents/bkit-build-install-skills.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-current.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tests.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-uninstall] write: .opencode/agents/bkit-design-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-design-organise.md
[bkit-uninstall] write: .opencode/agents/bkit-design-review-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-review-2.md
[bkit-uninstall] write: .opencode/agents/bkit-design-spike.md
[bkit-uninstall] write: .opencode/agents/bkit-design-update.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-review-1.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-review-2.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-update.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-uninstall] write: .opencode/commands/bkit-auto.md
[bkit-uninstall] write: .opencode/commands/bkit-build.md
[bkit-uninstall] write: .opencode/commands/bkit-debug.md
[bkit-uninstall] write: .opencode/commands/bkit-design.md
[bkit-uninstall] write: .opencode/commands/bkit-plan.md
[bkit-uninstall] write: .opencode/commands/bkit-ship.md
[bkit-uninstall] active provider switched to "ollama" — re-rendered 46 .opencode/ agent/command file(s) to its model pins.

 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 39ms
 ✓ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (22 tests) 127ms
stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > falls through to full teardown when the last provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[] bkit.providers.opencode.default=(removed)
[bkit-uninstall] no providers remain — triggering full opencode host teardown...
[bkit-uninstall] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall] prune empty dir: .opencode/agents
[bkit-uninstall] prune empty dir: .opencode/commands
[bkit-uninstall] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --auto resets bkit.cloud.agent to unset and keeps every other key
[bkit-uninstall-surgical-test] package.json: reset bkit.cloud.agent to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --opencode resets bkit.providers.opencode.default and .installed to unset
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: reset bkit.providers.opencode.default, bkit.providers.opencode.installed to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > a dry run lists the keys and writes nothing
[bkit-uninstall-surgical-test] [dry-run] Decision table:
[bkit-uninstall] No files to process.

[bkit-uninstall-surgical-test] [dry-run] package.json: reset bkit.cloud.agent to unset

 ✓ .bkit/core/engine/commands/install/uninstall.integration.test.ts (20 tests) 275ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 236ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 13ms
stderr | scripts/harvest/ledgers.integration.test.ts > Harvest: a friction row the dispatch seam wrote > keeps a seam-written tool-failure row through commit and harvest
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/consumer-app/.worktrees/902-seam
[bkit-harvest] /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/consumer-app/.worktrees/902-seam/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/consumer-app/.worktrees/902-seam/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-hcP9Lr/consumer-app/.worktrees/902-seam/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 1, entities after fold: 1, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

 ✓ scripts/harvest/ledgers.integration.test.ts (24 tests) 4720ms
   ✓ Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) (14)
     ✓ a newer same-key row never evicts a row an earlier run already pruned 305ms
     ✓ harvest multiple consumers and combines rows into bkit central store 457ms
   ✓ Harvest: a friction row the dispatch seam wrote (1)
     ✓ keeps a seam-written tool-failure row through commit and harvest 1540ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (48 tests) 114093ms
   ✓ bkit worktrees setup — mint (create) (19)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 3065ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 2414ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 3017ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 2899ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2940ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3374ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1218ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 661ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1409ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1088ms
     ✓ design installs dependencies like build and debug 1215ms
     ✓ plan installs dependencies like build and debug 1031ms
     ✓ design stops on a failed install (5) 1066ms
     ✓ plan stops on a failed install (5) 1029ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1164ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1746ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1111ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1369ms
   ✓ bkit worktrees setup — mint (resume) (24)
     ✓ rebases onto origin/dev and clears a stale sentinel 2761ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 4612ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4835ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2257ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2885ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3527ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 3611ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2970ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3980ms
     ✓ commits leftovers when a copy entry points outside the checkout 3090ms
     ✓ never commits the entries setup copies in from the main checkout 3087ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 3444ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 2067ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 2511ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 3060ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 979ms
     ✓ leaves a clean worktree's history alone 2863ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 3090ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 4051ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 3586ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 4742ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 5021ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 4484ms
     ✓ does not mark a resumed worktree it did not create 939ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 530ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 666ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 920ms
   ✓ bkit worktrees remove (1)
     ✓ removes a worktree setup created, uncommitted changes and all, and clears the marker 665ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (63 tests) 121610ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 1006ms
     ✓ install --claude does not write Serena or graphify examples 1930ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 1284ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 1583ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 1998ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 4057ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 2446ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 2602ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 4138ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 3818ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 4194ms
     ✓ malformed .mcp.json fails install instead of being overwritten 808ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 3594ms
     ✓ an adopted copy of every template survives upgrade and check 4081ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 4344ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 4136ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1363ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 5086ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 3690ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (11)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 3105ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 4495ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 3072ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 3182ms
     ✓ branded script migration is idempotent and dry-run writes nothing 5035ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 3549ms
     ✓ a dry-run hook and CI token migration writes nothing 1752ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 3992ms
     ✓ a second check-name migration writes nothing 3713ms
     ✓ a dry-run check-name migration writes and moves nothing 1783ms
     ✓ a second Vale migration and a dry run write nothing 3495ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 3116ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3636ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3967ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 2357ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 2767ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1605ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 907ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 842ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 875ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 824ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 876ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1072ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1464ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 845ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 580ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 1541ms

 Test Files  50 passed (50)
      Tests  1731 passed (1731)
   Start at  09:02:10
   Duration  122.08s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/748-brand-every-consumer/context-tests-local-1.log.reports/vitest-92813.xml
> [bkit] TRUNCATED — kept 3183 of 20102 lines (228 KB of 1.4 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
