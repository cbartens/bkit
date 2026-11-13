
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit:gate:static-unit-integration — /Users/christian/Documents/GitHub/bkit (pid 36393, since 17:38:49), last run took 0m8s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit:gate:static-unit-integration — /Users/christian/Documents/GitHub/bkit (pid 36393, since 17:38:49), last run took 0m8s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit:gate:static-unit-integration — /Users/christian/Documents/GitHub/bkit (pid 36393, since 17:38:49), last run took 0m8s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 5 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 7 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 8 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 9 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 10 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/930-build-tick-green (pid 90670, since 17:51:42), no earlier run

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
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
 1049:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1161:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1253:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1495:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1555:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> bkit ci slop

[bkit-ci] base 1901b02cf1bdd97815a3c7b5963d3d95197097d9 (1901b02cf1bdd97815a3c7b5963d3d95197097d9) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 1901b02cf1bdd97815a3c7b5963d3d95197097d9
base: 1901b02cf1bdd97815a3c7b5963d3d95197097d9
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 19.3 on 10 cores: unit limits 14150ms per test, 28300ms per hook (x2.83)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 40701ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 773ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1327ms
     ✓ always writes the marker, even with no plan 480ms
     ✓ writes the linear marker shape, taking the tracker from package.json 903ms
     ✓ writes the jira marker shape, taking the tracker from package.json 969ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 498ms
     ✓ refuses a PR from dev, main, or the base itself 415ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1084ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1226ms
     ✓ exits 5 when the open-PR probe errors 766ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 764ms
     ✓ prs open still opens against any other base 734ms
     ✓ exits 6 when the created PR's base is not --base 976ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2650ms
     ✓ refuses merged entry when current feature evidence cannot be read 934ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 832ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 401ms
     ✓ exits 1 with found=false when there is none 485ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 759ms
     ✓ --number reads one PR, mergeable included 529ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 456ms
     ✓ exits 4 when gh errors and 80 when it needs auth 634ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 385ms
     ✓ classifies a refused merge with a new dev conflict as integration 379ms
     ✓ returns an explicit terminal reason for other merge refusals 680ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 371ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 596ms
     ✓ drops the force-build marker from the title subject 376ms
     ✓ takes an explicit --subject 484ms
     ✓ runs no merge when the PR is already MERGED 358ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 604ms
     ✓ prs merge refuses a PR whose base is main 339ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 550ms
     ✓ prs merge refuses when the PR base is unknown 338ms
     ✓ prs merge reads the base from the one pr view it already makes 389ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 515ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 538ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 329ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 422ms
     ✓ never reads dev's required checks without --only-if-required 341ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 413ms
     ✓ updates when a dev ruleset requires status checks 425ms
     ✓ updates when dev's branch protection requires status checks 418ms
     ✓ ignores dev rulesets that require no checks 540ms
     ✓ updates when the repo cannot be resolved 364ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 393ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 379ms
     ✓ is not green when a check failed, naming it (exit 1) 322ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 505ms
     ✓ is not green on an empty rollup (total 0) 667ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 533ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 591ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 361ms
     ✓ is a no-op when the title already says so 411ms
     ✓ strips the marker, with or without its bkit prefix 682ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 768ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 45383ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 391ms
     ✓ adopts the main checkout even when called from a linked worktree 433ms
     ✓ design and plan in place on main are refused 462ms
     ✓ still adopts a cloud session branch whose upstream is main 440ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1488ms
     ✓ may debug in place on dev 614ms
     ✓ adopts in place when the session is already on feat/{fid} 414ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1245ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1106ms
     ✓ a new run of the same FID rewrites startSha 2077ms
     ✓ a resume of the same FID reuses the record 1723ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1148ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1213ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1199ms
     ✓ a stale record without a lock is replaced 1425ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1192ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3953ms
     ✓ names inherited commits and ship recovery in the refusal 1004ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1177ms
     ✓ ship names a missing feat branch 401ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1153ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 355ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 411ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 419ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 500ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 474ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 344ms
     ✓ never commits an entry only the main checkout's copy list names 411ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 535ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 320ms
     ✓ tells a caller inside the removed worktree where to cd 393ms
     ✓ fails with its own exit code when git cannot remove a marked path 301ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1073ms
       ✓ preserves staged-only mode during landed cleanup 1141ms
       ✓ preserves staged-only type during landed cleanup 1096ms
       ✓ preserves staged-only deletion during landed cleanup 1167ms
       ✓ removes landed staged content when both index and working contents are on dev 1211ms
       ✓ deletes the proved local and remote branch at their landed tips 1419ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1620ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 509ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 467ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 302ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 522ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 979ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 45549ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 918ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 989ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1033ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 446ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 928ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 435ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 513ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 766ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1417ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 931ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 457ms
     ✓ PASS is 0 failures with or without reports 844ms
     ✓ clears a previous attempt's reports before the gate runs 755ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 864ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1081ms
     ✓ a log under the outbox is named main-checkout relative in the record 816ms
     ✓ a log small enough is copied whole: not clamped, raw null 444ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 399ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 599ms
     ✓ numbers runs within the workflow's active run and per step 566ms
     ✓ without --file no row is written and the output carries row null 441ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 846ms
     ✓ a planned test that passes is a vacuous gap, exit 1 628ms
     ✓ a planned test absent from a loaded report is a missing gap 516ms
     ✓ a file that fails to load is a red of kind red-not-loaded 703ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 822ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 306ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1040ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 707ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 558ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1300ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 733ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1015ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 956ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1190ms
     ✓ green: a passed-accepted test is already landed, not a gap 769ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 847ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 678ms
     ✓ green: --group audits only that group's tasks 618ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 822ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1087ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 618ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 895ms
     ✓ green: lists each gap kind, with the runner output 591ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1340ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 520ms
       ✓ green clears an exception-only task from a human commit 406ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 49151ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 796ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 526ms
     ✓ done --group writes group on the row 509ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 738ms
     ✓ carries extra fields, parsed as JSON when they are JSON 480ms
     ✓ reports a failed commit with exit 8 without writing the row 904ms
     ✓ a failed commit leaves no row staged in the index 1161ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1453ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 856ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1094ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1325ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1160ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 416ms
     ✓ --ref reads the status file as committed on that ref, not from disk 401ms
     ✓ --ref exits 3 when the ref does not carry the status file 505ms
     ✓ fails on a placeholder left in the artifact 349ms
     ✓ fails when the row's verdict differs from the artifact's 423ms
     ✓ fails when the row does not list the artifact, or carries another attempt 389ms
     ✓ fails on a missing artifact 402ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 396ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 360ms
     ✓ fails a run-tests row missing its scope, and an empty scope 525ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 504ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 532ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 337ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 623ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 805ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 600ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 724ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1130ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 679ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 323ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 677ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 504ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 350ms
     ✓ --attempt-of checks the row carries the derived counter 373ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 987ms
     ✓ writeStepRow refuses when a recorded path changed 1135ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 582ms
     ✓ writeStepRow appends its commit sha to the record 958ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1224ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 396ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 753ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 710ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 442ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1190ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 831ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 634ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 414ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1106ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 435ms
     ✓ does not count an artifact the run found committed when it started 581ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 349ms
     ✓ commits a package.json change outside bkit.workflows 542ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1006ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 60134ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2133ms
     ✓ runs code.ts through its declared gate in the built checkout 2246ms
     ✓ runs code.ts through its declared gate in the built checkout 2323ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1762ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1849ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2033ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 962ms
     ✓ runs the full gate for replayed debug code 1746ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1948ms
     ✓ installs local dependencies against the built target tree 2205ms
     ✓ runs the configured frozen install even without root dependencies 1891ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1855ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2015ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2013ms
     ✓ never pushes local dev commits missing from origin/dev 1969ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3486ms
     ✓ dev moved before every push: exhausted, nothing landed 5251ms
     ✓ any other refusal is returned, not retried 2270ms
     ✓ pushToDev replays a commit range onto origin/dev 2056ms
     ✓ a replay retries on the new dev when dev moved 3391ms
     ✓ pushToDev log line names what it lands 1751ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1756ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1966ms
     ✓ a push that fails without a server answer is returned once, never retried 1641ms
     ✓ a failed fetch is returned before anything is built 620ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2493ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1695ms
     ✓ lands from a clone whose fetch refspec omits dev 2033ms
     ✓ build throwing stops the landing and removes the throwaway checkout 746ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 12859ms
   ✓ real workflow sources (37)
     ✓ bkit-build resolves cleanly for github 467ms
     ✓ bkit-build resolves cleanly for linear 427ms
     ✓ bkit-build resolves cleanly for jira 593ms
     ✓ bkit-debug resolves cleanly for jira 307ms
     ✓ bkit-plan resolves cleanly for linear 380ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-build: the github render keeps the warning bullet once and the recovery in Step 1 522ms
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 382ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 501ms
   ✓ issue-scan call sites (#135) (12)
     ✓ bkit-debug wires a jira scan whose hits the engine reads 362ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 33542ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 331ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 413ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2292ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 332ms
     ✓ rolls over after intervening comments external edits and deletion 361ms
     ✓ starts only new source after overflow or missing source 338ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 302ms
     ✓ reserves new comment opportunity within total delivery budget 788ms
     ✓ attempts independent attention after routine uncertainty 391ms
     ✓ seals an acknowledged segment after a postflight intervening comment 335ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 393ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1085ms
     ✓ seals unavailable or unstable representation evidence 491ms
     ✓ uses accepted final preflight eligibility without provider atomicity 460ms
     ✓ rejects marker preserving external edits 443ms
     ✓ preserves generated first line and extracts versioned h6 section markers 405ms
     ✓ returns owned comment identity and stable representation evidence 464ms
     ✓ selects newest created comment across complete pages 469ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 678ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 426ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 425ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 446ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 498ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 388ms
     ✓ fetches the issue and its comments as GitHub returns them 450ms
     ✓ github fetch marks a closed issue terminal and an open one not 986ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 425ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 545ms
     ✓ invalidates missing corrupt and unsupported progress cache 1185ms
     ✓ contains cache read and write failures as standalone degradation 541ms
     ✓ uses legacy receipts and contains receipt failures 1317ms
     ✓ records an engine-action row and skips the same key + body on a re-run 473ms
     ✓ a recent identical comment counts as done (the final close comment) 761ms
     ✓ a failed post reports done false with the reason and never leaks a token 646ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 463ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 599ms
     ✓ a different marker hash posts 462ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 447ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 30911ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 399ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 366ms
     ✓ staging failure: exit 4 and no commit is created, no false success 343ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 406ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 317ms
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 35457ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1002ms
     ✓ names each net-new and worsened finding in the log and the JSON 932ms
     ✓ fails on a net score rise with no net count change 714ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 700ms
     ✓ treats a net score at or below 0.001 as float noise 719ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 589ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 313ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 779ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 734ms
     ✓ exits 4 on a dropped net field instead of silently passing 930ms
     ✓ exits 4 on no summary instead of silently passing 867ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1074ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1049ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 953ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 922ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 631ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 696ms
     ✓ fails (exit 1) when vale reports alerts 570ms
     ✓ exits 6 on a vale runtime error 1049ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 495ms
     ✓ falls back to vale sync when the main worktree has none 691ms
     ✓ fails when vale sync cannot restore the required styles 866ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 474ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 348ms
     ✓ is a usage error when the commit cannot be read 332ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 527ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 425ms
     ✓ exits 1 naming the files outside, whatever the commit message says 391ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 734ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 547ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 448ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1076ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 588ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1075ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 726ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 478ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 544ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 503ms
     ✓ an unpinned repo reports nulls and asks no registry 526ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 406ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 442ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 468ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 429ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 25638ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2378ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2347ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 365ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 401ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 341ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2542ms
     ✓ does not fall back through a malformed later success receipt 1434ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1183ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1134ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1875ms
     ✓ requires proof even when the pushed increment changes no files 983ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 709ms
     ✓ does not record a committed tree 727ms
     ✓ records no proof for a failed gate or lighter gate 1110ms
     ✓ requires integration proof when integration is declared 1398ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2415ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 388ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1555ms
     ✓ freezes explicit workflow run attempt and all failed job pages 939ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2061ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2278ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1659ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2198ms
     ✓ checks the named repository base and fails closed on missing evidence 1111ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1030ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1127ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 662ms
       ✓ a source change past the validated head refuses (17) and names the path 566ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 615ms
       ✓ --validated without --month / --fid is a usage error (2) 453ms
       ✓ a validated sha that is not an ancestor refuses (17) 514ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 526ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1113ms
     ✓ a failed re-trigger push names the cause in the log 1361ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1132ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1908ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1102ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 556ms
     ✓ gh-error: every poll errored 516ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 959ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 978ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1148ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1023ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2627ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2510ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 685ms
     ✓ re-trigger on dev only uses the record of its own FID 890ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 775ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 353ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 602ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 395ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 487ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 635ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 709ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 713ms
     ✓ --file and --step go together 595ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 301ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 305ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ re-derives per call: one run's answer does not leak into the next 331ms
   ✓ bkit runtime row (6)
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 342ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 350ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 365ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:32495) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 613ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1943ms
     ✓ a refused dev push is logged, never fails the close 2346ms
     ✓ an unreachable remote is logged, never fails the close 748ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 24407ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 64 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 664ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 433ms
     ✓ follows summary cursors even when the first page is shorter than the limit 526ms
     ✓ reports excluded intervals as unread even when pagination finishes 441ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 504ms
     ✓ reports an unread remainder at the page cap 445ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 428ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 333ms
     ✓ rejects missing summaries instead of treating them as empty results 393ms
     ✓ reports a failed first page as unavailable 380ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 645ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 419ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 449ms
     ✓ follows summary cursors even when the first page is shorter than the limit 507ms
     ✓ reports excluded intervals as unread even when pagination finishes 411ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 491ms
     ✓ reports an unread remainder at the page cap 434ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 412ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 503ms
     ✓ rejects missing summaries instead of treating them as empty results 361ms
     ✓ reports a failed first page as unavailable 418ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 9938ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 28418ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 5163ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1346ms
     ✓ runGit names ENOBUFS when output passes the limit 1099ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1004ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 476ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1105ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 544ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 6529ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 797ms
     ✓ counts files committed since --base 733ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 553ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1242ms
     ✓ runs the --fallback gate even when no file changed, as it did before 759ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 831ms
     ✓ resolves config from the repo root when run from a subdirectory 300ms
     ✓ exits 6 when the PUT fails 447ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 609ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 332ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 429ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 303ms
     ✓ exits 6 when the api answer is not JSON 308ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 3687ms
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
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 763ms
     ✓ passes every rule on a clean head 309ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 335ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (42 tests) 2878ms
   ✓ bkit decisions compose (21)
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 360ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 375ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 407ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 792 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 192 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 322ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 333ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 199ms
(node:44273) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:44273) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 136ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 251ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 120ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 140ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 266ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 219ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-hRi96I/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-WwG4Io/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 129ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 136ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 255ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 116ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 153ms
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

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 227ms
 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 176ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 100ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 80ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 129ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 91ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 178ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 112ms
(node:46160) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:46160) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:46160) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:46160) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 68ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 131ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 84ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 60ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 147ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 71ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 71ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 43ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 71ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 104ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 97ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 87ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 60ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 105ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 81ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 126ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 81ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 49ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 145ms
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

 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 124ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 103ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 127ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 56ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 33ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 49ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 15ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 18ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 94ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 25ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 49ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 27ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 25ms
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

 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 20ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 29ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794556948735.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794556948738.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794556948739.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794556948747.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 25ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 28ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 54ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 31ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 33ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 66ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 17ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 17ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (162 tests) 145786ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 612ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2010ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 375ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 402ms
     ✓ writes no limits for a workflow with no ask point 313ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 426ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 513ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 526ms
       ✓ a new run in the same chat gets its own session row 621ms
       ✓ writes none outside Claude Code 416ms
     ✓ opens the next run after a finished one, and after another workflow's run 479ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 487ms
     ✓ design / plan / build / debug book in the current worktree 397ms
     ✓ refuses when the lock is live, writing no row 311ms
     ✓ --lock-held checks the lock is ours 459ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 352ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 621ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 352ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 391ms
     ✓ an OPEN decision of an earlier run never resurfaces 507ms
     ✓ an OPEN decision mid-build prints its header fields 328ms
     ✓ openDecision carries the Gate header 332ms
     ✓ openDecision gate is null without the header 408ms
     ✓ openDecision gate ignores a Gate line below the header 318ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 470ms
     ✓ writes no row when status.jsonl does not exist 376ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 493ms
     ✓ aborts a rebase only when one is in progress 822ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 672ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 740ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 434ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 418ms
     ✓ --max-exceeded says a handover is due without any sentinel 425ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 310ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 478ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 481ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 301ms
     ✓ a debug run in SOAK mode always needs a handover 394ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 949ms
       ✓ counts subagents of an earlier chat the run's session rows name 855ms
       ✓ records no context block, and still closes, outside a Claude Code session 855ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1026ms
     ✓ records ending held and publish false on the workflow-done row 877ms
     ✓ defaults the close row to ending done 869ms
     ✓ refuses an unknown ending 351ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 915ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 879ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 889ms
     ✓ always writes the telemetry, whatever the runtime 847ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 686ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 835ms
     ✓ an unwritable stats path is logged and never fails the close 764ms
     ✓ appends the completeness row before the workflow-done row 926ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 892ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 820ms
     ✓ writes one completeness row per close 1401ms
     ✓ leaves out the previous run's rows that share a second with this run's start 779ms
     ✓ still closes when the completeness check throws 889ms
     ✓ still closes when the completeness row write throws 865ms
     ✓ ship: run.pr, size of the squash commit, and coverage 949ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1295ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 872ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 763ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 970ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1029ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1182ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 947ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 975ms
     ✓ --record-step writes the close step's row before workflow-done 662ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 834ms
     ✓ --number without --outbox is a usage error 734ms
     ✓ --flush is ship only 301ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 966ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1009ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1102ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1063ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 803ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 372ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 401ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2315ms
     ✓ --flush with nothing to record commits and pushes nothing 1229ms
     ✓ --flush carries the named worktree's logs into the dev commit 2254ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3282ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2521ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2806ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2320ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3327ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2580ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2836ms
     ✓ --push on dev never carries a row whose references name another feature 2625ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2527ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5036ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2744ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1321ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3156ms
     ✓ preserves unlanded file deletions and ledger additions on close 5774ms
     ✓ preserves dirty work and uncertain branch evidence during close 6176ms
     ✓ preserves a local feature ref changed after its cleanup proof 5987ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3714ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2707ms
     ✓ a close that landed releases the lock 2885ms
     ✓ removes the worktree before it releases the lock 1709ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2605ms
       ✓ closePr refuses when the PR base is unknown 2819ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1370ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 438ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 709ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 325ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 306ms
     ✓ a second run's record does not let this FID's close commit 375ms
     ✓ record is present after workflows close and before the push 732ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1319ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 544ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 420ms
     ✓ puts each --line after the summary, in flag order 419ms
     ✓ --summary prints the file and keeps a copy in --outbox 433ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 460ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 221496ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 820ms
     ✓ rejects missing explicit and ambiguous existing branch selections 707ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1105ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1089ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 908ms
     ✓ a refused --continue carries git's own reason 1025ms
     ✓ --file records nothing for a refused rebase 776ms
     ✓ refuses a code conflict and aborts the rebase on the spot 810ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1642ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 737ms
     ✓ produces byte-identical output to merge=union 1823ms
     ✓ restores a trailing newline so the next append starts on its own line 1074ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 902ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1366ms
     ✓ refuses a union that leaves a line which is not JSON 737ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 995ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1414ms
     ✓ refuses a lockfile whose regenerate command fails 1009ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1516ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1321ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1193ms
     ✓ refuses and aborts when both sides changed the hand-written region 847ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 922ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1078ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1397ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 781ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 893ms
     ✓ refuses and aborts when a side deleted the install record 766ms
     ✓ refuses a conflicted doc the repo's script does not list 692ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 646ms
     ✓ removes a stale sentinel when the rebase succeeds 920ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1227ms
     ✓ resolves a conflict in each of two replayed commits across rounds 971ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 518ms
       ✓ skips (12) with no anchor 546ms
       ✓ skips (12) when the base is unreachable in this clone 618ms
       ✓ skips (12) when nothing landed since the base 591ms
       ✓ runs (0) with the landed path count once dev moved 1119ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 586ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1236ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 788ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 954ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1662ms
     ✓ runs exactly one git push 1264ms
     ✓ --set-upstream records the upstream 858ms
     ✓ refuses with no branch checked out 642ms
     ✓ --mode=dev refuses a feature checkout 635ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1518ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2549ms
     ✓ --require-ci pushes as-is when dev has not moved 1051ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1757ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2473ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 651ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1052ms
     ✓ --mode=abort pushes when the branch has no open PR 1007ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 841ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 588ms
     ✓ --open-pr carries the MCP answer and skips gh 753ms
     ✓ --mode=abort on dev pushes plainly without probing 781ms
     ✓ rejects an unknown mode 550ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2430ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1290ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1558ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3790ms
     ✓ skip-ci HEAD on the replay is refused 1095ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2834ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3340ms
     ✓ a level local dev is a plain push, recording nothing extra 1455ms
     ✓ a record with no commits pushes nothing 1031ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 668ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1372ms
     ✓ a rewritten branch is refused, never forced 1011ms
     ✓ refuses dev and main with exit 21 and pushes nothing 630ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1561ms
     ✓ refuses a detached HEAD (exit 5) 686ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1569ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1419ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1283ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1610ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 763ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1655ms
     ✓ an up-to-date branch is a no-op 973ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1561ms
     ✓ a fetch that fails exits 10 649ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 861ms
     ✓ scan-diff still reports a new skip when its test … 900ms
     ✓ scan-diff reports a skip moved onto a different t… 743ms
     ✓ scan-diff does not cancel a skip moved between am… 872ms
     ✓ scan-diff does not spend an unchanged duplicate t… 782ms
     ✓ scan-diff recognizes a renamed test file 782ms
     ✓ scan-diff recognizes a suite moved into a differe… 741ms
     ✓ scan-diff does not let unrelated additions hide a… 819ms
     ✓ scan-diff attributes deletion to its old test ins… 840ms
     ✓ scan-diff consumes each moved assertion once and … 916ms
     ✓ scan-diff does not match identical assertions fro… 889ms
     ✓ scan-diff does not match the same leaf test name … 740ms
     ✓ scan-diff does not match a same-named test with d… 858ms
     ✓ scan-diff does not match a same-named test with c… 1057ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 888ms
     ✓ --paths with no match exits 1 773ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 591ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1172ms
     ✓ --marker reads a diff over 1 MiB 902ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1018ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 999ms
     ✓ scan-diff finds an added skip 995ms
     ✓ scan-diff ignores a skip predating the base 858ms
     ✓ scan-diff reports a disabled test with its line 1091ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1016ms
     ✓ scan-diff ignores a removed comment in a test file 862ms
     ✓ scan-diff ignores an assertion moved within the file 827ms
     ✓ scan-diff still reports a removed assertion 847ms
     ✓ scan-diff reports an assertion re-added only outside the test file 817ms
     ✓ scan-diff finds an added pytest mark skip 868ms
     ✓ scan-diff finds an added unittest skip 690ms
     ✓ scan-diff finds an added bare skip call 496ms
     ✓ scan-diff ignores a quoted skip in a documentation file 483ms
     ✓ scan-diff ignores a marker literal in a non-test source file 469ms
     ✓ scan-diff ignores an assertion whose expectation changed 428ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 409ms
     ✓ scan-diff reports a deleted test file 397ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1210ms
     ✓ a title that already carries the marker is left alone 697ms
     ✓ with no open PR: pushes the marker commit and edits no title 850ms
     ✓ a re-run is deduped: no second marker commit 937ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1317ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 363ms
     ✓ --title-set skips gh entirely 685ms
     ✓ refuses dev and main (exit 21) 309ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1220ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1929ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1111ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2378ms
     ✓ continues only the explicitly recorded target through the public merge command 1644ms
     ✓ fetches the unseen feature head before classifying the base 1198ms
     ✓ fast forwards the feature before either base path is chosen 2303ms
     ✓ merges divergent feature tips without rebasing either side 1100ms
     ✓ continues the feature merge before starting a dev merge 1824ms
     ✓ publishes local code with a CI running head before bookkeeping 2070ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2678ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1775ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1223ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 347ms
     ✓ Path B once dev moved; --head checks a given commit 497ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 522ms
     ✓ --merge-docs merges dev when docs/ is behind 601ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 595ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 792ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 822ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 676ms
     ✓ --merge-docs skips an empty bkit:generate script 685ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 565ms
     ✓ --merge-docs never merges on dev itself 476ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 711ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 707ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 665ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 678ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 378ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 865ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 857ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1072ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 896ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 851ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1140ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 813ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 949ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 661ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 486ms
     ✓ exits 10 when the fetch fails 310ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 532ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 766ms
     ✓ a failed install stops ship (16) 635ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 554ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 540ms
     ✓ exits 10 when the fetch fails 443ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 315ms
     ✓ preserves unlanded file type changes in the shared landed comparison 313ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 397ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1389ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1395ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1323ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1300ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2605ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3080ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 486ms
     ✓ local: names unpushed dev as the cause when the branch carries it 544ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 592ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1556ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1395ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1036ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4762ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1126ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1148ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1071ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 715ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1693ms
     ✓ land removes the worktree when only the copied .env is untracked 1384ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1193ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1288ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1963ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1339ms
     ✓ landPr refuses a main-based PR without retrying 591ms
     ✓ landPr refuses when the PR base is unknown 541ms
     ✓ PR not open (closed): stops (17) at once, no retry 669ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 462ms
     ✓ --attempt names the merge round in a fix commit 451ms
     ✓ commits a rewritten and a deleted tracked file 460ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 397ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 371ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 438ms

 Test Files  176 passed (176)
      Tests  7591 passed | 2 skipped (7593)
   Start at  18:00:23
   Duration  222.78s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/911-ship-failed-merge/build-group-gate-1-2.log.reports/vitest-7269.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.49 |    82.25 |   94.39 |   89.94 |                   
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
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.06 |   96.42 |   94.53 | ...18-821,868-883 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |    47.2 |    44.69 |   57.14 |   47.59 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.02 |    30.65 |   33.33 |   33.21 | 355-383,565-1078  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   90.07 |    82.88 |   95.18 |   91.58 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.34 |    96.18 |     100 |   99.06 | 314,694           
  decisions.ts     |   94.38 |    83.15 |      98 |   97.21 | ...63,368,445,632 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   94.01 |    89.47 |   96.15 |    95.8 | ...96-198,461-462 
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
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |   88.86 |    81.75 |    92.3 |   90.76 | ...2351,2353,2397 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.03 |    90.27 |    94.2 |   96.33 | ...32-638,661,684 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.49 |    82.77 |    97.4 |    95.1 | ...1773,1947,2679 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1388,1391-1392 
 engine/install    |    91.8 |    83.22 |   93.29 |   94.81 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    90.14 |     100 |     100 | ...19,324,330-331 
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
Statements   : 88.49% ( 20636/23320 )
Branches     : 82.25% ( 16011/19465 )
Functions    : 94.39% ( 3282/3477 )
Lines        : 89.94% ( 18119/20145 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 438 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 214 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 220 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 292 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 213 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 224 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 91 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 246 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 301 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 299 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 224 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 268 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 226 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 247 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 941 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 546 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 19 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 20 ms
ok 19 stub: the response selector is cleared before running its body # in 19 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 23 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 26 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 21 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 18 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 25 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 17 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 41 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 64 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 602 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 464 ms
ok 30 refresh drops a file deleted in the index from the build # in 450 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 462 ms
ok 32 a key removed from the env file is unset on the next run # in 226 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 175 ms
ok 34 non-BKIT_ keys are skipped # in 158 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 176 ms
ok 36 a failed unsetenv is retried on the next run # in 307 ms
ok 37 logs key names only, never values # in 315 ms
ok 38 missing env file exits 0 without calling launchctl # in 27 ms
ok 39 the sweep prints the summary line the lane greps for # in 329 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 11 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (120.612125ms)
✔ shell cancellation waits for SIGTERM cleanup (176.979125ms)
✔ direct cancellation waits for SIGINT cleanup (116.240916ms)
✔ shell cancellation waits for SIGINT cleanup (177.420625ms)
✔ direct cancellation waits for SIGHUP cleanup (115.080375ms)
✔ shell cancellation waits for SIGHUP cleanup (175.123125ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (392.014167ms)
✔ shell cancellation follows a worker orphaned by a nested shell (241.867542ms)
✔ direct cancellation preserves a nested machine-lock owner (463.884208ms)
✔ shell cancellation preserves a nested machine-lock owner (493.32675ms)
✔ nested shell cancellation preserves a nested machine-lock owner (498.720292ms)
✔ a hard process-group timeout reaches a shell command during cleanup (89.57575ms)
✔ ships a command-scoped sleep prevention wrapper (0.075792ms)
✔ preserves arguments, output and nonzero exit status (51.6585ms)
✔ runs an entire shell chain and retains its failure (33.2715ms)
✔ reports a missing command as 127 (31.437375ms)
✔ requires a command (29.50625ms)
✔ non-macOS platform selection runs commands without sleep prevention (48.985ms)
✔ hard timeout escalation reaches a command that ignores TERM (153.70475ms)
✔ forwards POSIX cancellation to the command and releases the assertion (50.170333ms)
✔ holds a real macOS assertion only while the command runs (76.630792ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3577.791666
> [bkit] TRUNCATED — kept 1803 of 3398 lines (131 KB of 263 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
