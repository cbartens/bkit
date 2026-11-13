
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/157 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
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
 515:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 637:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 720:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 631:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 870:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1050:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1162:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1254:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1496:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1556:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 381:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 421:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 492:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 2.3 on 10 cores: unit limits 5650ms per test, 11300ms per hook (x1.13)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 35540ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 655ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1297ms
     ✓ always writes the marker, even with no plan 748ms
     ✓ writes the linear marker shape, taking the tracker from package.json 873ms
     ✓ writes the jira marker shape, taking the tracker from package.json 393ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 872ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 893ms
     ✓ retries a failed create once, and exits 5 when it fails twice 816ms
     ✓ exits 5 when the open-PR probe errors 646ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 613ms
     ✓ prs open still opens against any other base 439ms
     ✓ exits 6 when the created PR's base is not --base 576ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2241ms
     ✓ refuses merged entry when current feature evidence cannot be read 713ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 751ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 563ms
     ✓ exits 1 with found=false when there is none 496ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 602ms
     ✓ --number reads one PR, mergeable included 436ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 426ms
     ✓ exits 4 when gh errors and 80 when it needs auth 473ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 349ms
     ✓ classifies a refused merge with a new dev conflict as integration 343ms
     ✓ returns an explicit terminal reason for other merge refusals 592ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 354ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 502ms
     ✓ drops the force-build marker from the title subject 350ms
     ✓ takes an explicit --subject 349ms
     ✓ runs no merge when the PR is already MERGED 389ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 632ms
     ✓ prs merge refuses a PR whose base is main 342ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 351ms
     ✓ prs merge refuses when the PR base is unknown 389ms
     ✓ prs merge reads the base from the one pr view it already makes 331ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 422ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 305ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 330ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 537ms
     ✓ never reads dev's required checks without --only-if-required 307ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 461ms
     ✓ updates when a dev ruleset requires status checks 395ms
     ✓ updates when dev's branch protection requires status checks 570ms
     ✓ ignores dev rulesets that require no checks 386ms
     ✓ updates when the repo cannot be resolved 364ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 383ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 380ms
     ✓ is not green when a check failed, naming it (exit 1) 322ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 328ms
     ✓ is not green on an empty rollup (total 0) 407ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 323ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 506ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 329ms
     ✓ is a no-op when the title already says so 888ms
     ✓ strips the marker, with or without its bkit prefix 534ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 679ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 38038ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ adopts the main checkout even when called from a linked worktree 325ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1036ms
     ✓ may debug in place on dev 364ms
     ✓ adopts in place when the session is already on feat/{fid} 323ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 969ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 728ms
     ✓ a new run of the same FID rewrites startSha 1341ms
     ✓ a resume of the same FID reuses the record 1248ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 820ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 858ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 958ms
     ✓ a stale record without a lock is replaced 1108ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 980ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3518ms
     ✓ names inherited commits and ship recovery in the refusal 891ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1125ms
     ✓ ship names a missing feat branch 385ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 959ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 358ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 344ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 376ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 391ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 397ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 352ms
     ✓ never commits an entry only the main checkout's copy list names 360ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 499ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 301ms
     ✓ tells a caller inside the removed worktree where to cd 425ms
     ✓ fails with its own exit code when git cannot remove a marked path 349ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1096ms
       ✓ preserves staged-only mode during landed cleanup 1055ms
       ✓ preserves staged-only type during landed cleanup 1085ms
       ✓ preserves staged-only deletion during landed cleanup 1029ms
       ✓ removes landed staged content when both index and working contents are on dev 1177ms
       ✓ deletes the proved local and remote branch at their landed tips 1178ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1695ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 555ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 469ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 471ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 792ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 42893ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 951ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 537ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 842ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 386ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 854ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 399ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 525ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1258ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 432ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 588ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 755ms
     ✓ PASS is 0 failures with or without reports 1026ms
     ✓ clears a previous attempt's reports before the gate runs 670ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 387ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1070ms
     ✓ a log under the outbox is named main-checkout relative in the record 574ms
     ✓ a log small enough is copied whole: not clamped, raw null 730ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 494ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 565ms
     ✓ numbers runs within the workflow's active run and per step 579ms
     ✓ without --file no row is written and the output carries row null 346ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 607ms
     ✓ a planned test that passes is a vacuous gap, exit 1 684ms
     ✓ a planned test absent from a loaded report is a missing gap 464ms
     ✓ a file that fails to load is a red of kind red-not-loaded 649ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 775ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 300ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 959ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 512ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 771ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 347ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1503ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 866ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1081ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 870ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1355ms
     ✓ green: a passed-accepted test is already landed, not a gap 598ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 586ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 654ms
     ✓ green: --group audits only that group's tasks 541ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 817ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 859ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1107ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 804ms
     ✓ green: lists each gap kind, with the runner output 569ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1270ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 487ms
       ✓ green clears an exception-only task from a human commit 421ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (129 tests) 44101ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 532ms
     ✓ finishes a CI round only with its own failed job count 469ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 450ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 480ms
     ✓ carries extra fields, parsed as JSON when they are JSON 338ms
     ✓ reports a failed commit with exit 8 without writing the row 774ms
     ✓ a failed commit leaves no row staged in the index 1178ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 980ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 746ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1109ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 753ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 993ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 406ms
     ✓ --ref exits 3 when the ref does not carry the status file 374ms
     ✓ fails on a placeholder left in the artifact 340ms
     ✓ fails when the row's verdict differs from the artifact's 352ms
     ✓ fails when the row does not list the artifact, or carries another attempt 315ms
     ✓ fails on a missing artifact 358ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 316ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 350ms
     ✓ fails a run-tests row missing its scope, and an empty scope 451ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 492ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 428ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 514ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 778ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 563ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 667ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1003ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 631ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 329ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 711ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 545ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 351ms
     ✓ --attempt-of checks the row carries the derived counter 378ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 977ms
     ✓ writeStepRow refuses when a recorded path changed 1131ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 484ms
     ✓ writeStepRow appends its commit sha to the record 944ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1660ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 359ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 693ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 667ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 420ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1116ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 748ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 550ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 370ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 968ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 413ms
     ✓ does not count an artifact the run found committed when it started 489ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 584ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 986ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 51832ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1505ms
     ✓ runs code.ts through its declared gate in the built checkout 1538ms
     ✓ runs code.ts through its declared gate in the built checkout 1473ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1351ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1233ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1355ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 742ms
     ✓ runs the full gate for replayed debug code 1221ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1509ms
     ✓ installs local dependencies against the built target tree 1803ms
     ✓ runs the configured frozen install even without root dependencies 1608ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1682ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1849ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1829ms
     ✓ never pushes local dev commits missing from origin/dev 1839ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3083ms
     ✓ dev moved before every push: exhausted, nothing landed 5268ms
     ✓ any other refusal is returned, not retried 2129ms
     ✓ pushToDev replays a commit range onto origin/dev 1909ms
     ✓ a replay retries on the new dev when dev moved 3127ms
     ✓ pushToDev log line names what it lands 1516ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1662ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1831ms
     ✓ a push that fails without a server answer is returned once, never retried 1568ms
     ✓ a failed fetch is returned before anything is built 530ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2343ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1742ms
     ✓ lands from a clone whose fetch refspec omits dev 1964ms
     ✓ build throwing stops the landing and removes the throwaway checkout 604ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 22287ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 693ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 628ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 430ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 461ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 673ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 350ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 535ms
     ✓ counts commits behind origin/dev and the divergence age 960ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 395ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1054ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 555ms
     ✓ from a worktree, still names the main checkout and its outbox 861ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 777ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 625ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 583ms
     ✓ prints the Jira site and project under jira 910ms
     ✓ prints the board under github 462ms
     ✓ prints the github progress and review states, defaults for a key left unset 476ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1321ms
     ✓ prints the jira progress and review states, defaults for a key left unset 446ms
     ✓ prints the linear progress and review states, defaults for a key left unset 442ms
     ✓ prints null progress and review states under none 587ms
     ✓ prints buildPublishRemote and buildPublishLocal 609ms
     ✓ prints the publish defaults when package.json omits them 636ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 578ms
     ✓ prints nulls under github without a board, and for keys left unset 1003ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 440ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 900ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 645ms
     ✓ an unpinned repo reports nulls and asks no registry 432ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 502ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 404ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 360ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 425ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 33195ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 925ms
     ✓ names each net-new and worsened finding in the log and the JSON 808ms
     ✓ fails on a net score rise with no net count change 805ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1247ms
     ✓ treats a net score at or below 0.001 as float noise 623ms
     ✓ passes when the change only resolves findings 742ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 680ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base resolves to HEAD 326ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 721ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 539ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 324ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 667ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 809ms
     ✓ exits 4 on a dropped net field instead of silently passing 854ms
     ✓ exits 4 on no summary instead of silently passing 710ms
     ✓ exits 4 on output that is not JSON instead of silently passing 659ms
     ✓ exits 5 when the base worktree cannot be created 384ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1090ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1215ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 985ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 863ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 1008ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 549ms
     ✓ fails (exit 1) when vale reports alerts 604ms
     ✓ exits 6 on a vale runtime error 605ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 467ms
     ✓ falls back to vale sync when the main worktree has none 408ms
     ✓ fails when vale sync cannot restore the required styles 603ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 424ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 395ms
     ✓ exits 1 naming the files outside, whatever the commit message says 396ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 746ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 470ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 399ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 351ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 609ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 888ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 408ms
     ✓ fetches the issue and its comments as GitHub returns them 515ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 647ms
     ✓ invalidates missing corrupt and unsupported progress cache 1038ms
     ✓ contains cache read and write failures as standalone degradation 497ms
     ✓ uses legacy receipts and contains receipt failures 923ms
     ✓ records an engine-action row and skips the same key + body on a re-run 445ms
     ✓ a recent identical comment counts as done (the final close comment) 382ms
     ✓ a failed post reports done false with the reason and never leaks a token 413ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 679ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 428ms
     ✓ a different marker hash posts 438ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 392ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 28995ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 345ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 341ms
     ✓ staging failure: exit 4 and no commit is created, no false success 343ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 353ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1044ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 23009ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2218ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2143ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 368ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 355ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2592ms
     ✓ does not fall back through a malformed later success receipt 1380ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 822ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 911ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1606ms
     ✓ requires proof even when the pushed increment changes no files 949ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 597ms
     ✓ does not record a committed tree 605ms
     ✓ records no proof for a failed gate or lighter gate 1079ms
     ✓ requires integration proof when integration is declared 1281ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2194ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2182ms
     ✓ saves the failed job count without the capstone job 814ms
     ✓ counts the capstone job when it is the only failed job 747ms
     ✓ saves no failed job count when no job failed 936ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1287ms
     ✓ freezes explicit workflow run attempt and all failed job pages 555ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1739ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1765ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1511ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2036ms
     ✓ checks the named repository base and fails closed on missing evidence 985ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 915ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1079ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 591ms
       ✓ a source change past the validated head refuses (17) and names the path 578ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 614ms
       ✓ --validated without --month / --fid is a usage error (2) 402ms
       ✓ a validated sha that is not an ancestor refuses (17) 483ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 507ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1014ms
     ✓ a failed re-trigger push names the cause in the log 1307ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1266ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1748ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1016ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 468ms
     ✓ gh-error: every poll errored 511ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 844ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 891ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 994ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1002ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2501ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2392ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 680ms
     ✓ re-trigger on dev only uses the record of its own FID 790ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 903ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 318ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 518ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 331ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 332ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 479ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 594ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 534ms
     ✓ --file and --step go together 457ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 463ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 407ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 739ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 820ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 591ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 744ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 894ms
     ✓ --file into a missing directory is refused, not created 976ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 773ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 855ms
     ✓ follows summary cursors even when the first page is shorter than the limit 520ms
     ✓ reports excluded intervals as unread even when pagination finishes 409ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 437ms
     ✓ reports an unread remainder at the page cap 751ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 820ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 696ms
     ✓ rejects missing summaries instead of treating them as empty results 909ms
     ✓ reports a failed first page as unavailable 588ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 714ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 977ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1010ms
     ✓ follows summary cursors even when the first page is shorter than the limit 678ms
     ✓ reports excluded intervals as unread even when pagination finishes 1390ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 659ms
     ✓ reports an unread remainder at the page cap 1069ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 706ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 411ms
     ✓ rejects missing summaries instead of treating them as empty results 506ms
     ✓ reports a failed first page as unavailable 406ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 357ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 22975ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 610ms
     ✓ resolves config from the repo root when run from a subdirectory 811ms
     ✓ exits 6 when the PUT fails 424ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 301ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 447ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 414ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 320ms
     ✓ exits 6 when the api answer is not JSON 317ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 12805ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 678ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2213ms
     ✓ a refused dev push is logged, never fails the close 2040ms
     ✓ an unreachable remote is logged, never fails the close 723ms
 ✓ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests) 5193ms
   ✓ GitHub selected-evidence context blocks (4)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 736ms
     ✓ counts files committed since --base 703ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 529ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 527ms
     ✓ runs the --fallback gate even when no file changed, as it did before 554ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 5097ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1333ms
     ✓ runGit names ENOBUFS when output passes the limit 878ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1082ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 581ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1095ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 422ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 3732ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 735ms
     ✓ passes every rule on a clean head 345ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 359ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 2708ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 388ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 359ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 335ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (267 tests) 1610ms
   ✓ issue-less runs (68)
> [bkit] TRUNCATED HERE — 808 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 477 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 101 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 12ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows start — resume facts (8)
     ✓ an OPEN decision of an earlier run never resurfaces 361ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 358ms
     ✓ aborts a rebase only when one is in progress 617ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 526ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 532ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 395ms
     ✓ --max-exceeded says a handover is due without any sentinel 318ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 339ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 370ms
     ✓ a debug run in SOAK mode always needs a handover 303ms
   ✓ bkit workflows close (26)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 609ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 741ms
     ✓ an unwritable stats path is logged and never fails the close 694ms
     ✓ appends the completeness row before the workflow-done row 832ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1067ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 715ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1217ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 815ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 747ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --record-step writes the close step's row before workflow-done 577ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 843ms
     ✓ --number without --outbox is a usage error 729ms
     ✓ --flush is ship only 308ms
   ✓ bkit workflows handover (23)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 400ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 308ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2297ms
     ✓ --flush with nothing to record commits and pushes nothing 1132ms
     ✓ --flush carries the named worktree's logs into the dev commit 2128ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ preserves a local feature ref changed after its cleanup proof 6108ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3551ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2552ms
     ✓ a close that landed releases the lock 3580ms
     ✓ removes the worktree before it releases the lock 3086ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 1747ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1222ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 402ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 650ms
     ✓ a second run's record does not let this FID's close commit 339ms
     ✓ record is present after workflows close and before the push 659ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1199ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 484ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ --file records nothing for a refused rebase 466ms
     ✓ refuses a code conflict and aborts the rebase on the spot 606ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1302ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 465ms
     ✓ produces byte-identical output to merge=union 1235ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 745ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1398ms
     ✓ refuses a lockfile whose regenerate command fails 975ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1187ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1154ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ refuses and aborts when both sides changed the hand-written region 748ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 882ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 972ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1277ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 731ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when nothing landed since the base 584ms
       ✓ runs (0) with the landed path count once dev moved 943ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 468ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1104ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1726ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2472ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 636ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 987ms
     ✓ --mode=abort pushes when the branch has no open PR 980ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1047ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 511ms
     ✓ --open-pr carries the MCP answer and skips gh 658ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1262ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1449ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3418ms
     ✓ skip-ci HEAD on the replay is refused 997ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2489ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 787ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1447ms
     ✓ a fetch that fails exits 10 754ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 903ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 774ms
     ✓ scan-diff attributes deletion to its old test ins… 804ms
     ✓ scan-diff consumes each moved assertion once and … 799ms
     ✓ scan-diff does not match identical assertions fro… 733ms
     ✓ scan-diff does not match the same leaf test name … 782ms
     ✓ scan-diff does not match a same-named test with d… 925ms
     ✓ scan-diff does not match a same-named test with c… 905ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 907ms
     ✓ --paths with no match exits 1 789ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 648ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1161ms
     ✓ --marker reads a diff over 1 MiB 971ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 855ms
     ✓ scan-diff ignores a removed comment in a test file 879ms
     ✓ scan-diff ignores an assertion moved within the file 809ms
     ✓ scan-diff still reports a removed assertion 925ms
     ✓ scan-diff reports an assertion re-added only outside the test file 972ms
     ✓ scan-diff finds an added pytest mark skip 952ms
     ✓ scan-diff finds an added unittest skip 853ms
     ✓ scan-diff finds an added bare skip call 826ms
     ✓ scan-diff ignores a quoted skip in a documentation file 817ms
     ✓ scan-diff ignores a marker literal in a non-test source file 867ms
     ✓ scan-diff ignores an assertion whose expectation changed 494ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 389ms
     ✓ scan-diff reports a deleted test file 394ms
   ✓ branches force-build (8)
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 1608ms
     ✓ publishes local code with a CI running head before bookkeeping 1844ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2477ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1570ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1119ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 753ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 958ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 701ms
     ✓ --merge-docs skips an empty bkit:generate script 583ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 509ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 781ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 955ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 752ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 762ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 996ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ fast-forwards local dev without checking it out 497ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 694ms
     ✓ a failed install stops ship (16) 714ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 522ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 496ms
     ✓ exits 10 when the fetch fails 373ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1292ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1144ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1529ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1040ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 716ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1612ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ commits a rewritten and a deleted tracked file 452ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 387ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 355ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 413ms

> [bkit] TRUNCATED HERE — 106 lines omitted. Dropped content was NOT read.
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.93 |    85.49 |   95.47 |   90.54 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 231 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 773 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 528 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 17 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 19 ms
ok 19 stub: the response selector is cleared before running its body # in 19 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 22 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 25 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 20 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 17 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 23 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 17 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 39 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 60 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 563 ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
ok 33 an empty value unsets the key instead of setting an empty string # in 160 ms
ok 34 non-BKIT_ keys are skipped # in 155 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 168 ms
ok 36 a failed unsetenv is retried on the next run # in 186 ms
ok 37 logs key names only, never values # in 156 ms
ok 38 missing env file exits 0 without calling launchctl # in 29 ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
✔ shell cancellation preserves a nested machine-lock owner (475.656916ms)
✔ nested shell cancellation preserves a nested machine-lock owner (488.685292ms)
✔ a hard process-group timeout reaches a shell command during cleanup (89.837792ms)
✔ ships a command-scoped sleep prevention wrapper (0.07175ms)
✔ preserves arguments, output and nonzero exit status (51.47325ms)
✔ runs an entire shell chain and retains its failure (31.245833ms)
✔ reports a missing command as 127 (31.6035ms)
✔ requires a command (29.022875ms)
✔ non-macOS platform selection runs commands without sleep prevention (45.927375ms)
✔ hard timeout escalation reaches a command that ignores TERM (152.337625ms)
✔ forwards POSIX cancellation to the command and releases the assertion (50.699208ms)
✔ holds a real macOS assertion only while the command runs (71.59075ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
> node scripts/ci/bkit-test-awake.mjs vitest run integration.test

[test-timeout-budget] load average 5.4 on 10 cores: unit limits 7200ms per test, 14400ms per hook (x1.44)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/912-debug-loop-question

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9575ms
     ✓ records the failed job count and reads an uncounted local round as unknown 6528ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 4892ms
     ✓ finishes the first CI evidence round of the second debug run 3085ms
> [bkit] TRUNCATED HERE — 147 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 201 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 142 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 142 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-check] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-check] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ keeps published build completion and PR links in one terminal comment 6095ms
     ✓ continues after the prepared completion source disappears 3203ms
     ✓ records preparation and session association failures despite successful delivery 3010ms
     ✓ associates startup and run across restart or starts fresh safely 4394ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 13134ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ consumer-added extra key in opencode.json → check exits 0 (deep-contain, not drift) 4306ms
     ✓ opencode installed but no provider recorded → check exits 1 and names the fix 3535ms
     ✓ a consumer with no opencode host at all is not failed for a missing provider 3969ms
   ✓ bkit check — antigravity detected from any plugin file (1)
     ✓ deleted plugin.json + neutered guardrails command + deleted guardrails hook → check exits 1 naming each 4964ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ bkit check with stale consumer prompts.md does not emit Missing model lookup 682ms
   ✓ Scenario: bkit check stale-marker gate is branch-scoped (#256) (2)
     ✓ on main: hard-fails (exit 1) and names the bkit-managed-stale BLOCKER 1055ms
     ✓ on a feature branch: surfaces a non-blocking ADVISORY, no marker-drift hard-fail line 962ms
 ✓ .bkit/core/engine/audits/workflows/close-squash.integration.test.ts (15 tests) 53498ms
   ✓ bkit-design.md local close squash (6)
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 113955ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 3992ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 368ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1907ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 2284ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1571ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1188ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2811ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2386ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 4484ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 378ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1805ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1858ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1887ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1474ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1648ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 1886ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2566ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2975ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2834ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2670ms
       ✓ a branch with no status.jsonl dispatches as before 2227ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2411ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3240ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2538ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2493ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ .husky/pre-push: empty stdin → gates still run 557ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 819ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 367ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 331ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 502ms
     ✓ .husky/pre-push: first and last lines name the log 429ms
     ✓ .husky/pre-push: the hook body runs once 763ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 993ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 760ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 638ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 857ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1158ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1040ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 867ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 566ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 903ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 618ms
     ✓ .husky/pre-push: a gate fails → no disk prune 997ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 859ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 782ms
     ✓ a stale register stops the push before any gate runs 1027ms
     ✓ bkit check fails → the push stops before any gate runs 576ms
     ✓ the dependency audit runs before any gate, when its script is present 801ms
     ✓ no dependency-audit script → skipped, the gates still run 1240ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 705ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 563ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 719ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 606ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 751ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 687ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 729ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 705ms
   ✓ graphify register pre-push gate (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ branch with an open PR into dev, register current → push goes on 769ms
     ✓ branch with no open PR → no check, push goes on 1170ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 632ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 459ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1025ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 161 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 139 lines omitted. Dropped content was NOT read.
     ✓ node — with no report path the test file is left as it was 1664ms
     ✓ vitest — with no report path the test file is left as it was 1067ms
     ✓ a run naming files of two kinds is refused as a usage error 494ms
   ✓ bkit:test:file reports a failing test file kind as a red (2)
     ✓ node — a failing probe.test.mjs exits non-zero with a <failure> for its named test 601ms
     ✓ bats — a failing probe.bats exits non-zero with a <failure> for its named test 767ms
   ✓ bkit:lint:file passes a test file its linter does not cover (4)
     ✓ node — scripts/ci/bkit-test-awake.test.mjs lints clean 463ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1644ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2107ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2740ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1076ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 425ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ design installs dependencies like build and debug 991ms
     ✓ plan installs dependencies like build and debug 1456ms
     ✓ design stops on a failed install (5) 1116ms
     ✓ plan stops on a failed install (5) 1083ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 963ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1471ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1349ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1631ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2356ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 2016ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 2306ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1831ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1911ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2611ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 2590ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 3062ms
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 305ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 550ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2079ms
     ✓ preserves fragmented successful FIFO re… 1523ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2565ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 363ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1400ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 461ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 565ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 401ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ Codex: the dependency install runs in the repo after a download step leaves it 510ms
     ✓ Claude session hook: context-fetch provisioning (3)
       ✓ runs every recipe through bkit context provision and tells the agent on stdout what failed 1537ms
       ✓ prints nothing to stdout when every recipe succeeds 883ms
       ✓ logs and carries on when the installed bkit has no provision verb 440ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ github issue without bkit:auto stops the Cursor background session 827ms
     ✓ github closed issue stops the session and an open labelled one passes 1728ms
     ✓ github read failure stops the session naming the tracker and the reason 570ms
   ✓ preflight-tracker.sh — Linear tracker by state category (1)
     ✓ linear completed state renamed Shipped stops the session 767ms
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
     ✓ tests run with an unwritable lock dir exits 4 naming the path 782ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1038ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1052ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1045ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.integration.test.ts (18 tests) 15867ms
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 1000ms
     ✓ a failing file absent at the base commit is the branch's 552ms
     ✓ an undeclared bkit:test:file reads unknown 460ms
     ✓ a failed base install reads unknown and removes the worktree 584ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 733ms
     ✓ copies the worktreeCopy entries into the base checkout 806ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 4434ms
     ✓ a pull_request-event CI run at the base sha does not settle none 848ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 830ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 810ms
     ✓ the base test run does not inherit the hooks-off git config 796ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 173 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 178 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
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
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 141 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
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
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 641ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 599ms
     ✓ stops the step when the command crashed or was misused 1309ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 384 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
   ✓ bkit status — integration (4)
     ✓ exits 0 and prints [bkit-status] prefix 421ms
     ✓ writes zero files (purely read-only — write-set assertion) 408ms
     ✓ reports installed hosts (at minimum claude and cursor on a fresh consumer) 452ms
     ✓ reports opencode as absent when .opencode/ does not exist 400ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ checks credentials for ALL installed providers 715ms
     ✓ marks the active provider with (active) label in doctor output 661ms
stdout | .bkit/core/engine/install/modules/opencode.integration.test.ts > runOpencodeModule — staging zero-footprint on failure (KN-12, Task 2.2) > after a successful install, .opencode/ exists; uninstalling leaves zero footprint
[bkit-install] write: .opencode/agents/bkit-audit-generate.md
[bkit-install] write: .opencode/agents/bkit-build-challenge-1.md
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
     ✓ matches Write and MultiEdit too 349ms
     ✓ warns again for a different file in the same session 368ms
   ✓ gateguard hook — no-op / fail-open cases (7)
     ✓ a subagent sharing its parent's session_id gets its own checklist, once 469ms
stdout | .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 92 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 73 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 68 lines omitted. Dropped content was NOT read.
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

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest boundary: stats copy-only, friction moved (WS4-T1, #343) > count-only aggregates deferrals.jsonl and failures.jsonl without copying prose
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-Q1SeNJ/bkit
> [bkit] TRUNCATED HERE — 137 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ CONTROL — without it, a temp repo's `git -C` init under the hook's GIT_DIR flips core.bare 501ms
     ✓ clears every GIT_* variable, so the same init stays in the temp dir 728ms
     ✓ fails the run when a test writes an identity into the checkout, and removes it 848ms
     ✓ fails the run when a test sets core.bare in the checkout, and puts it back 767ms
 ✓ .bkit/core/engine/audits/hooks/antigravity-hook-commands.integration.test.ts (8 tests) 3349ms
stdout | .bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts
[test] core: .bkit/allowlist.json

stderr | scripts/harvest/ledgers.integration.test.ts > Harvest: a friction row the dispatch seam wrote > keeps a seam-written tool-failure row through commit and harvest
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-integration-w0uxEl/bkit
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
 ✓ scripts/harvest/ledgers.integration.test.ts (24 tests) 3783ms
   ✓ Harvest: a friction row the dispatch seam wrote (1)
     ✓ keeps a seam-written tool-failure row through commit and harvest 1569ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts (14 tests) 1927ms
   ✓ cursor gateguard — advisory delivery (3)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-test] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-test] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 164 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 161 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 78 lines omitted. Dropped content was NOT read.
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] delete (empty after strip): AGENTS.md
[bkit-test] delete (empty after strip): .gitignore
[bkit-test] delete (empty after strip): .gitattributes
[bkit-test] delete: .bkit/version
[bkit-test] delete: .bkit/allowlist.json
[bkit-test] delete: .bkit/authoring.md
[bkit-test] delete: .bkit/cloud.md
[bkit-test] delete: .bkit/cli.md
[bkit-test] delete: .bkit/comparison.md
[bkit-test] delete: .bkit/install.md
[bkit-test] delete: .bkit/jsonl.md
[bkit-test] delete: .bkit/LICENSE.md
[bkit-test] delete: .bkit/pipeline.md
[bkit-test] delete: .bkit/providers.md
[bkit-test] delete (empty after strip): .bkit/prompts.md
[bkit-test] delete: .bkit/router.md
[bkit-test] delete: .bkit/templates.md
[bkit-test] delete: .bkit/trackers.md
[bkit-test] delete: .bkit/workflows.md
[bkit-test] delete: .bkit/README.md
[bkit-test] delete (empty after strip): .agents/context.md
[bkit-test] delete (empty after strip): .agents/docs.md
[bkit-test] delete (empty after strip): .agents/rules.md
[bkit-test] delete (empty after strip): .agents/skills.md
[bkit-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-test] delete: docs/templates/bkit-audit-accessibility.md
[bkit-test] delete: docs/templates/bkit-audit-adoption.md
[bkit-test] delete: docs/templates/bkit-audit-agents.md
[bkit-test] delete: docs/templates/bkit-audit-aio-seo.md
[bkit-test] delete: docs/templates/bkit-audit-analytics.md
[bkit-test] delete: docs/templates/bkit-audit-annotations.md
[bkit-test] delete: docs/templates/bkit-audit-app-performance.md
[bkit-test] delete: docs/templates/bkit-audit-app-store.md
[bkit-test] delete: docs/templates/bkit-audit-architecture.md
[bkit-test] delete: docs/templates/bkit-audit-ci-performance.md
[bkit-test] delete: docs/templates/bkit-audit-config.md
[bkit-test] delete: docs/templates/bkit-audit-cost.md
[bkit-test] delete: docs/templates/bkit-audit-coverage.md
[bkit-test] delete: docs/templates/bkit-audit-database.md
[bkit-test] delete: docs/templates/bkit-audit-dead-code.md
[bkit-test] delete: docs/templates/bkit-audit-deferrals.md
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/core (payload view link)
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .bkit
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

 ✓ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (16 tests) 1113ms
stdout | .bkit/core/engine/install/payload-links.integration.test.ts > uninstall removes the payload view links > dry-run lists the links as deleted without removing them
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitattributes                                   | strip-block            | markered-text — strip bkit block, preserve consumer content
.bkit/version                                    | delete                 | bkit install-state manifest — removed on full/core uninstall
.bkit/allowlist.json                             | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/authoring.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/cloud.md                                   | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/cli.md                                     | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/comparison.md                              | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/install.md                                 | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/jsonl.md                                   | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/LICENSE.md                                 | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/pipeline.md                                | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/providers.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/prompts.md                                 | strip-block            | markered-text — strip bkit block, preserve consumer content
.bkit/router.md                                  | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/templates.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/trackers.md                                | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/workflows.md                               | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.bkit/README.md                                  | delete                 | byte-equal-text: content matches install-time hash — safe to delete
.agents/context.md                               | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/docs.md                                  | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/rules.md                                 | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/skills.md                                | strip-block            | markered-text — strip bkit block, preserve consumer content
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/templates/bkit-audit-accessibility.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-adoption.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-agents.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-aio-seo.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-analytics.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-annotations.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-app-performance.md     | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-app-store.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-architecture.md        | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-ci-performance.md      | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-config.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-cost.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-coverage.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-database.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-dead-code.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-deferrals.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-dependencies.md        | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-documentation.md       | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-duplication.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-failures.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-flakes.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-gates.md               | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-issues.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-llm.md                 | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-logs.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-models.md              | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-privacy.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-prompts.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-red-team.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-reliability.md         | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-repo.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-security.md            | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-slop.md                | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-testing.md             | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-audit-usability.md           | delete                 | bkit-owned docs template — removed on full/core uninstall
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


(node:85650) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:85650) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(node:85650) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(node:85650) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (33 tests) 1162ms
   ✓ bkit-cloud.yml template — dispatch jobs (9)
     ✓ filled bkit-cloud.yml passes actionlint 574ms
stdout | .bkit/core/engine/install/payload-links.integration.test.ts > uninstall removes the payload view links > leaves a real directory at the link path alone — consumer content
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] delete (empty after strip): AGENTS.md
[bkit-test] delete (empty after strip): .gitignore
[bkit-test] delete (empty after strip): .gitattributes
[bkit-test] delete: .bkit/version
[bkit-test] delete: .bkit/allowlist.json
[bkit-test] delete: .bkit/authoring.md
[bkit-test] delete: .bkit/cloud.md
[bkit-test] delete: .bkit/cli.md
[bkit-test] delete: .bkit/comparison.md
[bkit-test] delete: .bkit/install.md
[bkit-test] delete: .bkit/jsonl.md
[bkit-test] delete: .bkit/LICENSE.md
[bkit-test] delete: .bkit/pipeline.md
[bkit-test] delete: .bkit/providers.md
[bkit-test] delete (empty after strip): .bkit/prompts.md
[bkit-test] delete: .bkit/router.md
[bkit-test] delete: .bkit/templates.md
[bkit-test] delete: .bkit/trackers.md
[bkit-test] delete: .bkit/workflows.md
[bkit-test] delete: .bkit/README.md
[bkit-test] delete (empty after strip): .agents/context.md
[bkit-test] delete (empty after strip): .agents/docs.md
[bkit-test] delete (empty after strip): .agents/rules.md
[bkit-test] delete (empty after strip): .agents/skills.md
[bkit-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-test] delete: docs/templates/bkit-audit-accessibility.md
[bkit-test] delete: docs/templates/bkit-audit-adoption.md
[bkit-test] delete: docs/templates/bkit-audit-agents.md
[bkit-test] delete: docs/templates/bkit-audit-aio-seo.md
[bkit-test] delete: docs/templates/bkit-audit-analytics.md
[bkit-test] delete: docs/templates/bkit-audit-annotations.md
[bkit-test] delete: docs/templates/bkit-audit-app-performance.md
[bkit-test] delete: docs/templates/bkit-audit-app-store.md
[bkit-test] delete: docs/templates/bkit-audit-architecture.md
[bkit-test] delete: docs/templates/bkit-audit-ci-performance.md
[bkit-test] delete: docs/templates/bkit-audit-config.md
[bkit-test] delete: docs/templates/bkit-audit-cost.md
[bkit-test] delete: docs/templates/bkit-audit-coverage.md
[bkit-test] delete: docs/templates/bkit-audit-database.md
[bkit-test] delete: docs/templates/bkit-audit-dead-code.md
[bkit-test] delete: docs/templates/bkit-audit-deferrals.md
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

 ✓ .bkit/core/engine/install/payload-links.integration.test.ts (8 tests) 1937ms
   ✓ install creates the payload view links (5)
     ✓ re-points a link that resolves somewhere else 470ms
 ✓ .bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts (13 tests) 1941ms
   ✓ antigravity guardrails.cjs — secret-file reads (view_file) (3)
     ✓ denies private-key material every time 303ms
   ✓ antigravity guardrails.cjs — Antigravity contract (6)
     ✓ delivers an advisory tier by denying once; the identical retry passes 405ms
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
[bkit-install] write version pin: .bkit/version (6.1.1)

 ✓ .bkit/core/engine/install/modules/cloud.integration.test.ts (11 tests) 1039ms
   ✓ runCloudModule — opt-in cloud agents (post-CI auto-routing) (11)
     ✓ the default module set does NOT ship cloud scaffolding 999ms
 ✓ .bkit/core/engine/install/placeholders.integration.test.ts (6 tests) 690ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts (3 tests) 2595ms
   ✓ raw Vitest global setup against wrapped gates (3)
     ✓ the global setup waits for a held tests lock and takes it once the holder ends 979ms
     ✓ the global setup throws naming the holder when the wait gives up 755ms
     ✓ the global setup's teardown frees the tests lock 859ms
 ✓ .bkit/core/engine/install/write.integration.test.ts (4 tests) 13ms
 ✓ .bkit/core/engine/checks/after/managed.integration.test.ts (1 test) 207ms
 ✓ .bkit/core/engine/checks/before/files.integration.test.ts (12 tests) 109ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 517ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 44ms
 ✓ .bkit/core/engine/install/version-file.integration.test.ts (5 tests) 121ms
 ✓ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests) 184764ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 433ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 1507ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 7558ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 2898ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 1139ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 1091ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 1300ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 3288ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 2904ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 3448ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 1332ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --auto=codex without .codex/ exits 1 naming --codex and writes nothing 562ms
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 2113ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 773ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 1971ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 845ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 396ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 396ms
     ✓ explicit `bkit help` prints the same usage and exits 0 437ms
     ✓ `bkit check --claude` (stray module flag) errors 381ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 404ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1133ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1026ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 406ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 1225ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 2065ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 7974ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 8893ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 8592ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 8208ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 2198ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 3181ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 6240ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 9014ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 9587ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 14244ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 12511ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 14375ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 15004ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 4528ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 5511ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 2092ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 3131ms
   ✓ #864 — project document starters and their index (4)
     ✓ ships ten optional document starters on fresh install 1422ms
     ✓ preserves the contents of a legacy managed document when reinstalling 1443ms
     ✓ registers an adopted starter without duplicating project rows 2185ms
     ✓ preserves indexed equivalents and warns about unsafe registration paths 2188ms
stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (77 tests) 260677ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 639ms
     ✓ install --claude does not write Serena or graphify examples 1139ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 623ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 651ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 610ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 9473ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 9431ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 9331ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 9489ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 10074ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 10954ms
     ✓ malformed .mcp.json fails install instead of being overwritten 1793ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 18117ms
     ✓ an adopted copy of every template survives upgrade and check 5200ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 4620ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 4659ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 6578ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 27428ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 7236ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 7855ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 25330ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 4437ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1791ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 3233ms
     ✓ branded script migration is idempotent and dry-run writes nothing 3148ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1945ms
     ✓ a dry-run hook and CI token migration writes nothing 807ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 2124ms
     ✓ a second check-name migration writes nothing 2133ms
     ✓ a dry-run check-name migration writes and moves nothing 872ms
     ✓ a second Vale migration and a dry run write nothing 2213ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 3343ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 2699ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 5109ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 4000ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 2400ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 2110ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 2133ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2404ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 2352ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 2343ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 2536ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 2832ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 3655ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1672ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 555ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 3095ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 2169ms
     ✓ migrates legacy ownership without changing project text or core ownership 2662ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 1924ms
     ✓ previews project document migration without mutating the checkout 1048ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 3103ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 1485ms
     ✓ upgrade names the missing root lint-staged config with the copy command 1534ms
     ✓ install names the missing root lint-staged config under its own log prefix 1798ms
     ✓ check names the missing root lint-staged config under its own log prefix 1398ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 1259ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 1383ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 1553ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 1457ms

 Test Files  58 passed (58)
      Tests  1977 passed (1977)
   Start at  10:42:55
   Duration  261.04s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/912-debug-loop-question/run-tests-1.log.reports/vitest-32003.xml
> [bkit] TRUNCATED — kept 3520 of 24475 lines (245 KB of 1.7 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
