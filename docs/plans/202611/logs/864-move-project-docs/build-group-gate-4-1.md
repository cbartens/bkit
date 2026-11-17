
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (still, 5 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-4 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 88793, since 11:55:03), last run took 9m35s

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
 1245:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1487:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1545:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

[test-timeout-budget] load average 9.0 on 10 cores: unit limits 9000ms per test, 18000ms per hook (x1.80)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 33826ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 325ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 419ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2672ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 338ms
     ✓ rolls over after intervening comments external edits and deletion 377ms
     ✓ starts only new source after overflow or missing source 320ms
     ✓ uses exact new comment after a failed eligibility read 333ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 356ms
     ✓ contains exhausted append and create failures without fabricated success 356ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 451ms
     ✓ reserves new comment opportunity within total delivery budget 774ms
     ✓ attempts independent attention after routine uncertainty 389ms
     ✓ seals an acknowledged segment after a postflight intervening comment 330ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 400ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 975ms
     ✓ seals unavailable or unstable representation evidence 690ms
     ✓ uses accepted final preflight eligibility without provider atomicity 927ms
     ✓ rejects marker preserving external edits 640ms
     ✓ preserves generated first line and extracts versioned h6 section markers 363ms
     ✓ returns owned comment identity and stable representation evidence 1108ms
     ✓ selects newest created comment across complete pages 996ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 400ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 629ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 541ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 353ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 386ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 383ms
     ✓ fetches the issue and its comments as GitHub returns them 441ms
     ✓ github fetch marks a closed issue terminal and an open one not 620ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 539ms
     ✓ caches exact engine source with available progress identity 405ms
     ✓ keeps original body identity separate from time and changed output 596ms
     ✓ reuses matching invocation state without adopting foreign ownership 682ms
     ✓ invalidates missing corrupt and unsupported progress cache 1237ms
     ✓ contains cache read and write failures as standalone degradation 575ms
     ✓ uses legacy receipts and contains receipt failures 429ms
     ✓ records an engine-action row and skips the same key + body on a re-run 479ms
     ✓ a recent identical comment counts as done (the final close comment) 555ms
     ✓ a failed post reports done false with the reason and never leaks a token 572ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 503ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 452ms
     ✓ a board the token cannot see is scope 541ms
     ✓ an HTTP 403 from gh is scope 830ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 539ms
     ✓ github: no block, no blockers and no further reads 359ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 419ms
     ✓ a different marker hash posts 437ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 398ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 33934ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 751ms
     ✓ names each net-new and worsened finding in the log and the JSON 1081ms
     ✓ fails on a net score rise with no net count change 793ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1056ms
     ✓ treats a net score at or below 0.001 as float noise 1074ms
     ✓ passes when the change only resolves findings 720ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 694ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 301ms
     ✓ skips (exit 0) when the base resolves to HEAD 439ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1166ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 553ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 734ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 872ms
     ✓ exits 4 on a dropped net field instead of silently passing 1281ms
     ✓ exits 4 on no summary instead of silently passing 781ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1009ms
     ✓ exits 5 when the base worktree cannot be created 320ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1135ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 823ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 854ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 914ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 955ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1450ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 548ms
     ✓ explicit globs can select ignored prose and nested checkout files 585ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 391ms
     ✓ fails (exit 1) when vale reports alerts 638ms
     ✓ exits 6 on a vale runtime error 634ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 571ms
     ✓ falls back to vale sync when the main worktree has none 480ms
     ✓ fails when vale sync cannot restore the required styles 412ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 410ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 310ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 450ms
     ✓ exits 1 naming the code file, whatever the commit message says 385ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 510ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 350ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 778ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 341ms
     ✓ exits 1 naming the files outside, whatever the commit message says 342ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 704ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 511ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 390ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 873ms
     ✓ a top-level glob in the setting does not reach into folders 424ms
     ✓ a push that changes no files is not proven a min push 390ms
     ✓ exits 7 when a commit or its base cannot be read 429ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 41974ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 880ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 543ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 566ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 415ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 676ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 430ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 417ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 869ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 406ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 634ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 830ms
     ✓ PASS is 0 failures with or without reports 799ms
     ✓ clears a previous attempt's reports before the gate runs 634ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 645ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 723ms
     ✓ a log under the outbox is named main-checkout relative in the record 847ms
     ✓ a log small enough is copied whole: not clamped, raw null 732ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 784ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 577ms
     ✓ numbers runs within the workflow's active run and per step 994ms
     ✓ without --file no row is written and the output carries row null 831ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 896ms
     ✓ a planned test that passes is a vacuous gap, exit 1 846ms
     ✓ a planned test absent from a loaded report is a missing gap 637ms
     ✓ a file that fails to load is a red of kind red-not-loaded 662ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 676ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 310ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1021ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 503ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 544ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1208ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1014ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 919ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 748ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1030ms
     ✓ green: a passed-accepted test is already landed, not a gap 724ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 608ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 633ms
     ✓ green: --group audits only that group's tasks 844ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 705ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 757ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 606ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 792ms
     ✓ green: lists each gap kind, with the runner output 867ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1190ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 455ms
       ✓ green clears an exception-only task from a human commit 413ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 42686ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 613ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 595ms
     ✓ done --group writes group on the row 448ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 728ms
     ✓ carries extra fields, parsed as JSON when they are JSON 330ms
     ✓ reports a failed commit with exit 8 without writing the row 784ms
     ✓ a failed commit leaves no row staged in the index 790ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1391ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 877ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1049ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1046ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 854ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 348ms
     ✓ --ref reads the status file as committed on that ref, not from disk 352ms
     ✓ --ref exits 3 when the ref does not carry the status file 306ms
     ✓ fails when the row's verdict differs from the artifact's 317ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 372ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 331ms
     ✓ fails a run-tests row missing its scope, and an empty scope 474ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 523ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 450ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 459ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 544ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 747ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 507ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 596ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1018ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 608ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 319ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 616ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 507ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 316ms
     ✓ --attempt-of checks the row carries the derived counter 355ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 798ms
     ✓ writeStepRow refuses when a recorded path changed 988ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 515ms
     ✓ writeStepRow appends its commit sha to the record 935ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1474ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 336ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 733ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 609ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 375ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1118ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 816ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 646ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 412ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1054ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 381ms
     ✓ does not count an artifact the run found committed when it started 511ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 308ms
     ✓ commits a package.json change outside bkit.workflows 527ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1017ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 47656ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 28687ms
     ✓ every prompt, workflow and utility agent has the three header blocks 459ms
     ✓ sync has nothing left to rewrite 16150ms
     ✓ every clause reaches the cut-off of one surface it applies to 1781ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 56463ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1927ms
     ✓ runs code.ts through its declared gate in the built checkout 1986ms
     ✓ runs code.ts through its declared gate in the built checkout 1914ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1811ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1539ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1692ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 910ms
     ✓ runs the full gate for replayed debug code 1347ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1616ms
     ✓ installs local dependencies against the built target tree 1717ms
     ✓ runs the configured frozen install even without root dependencies 1667ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1697ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2048ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1795ms
     ✓ never pushes local dev commits missing from origin/dev 1761ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3257ms
     ✓ dev moved before every push: exhausted, nothing landed 4706ms
     ✓ any other refusal is returned, not retried 2209ms
     ✓ pushToDev replays a commit range onto origin/dev 1995ms
     ✓ a replay retries on the new dev when dev moved 3214ms
     ✓ pushToDev log line names what it lands 1734ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1855ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1763ms
     ✓ a push that fails without a server answer is returned once, never retried 1585ms
     ✓ a failed fetch is returned before anything is built 558ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2534ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1935ms
     ✓ lands from a clone whose fetch refspec omits dev 2694ms
     ✓ build throwing stops the landing and removes the throwaway checkout 966ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 28749ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 506ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 429ms
     ✓ brand-new untracked ledger is staged and committed 339ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 384ms
     ✓ path containing a space is staged and committed 385ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 357ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 340ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 302ms
     ✓ --mode=stage stages the sweep but creates no commit 348ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1073ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 582ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 471ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 302ms
     ✓ --root defaults to the working directory 326ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 484ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 506ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 467ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 483ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 331ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 341ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 666ms
     ✓ --path records its commit on the run's record, like every other commit mode 660ms
     ✓ a recorded ledger commits only the rows the run appended 963ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1159ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 995ms
     ✓ commitBookkeeping refuses when a recorded path changed 535ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 776ms
     ✓ under --mode=commit counts the squashed paths as something to commit 841ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 519ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 340ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 490ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 333ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 424ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 342ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 545ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 704ms
     ✓ a source file in the range: exit 7, path listed 535ms
     ✓ another FID's plan file in the range: exit 7 513ms
     ✓ from not an ancestor of to: exit 7 586ms
     ✓ unknown commit exits 3; a missing flag exits 2 388ms
   ✓ bkit ledgers triage (11)
     ✓ triage refuses a plan with no task blocks 311ms
     ✓ triage refuses a plan whose task blocks do not parse 309ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 386ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 504ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 473ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 29264ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2462ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2414ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 381ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 381ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 353ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3176ms
     ✓ does not fall back through a malformed later success receipt 2358ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1295ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1353ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2169ms
     ✓ requires proof even when the pushed increment changes no files 1153ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 631ms
     ✓ does not record a committed tree 626ms
     ✓ records no proof for a failed gate or lighter gate 1045ms
     ✓ requires integration proof when integration is declared 1498ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3269ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 346ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 419ms
     ✓ retries a failed create once, and exits 5 when it fails twice 500ms
     ✓ exits 5 when the open-PR probe errors 367ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 421ms
     ✓ prs open still opens against any other base 392ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 348ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 444ms
     ✓ exits 4 when gh errors and 80 when it needs auth 523ms
   ✓ bkit prs scan-body (10)
     ✓ flags [ci skip] in the landed commit body (exit 1) 336ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 527ms
     ✓ runs no merge when the PR is already MERGED 832ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 575ms
     ✓ prs merge refuses a PR whose base is main 359ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 412ms
     ✓ prs merge refuses when the PR base is unknown 379ms
     ✓ prs merge reads the base from the one pr view it already makes 361ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 338ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 349ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 329ms
     ✓ never reads dev's required checks without --only-if-required 347ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 386ms
     ✓ is not green when a check failed, naming it (exit 1) 506ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 443ms
     ✓ is not green on an empty rollup (total 0) 464ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 437ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 900ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 729ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 313ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1443ms
     ✓ freezes explicit workflow run attempt and all failed job pages 887ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1827ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2435ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 590ms
       ✓ a source change past the validated head refuses (17) and names the path 569ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 605ms
       ✓ --validated without --month / --fid is a usage error (2) 442ms
       ✓ a validated sha that is not an ancestor refuses (17) 520ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 514ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 925ms
     ✓ a failed re-trigger push names the cause in the log 854ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1327ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1606ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 876ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 485ms
     ✓ gh-error: every poll errored 475ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 761ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 769ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 908ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 936ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3040ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3415ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 923ms
     ✓ re-trigger on dev only uses the record of its own FID 1283ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 963ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 341ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 539ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 387ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 507ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 863ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 780ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 775ms
     ✓ --file and --step go together 689ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 10947ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 494ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 408ms
     ✓ follows summary cursors even when the first page is shorter than the limit 535ms
     ✓ reports excluded intervals as unread even when pagination finishes 429ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 512ms
     ✓ reports an unread remainder at the page cap 451ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 429ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 316ms
     ✓ rejects missing summaries instead of treating them as empty results 552ms
     ✓ reports a failed first page as unavailable 430ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 487ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 838ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 464ms
     ✓ follows summary cursors even when the first page is shorter than the limit 771ms
     ✓ reports excluded intervals as unread even when pagination finishes 529ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 821ms
     ✓ reports an unread remainder at the page cap 484ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 469ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 336ms
     ✓ rejects missing summaries instead of treating them as empty results 478ms
     ✓ reports a failed first page as unavailable 397ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 314ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 27601ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ 5. an issue-less mint a finished run used takes the next free suffix 313ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 608ms
     ✓ 6. a FID that fails the format check exits 1 329ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 376ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 15091ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 704ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1934ms
     ✓ a refused dev push is logged, never fails the close 2431ms
     ✓ an unreachable remote is logged, never fails the close 808ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 13119ms
   ✓ real workflow sources (37)
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 914ms
     ✓ keeps each context's own section banner and drops every other context's 2209ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 379ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 476ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1004ms
     ✓ counts files committed since --base 752ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 660ms
     ✓ runs nothing and exits 0 when no file changed 442ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 990ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 891ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 472ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1167ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 488ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 517ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 672ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 545ms
     ✓ an unpinned repo reports nulls and asks no registry 648ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 712ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 657ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 903ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 658ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests) 9678ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 346ms
   ✓ bkit issues comment (33)
     ✓ renders header fields in the order the flags were given 529ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1289ms
     ✓ source file is not treated as gate config 1088ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 953ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 3193ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 863ms
     ✓ resolves config from the repo root when run from a subdirectory 851ms
     ✓ exits 6 when the PUT fails 676ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 655ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 469ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 467ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 461ms
     ✓ exits 6 when the api answer is not JSON 475ms
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 4911ms
   ✓ repo facts on a real repository (4)
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 321ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1342ms
     ✓ runGit names ENOBUFS when output passes the limit 1182ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1042ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 730ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1404ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 443ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 16051ms
   ✓ bkit runtime detect — the table (17)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 610ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 859ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 566ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 389ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 454ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 620ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 380ms
     ✓ --file into a missing directory is refused, not created 309ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 887ms
     ✓ passes every rule on a clean head 338ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 433ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (47 tests) 3219ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 3149ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 337ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 370ms
   ✓ bkit locks release (5)
     ✓ locks release removes the FID shared-checkout record 503ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 418ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 389ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 509ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 397ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (75 tests) 2318ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 2913ms
> [bkit] TRUNCATED HERE — 841 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 160 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 409ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 140ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 155ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-OisKhS/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 152ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 287ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 237ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-2AVdKe/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 138ms
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

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 694ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 579ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 217ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 177ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 140ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 147ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (12 tests) 164ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 145ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 109ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 172ms
(node:44743) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:44743) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 287ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 94ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 117ms
(node:45274) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:45274) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:45274) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:45274) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 137ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 68ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 43ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 75ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 194ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 252ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 75ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 113ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 113ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 75ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 118ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 127ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 149ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 118ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 173ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 227ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 127ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 112ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 128ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 45ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 91ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 81ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 75ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 130ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 52ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 53ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 48ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 45ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 35ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 95ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (45 tests) 66ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 32ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 42ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 39ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794276376154.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794276376157.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794276376158.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794276376168.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 29ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 101ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 95ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 55ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 35ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 26ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 23ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 25ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 46ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 30ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 26ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 28ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 18ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 48ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 132213ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 449ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1726ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 408ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 335ms
     ✓ writes no limits for a workflow with no ask point 398ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 323ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 333ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 474ms
       ✓ a new run in the same chat gets its own session row 440ms
       ✓ writes none outside Claude Code 331ms
     ✓ opens the next run after a finished one, and after another workflow's run 435ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 409ms
     ✓ design / plan / build / debug book in the current worktree 518ms
     ✓ refuses when the lock is live, writing no row 381ms
     ✓ --lock-held checks the lock is ours 565ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 348ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 535ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 362ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 326ms
     ✓ an OPEN decision of an earlier run never resurfaces 431ms
     ✓ an OPEN decision mid-build prints its header fields 312ms
     ✓ reads Test attempt from a tests pause 348ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 438ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 388ms
     ✓ aborts a rebase only when one is in progress 715ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 526ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 563ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 372ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 380ms
     ✓ --max-exceeded says a handover is due without any sentinel 314ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 329ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 377ms
     ✓ a debug run in SOAK mode always needs a handover 333ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 710ms
       ✓ counts subagents of an earlier chat the run's session rows name 720ms
       ✓ records no context block, and still closes, outside a Claude Code session 751ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 771ms
     ✓ records ending held and publish false on the workflow-done row 749ms
     ✓ defaults the close row to ending done 881ms
     ✓ refuses an unknown ending 338ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 736ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 660ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 702ms
     ✓ always writes the telemetry, whatever the runtime 599ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 584ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 636ms
     ✓ an unwritable stats path is logged and never fails the close 685ms
     ✓ appends the completeness row before the workflow-done row 774ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 766ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 791ms
     ✓ writes one completeness row per close 982ms
     ✓ leaves out the previous run's rows that share a second with this run's start 589ms
     ✓ still closes when the completeness check throws 677ms
     ✓ still closes when the completeness row write throws 690ms
     ✓ ship: run.pr, size of the squash commit, and coverage 893ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1155ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 752ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 605ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 932ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 893ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1018ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 907ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 863ms
     ✓ --record-step writes the close step's row before workflow-done 605ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 653ms
     ✓ --number without --outbox is a usage error 635ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1059ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1012ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1049ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1052ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 760ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 374ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 349ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2435ms
     ✓ --flush with nothing to record commits and pushes nothing 1518ms
     ✓ --flush carries the named worktree's logs into the dev commit 2993ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3580ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3017ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3385ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2750ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4125ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3376ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2725ms
     ✓ --push on dev never carries a row whose references name another feature 3261ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2664ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4747ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3315ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1360ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3197ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2456ms
     ✓ a close that landed releases the lock 2977ms
     ✓ removes the worktree before it releases the lock 3710ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4731ms
       ✓ closePr refuses when the PR base is unknown 3775ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3100ms
   ✓ bkit workflows promote (7)
     ✓ exits 12 when there is no versioned draft 302ms
     ✓ stamps the anchor from the runtime-resolved base commit 337ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 414ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 507ms
     ✓ names the branch, not the remote-tracking ref, in each URL 473ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 491ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 444ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1121ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 759ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1686ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 482ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 429ms
     ✓ a second run's record does not let this FID's close commit 483ms
     ✓ record is present after workflows close and before the push 788ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1342ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 531ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 559ms
     ✓ puts each --line after the summary, in flag order 397ms
     ✓ --summary prints the file and keeps a copy in --outbox 327ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 303ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 180713ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 691ms
     ✓ rejects missing explicit and ambiguous existing branch selections 586ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1114ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1067ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 673ms
     ✓ a refused --continue carries git's own reason 894ms
     ✓ --file records nothing for a refused rebase 656ms
     ✓ refuses a code conflict and aborts the rebase on the spot 767ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1603ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 651ms
     ✓ produces byte-identical output to merge=union 1588ms
     ✓ restores a trailing newline so the next append starts on its own line 766ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 887ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 978ms
     ✓ refuses a union that leaves a line which is not JSON 654ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 830ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1319ms
     ✓ refuses a lockfile whose regenerate command fails 976ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1261ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1246ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1229ms
     ✓ refuses and aborts when both sides changed the hand-written region 879ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 845ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 904ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1149ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 747ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 836ms
     ✓ refuses and aborts when a side deleted the install record 765ms
     ✓ refuses a conflicted doc the repo's script does not list 629ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 679ms
     ✓ removes a stale sentinel when the rebase succeeds 888ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 944ms
     ✓ resolves a conflict in each of two replayed commits across rounds 944ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 558ms
       ✓ skips (12) with no anchor 533ms
       ✓ skips (12) when the base is unreachable in this clone 640ms
       ✓ skips (12) when nothing landed since the base 568ms
       ✓ runs (0) with the landed path count once dev moved 1017ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 564ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1150ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 694ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 930ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1434ms
     ✓ runs exactly one git push 1174ms
     ✓ --set-upstream records the upstream 830ms
     ✓ refuses with no branch checked out 634ms
     ✓ --mode=dev refuses a feature checkout 676ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1553ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2344ms
     ✓ --require-ci pushes as-is when dev has not moved 977ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1761ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2926ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 986ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1159ms
     ✓ --mode=abort pushes when the branch has no open PR 1388ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1323ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 733ms
     ✓ --open-pr carries the MCP answer and skips gh 933ms
     ✓ --mode=abort on dev pushes plainly without probing 946ms
     ✓ rejects an unknown mode 653ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3004ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1368ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1749ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4194ms
     ✓ skip-ci HEAD on the replay is refused 1346ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3415ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3676ms
     ✓ a level local dev is a plain push, recording nothing extra 1617ms
     ✓ a record with no commits pushes nothing 1078ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 728ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1728ms
     ✓ a rewritten branch is refused, never forced 1032ms
     ✓ refuses dev and main with exit 21 and pushes nothing 626ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1626ms
     ✓ refuses a detached HEAD (exit 5) 847ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1790ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1284ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1455ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1897ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 627ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1560ms
     ✓ an up-to-date branch is a no-op 1039ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1595ms
     ✓ a fetch that fails exits 10 733ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 982ms
     ✓ scan-diff still reports a new skip when its test … 1080ms
     ✓ scan-diff reports a skip moved onto a different t… 1072ms
     ✓ scan-diff does not cancel a skip moved between am… 1106ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1165ms
     ✓ scan-diff recognizes a renamed test file 1154ms
     ✓ scan-diff recognizes a suite moved into a differe… 903ms
     ✓ scan-diff does not let unrelated additions hide a… 1089ms
     ✓ scan-diff attributes deletion to its old test ins… 1017ms
     ✓ scan-diff consumes each moved assertion once and … 1033ms
     ✓ scan-diff does not match identical assertions fro… 893ms
     ✓ scan-diff does not match the same leaf test name … 1094ms
     ✓ scan-diff does not match a same-named test with d… 986ms
     ✓ scan-diff does not match a same-named test with c… 1039ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 921ms
     ✓ --paths with no match exits 1 945ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 690ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1302ms
     ✓ --marker reads a diff over 1 MiB 975ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1240ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1134ms
     ✓ scan-diff finds an added skip 1082ms
     ✓ scan-diff ignores a skip predating the base 946ms
     ✓ scan-diff reports a disabled test with its line 674ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 555ms
     ✓ scan-diff ignores a removed comment in a test file 512ms
     ✓ scan-diff ignores an assertion moved within the file 454ms
     ✓ scan-diff still reports a removed assertion 401ms
     ✓ scan-diff reports an assertion re-added only outside the test file 397ms
     ✓ scan-diff finds an added pytest mark skip 535ms
     ✓ scan-diff finds an added unittest skip 462ms
     ✓ scan-diff finds an added bare skip call 404ms
     ✓ scan-diff ignores a quoted skip in a documentation file 436ms
     ✓ scan-diff ignores a marker literal in a non-test source file 507ms
     ✓ scan-diff ignores an assertion whose expectation changed 565ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 411ms
     ✓ scan-diff reports a deleted test file 359ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 835ms
     ✓ a title that already carries the marker is left alone 492ms
     ✓ with no open PR: pushes the marker commit and edits no title 508ms
     ✓ a re-run is deduped: no second marker commit 573ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 619ms
     ✓ --title-set skips gh entirely 302ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 359ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 359ms
     ✓ --merge-docs merges dev when docs/ is behind 483ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 561ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 728ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 648ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 519ms
     ✓ --merge-docs skips an empty bkit:generate script 446ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 486ms
     ✓ --merge-docs never merges on dev itself 389ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 529ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 524ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 484ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 515ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 637ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 677ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 750ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 665ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 625ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 830ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 577ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 694ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 459ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 320ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 407ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 606ms
     ✓ a failed install stops ship (16) 527ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 411ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 392ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1038ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1032ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1029ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1000ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2054ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2390ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 371ms
     ✓ local: names unpushed dev as the cause when the branch carries it 430ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 470ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1563ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1175ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 903ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 895ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 993ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 956ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 657ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1168ms
     ✓ land removes the worktree when only the copied .env is untracked 978ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 898ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 932ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1600ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 952ms
     ✓ landPr refuses a main-based PR without retrying 515ms
     ✓ landPr refuses when the PR base is unknown 572ms
     ✓ PR not open (closed): stops (17) at once, no retry 637ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 388ms
     ✓ --attempt names the merge round in a fix commit 350ms
     ✓ commits a rewritten and a deleted tracked file 368ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 314ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 334ms

 Test Files  174 passed (174)
      Tests  7401 passed | 2 skipped (7403)
   Start at  12:04:14
   Duration  181.55s (tests 96%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/864-move-project-docs/build-group-gate-4-1.log.reports/vitest-36829.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.82 |    83.38 |    95.1 |   91.18 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.02 |    86.72 |   95.53 |   94.59 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.42 |     100 |    97.2 | ...01,321,418-419 
  managed.ts       |    81.7 |    87.87 |   58.33 |   83.87 | 216-237           
  suppression.ts   |     100 |      100 |     100 |     100 |                   
  tools.ts         |   93.93 |    92.18 |     100 |   93.61 | ...18,531,544,571 
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
 ...mands/workflow |    92.3 |    84.69 |   96.31 |   93.78 |                   
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
  locks.ts         |   92.09 |    86.44 |   92.59 |   94.03 | ...04-305,474-475 
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
  summary.ts       |   95.92 |    89.68 |   94.11 |   96.21 | ...05-611,634,657 
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
Statements   : 89.82% ( 19141/21310 )
Branches     : 83.38% ( 14312/17163 )
Functions    : 95.1% ( 3073/3231 )
Lines        : 91.18% ( 16764/18384 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 242 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 198 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 204 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 224 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 187 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 201 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 72 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 231 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 193 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 196 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 200 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 197 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 204 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 211 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 768 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 501 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 20 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 33 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 48 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 545 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 338 ms
ok 30 refresh drops a file deleted in the index from the build # in 335 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 800 ms
ok 32 a key removed from the env file is unset on the next run # in 173 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 150 ms
ok 34 non-BKIT_ keys are skipped # in 147 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 155 ms
ok 36 a failed unsetenv is retried on the next run # in 170 ms
ok 37 logs key names only, never values # in 141 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 305 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (105.672708ms)
✔ shell cancellation waits for SIGTERM cleanup (138.146875ms)
✔ direct cancellation waits for SIGINT cleanup (84.247708ms)
✔ shell cancellation waits for SIGINT cleanup (159.7445ms)
✔ direct cancellation waits for SIGHUP cleanup (86.110792ms)
✔ shell cancellation waits for SIGHUP cleanup (161.450792ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (382.277ms)
✔ shell cancellation follows a worker orphaned by a nested shell (227.879417ms)
✔ direct cancellation preserves a nested machine-lock owner (413.680583ms)
✔ shell cancellation preserves a nested machine-lock owner (460.49025ms)
✔ nested shell cancellation preserves a nested machine-lock owner (458.303917ms)
✔ a hard process-group timeout reaches a shell command during cleanup (85.91075ms)
✔ ships a command-scoped sleep prevention wrapper (0.059084ms)
✔ preserves arguments, output and nonzero exit status (42.326125ms)
✔ runs an entire shell chain and retains its failure (26.410208ms)
✔ reports a missing command as 127 (23.908375ms)
✔ requires a command (23.013958ms)
✔ non-macOS platform selection runs commands without sleep prevention (38.460959ms)
✔ hard timeout escalation reaches a command that ignores TERM (142.655666ms)
✔ forwards POSIX cancellation to the command and releases the assertion (49.471125ms)
✔ holds a real macOS assertion only while the command runs (61.726458ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3202.844041
> [bkit] TRUNCATED — kept 1807 of 3383 lines (130 KB of 261 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
