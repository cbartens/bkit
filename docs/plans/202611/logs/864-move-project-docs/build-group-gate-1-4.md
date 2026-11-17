
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (up to 1200s): in use by vitest all — /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck (pid 73556, since 23:16:15), last run took 1m27s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by vitest all — /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck (pid 73556, since 23:16:15), last run took 1m27s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
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
 509:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 631:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
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
 1153:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1207:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1449:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1507:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 253:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 344:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 455:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 250:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 378:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 418:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 489:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> bkit ci slop

[bkit-ci] base da97be3876cf42450f57b335b7aac09629f33a59 (da97be3876cf42450f57b335b7aac09629f33a59) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: da97be3876cf42450f57b335b7aac09629f33a59
base: da97be3876cf42450f57b335b7aac09629f33a59
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 9.6 on 10 cores: unit limits 9300ms per test, 18600ms per hook (x1.86)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 28081ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 533ms
     ✓ names each net-new and worsened finding in the log and the JSON 1183ms
     ✓ fails on a net score rise with no net count change 585ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1089ms
     ✓ treats a net score at or below 0.001 as float noise 1003ms
     ✓ passes when the change only resolves findings 674ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 675ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 808ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 369ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 717ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 806ms
     ✓ exits 4 on a dropped net field instead of silently passing 674ms
     ✓ exits 4 on no summary instead of silently passing 838ms
     ✓ exits 4 on output that is not JSON instead of silently passing 834ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 976ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 729ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 799ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 780ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 784ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1112ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 417ms
     ✓ explicit globs can select ignored prose and nested checkout files 376ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 330ms
     ✓ fails (exit 1) when vale reports alerts 547ms
     ✓ exits 6 on a vale runtime error 537ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 598ms
     ✓ falls back to vale sync when the main worktree has none 551ms
     ✓ fails when vale sync cannot restore the required styles 557ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 371ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 336ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 586ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 567ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 380ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 339ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 627ms
     ✓ a top-level glob in the setting does not reach into folders 332ms
     ✓ exits 7 when a commit or its base cannot be read 334ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 29690ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 321ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1285ms
     ✓ always writes the marker, even with no plan 382ms
     ✓ writes the linear marker shape, taking the tracker from package.json 921ms
     ✓ writes the jira marker shape, taking the tracker from package.json 506ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 683ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 570ms
     ✓ retries a failed create once, and exits 5 when it fails twice 541ms
     ✓ exits 5 when the open-PR probe errors 586ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 685ms
     ✓ prs open still opens against any other base 570ms
     ✓ exits 6 when the created PR's base is not --base 671ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 501ms
     ✓ exits 1 with found=false when there is none 809ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 716ms
     ✓ --number reads one PR, mergeable included 462ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 957ms
     ✓ exits 4 when gh errors and 80 when it needs auth 523ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 312ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 461ms
     ✓ drops the force-build marker from the title subject 322ms
     ✓ takes an explicit --subject 420ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 477ms
     ✓ prs merge refuses a PR whose base is main 455ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 400ms
     ✓ prs merge reads the base from the one pr view it already makes 475ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 589ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 470ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 362ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 541ms
     ✓ never reads dev's required checks without --only-if-required 316ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 594ms
     ✓ updates when a dev ruleset requires status checks 336ms
     ✓ updates when dev's branch protection requires status checks 384ms
     ✓ ignores dev rulesets that require no checks 667ms
     ✓ updates when the repo cannot be resolved 735ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 389ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 310ms
     ✓ is not green when a check failed, naming it (exit 1) 336ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 361ms
     ✓ is not green on an empty rollup (total 0) 473ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 441ms
   ✓ bkit prs verbose-ci (4)
     ✓ strips the marker, with or without its bkit prefix 678ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 758ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 31943ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 394ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 336ms
     ✓ done --group writes group on the row 339ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 478ms
     ✓ reports a failed commit with exit 8 without writing the row 852ms
     ✓ a failed commit leaves no row staged in the index 690ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 703ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 806ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 798ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 476ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 671ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 351ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 347ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 453ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 608ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 428ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 547ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 785ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 491ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 457ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 366ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 666ms
     ✓ writeStepRow refuses when a recorded path changed 876ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 392ms
     ✓ writeStepRow appends its commit sha to the record 643ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1016ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 504ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 500ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 336ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 906ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 592ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 449ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 307ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 958ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 331ms
     ✓ does not count an artifact the run found committed when it started 443ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 480ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 835ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 35597ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 20422ms
     ✓ every prompt, workflow and utility agent has the three header blocks 364ms
     ✓ sync has nothing left to rewrite 12823ms
     ✓ every clause reaches the cut-off of one surface it applies to 1601ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 36132ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 754ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 327ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 526ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 721ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 861ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 653ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 542ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 740ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 740ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 644ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 802ms
     ✓ PASS is 0 failures with or without reports 895ms
     ✓ clears a previous attempt's reports before the gate runs 424ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 500ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 746ms
     ✓ a log under the outbox is named main-checkout relative in the record 657ms
     ✓ a log small enough is copied whole: not clamped, raw null 464ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 851ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 673ms
     ✓ numbers runs within the workflow's active run and per step 488ms
     ✓ without --file no row is written and the output carries row null 310ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 539ms
     ✓ a planned test that passes is a vacuous gap, exit 1 460ms
     ✓ a planned test absent from a loaded report is a missing gap 539ms
     ✓ a file that fails to load is a red of kind red-not-loaded 675ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 750ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 811ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 759ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 736ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 967ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 586ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 938ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 785ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 784ms
     ✓ green: a passed-accepted test is already landed, not a gap 534ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 538ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 536ms
     ✓ green: --group audits only that group's tasks 499ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 616ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 669ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 546ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 706ms
     ✓ green: lists each gap kind, with the runner output 532ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1031ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 435ms
       ✓ green clears an exception-only task from a human commit 366ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 42272ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1218ms
     ✓ runs code.ts through its declared gate in the built checkout 1363ms
     ✓ runs code.ts through its declared gate in the built checkout 1142ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 919ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1051ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1019ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 621ms
     ✓ runs the full gate for replayed debug code 975ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1181ms
     ✓ installs local dependencies against the built target tree 1310ms
     ✓ runs the configured frozen install even without root dependencies 1163ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1120ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1465ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1557ms
     ✓ never pushes local dev commits missing from origin/dev 1470ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2503ms
     ✓ dev moved before every push: exhausted, nothing landed 3728ms
     ✓ any other refusal is returned, not retried 1661ms
     ✓ pushToDev replays a commit range onto origin/dev 1590ms
     ✓ a replay retries on the new dev when dev moved 2655ms
     ✓ pushToDev log line names what it lands 1441ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1485ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1614ms
     ✓ a push that fails without a server answer is returned once, never retried 1375ms
     ✓ a failed fetch is returned before anything is built 519ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2223ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1599ms
     ✓ lands from a clone whose fetch refspec omits dev 1692ms
     ✓ build throwing stops the landing and removes the throwaway checkout 597ms
[feat/test 4f961a6] gate
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 23807ms
   ✓ best effort comment friction (4)
     ✓ distinguishes fallback attempts from known delivery and lost reports 301ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1873ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 664ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 377ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 546ms
     ✓ seals unavailable or unstable representation evidence 432ms
     ✓ uses accepted final preflight eligibility without provider atomicity 367ms
     ✓ rejects marker preserving external edits 384ms
     ✓ preserves generated first line and extracts versioned h6 section markers 361ms
     ✓ returns owned comment identity and stable representation evidence 430ms
     ✓ selects newest created comment across complete pages 373ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 312ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 316ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 303ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 324ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 328ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 312ms
     ✓ fetches the issue and its comments as GitHub returns them 413ms
     ✓ github fetch marks a closed issue terminal and an open one not 487ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 398ms
     ✓ caches exact engine source with available progress identity 357ms
     ✓ keeps original body identity separate from time and changed output 443ms
     ✓ reuses matching invocation state without adopting foreign ownership 490ms
     ✓ invalidates missing corrupt and unsupported progress cache 891ms
     ✓ contains cache read and write failures as standalone degradation 418ms
     ✓ uses legacy receipts and contains receipt failures 376ms
     ✓ records an engine-action row and skips the same key + body on a re-run 410ms
     ✓ a recent identical comment counts as done (the final close comment) 356ms
     ✓ a failed post reports done false with the reason and never leaks a token 335ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 405ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 388ms
     ✓ a board the token cannot see is scope 335ms
     ✓ an HTTP 403 from gh is scope 350ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 375ms
     ✓ github: no block, no blockers and no further reads 327ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 350ms
     ✓ a different marker hash posts 485ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 344ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 22412ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 435ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 358ms
     ✓ brand-new untracked ledger is staged and committed 337ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 340ms
     ✓ path containing a space is staged and committed 334ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 303ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 950ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 475ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 398ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 467ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 468ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 415ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 383ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 544ms
     ✓ --path records its commit on the run's record, like every other commit mode 511ms
     ✓ a recorded ledger commits only the rows the run appended 779ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 917ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 829ms
     ✓ commitBookkeeping refuses when a recorded path changed 534ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 562ms
     ✓ under --mode=commit counts the squashed paths as something to commit 579ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 414ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 348ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 353ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 505ms
     ✓ a source file in the range: exit 7, path listed 359ms
     ✓ another FID's plan file in the range: exit 7 376ms
     ✓ from not an ancestor of to: exit 7 330ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 21224ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2097ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2171ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 336ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 347ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 333ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 339ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2303ms
     ✓ does not fall back through a malformed later success receipt 1199ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 853ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 860ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1582ms
     ✓ requires proof even when the pushed increment changes no files 858ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 519ms
     ✓ does not record a committed tree 561ms
     ✓ records no proof for a failed gate or lighter gate 924ms
     ✓ requires integration proof when integration is declared 1153ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1856ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 1827ms
     ✓ filters branch and PR discovery by configured workflow and exact head 781ms
     ✓ freezes explicit workflow run attempt and all failed job pages 814ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1495ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1941ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 478ms
       ✓ a source change past the validated head refuses (17) and names the path 386ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 458ms
       ✓ --validated without --month / --fid is a usage error (2) 315ms
       ✓ a validated sha that is not an ancestor refuses (17) 406ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 347ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 693ms
     ✓ a failed re-trigger push names the cause in the log 904ms
     ✓ a failed re-trigger push leaves no orphan commit behind 907ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1372ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 751ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 462ms
     ✓ gh-error: every poll errored 381ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 674ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 676ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 798ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 772ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2172ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2341ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 651ms
     ✓ re-trigger on dev only uses the record of its own FID 718ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 662ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
       ✓ without --repo no call gains a --repo flag 444ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 439ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 334ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 380ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 442ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 483ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 488ms
     ✓ --file and --step go together 399ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 18831ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 745ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 301ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 337ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 355ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1102ms
     ✓ a refused dev push is logged, never fails the close 1840ms
     ✓ an unreachable remote is logged, never fails the close 424ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 13992ms
   ✓ bkit runtime detect — the table (17)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 352ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 564ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 505ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 850ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 825ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 736ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 964ms
     ✓ --file into a missing directory is refused, not created 627ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:97331) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
(node:97331) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:97331) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests | 1 failed) 15776ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 3ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ flags an expired, over-long or stale acceptance 1ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 234ms
     ✓ rejects an --unreachable value that is neither fail nor warn 50ms
   ❯ shipped copy-and-own test files (6)
     ✓ finds the shipped .test.mjs files 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 283ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 64ms
     × ci/bkit-test-awake.test.mjs passes when run on its own 5549ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 9017ms
   ✓ capstone env wiring checks (3)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 868ms
     ✓ counts files committed since --base 526ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 672ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 731ms
     ✓ runs the --fallback gate even when no file changed, as it did before 746ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 402ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 572ms
     ✓ follows summary cursors even when the first page is shorter than the limit 641ms
     ✓ reports excluded intervals as unread even when pagination finishes 484ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 904ms
     ✓ reports an unread remainder at the page cap 965ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 862ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 750ms
     ✓ rejects missing summaries instead of treating them as empty results 813ms
     ✓ reports a failed first page as unavailable 947ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 586ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 973ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 535ms
     ✓ follows summary cursors even when the first page is shorter than the limit 836ms
     ✓ reports excluded intervals as unread even when pagination finishes 812ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 541ms
     ✓ reports an unread remainder at the page cap 638ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 747ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 603ms
     ✓ rejects missing summaries instead of treating them as empty results 760ms
     ✓ reports a failed first page as unavailable 988ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 661ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 24521ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1010ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 545ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 991ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 578ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 626ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 697ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 831ms
     ✓ an unpinned repo reports nulls and asks no registry 688ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 629ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 915ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 747ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 566ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 670ms
     ✓ resolves config from the repo root when run from a subdirectory 363ms
     ✓ exits 6 when the PUT fails 747ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 670ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 3675ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1320ms
     ✓ runGit names ENOBUFS when output passes the limit 683ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 858ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 553ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 541ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 309ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 2839ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 333ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 319ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 1785ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (89 tests) 1169ms
> [bkit] TRUNCATED HERE — 815 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 93 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
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

 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 261ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 263ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 136ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 265ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-Yfnn1G/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 198ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 120ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 174ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 63ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 62ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-9WECQi/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 112ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests) 1038ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 50ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 136ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 107ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 78ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 66ms
(node:91302) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:91302) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 99ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 103ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (279 tests) 100ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 75ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

 ✓ .bkit/core/engine/install/project-docs.test.ts (10 tests) 139ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 92ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 141ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 108ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 71ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 95ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 74ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 80ms
(node:92483) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:92483) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:92483) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92483) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 69ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 60ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 55ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 63ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 52ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 74ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 73ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 68ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 47ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 36ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 44ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 49ms
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

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 47ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 55ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 47ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 34ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 62ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 47ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 28ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 41ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 28ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 118ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 22ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 25ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 24ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 24ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794230549906.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794230549909.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794230549910.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794230549921.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 27ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 19ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 20ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 20ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 15ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 18ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 9ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 6ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 93031ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1042ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 317ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 371ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 461ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 381ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 431ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 492ms
       ✓ counts subagents of an earlier chat the run's session rows name 513ms
       ✓ records no context block, and still closes, outside a Claude Code session 456ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 475ms
     ✓ records ending held and publish false on the workflow-done row 534ms
     ✓ defaults the close row to ending done 623ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 624ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 593ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 636ms
     ✓ always writes the telemetry, whatever the runtime 532ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 470ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 543ms
     ✓ an unwritable stats path is logged and never fails the close 526ms
     ✓ appends the completeness row before the workflow-done row 608ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 605ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 544ms
     ✓ writes one completeness row per close 860ms
     ✓ leaves out the previous run's rows that share a second with this run's start 527ms
     ✓ still closes when the completeness check throws 510ms
     ✓ still closes when the completeness row write throws 571ms
     ✓ ship: run.pr, size of the squash commit, and coverage 630ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 798ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 518ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 473ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 640ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 701ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 775ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 664ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 621ms
     ✓ --record-step writes the close step's row before workflow-done 451ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 647ms
     ✓ --number without --outbox is a usage error 510ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 845ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 837ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 884ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 930ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 655ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 330ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2133ms
     ✓ --flush with nothing to record commits and pushes nothing 1147ms
     ✓ --flush carries the named worktree's logs into the dev commit 1907ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2136ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2269ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2541ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2175ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2490ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2170ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2016ms
     ✓ --push on dev never carries a row whose references name another feature 1953ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1838ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2776ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1854ms
     ✓ --push commits in the named worktree, not the checkout it runs from 662ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1693ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1576ms
     ✓ a close that landed releases the lock 1844ms
     ✓ removes the worktree before it releases the lock 2044ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3290ms
       ✓ closePr refuses when the PR base is unknown 2646ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2210ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 315ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 346ms
     ✓ names the branch, not the remote-tracking ref, in each URL 345ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 306ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 836ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 525ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1467ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 672ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 650ms
     ✓ a second run's record does not let this FID's close commit 735ms
     ✓ record is present after workflows close and before the push 1297ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1062ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 308ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 138155ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 410ms
     ✓ rejects missing explicit and ambiguous existing branch selections 358ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 734ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 693ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 417ms
     ✓ a refused --continue carries git's own reason 537ms
     ✓ --file records nothing for a refused rebase 390ms
     ✓ refuses a code conflict and aborts the rebase on the spot 376ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 820ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 420ms
     ✓ produces byte-identical output to merge=union 923ms
     ✓ restores a trailing newline so the next append starts on its own line 575ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 536ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 741ms
     ✓ refuses a union that leaves a line which is not JSON 447ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 595ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1086ms
     ✓ refuses a lockfile whose regenerate command fails 898ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 869ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 746ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 867ms
     ✓ refuses and aborts when both sides changed the hand-written region 569ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 700ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 799ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1027ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 618ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 688ms
     ✓ refuses and aborts when a side deleted the install record 565ms
     ✓ refuses a conflicted doc the repo's script does not list 568ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 457ms
     ✓ removes a stale sentinel when the rebase succeeds 629ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 843ms
     ✓ resolves a conflict in each of two replayed commits across rounds 704ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 424ms
       ✓ skips (12) with no anchor 364ms
       ✓ skips (12) when the base is unreachable in this clone 437ms
       ✓ skips (12) when nothing landed since the base 429ms
       ✓ runs (0) with the landed path count once dev moved 766ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 381ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 901ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 562ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 734ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1524ms
     ✓ runs exactly one git push 1104ms
     ✓ --set-upstream records the upstream 685ms
     ✓ refuses with no branch checked out 560ms
     ✓ --mode=dev refuses a feature checkout 524ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1364ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1953ms
     ✓ --require-ci pushes as-is when dev has not moved 920ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1579ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2133ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 555ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 718ms
     ✓ --mode=abort pushes when the branch has no open PR 878ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 765ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 554ms
     ✓ --open-pr carries the MCP answer and skips gh 706ms
     ✓ --mode=abort on dev pushes plainly without probing 742ms
     ✓ rejects an unknown mode 506ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2088ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1218ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1314ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2793ms
     ✓ skip-ci HEAD on the replay is refused 866ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2123ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2706ms
     ✓ a level local dev is a plain push, recording nothing extra 997ms
     ✓ a record with no commits pushes nothing 712ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 466ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1341ms
     ✓ a rewritten branch is refused, never forced 557ms
     ✓ refuses dev and main with exit 21 and pushes nothing 380ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 885ms
     ✓ refuses a detached HEAD (exit 5) 362ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 717ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 688ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 765ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1016ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 469ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1009ms
     ✓ an up-to-date branch is a no-op 627ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1043ms
     ✓ a fetch that fails exits 10 458ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 691ms
     ✓ scan-diff still reports a new skip when its test … 604ms
     ✓ scan-diff reports a skip moved onto a different t… 496ms
     ✓ scan-diff does not cancel a skip moved between am… 418ms
     ✓ scan-diff does not spend an unchanged duplicate t… 527ms
     ✓ scan-diff recognizes a renamed test file 633ms
     ✓ scan-diff recognizes a suite moved into a differe… 544ms
     ✓ scan-diff does not let unrelated additions hide a… 534ms
     ✓ scan-diff attributes deletion to its old test ins… 554ms
     ✓ scan-diff consumes each moved assertion once and … 568ms
     ✓ scan-diff does not match identical assertions fro… 674ms
     ✓ scan-diff does not match the same leaf test name … 709ms
     ✓ scan-diff does not match a same-named test with d… 717ms
     ✓ scan-diff does not match a same-named test with c… 754ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 711ms
     ✓ --paths with no match exits 1 731ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 543ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 974ms
     ✓ --marker reads a diff over 1 MiB 736ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 915ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 869ms
     ✓ scan-diff finds an added skip 843ms
     ✓ scan-diff ignores a skip predating the base 787ms
     ✓ scan-diff reports a disabled test with its line 911ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 761ms
     ✓ scan-diff ignores a removed comment in a test file 720ms
     ✓ scan-diff ignores an assertion moved within the file 731ms
     ✓ scan-diff still reports a removed assertion 360ms
     ✓ scan-diff finds an added pytest mark skip 306ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 594ms
     ✓ a title that already carries the marker is left alone 463ms
     ✓ with no open PR: pushes the marker commit and edits no title 477ms
     ✓ a re-run is deduped: no second marker commit 565ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 607ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 345ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 344ms
     ✓ --merge-docs merges dev when docs/ is behind 407ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 398ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 568ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 560ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 472ms
     ✓ --merge-docs skips an empty bkit:generate script 432ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 359ms
     ✓ --merge-docs never merges on dev itself 315ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 474ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 475ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 447ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 480ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 608ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 635ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 705ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 634ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 600ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 755ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 551ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 643ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 439ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 303ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 388ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 577ms
     ✓ a failed install stops ship (16) 510ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 402ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 382ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 937ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 919ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 924ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 919ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1983ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2349ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 359ms
     ✓ local: names unpushed dev as the cause when the branch carries it 411ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 436ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1106ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1139ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 888ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 872ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 987ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 923ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 673ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1133ms
     ✓ land removes the worktree when only the copied .env is untracked 957ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 855ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 905ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1533ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 913ms
     ✓ landPr refuses a main-based PR without retrying 503ms
     ✓ landPr refuses when the PR base is unknown 491ms
     ✓ PR not open (closed): stops (17) at once, no retry 663ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 398ms
     ✓ --attempt names the merge round in a fix commit 346ms
     ✓ commits a rewritten and a deleted tracked file 359ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 304ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 321ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own
AssertionError: ✔ direct cancellation waits for SIGTERM cleanup (173.792917ms)
✖ shell cancellation waits for SIGTERM cleanup (191.122292ms)
✔ direct cancellation waits for SIGINT cleanup (189.729875ms)
✔ shell cancellation waits for SIGINT cleanup (264.996375ms)
✔ direct cancellation waits for SIGHUP cleanup (177.365833ms)
✔ shell cancellation waits for SIGHUP cleanup (265.698958ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (574.290667ms)
✔ shell cancellation follows a worker orphaned by a nested shell (357.60775ms)
✔ direct cancellation preserves a nested machine-lock owner (759.347625ms)
✔ shell cancellation preserves a nested machine-lock owner (773.859333ms)
✔ nested shell cancellation preserves a nested machine-lock owner (786.24ms)
✔ a hard process-group timeout reaches a shell command during cleanup (158.523292ms)
✔ ships a command-scoped sleep prevention wrapper (0.128ms)
✔ preserves arguments, output and nonzero exit status (102.671583ms)
✔ runs an entire shell chain and retains its failure (60.033667ms)
✔ reports a missing command as 127 (65.769292ms)
✔ requires a command (61.279083ms)
✔ non-macOS platform selection runs commands without sleep prevention (87.573625ms)
✔ hard timeout escalation reaches a command that ignores TERM (194.191875ms)
✔ forwards POSIX cancellation to the command and releases the assertion (98.759375ms)
✔ holds a real macOS assertion only while the command runs (132.277834ms)
ℹ tests 21
ℹ suites 0
ℹ pass 20
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5483.538292

✖ failing tests:

test at .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:90:5
✖ shell cancellation waits for SIGTERM cleanup (191.122292ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  '' !== 'SIGTERM'
  
      at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:110:16)
      at async Test.run (node:internal/test_runner/test:1313:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: '',
    expected: 'SIGTERM',
    operator: 'strictEqual',
    diff: 'simple'
  }
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ TestContext.<anonymous> .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:110:16
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:134:49
    132|       encoding: "utf-8",
    133|     });
    134|     expect(res.status, res.stdout + res.stderr).toBe(0);
       |                                                 ^
    135|   });
    136| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 173 passed (174)
      Tests  1 failed | 7381 passed | 2 skipped (7384)
   Start at  23:21:01
   Duration  138.79s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/864-move-project-docs/build-group-gate-1-4.log.reports/vitest-80508.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    89.8 |    83.34 |   95.11 |   91.17 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.04 |    86.51 |   95.19 |   95.06 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.45 |    71.42 |     100 |   97.19 | ...00,320,417-418 
  managed.ts       |    81.7 |    87.87 |   58.33 |   83.87 | 216-237           
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
 engine/commands   |   89.65 |    84.15 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.53 |   97.05 |   97.28 | ...51,487,539-542 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.28 |    44.78 |   57.14 |   47.64 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.23 |    30.88 |   33.33 |   33.33 | 351-379,561-1072  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.29 |    84.66 |   96.35 |   93.77 |                   
  branches.ts      |   90.41 |    83.62 |   98.22 |   92.29 | ...3028,3053,3196 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.38 |    94.69 |     100 |    98.8 | 240,557           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 206,311,380       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.22 |    88.13 |   96.29 |   95.36 | ...09-211,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.57 |    84.15 |    99.1 |   92.67 | ...2403,2435-2439 
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
  worktrees.ts     |   61.38 |     59.2 |   67.85 |   62.53 | ...1124,1127-1128 
 engine/install    |   93.34 |    84.46 |   94.44 |   96.08 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    87.32 |     100 |     100 | ...19,324,330-331 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
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
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1717-1799,1804 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.8% ( 18983/21138 )
Branches     : 83.34% ( 14201/17039 )
Functions    : 95.11% ( 3059/3216 )
Lines        : 91.17% ( 16635/18245 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1745 of 3133 lines (123 KB of 239 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
