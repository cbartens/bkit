
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 929-hung-test-never build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 36677, since 14:54:42), last run took 14m9s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 929-hung-test-never build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 36677, since 14:54:42), last run took 14m9s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 8.0 on 10 cores: unit limits 8500ms per test, 17000ms per hook (x1.70)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 47496ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 689ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1000ms
     ✓ always writes the marker, even with no plan 546ms
     ✓ writes the linear marker shape, taking the tracker from package.json 512ms
     ✓ writes the jira marker shape, taking the tracker from package.json 722ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 976ms
     ✓ refuses a PR from dev, main, or the base itself 540ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1172ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1074ms
     ✓ exits 5 when the open-PR probe errors 1313ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 940ms
     ✓ prs open still opens against any other base 980ms
     ✓ exits 6 when the created PR's base is not --base 853ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 3046ms
     ✓ refuses merged entry when current feature evidence cannot be read 1040ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 1292ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 500ms
     ✓ exits 1 with found=false when there is none 521ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 766ms
     ✓ --number reads one PR, mergeable included 666ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 553ms
     ✓ exits 4 when gh errors and 80 when it needs auth 853ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 342ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 459ms
     ✓ classifies a refused merge with a new dev conflict as integration 418ms
     ✓ returns an explicit terminal reason for other merge refusals 835ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 474ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 676ms
     ✓ drops the force-build marker from the title subject 601ms
     ✓ takes an explicit --subject 829ms
     ✓ runs no merge when the PR is already MERGED 516ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1099ms
     ✓ prs merge refuses a PR whose base is main 432ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 463ms
     ✓ prs merge refuses when the PR base is unknown 526ms
     ✓ prs merge reads the base from the one pr view it already makes 485ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 902ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 425ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 364ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 430ms
     ✓ never reads dev's required checks without --only-if-required 419ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 682ms
     ✓ updates when a dev ruleset requires status checks 507ms
     ✓ updates when dev's branch protection requires status checks 554ms
     ✓ ignores dev rulesets that require no checks 530ms
     ✓ updates when the repo cannot be resolved 465ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 580ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 462ms
     ✓ is not green when a check failed, naming it (exit 1) 450ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 528ms
     ✓ is not green on an empty rollup (total 0) 441ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 408ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 771ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 614ms
     ✓ is a no-op when the title already says so 427ms
     ✓ strips the marker, with or without its bkit prefix 643ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 631ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ exits 8 on an unreadable commit, writing nothing 404ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 303ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 57854ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 986ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 763ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 937ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 526ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 721ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 463ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 450ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 576ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 824ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 965ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1483ms
     ✓ PASS is 0 failures with or without reports 967ms
     ✓ clears a previous attempt's reports before the gate runs 521ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 531ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 921ms
     ✓ a log under the outbox is named main-checkout relative in the record 1308ms
     ✓ a log small enough is copied whole: not clamped, raw null 624ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 959ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 969ms
     ✓ numbers runs within the workflow's active run and per step 1157ms
     ✓ without --file no row is written and the output carries row null 426ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1054ms
     ✓ a planned test that passes is a vacuous gap, exit 1 606ms
     ✓ a planned test absent from a loaded report is a missing gap 1196ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1809ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1205ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 474ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1579ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 766ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 654ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 330ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1645ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1004ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1503ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1039ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1269ms
     ✓ green: a passed-accepted test is already landed, not a gap 964ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 868ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 319ms
     ✓ green refuses a plan with no task markers 328ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1056ms
     ✓ green: --group audits only that group's tasks 895ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1183ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1025ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 995ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1395ms
     ✓ green: lists each gap kind, with the runner output 790ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1758ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 787ms
       ✓ green clears an exception-only task from a human commit 677ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 61233ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 398ms
     ✓ adopts the main checkout even when called from a linked worktree 546ms
     ✓ design refuses to work in place on dev 308ms
     ✓ build refuses to work in place on dev 302ms
     ✓ design and plan in place on main are refused 490ms
     ✓ still adopts a cloud session branch whose upstream is main 478ms
     ✓ refuses a detached HEAD 321ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1628ms
     ✓ may debug in place on dev 630ms
     ✓ adopts in place when the session is already on feat/{fid} 400ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1340ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1135ms
     ✓ a new run of the same FID rewrites startSha 2431ms
     ✓ a resume of the same FID reuses the record 2217ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1585ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1707ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1653ms
     ✓ a stale record without a lock is replaced 1798ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1507ms
     ✓ refuses inherited unpublished dev commits in every ship mode 5106ms
     ✓ names inherited commits and ship recovery in the refusal 1272ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2846ms
     ✓ ship names a missing feat branch 501ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 2043ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 558ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 347ms
     ✓ fails with a fetch error when there is no origin to rebase onto 550ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 379ms
       ✓ checks no disk when there are no cleanup step files 494ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 622ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 628ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 576ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 314ms
     ✓ never commits an entry only the main checkout's copy list names 619ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 351ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 321ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 708ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 401ms
     ✓ tells a caller inside the removed worktree where to cd 522ms
     ✓ fails with its own exit code when git cannot remove a marked path 419ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1536ms
       ✓ preserves staged-only mode during landed cleanup 1677ms
       ✓ preserves staged-only type during landed cleanup 2174ms
       ✓ preserves staged-only deletion during landed cleanup 1725ms
       ✓ removes landed staged content when both index and working contents are on dev 1729ms
       ✓ deletes the proved local and remote branch at their landed tips 1908ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2376ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 828ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 890ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 394ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 611ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1173ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 67804ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 901ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 725ms
     ✓ done --group writes group on the row 483ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 814ms
     ✓ carries extra fields, parsed as JSON when they are JSON 518ms
     ✓ reports a failed commit with exit 8 without writing the row 1392ms
     ✓ a failed commit leaves no row staged in the index 1513ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1647ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1127ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1548ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 755ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1756ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 637ms
     ✓ --ref reads the status file as committed on that ref, not from disk 631ms
     ✓ --ref exits 3 when the ref does not carry the status file 560ms
     ✓ fails on a placeholder left in the artifact 527ms
     ✓ fails when the row's verdict differs from the artifact's 490ms
     ✓ fails when the row does not list the artifact, or carries another attempt 565ms
     ✓ fails on a missing artifact 554ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 521ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 427ms
     ✓ fails a run-tests row missing its scope, and an empty scope 615ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 710ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 336ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 656ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 1147ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1462ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1060ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1030ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1287ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1503ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 860ms
     ✓ --post needs --number; without --post there is no tracker key 386ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 446ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 931ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 730ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 473ms
     ✓ --attempt-of checks the row carries the derived counter 505ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1465ms
     ✓ writeStepRow refuses when a recorded path changed 1775ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 1016ms
     ✓ writeStepRow appends its commit sha to the record 1884ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1769ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 557ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 989ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 982ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 577ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1644ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1213ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 1237ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 574ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1517ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 580ms
     ✓ does not count an artifact the run found committed when it started 784ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 603ms
     ✓ commits a package.json change outside bkit.workflows 806ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1703ms
   ✓ bkit steps stub --result-file (12)
     ✓ reads held audit keys from the linked worktree's own ledger 328ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 79308ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2315ms
     ✓ runs code.ts through its declared gate in the built checkout 2406ms
     ✓ runs code.ts through its declared gate in the built checkout 2411ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1868ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1663ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2384ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1322ms
     ✓ runs the full gate for replayed debug code 2437ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2832ms
     ✓ installs local dependencies against the built target tree 2816ms
     ✓ runs the configured frozen install even without root dependencies 2434ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2402ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2503ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 3812ms
     ✓ never pushes local dev commits missing from origin/dev 3171ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4782ms
     ✓ dev moved before every push: exhausted, nothing landed 7970ms
     ✓ any other refusal is returned, not retried 2940ms
     ✓ pushToDev replays a commit range onto origin/dev 2813ms
     ✓ a replay retries on the new dev when dev moved 4960ms
     ✓ pushToDev log line names what it lands 2505ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2840ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2526ms
     ✓ a push that fails without a server answer is returned once, never retried 2035ms
     ✓ a failed fetch is returned before anything is built 774ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2960ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2000ms
     ✓ lands from a clone whose fetch refspec omits dev 2533ms
     ✓ build throwing stops the landing and removes the throwaway checkout 867ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 43109ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1259ms
     ✓ names each net-new and worsened finding in the log and the JSON 912ms
     ✓ fails on a net score rise with no net count change 937ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1344ms
     ✓ treats a net score at or below 0.001 as float noise 936ms
     ✓ passes when the change only resolves findings 851ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 780ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 490ms
     ✓ skips (exit 0) when the base resolves to HEAD 512ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1032ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1104ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 372ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1101ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 875ms
     ✓ exits 4 on a dropped net field instead of silently passing 856ms
     ✓ exits 4 on no summary instead of silently passing 956ms
     ✓ exits 4 on output that is not JSON instead of silently passing 883ms
     ✓ exits 5 when the base worktree cannot be created 774ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1169ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1834ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1393ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1180ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1393ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2145ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 969ms
     ✓ explicit globs can select ignored prose and nested checkout files 588ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 499ms
     ✓ fails (exit 1) when vale reports alerts 981ms
     ✓ exits 6 on a vale runtime error 538ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 564ms
     ✓ falls back to vale sync when the main worktree has none 553ms
     ✓ fails when vale sync cannot restore the required styles 781ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 585ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 483ms
     ✓ is a usage error when the commit cannot be read 327ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 582ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 514ms
     ✓ exits 1 naming the files outside, whatever the commit message says 582ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1025ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 643ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 507ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 372ms
     ✓ continues after friction and diagnostic writes fail without recursion 438ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 604ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3759ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 509ms
     ✓ starts only new source after overflow or missing source 362ms
     ✓ uses exact new comment after a failed eligibility read 395ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 354ms
     ✓ recognizes append success within budget without unnecessary resend 301ms
     ✓ preserves a human correction after lost append recognition and a later report 371ms
     ✓ contains exhausted append and create failures without fabricated success 339ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 386ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 348ms
     ✓ reserves new comment opportunity within total delivery budget 995ms
     ✓ contains preparation state lock and reconciliation exceptions 324ms
     ✓ attempts independent attention after routine uncertainty 406ms
     ✓ seals an acknowledged segment after a postflight intervening comment 354ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 516ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 546ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 803ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 461ms
     ✓ fetches the issue and its comments as GitHub returns them 534ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 672ms
     ✓ invalidates missing corrupt and unsupported progress cache 1354ms
     ✓ contains cache read and write failures as standalone degradation 644ms
     ✓ uses legacy receipts and contains receipt failures 574ms
     ✓ records an engine-action row and skips the same key + body on a re-run 574ms
     ✓ a recent identical comment counts as done (the final close comment) 465ms
     ✓ a failed post reports done false with the reason and never leaks a token 476ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 565ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 677ms
     ✓ a different marker hash posts 607ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 538ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 40367ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 521ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 470ms
     ✓ staging failure: exit 4 and no commit is created, no false success 476ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 410ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 415ms
> [bkit] TRUNCATED HERE — 58 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 694ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 955ms
     ✓ follows summary cursors even when the first page is shorter than the limit 609ms
     ✓ reports excluded intervals as unread even when pagination finishes 483ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 578ms
     ✓ reports an unread remainder at the page cap 985ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 597ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 354ms
     ✓ rejects missing summaries instead of treating them as empty results 463ms
     ✓ reports a failed first page as unavailable 453ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 457ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 464ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 498ms
     ✓ follows summary cursors even when the first page is shorter than the limit 605ms
     ✓ reports excluded intervals as unread even when pagination finishes 503ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 827ms
     ✓ reports an unread remainder at the page cap 569ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1035ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 406ms
     ✓ rejects missing summaries instead of treating them as empty results 460ms
     ✓ reports a failed first page as unavailable 484ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 342ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 31895ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3389ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3307ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 442ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 532ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 495ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3466ms
     ✓ does not fall back through a malformed later success receipt 1802ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1166ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1154ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2322ms
     ✓ requires proof even when the pushed increment changes no files 1330ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 692ms
     ✓ does not record a committed tree 840ms
     ✓ records no proof for a failed gate or lighter gate 1227ms
     ✓ requires integration proof when integration is declared 1666ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3054ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 3034ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1460ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1160ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2821ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3103ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2195ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2666ms
     ✓ checks the named repository base and fails closed on missing evidence 1516ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 2223ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1996ms
     ✓ rejects MCP capstone jobs belonging to another run 2628ms
     ✓ --fetch refreshes origin/<branch> before gating 934ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 312ms
     ✓ tells an API error (20) from no run (10) 356ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 330ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 326ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 302ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 592ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1190ms
       ✓ a source change past the validated head refuses (17) and names the path 873ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 977ms
       ✓ --validated without --month / --fid is a usage error (2) 625ms
       ✓ a validated sha that is not an ancestor refuses (17) 810ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 789ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1686ms
     ✓ a failed re-trigger push names the cause in the log 1466ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1510ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3176ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1409ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 729ms
     ✓ gh-error: every poll errored 629ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1203ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1222ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1437ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1326ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3598ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3667ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 932ms
     ✓ re-trigger on dev only uses the record of its own FID 1002ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 926ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 391ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 777ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 428ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 545ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 703ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1018ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 961ms
     ✓ --file and --step go together 752ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 519ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 361ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 422ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1003ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 516ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 921ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1025ms
     ✓ --file into a missing directory is refused, not created 747ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:24347) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
(node:24347) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:24347) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests | 1 failed) 19863ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 3ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ flags an expired, over-long or stale acceptance 0ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 277ms
     ✓ rejects an --unreachable value that is neither fail nor warn 78ms
   ❯ shipped copy-and-own test files (6)
     ✓ finds the shipped .test.mjs files 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 509ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 118ms
     × ci/bkit-test-awake.test.mjs passes when run on its own 8477ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 8621ms
   ✓ capstone env wiring checks (3)
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1138ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 750ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1344ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1010ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 854ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 591ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 694ms
     ✓ an unpinned repo reports nulls and asks no registry 668ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 447ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 712ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 618ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 517ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 484ms
     ✓ resolves config from the repo root when run from a subdirectory 510ms
     ✓ exits 6 when the PUT fails 605ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 378ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 400ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 541ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 421ms
     ✓ exits 6 when the api answer is not JSON 398ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 19292ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 900ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3441ms
     ✓ a refused dev push is logged, never fails the close 3258ms
     ✓ an unreachable remote is logged, never fails the close 1099ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 31959ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 336ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 2027ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 377ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 340ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 346ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 749ms
     ✓ 6. a FID that fails the format check exits 1 303ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 414ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1197ms
     ✓ keeps each context's own section banner and drops every other context's 4538ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 875ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 460ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 17888ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 307ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 361ms
     ✓ trackerState for {"tracker":{"default":"linear","linear":{"review":"Code Review"}}}: phase start "started", hand-off "Code Review" 390ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 868ms
     ✓ counts files committed since --base 843ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1163ms
     ✓ runs nothing and exits 0 when no file changed 368ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1194ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 392ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1807ms
     ✓ runGit names ENOBUFS when output passes the limit 3609ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 3605ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 744ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1298ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 420ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 4601ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 816ms
     ✓ passes every rule on a clean head 433ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 402ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (82 tests) 4874ms
   ✓ bkit status invocation (7)
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
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 982ms
     ✓ source file is not treated as gate config 941ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 702ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 3126ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 348ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 356ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 471ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 351ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1144ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 15447ms
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (4 tests) 1135ms
   ✓ withChildDeadline (4)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 307ms
     ✓ limits execSync and execFileSync the same way 608ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (76 tests) 3438ms
> [bkit] TRUNCATED HERE — 828 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 222 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 364ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 304ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 339ms
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

 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 319ms
 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 162ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 334ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 195ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-BlhueH/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 214ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 307ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 241ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 246ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 396ms
(node:37527) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:37527) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 182ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 168ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 87ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-KGklOD/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 169ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 164ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 147ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 93ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 160ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 190ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 154ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 128ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 148ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 134ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 145ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 98ms
(node:38644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:38644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:38644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:38644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 113ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 177ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 154ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 230ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 126ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 197ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 100ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 159ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 92ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 154ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 173ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 51ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 175ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 166ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 73ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 90ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 150ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 100ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 68ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 109ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 66ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794546227438.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794546227453.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794546227455.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794546227467.js — skipping

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

 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 43ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 88ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 78ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 75ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 32ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 51ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 35ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 55ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 133ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 35ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 48ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 57ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 70ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 20ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 48ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 36ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 34ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 53ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 21ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 23ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 26ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 82ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 29ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 16ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 31ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 35ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 41ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 20ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 26ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 195649ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 784ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2253ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 423ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 393ms
     ✓ writes no limits for a workflow with no ask point 405ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 422ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 573ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 593ms
       ✓ a new run in the same chat gets its own session row 678ms
       ✓ writes none outside Claude Code 368ms
     ✓ opens the next run after a finished one, and after another workflow's run 516ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 428ms
     ✓ design / plan / build / debug book in the current worktree 487ms
     ✓ refuses when the lock is live, writing no row 402ms
     ✓ --lock-held checks the lock is ours 442ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 645ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 415ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 388ms
     ✓ an OPEN decision of an earlier run never resurfaces 843ms
     ✓ an OPEN decision mid-build prints its header fields 507ms
     ✓ openDecision carries the Gate header 429ms
     ✓ openDecision gate is null without the header 468ms
     ✓ openDecision gate ignores a Gate line below the header 348ms
     ✓ reads Test attempt from a tests pause 426ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 696ms
     ✓ writes no row when status.jsonl does not exist 512ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 608ms
     ✓ aborts a rebase only when one is in progress 986ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 925ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1006ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 709ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 622ms
     ✓ --max-exceeded says a handover is due without any sentinel 506ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 486ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 562ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 660ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 375ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 323ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 331ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 377ms
     ✓ a debug run in SOAK mode always needs a handover 469ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1136ms
       ✓ counts subagents of an earlier chat the run's session rows name 1280ms
       ✓ records no context block, and still closes, outside a Claude Code session 1067ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1287ms
     ✓ records ending held and publish false on the workflow-done row 2734ms
     ✓ defaults the close row to ending done 1111ms
     ✓ refuses an unknown ending 539ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1797ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1213ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1163ms
     ✓ always writes the telemetry, whatever the runtime 1089ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1036ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1441ms
     ✓ an unwritable stats path is logged and never fails the close 1046ms
     ✓ appends the completeness row before the workflow-done row 1115ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1514ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1419ms
     ✓ writes one completeness row per close 2720ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1193ms
     ✓ still closes when the completeness check throws 1209ms
     ✓ still closes when the completeness row write throws 1098ms
     ✓ refuses without status.jsonl and writes nothing 336ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1334ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1901ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1938ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1085ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1474ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1462ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1637ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1595ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1382ms
     ✓ --record-step writes the close step's row before workflow-done 1021ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 977ms
     ✓ --number without --outbox is a usage error 1001ms
     ✓ --flush is ship only 435ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1188ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1257ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1285ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1194ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 975ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 537ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 478ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2952ms
     ✓ --flush with nothing to record commits and pushes nothing 1565ms
     ✓ --flush carries the named worktree's logs into the dev commit 3069ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3466ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3116ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3622ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3118ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3777ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3110ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3383ms
     ✓ --push on dev never carries a row whose references name another feature 2967ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3212ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5746ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3547ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1844ms
     ✓ rejects --push with --flush, and --flush outside ship 316ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 5116ms
     ✓ preserves unlanded file deletions and ledger additions on close 8111ms
     ✓ preserves dirty work and uncertain branch evidence during close 7703ms
     ✓ preserves a local feature ref changed after its cleanup proof 6825ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4056ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3072ms
     ✓ a close that landed releases the lock 3937ms
     ✓ removes the worktree before it releases the lock 3891ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5574ms
       ✓ closePr refuses when the PR base is unknown 4341ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2177ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 355ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 612ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 363ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 985ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 424ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 420ms
     ✓ a second run's record does not let this FID's close commit 495ms
     ✓ record is present after workflows close and before the push 1015ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1793ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 344ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 376ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 711ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 578ms
     ✓ puts each --line after the summary, in flag order 610ms
     ✓ --summary prints the file and keeps a copy in --outbox 560ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 626ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 286368ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 856ms
     ✓ rejects missing explicit and ambiguous existing branch selections 754ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1307ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1282ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 901ms
     ✓ a refused --continue carries git's own reason 1099ms
     ✓ --file records nothing for a refused rebase 878ms
     ✓ refuses a code conflict and aborts the rebase on the spot 747ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2017ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 831ms
     ✓ produces byte-identical output to merge=union 2252ms
     ✓ restores a trailing newline so the next append starts on its own line 1223ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1296ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1770ms
     ✓ refuses a union that leaves a line which is not JSON 1133ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1353ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1797ms
     ✓ refuses a lockfile whose regenerate command fails 1335ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1773ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1647ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1612ms
     ✓ refuses and aborts when both sides changed the hand-written region 1095ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1438ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 2395ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 2292ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1042ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1323ms
     ✓ refuses and aborts when a side deleted the install record 1027ms
     ✓ refuses a conflicted doc the repo's script does not list 946ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 992ms
     ✓ removes a stale sentinel when the rebase succeeds 1326ms
     ✓ exits 4 when no rebase is in progress 383ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1479ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1366ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1010ms
       ✓ skips (12) with no anchor 1162ms
       ✓ skips (12) when the base is unreachable in this clone 978ms
       ✓ skips (12) when nothing landed since the base 889ms
       ✓ runs (0) with the landed path count once dev moved 1636ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 756ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1623ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 945ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1384ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2256ms
     ✓ runs exactly one git push 1796ms
     ✓ --set-upstream records the upstream 1117ms
     ✓ refuses with no branch checked out 995ms
     ✓ --mode=dev refuses a feature checkout 863ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2388ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2980ms
     ✓ --require-ci pushes as-is when dev has not moved 1366ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2115ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3088ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 845ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1449ms
     ✓ --mode=abort pushes when the branch has no open PR 1253ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1398ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 737ms
     ✓ --open-pr carries the MCP answer and skips gh 1039ms
     ✓ --mode=abort on dev pushes plainly without probing 1034ms
     ✓ rejects an unknown mode 729ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3455ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1791ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1842ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4355ms
     ✓ skip-ci HEAD on the replay is refused 1300ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3312ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4442ms
     ✓ a level local dev is a plain push, recording nothing extra 1604ms
     ✓ a record with no commits pushes nothing 1298ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 940ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1590ms
     ✓ a rewritten branch is refused, never forced 1165ms
     ✓ refuses dev and main with exit 21 and pushes nothing 833ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2082ms
     ✓ refuses a detached HEAD (exit 5) 757ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1801ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1553ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1431ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2038ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 935ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2075ms
     ✓ an up-to-date branch is a no-op 1402ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2472ms
     ✓ a fetch that fails exits 10 1076ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1226ms
     ✓ scan-diff still reports a new skip when its test … 1357ms
     ✓ scan-diff reports a skip moved onto a different t… 1147ms
     ✓ scan-diff does not cancel a skip moved between am… 993ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1068ms
     ✓ scan-diff recognizes a renamed test file 958ms
     ✓ scan-diff recognizes a suite moved into a differe… 983ms
     ✓ scan-diff does not let unrelated additions hide a… 978ms
     ✓ scan-diff attributes deletion to its old test ins… 1044ms
     ✓ scan-diff consumes each moved assertion once and … 1196ms
     ✓ scan-diff does not match identical assertions fro… 1053ms
     ✓ scan-diff does not match the same leaf test name … 970ms
     ✓ scan-diff does not match a same-named test with d… 984ms
     ✓ scan-diff does not match a same-named test with c… 945ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 960ms
     ✓ --paths with no match exits 1 851ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 695ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1351ms
     ✓ --marker reads a diff over 1 MiB 1198ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1184ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 999ms
     ✓ scan-diff finds an added skip 1110ms
     ✓ scan-diff ignores a skip predating the base 1031ms
     ✓ scan-diff reports a disabled test with its line 1156ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 994ms
     ✓ scan-diff ignores a removed comment in a test file 959ms
     ✓ scan-diff ignores an assertion moved within the file 979ms
     ✓ scan-diff still reports a removed assertion 1092ms
     ✓ scan-diff reports an assertion re-added only outside the test file 949ms
     ✓ scan-diff finds an added pytest mark skip 1110ms
     ✓ scan-diff finds an added unittest skip 969ms
     ✓ scan-diff finds an added bare skip call 934ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1064ms
     ✓ scan-diff ignores a marker literal in a non-test source file 979ms
     ✓ scan-diff ignores an assertion whose expectation changed 1054ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1050ms
     ✓ scan-diff reports a deleted test file 1014ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 862ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2274ms
     ✓ a title that already carries the marker is left alone 1985ms
     ✓ with no open PR: pushes the marker commit and edits no title 1814ms
     ✓ a re-run is deduped: no second marker commit 2061ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2521ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 476ms
     ✓ --title-set skips gh entirely 734ms
     ✓ refuses dev and main (exit 21) 565ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1543ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2655ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1490ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3192ms
     ✓ continues only the explicitly recorded target through the public merge command 2242ms
     ✓ fetches the unseen feature head before classifying the base 1689ms
     ✓ fast forwards the feature before either base path is chosen 3310ms
     ✓ merges divergent feature tips without rebasing either side 1709ms
     ✓ continues the feature merge before starting a dev merge 2643ms
     ✓ publishes local code with a CI running head before bookkeeping 2793ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3966ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2773ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1715ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 385ms
     ✓ Path B once dev moved; --head checks a given commit 548ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 520ms
     ✓ --merge-docs merges dev when docs/ is behind 632ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 623ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 937ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 943ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 777ms
     ✓ --merge-docs skips an empty bkit:generate script 692ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 596ms
     ✓ --merge-docs never merges on dev itself 547ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 746ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 798ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 738ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 773ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 421ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1006ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1143ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1160ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 969ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1000ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1298ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 912ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1110ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 706ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 478ms
     ✓ refuses --merge-docs with --head, and an unknown --head 354ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 630ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 838ms
     ✓ a failed install stops ship (16) 744ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 836ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 759ms
     ✓ exits 10 when the fetch fails 480ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 348ms
     ✓ preserves unlanded file type changes in the shared landed comparison 349ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 318ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1508ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1517ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1520ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1501ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3085ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3567ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 586ms
     ✓ local: names unpushed dev as the cause when the branch carries it 659ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 710ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1625ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1654ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1192ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5003ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1357ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1330ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1190ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 774ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2030ms
     ✓ land removes the worktree when only the copied .env is untracked 1728ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1440ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1524ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2329ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1565ms
     ✓ landPr refuses a main-based PR without retrying 614ms
     ✓ landPr refuses when the PR base is unknown 590ms
     ✓ PR not open (closed): stops (17) at once, no retry 792ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 564ms
     ✓ --attempt names the merge round in a fix commit 579ms
     ✓ commits a rewritten and a deleted tracked file 562ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 472ms
     ✓ reports undeclared and runs nothing with no scripts 342ms
     ✓ reports undeclared and runs nothing with an empty script 448ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 564ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 562ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 376ms

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts
Error: Hook timed out in 23232ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:124:3
    122|
    123| describe("rendered workflow comment contracts", () => {
    124|   beforeAll(() => {
       |   ^
    125|     renderedReportingWorkflows();
    126|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own
AssertionError: ✔ direct cancellation waits for SIGTERM cleanup (272.127709ms)
✖ shell cancellation waits for SIGTERM cleanup (336.963041ms)
✔ direct cancellation waits for SIGINT cleanup (239.926042ms)
✔ shell cancellation waits for SIGINT cleanup (461.009208ms)
✔ direct cancellation waits for SIGHUP cleanup (375.570417ms)
✔ shell cancellation waits for SIGHUP cleanup (460.625625ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (801.715667ms)
✔ shell cancellation follows a worker orphaned by a nested shell (448.128875ms)
✔ direct cancellation preserves a nested machine-lock owner (996.046375ms)
✔ shell cancellation preserves a nested machine-lock owner (1201.941084ms)
✔ nested shell cancellation preserves a nested machine-lock owner (1302.576167ms)
✔ a hard process-group timeout reaches a shell command during cleanup (202.147458ms)
✔ ships a command-scoped sleep prevention wrapper (0.1285ms)
✔ preserves arguments, output and nonzero exit status (178.910833ms)
✔ runs an entire shell chain and retains its failure (106.787208ms)
✔ reports a missing command as 127 (119.97675ms)
✔ requires a command (89.018125ms)
✔ non-macOS platform selection runs commands without sleep prevention (142.595542ms)
✔ hard timeout escalation reaches a command that ignores TERM (271.049292ms)
✔ forwards POSIX cancellation to the command and releases the assertion (158.787625ms)
✔ holds a real macOS assertion only while the command runs (216.519458ms)
ℹ tests 21
ℹ suites 0
ℹ pass 20
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8393.766791

✖ failing tests:

test at .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:90:5
✖ shell cancellation waits for SIGTERM cleanup (336.963041ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  '' !== 'SIGTERM'
  
      at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:110:16)
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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 175 passed (177)
      Tests  1 failed | 7589 passed | 9 skipped (7599)
   Start at  15:00:50
   Duration  288.57s (tests 96%, import 1%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/929-hung-test-never/build-group-gate-1-2.log.reports/vitest-80430.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.48 |    82.24 |   94.36 |   89.93 |                   
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
 ...mands/workflow |   90.06 |    82.86 |   95.13 |   91.57 |                   
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
  locks.ts         |   92.81 |    87.71 |    92.3 |    94.4 | ...91-292,461-462 
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
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.49 |    82.65 |    97.4 |    95.1 | ...1773,1947,2679 
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
Statements   : 88.48% ( 20635/23320 )
Branches     : 82.24% ( 16009/19465 )
Functions    : 94.36% ( 3281/3477 )
Lines        : 89.93% ( 18118/20146 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1865 of 3653 lines (131 KB of 278 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
