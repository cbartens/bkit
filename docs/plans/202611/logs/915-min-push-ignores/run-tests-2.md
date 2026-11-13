
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests is waiting for tests (up to 1200s): in use by bkit tests run bkit:gate:static-unit 929-hung-test-never build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 35746, since 15:45:50), last run took 6m1s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 929-hung-test-never build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 35746, since 15:45:50), last run took 6m1s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 929-hung-test-never build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 35746, since 15:45:50), last run took 6m1s

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

[test-timeout-budget] load average 6.0 on 10 cores: unit limits 7500ms per test, 15000ms per hook (x1.50)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 62907ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 2147ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 340ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1001ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 521ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 909ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 621ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 728ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 449ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 303ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 673ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1119ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 866ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 758ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 775ms
     ✓ PASS is 0 failures with or without reports 2199ms
     ✓ clears a previous attempt's reports before the gate runs 824ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 836ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1060ms
     ✓ a log under the outbox is named main-checkout relative in the record 1011ms
     ✓ a log small enough is copied whole: not clamped, raw null 682ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 634ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1197ms
     ✓ numbers runs within the workflow's active run and per step 973ms
     ✓ without --file no row is written and the output carries row null 485ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check refuses DEPENDS ON a later group 304ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 342ms
     ✓ plan-check follows bkit.workflows.tasks 305ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 829ms
     ✓ a planned test that passes is a vacuous gap, exit 1 666ms
     ✓ a planned test absent from a loaded report is a missing gap 640ms
     ✓ a file that fails to load is a red of kind red-not-loaded 848ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1210ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 417ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1319ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 699ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 721ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1441ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1240ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1539ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1108ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1401ms
     ✓ green: a passed-accepted test is already landed, not a gap 924ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 910ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 306ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 952ms
     ✓ green: --group audits only that group's tasks 728ms
     ✓ green: a code fence never closed is the reason, not missing task markers 495ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1119ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1612ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1334ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1978ms
     ✓ green: lists each gap kind, with the runner output 911ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1940ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 860ms
       ✓ green clears an exception-only task from a human commit 1050ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 66744ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1398ms
     ✓ names each net-new and worsened finding in the log and the JSON 1931ms
     ✓ fails on a net score rise with no net count change 961ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1397ms
     ✓ treats a net score at or below 0.001 as float noise 1493ms
     ✓ passes when the change only resolves findings 1287ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1146ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 484ms
     ✓ skips (exit 0) when the base resolves to HEAD 623ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1641ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 833ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 821ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1690ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 991ms
     ✓ exits 4 on a dropped net field instead of silently passing 1184ms
     ✓ exits 4 on no summary instead of silently passing 1520ms
     ✓ exits 4 on output that is not JSON instead of silently passing 911ms
     ✓ exits 5 when the base worktree cannot be created 871ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1241ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1934ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1935ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1978ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1559ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2129ms
   ✓ bkit ci prose — file selection (7)
     ✓ does not follow a directory symlink replacing tracked prose 365ms
     ✓ defaults to every markdown file outside node_modules 354ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 301ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 955ms
     ✓ explicit globs can select ignored prose and nested checkout files 600ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 532ms
     ✓ fails (exit 1) when vale reports alerts 623ms
     ✓ exits 6 on a vale runtime error 653ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 678ms
     ✓ falls back to vale sync when the main worktree has none 550ms
     ✓ fails when vale sync cannot restore the required styles 490ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 734ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 467ms
     ✓ is a usage error when the commit cannot be read 379ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 619ms
     ✓ exits 1 naming the code file, whatever the commit message says 642ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 819ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 633ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1360ms
     ✓ exits 7 when a commit cannot be read 439ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 602ms
     ✓ exits 1 naming the files outside, whatever the commit message says 589ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1103ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 782ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 767ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1357ms
     ✓ a top-level glob in the setting does not reach into folders 610ms
     ✓ a push that changes no files is not proven a min push 516ms
     ✓ exits 7 when a commit or its base cannot be read 900ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 615ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 1021ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 947ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 1091ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 945ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 1338ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 883ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 876ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 917ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 865ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 1171ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 1684ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 1616ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 72174ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 366ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 1017ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 592ms
     ✓ adopts the main checkout even when called from a linked worktree 585ms
     ✓ plan refuses to work in place on dev 451ms
     ✓ build refuses to work in place on dev 330ms
     ✓ build in place on main is refused 415ms
     ✓ design and plan in place on main are refused 1003ms
     ✓ still adopts a cloud session branch whose upstream is main 723ms
     ✓ refuses a detached HEAD 375ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 2144ms
     ✓ may debug in place on dev 905ms
     ✓ never in place on main 889ms
     ✓ refuses a detached HEAD before anything else 483ms
     ✓ adopts in place when the session is already on feat/{fid} 434ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2858ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1720ms
     ✓ a new run of the same FID rewrites startSha 2510ms
     ✓ a resume of the same FID reuses the record 2802ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1382ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1503ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1627ms
     ✓ a stale record without a lock is replaced 1842ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1609ms
     ✓ refuses inherited unpublished dev commits in every ship mode 5701ms
     ✓ names inherited commits and ship recovery in the refusal 1497ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1554ms
     ✓ ship names a missing feat branch 552ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1577ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 551ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 483ms
     ✓ fails with a fetch error when there is no origin to rebase onto 677ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 548ms
       ✓ checks no disk when there are no cleanup step files 638ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 588ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 641ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 478ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 322ms
     ✓ never commits an entry only the main checkout's copy list names 489ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 337ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 863ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 464ms
     ✓ tells a caller inside the removed worktree where to cd 510ms
     ✓ fails with its own exit code when git cannot remove a marked path 513ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1746ms
       ✓ preserves staged-only mode during landed cleanup 1982ms
       ✓ preserves staged-only type during landed cleanup 2106ms
       ✓ preserves staged-only deletion during landed cleanup 2308ms
       ✓ removes landed staged content when both index and working contents are on dev 2056ms
       ✓ deletes the proved local and remote branch at their landed tips 2670ms
       ✓ retains the remote branch when origin refuses its conditional deletion 3934ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 692ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 780ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 463ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1020ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1455ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 76976ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 2227ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 377ms
     ✓ done prints progressLine 371ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 788ms
     ✓ done --group writes group on the row 689ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1537ms
     ✓ --commit=none writes the row and leaves it uncommitted 428ms
     ✓ carries extra fields, parsed as JSON when they are JSON 713ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 304ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 319ms
     ✓ needs a message unless --commit=none 750ms
     ✓ reports a failed commit with exit 8 without writing the row 1249ms
     ✓ a failed commit leaves no row staged in the index 1607ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1543ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1299ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1265ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 874ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1442ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 565ms
     ✓ --ref reads the status file as committed on that ref, not from disk 608ms
     ✓ --ref exits 3 when the ref does not carry the status file 635ms
     ✓ fails on a placeholder left in the artifact 500ms
     ✓ fails when the row's verdict differs from the artifact's 491ms
     ✓ fails when the row does not list the artifact, or carries another attempt 568ms
     ✓ fails on a missing artifact 508ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 523ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 448ms
     ✓ fails a run-tests row missing its scope, and an empty scope 704ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 302ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 809ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 333ms
     ✓ a true | false header field is true when any agent sets it true 319ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 627ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 452ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 812ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1231ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 866ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 937ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1563ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 991ms
     ✓ --post needs --number; without --post there is no tracker key 401ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 312ms
     ✓ checks the FID's shape for the wired tracker 325ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 631ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 977ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 705ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 499ms
     ✓ --attempt-of checks the row carries the derived counter 520ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1520ms
     ✓ writeStepRow refuses when a recorded path changed 1935ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 717ms
     ✓ writeStepRow appends its commit sha to the record 1776ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2146ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 785ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1256ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1666ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 683ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 2070ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1830ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 2338ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 928ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1420ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 693ms
     ✓ does not count an artifact the run found committed when it started 882ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 649ms
     ✓ commits a package.json change outside bkit.workflows 998ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1713ms
   ✓ bkit steps stub --result-file (12)
     ✓ renders and verifies the header of every prompt that declares one 422ms
     ✓ renders no PASS from a result that omits its evidence 330ms
     ✓ reads held audit keys from the linked worktree's own ledger 439ms
     ✓ refuses a result file left from an earlier round 732ms
 ❯ .bkit/core/engine/commands/land.test.ts (45 tests | 1 failed) 101206ms
   ✓ landBackoffMs (2)
     ✓ doubles from the start wait, caps it, and jitters down by at most half 6ms
     ✓ ten tries wait at most three minutes in all 2ms
   ✓ devMoved / devRefused (3)
     ✓ dev moved before or while the push was sent: retry 2ms
     ✓ a server refusal (hook, ruleset, HTTP 403): the PR route 2ms
     ✓ no server answer: neither 1ms
   ✓ devRefRace (2)
     ✓ another fetch moved or holds origin/dev: retry 1ms
     ✓ any other fetch failure, or another ref: not a race 2ms
   ✓ landDir (6)
     ✓ names the throwaway beside the feature worktrees 1ms
     ✓ refuses "../x" as a feature id 2ms
     ✓ refuses "a/b" as a feature id 2ms
     ✓ refuses "" as a feature id 2ms
     ✓ refuses ".hidden" as a feature id 1ms
     ✓ refuses "a..b" as a feature id 1ms
   ✓ withoutHooks (1)
     ✓ points core.hooksPath nowhere for the call, then restores the environment 2ms
   ❯ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 4141ms
     ✓ runs code.ts through its declared gate in the built checkout 3929ms
     ✓ runs code.ts through its declared gate in the built checkout 3858ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 3873ms
     ✓ runs an audit template's project-section change through bkit:gate:min 3208ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2741ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 2411ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2278ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1300ms
     ✓ runs the full gate for replayed debug code 2171ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2757ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ never pushes local dev commits missing from origin/dev 2883ms
     ✓ dev moved: rebuilds on the new dev and pushes again 5615ms
     × dev moved before every push: exhausted, nothing landed 10481ms
     ✓ any other refusal is returned, not retried 3421ms
     ✓ pushToDev replays a commit range onto origin/dev 3676ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2700ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 3090ms
     ✓ a push that fails without a server answer is returned once, never retried 2467ms
     ✓ a failed fetch is returned before anything is built 811ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 4160ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2526ms
     ✓ lands from a clone whose fetch refspec omits dev 3347ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1158ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 555ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 652ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1183ms
     ✓ exits 5 when the open-PR probe errors 443ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 532ms
     ✓ prs open still opens against any other base 545ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 391ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 575ms
     ✓ exits 4 when gh errors and 80 when it needs auth 692ms
   ✓ bkit prs scan-body (10)
     ✓ flags [no ci] in the landed commit body (exit 1) 313ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 301ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 313ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 391ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 621ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 476ms
     ✓ runs no merge when the PR is already MERGED 482ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 661ms
     ✓ prs merge refuses a PR whose base is main 479ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 499ms
     ✓ prs merge refuses when the PR base is unknown 449ms
     ✓ prs merge reads the base from the one pr view it already makes 496ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 404ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 497ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 453ms
     ✓ never reads dev's required checks without --only-if-required 416ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 517ms
     ✓ is not green when a check failed, naming it (exit 1) 526ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 446ms
     ✓ is not green on an empty rollup (total 0) 439ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 426ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1014ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 979ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 661ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 574ms
     ✓ staging failure: exit 4 and no commit is created, no false success 533ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 718ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 531ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 561ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 338ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1216ms
> [bkit] TRUNCATED HERE — 60 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 49640ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 4672ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3902ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 721ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 582ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 594ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4594ms
     ✓ does not fall back through a malformed later success receipt 2610ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1762ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1541ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2882ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 3103ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 1078ms
     ✓ does not record a committed tree 1367ms
     ✓ records no proof for a failed gate or lighter gate 1850ms
     ✓ requires integration proof when integration is declared 2562ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3829ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 459ms
     ✓ filters branch and PR discovery by configured workflow and exact head 2846ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1188ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2951ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3410ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2213ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 3360ms
     ✓ checks the named repository base and fails closed on missing evidence 1605ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1257ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1806ms
     ✓ rejects MCP capstone jobs belonging to another run 2136ms
     ✓ --fetch refreshes origin/<branch> before gating 871ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 311ms
     ✓ tells an API error (20) from no run (10) 306ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 315ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1154ms
       ✓ a source change past the validated head refuses (17) and names the path 813ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1365ms
       ✓ --validated without --month / --fid is a usage error (2) 753ms
       ✓ a validated sha that is not an ancestor refuses (17) 1050ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 857ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2076ms
     ✓ a failed re-trigger push names the cause in the log 2948ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1496ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3072ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1840ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 927ms
     ✓ gh-error: every poll errored 773ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1576ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1904ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1558ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1575ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4456ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4258ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1417ms
     ✓ re-trigger on dev only uses the record of its own FID 3062ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 2460ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 376ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 425ms
     ✓ a refused capstone records FAIL with its reason 457ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 539ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 942ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 671ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 951ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 794ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1082ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1257ms
     ✓ --file and --step go together 852ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1163ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1000ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1398ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1344ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 824ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 722ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 818ms
     ✓ an unpinned repo reports nulls and asks no registry 672ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 489ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 392ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 681ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 417ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 908ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2737ms
     ✓ a refused dev push is logged, never fails the close 3017ms
     ✓ an unreachable remote is logged, never fails the close 1023ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 54304ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 591ms
     ✓ continues after friction and diagnostic writes fail without recursion 1111ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 1496ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 5888ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ starts only new source after overflow or missing source 613ms
     ✓ keeps standalone fallback exact and unassociated calls conservative 337ms
     ✓ uses exact new comment after a failed eligibility read 628ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 376ms
     ✓ recognizes append success within budget without unnecessary resend 348ms
     ✓ preserves a human correction after lost append recognition and a later report 505ms
     ✓ contains exhausted append and create failures without fabricated success 528ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 542ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 402ms
     ✓ reserves new comment opportunity within total delivery budget 1294ms
     ✓ contains preparation state lock and reconciliation exceptions 432ms
     ✓ attempts independent attention after routine uncertainty 759ms
     ✓ seals an acknowledged segment after a postflight intervening comment 599ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 759ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 535ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 867ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 749ms
     ✓ fetches the issue and its comments as GitHub returns them 1096ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1273ms
     ✓ invalidates missing corrupt and unsupported progress cache 2561ms
     ✓ contains cache read and write failures as standalone degradation 1153ms
     ✓ uses legacy receipts and contains receipt failures 734ms
     ✓ skips issue-less runs and tracker none 322ms
     ✓ records an engine-action row and skips the same key + body on a re-run 777ms
     ✓ a recent identical comment counts as done (the final close comment) 849ms
     ✓ a failed post reports done false with the reason and never leaks a token 516ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 633ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 691ms
     ✓ a different marker hash posts 555ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 480ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 19451ms
   ✓ real workflow sources (37)
> [bkit] TRUNCATED HERE — 113 lines omitted. Dropped content was NOT read.
     ✓ flags vitest.config.ts as gate config 418ms
     ✓ flags eslint.config.mjs as gate config 510ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 403ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 787ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1539ms
     ✓ keeps each context's own section banner and drops every other context's 2395ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 383ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 301ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 854ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 560ms
     ✓ follows summary cursors even when the first page is shorter than the limit 647ms
     ✓ reports excluded intervals as unread even when pagination finishes 620ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 784ms
     ✓ reports an unread remainder at the page cap 528ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 551ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 368ms
     ✓ rejects missing summaries instead of treating them as empty results 463ms
     ✓ reports a failed first page as unavailable 461ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 768ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 723ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 548ms
     ✓ follows summary cursors even when the first page is shorter than the limit 752ms
     ✓ reports excluded intervals as unread even when pagination finishes 735ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 766ms
     ✓ reports an unread remainder at the page cap 491ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 761ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 360ms
     ✓ rejects missing summaries instead of treating them as empty results 691ms
     ✓ reports a failed first page as unavailable 604ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 429ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 15915ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 419ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 445ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 824ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 434ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 515ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 458ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1015ms
     ✓ --file into a missing directory is refused, not created 527ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 502ms
     ✓ resolves config from the repo root when run from a subdirectory 521ms
     ✓ exits 6 when the PUT fails 714ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 475ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 493ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 469ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 546ms
     ✓ exits 6 when the api answer is not JSON 554ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (93 tests) 17251ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ posts the printed body; an identical recent comment is not posted twice 952ms
     ✓ renders audit comments from validated result and preserves tracker adapters 1050ms
     ✓ a failed post exits 0 with done false and the reason 310ms
     ✓ --file: an engine-action row per run dedups a re-run without reading the issue 452ms
   ✓ bkit issues fetch (5)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a hits file that is not a list of ids exits 3 330ms
   ✓ bkit issues labels --write (5)
     ✓ a failed read prints done false and the transition of the given --label set 309ms
     ✓ a malformed board target is refused before any label is written 387ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 1079ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1389ms
     ✓ counts files committed since --base 1355ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 948ms
     ✓ runs nothing and exits 0 when no file changed 468ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1022ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 937ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1629ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 612ms
     ✓ challenge gate exits 5 when --base names no commit 450ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 13548ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 557ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1427ms
     ✓ runGit names ENOBUFS when output passes the limit 4506ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 4058ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 727ms
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests | 1 failed) 7263ms
   ❯ publication ownership lock (4)
     ✓ serializes publication for one target and invocation 455ms
     ✓ bounds acquisition and preserves unverifiable owners 292ms
     × reclaims only a proven dead matching process identity 976ms
     ✓ releases only its delivery token on every exit 322ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses while the holder's run stepped in the last 30 minutes 478ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 306ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 524ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 267ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 226ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1084ms
     ✓ passes every rule on a clean head 400ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 487ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 3739ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 340ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 401ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 569ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 403ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

 ❯ .bkit/core/engine/tools/instructions.test.ts (103 tests | 1 failed) 206421ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 16ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 4ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 2ms
     × has no findings 96503ms
     ✓ every prompt, workflow and utility agent has the three header blocks 1338ms
     ✓ sync has nothing left to rewrite 46861ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 1ms
     ✓ a duplicated clause fails 1ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 2ms
     ✓ an excepted file is not checked 2ms
     ✓ retired wording fails 1ms
     ✓ an anchored template fails on a line that starts it but does not match 1ms
     ✓ position: first fails when another bullet opens the block 1ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ a required clause is checked inside the managed block only 1ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 2 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 1ms
     ✓ a drifted anchored line fails 1ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 6ms
     ✓ two swapped lines in one block fail 1ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 4ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 11ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 4ms
   ✓ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 91 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 727 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 253 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 936ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 578ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 681ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1371ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1070ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 1087ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 692ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 767ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 413ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 587ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 780ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-ydEQ3i/architecture.md — skipping (expected exactly one start/end)

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 1801ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (54 tests) 951ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 633ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 320ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-hsYpiI/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 575ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 494ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 719ms
(node:22914) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:22914) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 434ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 387ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 360ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 411ms
   ✓ disk prune step-file templates (7)
     ✓ both copy into place and load as valid steps of both modes 390ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 295ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 251ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 26ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 579ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 356ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 337ms
   ✓ floor (1)
     ✓ canonical clause and rule text stays at or above the floor 327ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 216ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 525ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 237ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 478ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 151ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 332ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 280ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 177ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 21ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 284ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 452ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 153ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 191ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 289ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 154ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 266ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 204ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 227ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 141ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 187ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 265ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 120ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 240ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 200ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 242ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 223ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 256ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 13ms
(node:32792) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:32792) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:32792) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:32792) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 414ms
   ✓ consumer-facing names carry the bkit prefix (6)
     ✓ workflow and job display names 315ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 107ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 324ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 287ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 26ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 73ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 40ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 11ms
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

 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 79ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 96ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 65ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 49ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 60ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 35ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 53ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794549434543.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794549434549.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794549434551.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794549434567.js — skipping

 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 144ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 97ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 111ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 25ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 59ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 68ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 31ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 84ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 163ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 50ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 52ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 56ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 53ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 35ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 231ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 16ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 26ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 46ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 44ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 37ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 38ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 247487ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 1931ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2856ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 776ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 906ms
     ✓ writes no limits for a workflow with no ask point 678ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 609ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 726ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 818ms
       ✓ a new run in the same chat gets its own session row 799ms
       ✓ writes none outside Claude Code 917ms
     ✓ opens the next run after a finished one, and after another workflow's run 1231ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 612ms
     ✓ design / plan / build / debug book in the current worktree 1258ms
     ✓ refuses when the lock is live, writing no row 789ms
     ✓ --lock-held checks the lock is ours 776ms
     ✓ rejects an unknown workflow 396ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 737ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 1004ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 387ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 513ms
     ✓ an OPEN decision of an earlier run never resurfaces 788ms
     ✓ an OPEN decision mid-build prints its header fields 658ms
     ✓ openDecision carries the Gate header 627ms
     ✓ openDecision gate is null without the header 456ms
     ✓ openDecision gate ignores a Gate line below the header 467ms
     ✓ reads Test attempt from a tests pause 506ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 589ms
     ✓ writes no row when status.jsonl does not exist 490ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 489ms
     ✓ aborts a rebase only when one is in progress 1113ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 809ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1015ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 586ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 550ms
     ✓ --max-exceeded says a handover is due without any sentinel 537ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 592ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 613ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 600ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 402ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 372ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 324ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 355ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 618ms
     ✓ a debug run in SOAK mode always needs a handover 590ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1146ms
       ✓ counts subagents of an earlier chat the run's session rows name 1165ms
       ✓ records no context block, and still closes, outside a Claude Code session 1561ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1241ms
     ✓ records ending held and publish false on the workflow-done row 1145ms
     ✓ defaults the close row to ending done 1299ms
     ✓ refuses an unknown ending 451ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1403ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1469ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1335ms
     ✓ always writes the telemetry, whatever the runtime 1073ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 950ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1205ms
     ✓ an unwritable stats path is logged and never fails the close 1407ms
     ✓ appends the completeness row before the workflow-done row 1472ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1537ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1948ms
     ✓ writes one completeness row per close 3347ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1327ms
     ✓ still closes when the completeness check throws 1688ms
     ✓ still closes when the completeness row write throws 1898ms
     ✓ refuses without status.jsonl and writes nothing 782ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2829ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1883ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1707ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1711ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1922ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1525ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 2405ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1492ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1436ms
     ✓ --record-step writes the close step's row before workflow-done 1229ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1386ms
     ✓ --number without --outbox is a usage error 1533ms
     ✓ --flush is ship only 439ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1657ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1386ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1780ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1678ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1342ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 685ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 607ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 4036ms
     ✓ --flush with nothing to record commits and pushes nothing 1873ms
     ✓ --flush carries the named worktree's logs into the dev commit 6337ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4952ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 4538ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 5337ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 4932ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4933ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 4395ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4223ms
     ✓ --push on dev never carries a row whose references name another feature 4744ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3664ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6718ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3748ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1634ms
     ✓ rejects --push with --flush, and --flush outside ship 380ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4428ms
     ✓ preserves unlanded file deletions and ledger additions on close 11444ms
     ✓ preserves dirty work and uncertain branch evidence during close 10790ms
     ✓ preserves a local feature ref changed after its cleanup proof 9513ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4841ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3559ms
     ✓ a close that landed releases the lock 4410ms
     ✓ removes the worktree before it releases the lock 4695ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5630ms
       ✓ closePr refuses when the PR base is unknown 4615ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3736ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 397ms
     ✓ exits 12 when there is no versioned draft 342ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 314ms
     ✓ stamps the anchor from the runtime-resolved base commit 369ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 483ms
     ✓ promote copies the plan only 327ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 385ms
     ✓ names the branch, not the remote-tracking ref, in each URL 347ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 349ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 616ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 723ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 442ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1259ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 609ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 520ms
     ✓ a second run's record does not let this FID's close commit 642ms
     ✓ record is present after workflows close and before the push 1140ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2326ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 437ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 475ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 912ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 665ms
     ✓ puts each --line after the summary, in flag order 636ms
     ✓ --summary prints the file and keeps a copy in --outbox 653ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 631ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 370682ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1478ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1599ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 310ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1453ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 2206ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1287ms
     ✓ a refused --continue carries git's own reason 1447ms
     ✓ --file records nothing for a refused rebase 1277ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1288ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1728ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1437ms
     ✓ produces byte-identical output to merge=union 2397ms
     ✓ restores a trailing newline so the next append starts on its own line 1358ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1632ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1911ms
     ✓ refuses a union that leaves a line which is not JSON 1005ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1377ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1455ms
     ✓ refuses a lockfile whose regenerate command fails 1222ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1974ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1901ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1940ms
     ✓ refuses and aborts when both sides changed the hand-written region 1036ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1159ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1596ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1828ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1033ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1387ms
     ✓ refuses and aborts when a side deleted the install record 1183ms
     ✓ refuses a conflicted doc the repo's script does not list 1078ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 899ms
     ✓ removes a stale sentinel when the rebase succeeds 1264ms
     ✓ exits 4 when no rebase is in progress 301ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1628ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1669ms
   ✓ branches anchor-stamp (19)
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 355ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1006ms
       ✓ skips (12) with no anchor 978ms
       ✓ skips (12) when the base is unreachable in this clone 1184ms
       ✓ skips (12) when nothing landed since the base 1144ms
       ✓ runs (0) with the landed path count once dev moved 2101ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1058ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1872ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1285ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 2188ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3227ms
     ✓ runs exactly one git push 2169ms
     ✓ --set-upstream records the upstream 1430ms
     ✓ refuses with no branch checked out 1171ms
     ✓ --mode=dev refuses a feature checkout 947ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2440ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 4106ms
     ✓ --require-ci pushes as-is when dev has not moved 1581ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2858ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4041ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1113ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1622ms
     ✓ --mode=abort pushes when the branch has no open PR 1479ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1556ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 954ms
     ✓ --open-pr carries the MCP answer and skips gh 1351ms
     ✓ --mode=abort on dev pushes plainly without probing 1286ms
     ✓ rejects an unknown mode 872ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4145ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 4598ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2770ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5940ms
     ✓ skip-ci HEAD on the replay is refused 1825ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 4482ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5644ms
     ✓ a level local dev is a plain push, recording nothing extra 2253ms
     ✓ a record with no commits pushes nothing 1276ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1065ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2553ms
     ✓ a rewritten branch is refused, never forced 1493ms
     ✓ refuses dev and main with exit 21 and pushes nothing 915ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2312ms
     ✓ refuses a detached HEAD (exit 5) 1199ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2805ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1923ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1987ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2235ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 959ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1966ms
     ✓ an up-to-date branch is a no-op 1492ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2158ms
     ✓ a fetch that fails exits 10 941ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1150ms
     ✓ scan-diff still reports a new skip when its test … 1349ms
     ✓ scan-diff reports a skip moved onto a different t… 1220ms
     ✓ scan-diff does not cancel a skip moved between am… 1107ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1183ms
     ✓ scan-diff recognizes a renamed test file 1243ms
     ✓ scan-diff recognizes a suite moved into a differe… 1372ms
     ✓ scan-diff does not let unrelated additions hide a… 1221ms
     ✓ scan-diff attributes deletion to its old test ins… 1168ms
     ✓ scan-diff consumes each moved assertion once and … 1298ms
     ✓ scan-diff does not match identical assertions fro… 1879ms
     ✓ scan-diff does not match the same leaf test name … 1695ms
     ✓ scan-diff does not match a same-named test with d… 1549ms
     ✓ scan-diff does not match a same-named test with c… 1575ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1664ms
     ✓ --paths with no match exits 1 1312ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 842ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1530ms
     ✓ --marker reads a diff over 1 MiB 1314ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1427ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 2224ms
     ✓ scan-diff finds an added skip 1366ms
     ✓ scan-diff ignores a skip predating the base 1176ms
     ✓ scan-diff reports a disabled test with its line 1361ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1848ms
     ✓ scan-diff ignores a removed comment in a test file 1367ms
     ✓ scan-diff ignores an assertion moved within the file 1151ms
     ✓ scan-diff still reports a removed assertion 1329ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1253ms
     ✓ scan-diff finds an added pytest mark skip 1241ms
     ✓ scan-diff finds an added unittest skip 1298ms
     ✓ scan-diff finds an added bare skip call 1070ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1125ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1182ms
     ✓ scan-diff ignores an assertion whose expectation changed 1038ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1080ms
     ✓ scan-diff reports a deleted test file 1117ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 786ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2389ms
     ✓ a title that already carries the marker is left alone 1815ms
     ✓ with no open PR: pushes the marker commit and edits no title 1965ms
     ✓ a re-run is deduped: no second marker commit 2128ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2514ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 960ms
     ✓ --title-set skips gh entirely 1389ms
     ✓ refuses dev and main (exit 21) 674ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 3153ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 5374ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 2423ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 4375ms
     ✓ continues only the explicitly recorded target through the public merge command 2652ms
     ✓ fetches the unseen feature head before classifying the base 1995ms
     ✓ fast forwards the feature before either base path is chosen 3931ms
     ✓ merges divergent feature tips without rebasing either side 2195ms
     ✓ continues the feature merge before starting a dev merge 3829ms
     ✓ publishes local code with a CI running head before bookkeeping 3940ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 8191ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 5185ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2980ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 1424ms
     ✓ Path B once dev moved; --head checks a given commit 899ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 783ms
     ✓ --merge-docs merges dev when docs/ is behind 950ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 958ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1853ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1193ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1055ms
     ✓ --merge-docs skips an empty bkit:generate script 1002ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 861ms
     ✓ --merge-docs never merges on dev itself 1184ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1507ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1192ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1037ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1145ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 572ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1650ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1678ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1641ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1431ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1544ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1634ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1356ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1574ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1063ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 672ms
     ✓ exits 10 when the fetch fails 436ms
     ✓ refuses --merge-docs with --head, and an unknown --head 474ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 955ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1178ms
     ✓ a failed install stops ship (16) 1135ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 896ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 844ms
     ✓ exits 10 when the fetch fails 713ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 454ms
     ✓ preserves unlanded file type changes in the shared landed comparison 493ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 320ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 532ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2167ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2207ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2744ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1825ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3423ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4949ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 550ms
     ✓ local: names unpushed dev as the cause when the branch carries it 666ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 799ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2716ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2345ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1380ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5850ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2036ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2379ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1760ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1077ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3118ms
     ✓ land removes the worktree when only the copied .env is untracked 1836ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1638ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1670ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2430ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2265ms
     ✓ landPr refuses a main-based PR without retrying 638ms
     ✓ landPr refuses when the PR base is unknown 632ms
     ✓ PR not open (closed): stops (17) at once, no retry 773ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 605ms
     ✓ --attempt names the merge round in a fix commit 614ms
     ✓ commits a rewritten and a deleted tracked file 652ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 696ms
     ✓ reports undeclared and runs nothing with no scripts 530ms
     ✓ reports undeclared and runs nothing with an empty script 410ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 482ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 553ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 364ms

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts
Error: Hook timed out in 26886ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:124:3
    122|
    123| describe("rendered workflow comment contracts", () => {
    124|   beforeAll(() => {
       |   ^
    125|     renderedReportingWorkflows();
    126|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed
Error: Test timed out in 7500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/land.test.ts:440:3
    438|   });
    439|
    440|   it("dev moved before every push: exhausted, nothing landed", async (…
       |   ^
    441|     const { root, remote, dir } = fixture();
    442|     const res = await pushToDev({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 90000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:214:3
    212|   });
    213|
    214|   it("has no findings", CORPUS_CASE, () => {
       |   ^
    215|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    216|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > reclaims only a proven dead matching process identity
TypeError: Cannot read properties of null (reading 'owner')
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:152:17
    150|     expect(child.status).toBe(0);
    151|     const dead: PublicationLock = JSON.parse(child.stdout.trim());
    152|     expect(dead.owner.pid).not.toBe(process.pid);
       |                 ^
    153|     const reclaimed = ownedPublication(await api.acquire(cwd, options)…
    154|     expect(reclaimed).not.toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  4 failed | 172 passed (176)
      Tests  3 failed | 7595 passed | 6 skipped (7604)
   Start at  15:53:26
   Duration  372.25s (tests 96%, import 2%, setup 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/915-min-push-ignores/run-tests-2.log.reports/vitest-75483.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.45 |     82.2 |   94.36 |   89.91 |                   
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
 ...mands/workflow |   89.99 |    82.78 |   95.12 |   91.51 |                   
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
  locks.ts         |   89.22 |    83.33 |    92.3 |    91.6 | ...91-292,461-462 
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
  steps.ts         |   88.86 |    81.75 |    92.3 |   90.78 | ...2357,2359,2403 
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
Statements   : 88.45% ( 20637/23330 )
Branches     : 82.2% ( 15995/19457 )
Functions    : 94.36% ( 3283/3479 )
Lines        : 89.91% ( 18115/20147 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1949 of 3933 lines (137 KB of 298 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
