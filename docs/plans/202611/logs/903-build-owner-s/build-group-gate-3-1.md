
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-3 is waiting for tests (up to 1200s): in use by bkit tests run bkit:gate:static-unit 915-min-push-ignores build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 25467, since 18:24:13), last run took 20m21s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 8.2 on 10 cores: unit limits 8600ms per test, 17200ms per hook (x1.72)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 44087ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 706ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1342ms
     ✓ always writes the marker, even with no plan 500ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1173ms
     ✓ writes the jira marker shape, taking the tracker from package.json 448ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 997ms
     ✓ refuses a PR from dev, main, or the base itself 453ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1118ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1059ms
     ✓ exits 5 when the open-PR probe errors 818ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 984ms
     ✓ prs open still opens against any other base 532ms
     ✓ exits 6 when the created PR's base is not --base 1218ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2443ms
     ✓ refuses merged entry when current feature evidence cannot be read 1128ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 771ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 597ms
     ✓ exits 1 with found=false when there is none 520ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 556ms
     ✓ --number reads one PR, mergeable included 375ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 503ms
     ✓ exits 4 when gh errors and 80 when it needs auth 560ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 412ms
     ✓ classifies a refused merge with a new dev conflict as integration 425ms
     ✓ returns an explicit terminal reason for other merge refusals 733ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 486ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 722ms
     ✓ drops the force-build marker from the title subject 441ms
     ✓ takes an explicit --subject 578ms
     ✓ runs no merge when the PR is already MERGED 602ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 815ms
     ✓ prs merge refuses a PR whose base is main 493ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 531ms
     ✓ prs merge refuses when the PR base is unknown 414ms
     ✓ prs merge reads the base from the one pr view it already makes 427ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 724ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 397ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 599ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 415ms
     ✓ never reads dev's required checks without --only-if-required 566ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 487ms
     ✓ updates when a dev ruleset requires status checks 486ms
     ✓ updates when dev's branch protection requires status checks 516ms
     ✓ ignores dev rulesets that require no checks 483ms
     ✓ updates when the repo cannot be resolved 538ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 467ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 622ms
     ✓ is not green when a check failed, naming it (exit 1) 389ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 388ms
     ✓ is not green on an empty rollup (total 0) 615ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 447ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 770ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 451ms
     ✓ is a no-op when the title already says so 702ms
     ✓ strips the marker, with or without its bkit prefix 1157ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 639ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 49165ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 414ms
     ✓ adopts the main checkout even when called from a linked worktree 466ms
     ✓ design and plan in place on main are refused 350ms
     ✓ still adopts a cloud session branch whose upstream is main 315ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1037ms
     ✓ may debug in place on dev 649ms
     ✓ adopts in place when the session is already on feat/{fid} 356ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1183ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1167ms
     ✓ a new run of the same FID rewrites startSha 1862ms
     ✓ a resume of the same FID reuses the record 1482ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 948ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1072ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1258ms
     ✓ a stale record without a lock is replaced 1210ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1061ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4295ms
     ✓ names inherited commits and ship recovery in the refusal 936ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1315ms
     ✓ ship names a missing feat branch 473ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1467ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 434ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 437ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 331ms
       ✓ checks no disk when there are no cleanup step files 434ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 567ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 520ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 449ms
     ✓ never commits an entry only the main checkout's copy list names 495ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 345ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 973ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 476ms
     ✓ tells a caller inside the removed worktree where to cd 727ms
     ✓ fails with its own exit code when git cannot remove a marked path 416ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1399ms
       ✓ preserves staged-only mode during landed cleanup 1202ms
       ✓ preserves staged-only type during landed cleanup 1413ms
       ✓ preserves staged-only deletion during landed cleanup 1574ms
       ✓ removes landed staged content when both index and working contents are on dev 1440ms
       ✓ deletes the proved local and remote branch at their landed tips 1533ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2391ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 604ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 582ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 311ms
       ✓ refuses to delete dev (2) 367ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 731ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1043ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 53066ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1008ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 729ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 960ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 953ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 505ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 456ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 906ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1057ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 808ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 469ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 979ms
     ✓ PASS is 0 failures with or without reports 996ms
     ✓ clears a previous attempt's reports before the gate runs 624ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 705ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1130ms
     ✓ a log under the outbox is named main-checkout relative in the record 869ms
     ✓ a log small enough is copied whole: not clamped, raw null 439ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 631ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1084ms
     ✓ numbers runs within the workflow's active run and per step 698ms
     ✓ without --file no row is written and the output carries row null 535ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1012ms
     ✓ a planned test that passes is a vacuous gap, exit 1 634ms
     ✓ a planned test absent from a loaded report is a missing gap 601ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1049ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1020ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 372ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1276ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 698ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 993ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 335ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1464ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1050ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1382ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1070ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1296ms
     ✓ green: a passed-accepted test is already landed, not a gap 850ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1501ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 740ms
     ✓ green: --group audits only that group's tasks 708ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1456ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1414ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 821ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1235ms
     ✓ green: lists each gap kind, with the runner output 709ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1690ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 600ms
       ✓ green clears an exception-only task from a human commit 512ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 55374ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 756ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 570ms
     ✓ done --group writes group on the row 378ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 553ms
     ✓ carries extra fields, parsed as JSON when they are JSON 362ms
     ✓ reports a failed commit with exit 8 without writing the row 852ms
     ✓ a failed commit leaves no row staged in the index 1042ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1474ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 914ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1133ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 969ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1474ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 437ms
     ✓ --ref reads the status file as committed on that ref, not from disk 457ms
     ✓ --ref exits 3 when the ref does not carry the status file 366ms
     ✓ fails on a placeholder left in the artifact 334ms
     ✓ fails when the row's verdict differs from the artifact's 404ms
     ✓ fails when the row does not list the artifact, or carries another attempt 371ms
     ✓ fails on a missing artifact 356ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 369ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 564ms
     ✓ fails a run-tests row missing its scope, and an empty scope 565ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 518ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 584ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 341ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 650ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 942ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 783ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 971ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1214ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 847ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 374ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1035ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 871ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 695ms
     ✓ --attempt-of checks the row carries the derived counter 463ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1307ms
     ✓ writeStepRow refuses when a recorded path changed 1519ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 604ms
     ✓ writeStepRow appends its commit sha to the record 1364ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1948ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 344ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 833ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 819ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 523ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1289ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 953ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 961ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 657ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1404ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 307ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 461ms
     ✓ does not count an artifact the run found committed when it started 659ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 479ms
     ✓ commits a package.json change outside bkit.workflows 681ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1294ms
   ✓ bkit steps stub --result-file (12)
     ✓ reads held audit keys from the linked worktree's own ledger 365ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 65793ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2227ms
     ✓ runs code.ts through its declared gate in the built checkout 1720ms
     ✓ runs code.ts through its declared gate in the built checkout 1794ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1549ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1726ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1816ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 878ms
     ✓ runs the full gate for replayed debug code 1450ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1832ms
     ✓ installs local dependencies against the built target tree 2057ms
     ✓ runs the configured frozen install even without root dependencies 1800ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2194ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2050ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2149ms
     ✓ never pushes local dev commits missing from origin/dev 2461ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4033ms
     ✓ dev moved before every push: exhausted, nothing landed 7018ms
     ✓ any other refusal is returned, not retried 3245ms
     ✓ pushToDev replays a commit range onto origin/dev 2413ms
     ✓ a replay retries on the new dev when dev moved 4310ms
     ✓ pushToDev log line names what it lands 2256ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2306ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2599ms
     ✓ a push that fails without a server answer is returned once, never retried 1927ms
     ✓ a failed fetch is returned before anything is built 607ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2937ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1750ms
     ✓ lands from a clone whose fetch refspec omits dev 2068ms
     ✓ build throwing stops the landing and removes the throwaway checkout 596ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 12722ms
   ✓ real workflow sources (37)
     ✓ bkit-build resolves cleanly for github 556ms
     ✓ bkit-build resolves cleanly for linear 516ms
     ✓ bkit-build resolves cleanly for jira 494ms
     ✓ bkit-ship resolves cleanly for jira 362ms
     ✓ bkit-debug resolves cleanly for github 344ms
     ✓ bkit-debug resolves cleanly for linear 415ms
     ✓ bkit-debug resolves cleanly for jira 403ms
     ✓ bkit-plan resolves cleanly for linear 336ms
     ✓ bkit-plan resolves cleanly for jira 397ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-build: the github render keeps the warning bullet once and the recovery in Step 1 362ms
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 483ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 506ms
   ✓ issue-scan call sites (#135) (12)
     ✓ bkit-debug wires a jira scan whose hits the engine reads 370ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 81599ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 34480ms
     ✓ every prompt, workflow and utility agent has the three header blocks 727ms
     ✓ sync has nothing left to rewrite 22724ms
     ✓ every clause reaches the cut-off of one surface it applies to 2573ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 380ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 20292ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 37379ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1329ms
     ✓ names each net-new and worsened finding in the log and the JSON 777ms
     ✓ fails on a net score rise with no net count change 1046ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 971ms
     ✓ treats a net score at or below 0.001 as float noise 1030ms
     ✓ passes when the change only resolves findings 983ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 970ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 369ms
     ✓ skips (exit 0) when the base resolves to HEAD 418ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 929ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 717ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 345ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 919ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 825ms
     ✓ exits 4 on a dropped net field instead of silently passing 758ms
     ✓ exits 4 on no summary instead of silently passing 872ms
     ✓ exits 4 on output that is not JSON instead of silently passing 804ms
     ✓ exits 5 when the base worktree cannot be created 424ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1060ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1350ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 932ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 943ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 488ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 451ms
     ✓ fails (exit 1) when vale reports alerts 522ms
     ✓ exits 6 on a vale runtime error 895ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 762ms
     ✓ falls back to vale sync when the main worktree has none 768ms
     ✓ fails when vale sync cannot restore the required styles 543ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 639ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 360ms
     ✓ is a usage error when the commit cannot be read 306ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 457ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 466ms
     ✓ exits 1 naming the files outside, whatever the commit message says 381ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 706ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 557ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 453ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 438ms
     ✓ starts only new source after overflow or missing source 307ms
     ✓ uses exact new comment after a failed eligibility read 326ms
   ✓ bounded nonfatal publication (10)
     ✓ recognizes append success within budget without unnecessary resend 325ms
     ✓ preserves a human correction after lost append recognition and a later report 373ms
     ✓ contains exhausted append and create failures without fabricated success 320ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 417ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 301ms
     ✓ reserves new comment opportunity within total delivery budget 973ms
     ✓ attempts independent attention after routine uncertainty 381ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 574ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 443ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 534ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 503ms
     ✓ fetches the issue and its comments as GitHub returns them 941ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 558ms
     ✓ invalidates missing corrupt and unsupported progress cache 1393ms
     ✓ contains cache read and write failures as standalone degradation 541ms
     ✓ uses legacy receipts and contains receipt failures 851ms
     ✓ records an engine-action row and skips the same key + body on a re-run 511ms
     ✓ a recent identical comment counts as done (the final close comment) 434ms
     ✓ a failed post reports done false with the reason and never leaks a token 719ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 715ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 485ms
     ✓ a different marker hash posts 853ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 519ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 35380ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 453ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 439ms
     ✓ staging failure: exit 4 and no commit is created, no false success 447ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 441ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 371ms
> [bkit] TRUNCATED HERE — 54 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1037ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 475ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1041ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 722ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 658ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 661ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 556ms
     ✓ an unpinned repo reports nulls and asks no registry 539ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 383ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 378ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 457ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 434ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 29379ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2620ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3179ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 423ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 560ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 419ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3011ms
     ✓ does not fall back through a malformed later success receipt 1480ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1050ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 972ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2107ms
     ✓ requires proof even when the pushed increment changes no files 1121ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 706ms
     ✓ does not record a committed tree 739ms
     ✓ records no proof for a failed gate or lighter gate 1396ms
     ✓ requires integration proof when integration is declared 1992ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2695ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 348ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1191ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1346ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1873ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2041ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1724ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2402ms
     ✓ checks the named repository base and fails closed on missing evidence 1249ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1318ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1239ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 785ms
       ✓ a source change past the validated head refuses (17) and names the path 554ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 713ms
       ✓ --validated without --month / --fid is a usage error (2) 518ms
       ✓ a validated sha that is not an ancestor refuses (17) 574ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 984ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1297ms
     ✓ a failed re-trigger push names the cause in the log 2013ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1402ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2521ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1331ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 653ms
     ✓ gh-error: every poll errored 599ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1170ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1048ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1404ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1079ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3170ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3222ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 766ms
     ✓ re-trigger on dev only uses the record of its own FID 1015ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 925ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 375ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 715ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 462ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 346ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 732ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 834ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 783ms
     ✓ --file and --step go together 644ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 14075ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 583ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1767ms
     ✓ a refused dev push is logged, never fails the close 2106ms
     ✓ an unreachable remote is logged, never fails the close 641ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 24424ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1085ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 977ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 814ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 682ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 887ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 447ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 540ms
     ✓ --file into a missing directory is refused, not created 475ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 479ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 489ms
     ✓ follows summary cursors even when the first page is shorter than the limit 743ms
     ✓ reports excluded intervals as unread even when pagination finishes 807ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 780ms
     ✓ reports an unread remainder at the page cap 891ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 978ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 617ms
     ✓ rejects missing summaries instead of treating them as empty results 1233ms
     ✓ reports a failed first page as unavailable 869ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 866ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 841ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 981ms
     ✓ follows summary cursors even when the first page is shorter than the limit 790ms
     ✓ reports excluded intervals as unread even when pagination finishes 821ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 526ms
     ✓ reports an unread remainder at the page cap 471ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 523ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 340ms
     ✓ rejects missing summaries instead of treating them as empty results 417ms
     ✓ reports a failed first page as unavailable 422ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 394ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (269 tests) 1598ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 907ms
     ✓ counts files committed since --base 807ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 915ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1185ms
     ✓ runs the --fallback gate even when no file changed, as it did before 625ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 504ms
     ✓ resolves config from the repo root when run from a subdirectory 649ms
     ✓ exits 6 when the PUT fails 340ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 465ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 879ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 521ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 357ms
     ✓ exits 6 when the api answer is not JSON 355ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 7381ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 5426ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1343ms
     ✓ runGit names ENOBUFS when output passes the limit 1048ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 964ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 707ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1341ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 432ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 5604ms
   ✓ bkit disk prune — notes (5)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 301ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 340ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 319ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 770ms
     ✓ passes every rule on a clean head 328ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 363ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 4098ms
   ✓ selected CI context evidence (3)
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
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 89 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 374ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 344ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 363ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 353ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 743 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 197 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 358ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 286ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1123ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1089ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 260ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 304ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 357ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 128ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-q2Fs0x/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 211ms
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

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 336ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 205ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 212ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 131ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 97ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 168ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 160ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 126ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 167ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 84ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-TxW8k2/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 90ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 116ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 114ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 189ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 178ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 134ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 105ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 124ms
(node:92339) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:92339) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 166ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 144ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 94ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 703ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 89ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 102ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 73ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 84ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 106ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 76ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 81ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 66ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 87ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 122ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 123ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
(node:93536) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:93536) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:93536) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:93536) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 105ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 44ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 55ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 33ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 27ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 42ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 50ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 38ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 56ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 46ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 80ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 37ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 33ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794472392384.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794472392387.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794472392387.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794472392416.js — skipping

 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 48ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 40ms
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

 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 44ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 32ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 26ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 42ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 20ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 26ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 56ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (162 tests) 150219ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 523ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1959ms
     ✓ writes no limits for a workflow with no ask point 320ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 374ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 368ms
       ✓ a new run in the same chat gets its own session row 355ms
       ✓ writes none outside Claude Code 319ms
     ✓ opens the next run after a finished one, and after another workflow's run 497ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 430ms
     ✓ design / plan / build / debug book in the current worktree 418ms
     ✓ --lock-held checks the lock is ours 419ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 364ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 622ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 364ms
     ✓ an OPEN decision of an earlier run never resurfaces 467ms
     ✓ openDecision carries the Gate header 479ms
     ✓ openDecision gate is null without the header 307ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 429ms
     ✓ writes no row when status.jsonl does not exist 394ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 356ms
     ✓ aborts a rebase only when one is in progress 660ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 575ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 730ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 420ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 431ms
     ✓ --max-exceeded says a handover is due without any sentinel 385ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 340ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 426ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 376ms
     ✓ a debug run in SOAK mode always needs a handover 323ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 925ms
       ✓ counts subagents of an earlier chat the run's session rows name 1085ms
       ✓ records no context block, and still closes, outside a Claude Code session 921ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 872ms
     ✓ records ending held and publish false on the workflow-done row 895ms
     ✓ defaults the close row to ending done 949ms
     ✓ refuses an unknown ending 372ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1013ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1181ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1016ms
     ✓ always writes the telemetry, whatever the runtime 856ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 829ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 908ms
     ✓ an unwritable stats path is logged and never fails the close 880ms
     ✓ appends the completeness row before the workflow-done row 1175ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1741ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1208ms
     ✓ writes one completeness row per close 1574ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1077ms
     ✓ still closes when the completeness check throws 997ms
     ✓ still closes when the completeness row write throws 1154ms
     ✓ refuses without status.jsonl and writes nothing 359ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1073ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1381ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 940ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 888ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1101ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1127ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1810ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1271ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1208ms
     ✓ --record-step writes the close step's row before workflow-done 884ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 954ms
     ✓ --number without --outbox is a usage error 934ms
     ✓ --flush is ship only 401ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1415ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1132ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1305ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1264ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 853ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 453ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 641ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2348ms
     ✓ --flush with nothing to record commits and pushes nothing 1255ms
     ✓ --flush carries the named worktree's logs into the dev commit 2253ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3240ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3162ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3393ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2461ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3396ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2976ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3197ms
     ✓ --push on dev never carries a row whose references name another feature 3279ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2736ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4610ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2881ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1138ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2780ms
     ✓ preserves unlanded file deletions and ledger additions on close 5852ms
     ✓ preserves dirty work and uncertain branch evidence during close 5759ms
     ✓ preserves a local feature ref changed after its cleanup proof 6561ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3768ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2992ms
     ✓ a close that landed releases the lock 4038ms
     ✓ removes the worktree before it releases the lock 1435ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2002ms
       ✓ closePr refuses when the PR base is unknown 1441ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1001ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 418ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 636ms
     ✓ record is present after workflows close and before the push 568ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1095ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 444ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 374ms
     ✓ puts each --line after the summary, in flag order 364ms
     ✓ --summary prints the file and keeps a copy in --outbox 339ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 339ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 215477ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 750ms
     ✓ rejects missing explicit and ambiguous existing branch selections 740ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1013ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 930ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 589ms
     ✓ a refused --continue carries git's own reason 730ms
     ✓ --file records nothing for a refused rebase 780ms
     ✓ refuses a code conflict and aborts the rebase on the spot 691ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1468ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 721ms
     ✓ produces byte-identical output to merge=union 1724ms
     ✓ restores a trailing newline so the next append starts on its own line 802ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 865ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1087ms
     ✓ refuses a union that leaves a line which is not JSON 737ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1009ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1614ms
     ✓ refuses a lockfile whose regenerate command fails 1319ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1385ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1564ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1318ms
     ✓ refuses and aborts when both sides changed the hand-written region 804ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1011ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1149ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1793ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 850ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1065ms
     ✓ refuses and aborts when a side deleted the install record 921ms
     ✓ refuses a conflicted doc the repo's script does not list 837ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 710ms
     ✓ removes a stale sentinel when the rebase succeeds 1531ms
     ✓ exits 4 when no rebase is in progress 462ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1650ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1242ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 646ms
       ✓ skips (12) with no anchor 648ms
       ✓ skips (12) when the base is unreachable in this clone 914ms
       ✓ skips (12) when nothing landed since the base 735ms
       ✓ runs (0) with the landed path count once dev moved 1262ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 652ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1383ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 859ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1019ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2187ms
     ✓ runs exactly one git push 1510ms
     ✓ --set-upstream records the upstream 1062ms
     ✓ refuses with no branch checked out 863ms
     ✓ --mode=dev refuses a feature checkout 747ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2044ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3057ms
     ✓ --require-ci pushes as-is when dev has not moved 1193ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1979ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2799ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 705ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1086ms
     ✓ --mode=abort pushes when the branch has no open PR 1408ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 975ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 619ms
     ✓ --open-pr carries the MCP answer and skips gh 871ms
     ✓ --mode=abort on dev pushes plainly without probing 1041ms
     ✓ rejects an unknown mode 534ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3040ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1549ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1697ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3653ms
     ✓ skip-ci HEAD on the replay is refused 1331ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2956ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3837ms
     ✓ a level local dev is a plain push, recording nothing extra 1822ms
     ✓ a record with no commits pushes nothing 1188ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 796ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1463ms
     ✓ a rewritten branch is refused, never forced 1116ms
     ✓ refuses dev and main with exit 21 and pushes nothing 687ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1683ms
     ✓ refuses a detached HEAD (exit 5) 652ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1244ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1198ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1110ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1277ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 639ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1336ms
     ✓ an up-to-date branch is a no-op 956ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1436ms
     ✓ a fetch that fails exits 10 572ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 813ms
     ✓ scan-diff still reports a new skip when its test … 905ms
     ✓ scan-diff reports a skip moved onto a different t… 938ms
     ✓ scan-diff does not cancel a skip moved between am… 905ms
     ✓ scan-diff does not spend an unchanged duplicate t… 884ms
     ✓ scan-diff recognizes a renamed test file 834ms
     ✓ scan-diff recognizes a suite moved into a differe… 775ms
     ✓ scan-diff does not let unrelated additions hide a… 764ms
     ✓ scan-diff attributes deletion to its old test ins… 887ms
     ✓ scan-diff consumes each moved assertion once and … 790ms
     ✓ scan-diff does not match identical assertions fro… 719ms
     ✓ scan-diff does not match the same leaf test name … 947ms
     ✓ scan-diff does not match a same-named test with d… 966ms
     ✓ scan-diff does not match a same-named test with c… 1005ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1112ms
     ✓ --paths with no match exits 1 947ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 662ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1268ms
     ✓ --marker reads a diff over 1 MiB 909ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1102ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1039ms
     ✓ scan-diff finds an added skip 1121ms
     ✓ scan-diff ignores a skip predating the base 1022ms
     ✓ scan-diff reports a disabled test with its line 1243ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1008ms
     ✓ scan-diff ignores a removed comment in a test file 1052ms
     ✓ scan-diff ignores an assertion moved within the file 949ms
     ✓ scan-diff still reports a removed assertion 1032ms
     ✓ scan-diff reports an assertion re-added only outside the test file 984ms
     ✓ scan-diff finds an added pytest mark skip 861ms
     ✓ scan-diff finds an added unittest skip 390ms
     ✓ scan-diff finds an added bare skip call 343ms
     ✓ scan-diff ignores a quoted skip in a documentation file 339ms
     ✓ scan-diff ignores a marker literal in a non-test source file 320ms
     ✓ scan-diff ignores an assertion whose expectation changed 311ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 324ms
     ✓ scan-diff reports a deleted test file 302ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 994ms
     ✓ a title that already carries the marker is left alone 547ms
     ✓ with no open PR: pushes the marker commit and edits no title 768ms
     ✓ a re-run is deduped: no second marker commit 737ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 856ms
     ✓ --title-set skips gh entirely 472ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 957ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1557ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 937ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1961ms
     ✓ continues only the explicitly recorded target through the public merge command 1480ms
     ✓ fetches the unseen feature head before classifying the base 863ms
     ✓ fast forwards the feature before either base path is chosen 1511ms
     ✓ merges divergent feature tips without rebasing either side 853ms
     ✓ continues the feature merge before starting a dev merge 1372ms
     ✓ publishes local code with a CI running head before bookkeeping 1616ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2115ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1346ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 964ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 423ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 401ms
     ✓ --merge-docs merges dev when docs/ is behind 490ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 505ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 835ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 897ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 751ms
     ✓ --merge-docs skips an empty bkit:generate script 530ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 441ms
     ✓ --merge-docs never merges on dev itself 378ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 545ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 571ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 593ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 591ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 737ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 737ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 837ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 725ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 992ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1080ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 645ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 780ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 495ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 343ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 425ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 640ms
     ✓ a failed install stops ship (16) 551ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 456ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 438ms
     ✓ exits 10 when the fetch fails 326ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 307ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1166ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1218ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1140ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1231ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2260ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2896ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 453ms
     ✓ local: names unpushed dev as the cause when the branch carries it 493ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 496ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1166ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1143ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 906ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4052ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 949ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1027ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 973ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 663ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1378ms
     ✓ land removes the worktree when only the copied .env is untracked 1254ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1079ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1200ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1650ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1048ms
     ✓ landPr refuses a main-based PR without retrying 537ms
     ✓ landPr refuses when the PR base is unknown 527ms
     ✓ PR not open (closed): stops (17) at once, no retry 715ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 385ms
     ✓ --attempt names the merge round in a fix commit 353ms
     ✓ commits a rewritten and a deleted tracked file 363ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 314ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 350ms

 Test Files  176 passed (176)
      Tests  7601 passed | 2 skipped (7603)
   Start at  18:30:58
   Duration  216.44s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/903-build-owner-s/build-group-gate-3-1.log.reports/vitest-47089.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.49 |    82.25 |   94.44 |   89.95 |                   
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
 ...mands/workflow |   90.07 |    82.88 |   95.25 |   91.59 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.34 |    96.18 |     100 |   99.06 | 314,694           
  decisions.ts     |   94.57 |     83.5 |   98.07 |   97.29 | ...82,387,464,651 
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
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |    93.8 |    83.02 |    98.7 |   95.45 | ...1717,1947,2679 
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
Statements   : 88.49% ( 20671/23359 )
Branches     : 82.25% ( 16049/19511 )
Functions    : 94.44% ( 3296/3490 )
Lines        : 89.95% ( 18138/20164 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 492 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 199 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 199 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 195 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 196 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 186 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 72 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 223 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 190 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 198 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 199 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 187 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 205 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 201 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 828 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 520 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 14 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 20 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 14 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 49 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 618 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 338 ms
ok 30 refresh drops a file deleted in the index from the build # in 307 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 413 ms
ok 32 a key removed from the env file is unset on the next run # in 166 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 144 ms
ok 34 non-BKIT_ keys are skipped # in 138 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 177 ms
ok 36 a failed unsetenv is retried on the next run # in 167 ms
ok 37 logs key names only, never values # in 131 ms
ok 38 missing env file exits 0 without calling launchctl # in 23 ms
ok 39 the sweep prints the summary line the lane greps for # in 257 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 8 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (88.326ms)
✔ shell cancellation waits for SIGTERM cleanup (137.101542ms)
✔ direct cancellation waits for SIGINT cleanup (110.554458ms)
✔ shell cancellation waits for SIGINT cleanup (138.81475ms)
✔ direct cancellation waits for SIGHUP cleanup (84.96225ms)
✔ shell cancellation waits for SIGHUP cleanup (158.155916ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (373.475167ms)
✔ shell cancellation follows a worker orphaned by a nested shell (225.857625ms)
✔ direct cancellation preserves a nested machine-lock owner (415.525583ms)
✔ shell cancellation preserves a nested machine-lock owner (448.781916ms)
✔ nested shell cancellation preserves a nested machine-lock owner (456.061625ms)
✔ a hard process-group timeout reaches a shell command during cleanup (64.714041ms)
✔ ships a command-scoped sleep prevention wrapper (0.052709ms)
✔ preserves arguments, output and nonzero exit status (43.301125ms)
✔ runs an entire shell chain and retains its failure (26.348917ms)
✔ reports a missing command as 127 (25.375583ms)
✔ requires a command (23.884ms)
✔ non-macOS platform selection runs commands without sleep prevention (39.762875ms)
✔ hard timeout escalation reaches a command that ignores TERM (143.403958ms)
✔ forwards POSIX cancellation to the command and releases the assertion (51.842458ms)
✔ holds a real macOS assertion only while the command runs (61.069834ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3148.877167
> [bkit] TRUNCATED — kept 1811 of 3406 lines (129 KB of 261 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
