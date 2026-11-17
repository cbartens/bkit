
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 915-min-push-ignores build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 35507, since 13:49:26), no earlier run

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


0/158 files need formatting

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

[test-timeout-budget] load average 5.5 on 10 cores: unit limits 7250ms per test, 14500ms per hook (x1.45)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 39657ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 648ms
     ✓ names each net-new and worsened finding in the log and the JSON 1066ms
     ✓ fails on a net score rise with no net count change 642ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1040ms
     ✓ treats a net score at or below 0.001 as float noise 1074ms
     ✓ passes when the change only resolves findings 638ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 748ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 947ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 504ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 761ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 806ms
     ✓ exits 4 on a dropped net field instead of silently passing 804ms
     ✓ exits 4 on no summary instead of silently passing 618ms
     ✓ exits 4 on output that is not JSON instead of silently passing 609ms
     ✓ exits 5 when the base worktree cannot be created 365ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1034ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 927ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1228ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1109ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1193ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1397ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 486ms
     ✓ explicit globs can select ignored prose and nested checkout files 445ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 384ms
     ✓ fails (exit 1) when vale reports alerts 592ms
     ✓ exits 6 on a vale runtime error 526ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 461ms
     ✓ falls back to vale sync when the main worktree has none 555ms
     ✓ fails when vale sync cannot restore the required styles 423ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 435ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 335ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 418ms
     ✓ exits 1 naming the code file, whatever the commit message says 412ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 465ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 308ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 831ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 392ms
     ✓ exits 1 naming the files outside, whatever the commit message says 410ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 748ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 495ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 407ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 862ms
     ✓ a top-level glob in the setting does not reach into folders 424ms
     ✓ a push that changes no files is not proven a min push 421ms
     ✓ exits 7 when a commit or its base cannot be read 427ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 430ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 557ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 541ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 550ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 571ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 471ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 537ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 578ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 538ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 447ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 493ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 680ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 610ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 40073ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ adopts the main checkout even when called from a linked worktree 377ms
     ✓ still adopts a cloud session branch whose upstream is main 343ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 953ms
     ✓ may debug in place on dev 452ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 885ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 829ms
     ✓ a new run of the same FID rewrites startSha 1421ms
     ✓ a resume of the same FID reuses the record 1199ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 893ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 974ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1050ms
     ✓ a stale record without a lock is replaced 1153ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1354ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3889ms
     ✓ names inherited commits and ship recovery in the refusal 870ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1167ms
     ✓ ship names a missing feat branch 371ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 997ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 361ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 370ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 370ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 409ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 461ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 344ms
     ✓ never commits an entry only the main checkout's copy list names 368ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 500ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 325ms
     ✓ tells a caller inside the removed worktree where to cd 366ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1030ms
       ✓ preserves staged-only mode during landed cleanup 1049ms
       ✓ preserves staged-only type during landed cleanup 1142ms
       ✓ preserves staged-only deletion during landed cleanup 1133ms
       ✓ removes landed staged content when both index and working contents are on dev 1292ms
       ✓ deletes the proved local and remote branch at their landed tips 1413ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1638ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 512ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 509ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 319ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 520ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 852ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 40432ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 862ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 564ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 570ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 404ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 684ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 415ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 354ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 889ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 510ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 774ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 365ms
     ✓ PASS is 0 failures with or without reports 699ms
     ✓ clears a previous attempt's reports before the gate runs 716ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 794ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 561ms
     ✓ a log under the outbox is named main-checkout relative in the record 542ms
     ✓ a log small enough is copied whole: not clamped, raw null 560ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 345ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 508ms
     ✓ numbers runs within the workflow's active run and per step 829ms
     ✓ without --file no row is written and the output carries row null 428ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 653ms
     ✓ a planned test that passes is a vacuous gap, exit 1 570ms
     ✓ a planned test absent from a loaded report is a missing gap 464ms
     ✓ a file that fails to load is a red of kind red-not-loaded 678ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 653ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 324ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 865ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 499ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 518ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1076ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 726ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 901ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 710ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 974ms
     ✓ green: a passed-accepted test is already landed, not a gap 652ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 610ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 874ms
     ✓ green: --group audits only that group's tasks 633ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 763ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1152ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 617ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 901ms
     ✓ green: lists each gap kind, with the runner output 835ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1228ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 501ms
       ✓ green clears an exception-only task from a human commit 413ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 44338ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 608ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 474ms
     ✓ done --group writes group on the row 348ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 511ms
     ✓ carries extra fields, parsed as JSON when they are JSON 354ms
     ✓ reports a failed commit with exit 8 without writing the row 631ms
     ✓ a failed commit leaves no row staged in the index 828ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1059ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 904ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 793ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 798ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 825ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 329ms
     ✓ --ref reads the status file as committed on that ref, not from disk 334ms
     ✓ --ref exits 3 when the ref does not carry the status file 363ms
     ✓ fails on a placeholder left in the artifact 319ms
     ✓ fails when the row's verdict differs from the artifact's 366ms
     ✓ fails when the row does not list the artifact, or carries another attempt 500ms
     ✓ fails on a missing artifact 457ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 414ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 330ms
     ✓ fails a run-tests row missing its scope, and an empty scope 606ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 506ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 428ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 312ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 602ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 813ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 560ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 658ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1006ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 622ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 339ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 630ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 473ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 312ms
     ✓ --attempt-of checks the row carries the derived counter 351ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 929ms
     ✓ writeStepRow refuses when a recorded path changed 1078ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 542ms
     ✓ writeStepRow appends its commit sha to the record 1002ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1207ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 410ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 788ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 732ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 462ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1139ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 840ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 647ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 424ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1131ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 416ms
     ✓ does not count an artifact the run found committed when it started 580ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 397ms
     ✓ commits a package.json change outside bkit.workflows 600ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1039ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 58396ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1714ms
     ✓ runs code.ts through its declared gate in the built checkout 1626ms
     ✓ runs code.ts through its declared gate in the built checkout 1583ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1500ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1738ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1276ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1334ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1448ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 789ms
     ✓ runs the full gate for replayed debug code 1567ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1945ms
     ✓ installs local dependencies against the built target tree 2166ms
     ✓ runs the configured frozen install even without root dependencies 1738ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1785ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1754ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1815ms
     ✓ never pushes local dev commits missing from origin/dev 1821ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3254ms
     ✓ dev moved before every push: exhausted, nothing landed 5185ms
     ✓ any other refusal is returned, not retried 1955ms
     ✓ pushToDev replays a commit range onto origin/dev 2092ms
     ✓ a replay retries on the new dev when dev moved 3622ms
     ✓ pushToDev log line names what it lands 1870ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1919ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2044ms
     ✓ a push that fails without a server answer is returned once, never retried 1669ms
     ✓ a failed fetch is returned before anything is built 547ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2226ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1639ms
     ✓ lands from a clone whose fetch refspec omits dev 2050ms
     ✓ build throwing stops the landing and removes the throwaway checkout 701ms
[feat/test 1f837a5] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 26053ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 2751ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2504ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 409ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 407ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 396ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 368ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2579ms
     ✓ does not fall back through a malformed later success receipt 1463ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 977ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 908ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1569ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1815ms
     ✓ requires proof even when the pushed increment changes no files 1011ms
     ✓ ignores malformed receipts 962ms
     ✓ does not record a tracked tree 499ms
     ✓ does not record a untracked tree 477ms
     ✓ does not record a mutated tree 513ms
     ✓ does not record a committed tree 616ms
     ✓ records no proof for a failed gate or lighter gate 1054ms
     ✓ requires integration proof when integration is declared 1283ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2016ms
     ✓ invalidates proof when the gate definition changes 925ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 547ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 29983ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 323ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 473ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2543ms
   ✓ routine publication policy (8)
     ✓ appends changed report versions without replacing prior text 302ms
     ✓ classifies attention and terminal reports from structured purpose 353ms
     ✓ rolls over after intervening comments external edits and deletion 394ms
     ✓ starts only new source after overflow or missing source 311ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 309ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 306ms
     ✓ reserves new comment opportunity within total delivery budget 787ms
     ✓ attempts independent attention after routine uncertainty 335ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 424ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 881ms
     ✓ seals unavailable or unstable representation evidence 649ms
     ✓ uses accepted final preflight eligibility without provider atomicity 549ms
     ✓ rejects marker preserving external edits 417ms
     ✓ preserves generated first line and extracts versioned h6 section markers 582ms
     ✓ returns owned comment identity and stable representation evidence 509ms
     ✓ selects newest created comment across complete pages 522ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 369ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 395ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 372ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 370ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 417ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 412ms
     ✓ fetches the issue and its comments as GitHub returns them 473ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 577ms
     ✓ invalidates missing corrupt and unsupported progress cache 1017ms
     ✓ contains cache read and write failures as standalone degradation 517ms
     ✓ uses legacy receipts and contains receipt failures 461ms
     ✓ records an engine-action row and skips the same key + body on a re-run 874ms
     ✓ a recent identical comment counts as done (the final close comment) 385ms
     ✓ a failed post reports done false with the reason and never leaks a token 431ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 514ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 435ms
     ✓ a different marker hash posts 475ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 399ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 30356ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 440ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 353ms
     ✓ staging failure: exit 4 and no commit is created, no false success 355ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 344ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 343ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 361ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 465ms
     ✓ retries a failed create once, and exits 5 when it fails twice 579ms
     ✓ exits 5 when the open-PR probe errors 386ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 447ms
     ✓ prs open still opens against any other base 417ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 548ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 495ms
     ✓ exits 4 when gh errors and 80 when it needs auth 659ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 417ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 346ms
     ✓ runs no merge when the PR is already MERGED 408ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 567ms
     ✓ prs merge refuses a PR whose base is main 323ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 485ms
     ✓ prs merge refuses when the PR base is unknown 341ms
     ✓ prs merge reads the base from the one pr view it already makes 438ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 314ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 526ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 611ms
     ✓ never reads dev's required checks without --only-if-required 368ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 389ms
     ✓ is not green when a check failed, naming it (exit 1) 411ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 315ms
     ✓ is not green on an empty rollup (total 0) 416ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 316ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 613ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 333ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2076ms
     ✓ filters branch and PR discovery by configured workflow and exact head 944ms
     ✓ freezes explicit workflow run attempt and all failed job pages 594ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1789ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2330ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1751ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1998ms
     ✓ checks the named repository base and fails closed on missing evidence 1096ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 954ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1066ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 683ms
       ✓ a source change past the validated head refuses (17) and names the path 594ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 668ms
       ✓ --validated without --month / --fid is a usage error (2) 457ms
       ✓ a validated sha that is not an ancestor refuses (17) 547ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 568ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1042ms
     ✓ a failed re-trigger push names the cause in the log 1239ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1182ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1993ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1118ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 613ms
     ✓ gh-error: every poll errored 542ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 991ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 915ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1183ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1072ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2496ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2552ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 684ms
     ✓ re-trigger on dev only uses the record of its own FID 886ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 793ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 334ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 464ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 328ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 425ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 520ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 613ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 537ms
     ✓ --file and --step go together 474ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 18908ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 486ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1511ms
     ✓ a refused dev push is logged, never fails the close 2400ms
     ✓ an unreachable remote is logged, never fails the close 612ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 9513ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 650ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 851ms
     ✓ follows summary cursors even when the first page is shorter than the limit 707ms
     ✓ reports excluded intervals as unread even when pagination finishes 1228ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 686ms
     ✓ reports an unread remainder at the page cap 596ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 638ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 922ms
     ✓ rejects missing summaries instead of treating them as empty results 899ms
     ✓ reports a failed first page as unavailable 1110ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 990ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 987ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1031ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1603ms
     ✓ reports excluded intervals as unread even when pagination finishes 959ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 836ms
     ✓ reports an unread remainder at the page cap 968ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 807ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1091ms
     ✓ rejects missing summaries instead of treating them as empty results 682ms
     ✓ reports a failed first page as unavailable 585ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 537ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 21206ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 789ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1005ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 762ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 581ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 612ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 561ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 439ms
     ✓ --file into a missing directory is refused, not created 593ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1080ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 592ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1040ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 872ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 725ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 498ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 519ms
     ✓ an unpinned repo reports nulls and asks no registry 474ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 313ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 310ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 489ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 329ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 903ms
     ✓ counts files committed since --base 620ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 551ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 658ms
     ✓ runs the --fallback gate even when no file changed, as it did before 746ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ PUTs the policy requiring the default capstone check 501ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 621ms
     ✓ exits 6 when the PUT fails 638ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 426ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 452ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 312ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 304ms
     ✓ exits 6 when the api answer is not JSON 325ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 10415ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 5183ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1336ms
     ✓ runGit names ENOBUFS when output passes the limit 1036ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 938ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 597ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1138ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 371ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 3339ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 741ms
     ✓ passes every rule on a clean head 317ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 357ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 4417ms
   ✓ publication ownership lock (4)
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
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 359ms
   ✓ guardRepoConfig (6)
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 325ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
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
> [bkit] TRUNCATED HERE — 850 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 187 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 296ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/checks/after/index.test.ts (54 tests) 329ms
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 505ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 333ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 496ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 413ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 265ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 280ms
(node:90144) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:90144) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 182ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 265ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 221ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 192ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 235ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 167ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 129ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-VGmfgq/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 116ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 188ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-sCpdTc/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 146ms
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

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 227ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 206ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 205ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 165ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 135ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 88ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 110ms
(node:92396) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:92396) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:92396) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92396) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 95ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 142ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 153ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 118ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 118ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 77ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 108ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 97ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 100ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 91ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 83ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 82ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 67ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 75ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 85ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 94ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 84ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 65ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 24ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 76ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 80ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 85ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 81ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 38ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 74ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 31ms
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

 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 58ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 54ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 54ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 33ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 53ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794542557796.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794542557799.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794542557801.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794542557809.js — skipping

 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 57ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 56ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 28ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 47ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 62ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 65ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 29ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 30ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 38ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 27ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 21ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 25ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 20ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 24ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 17ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 7ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 134660ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 459ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1453ms
     ✓ writes no limits for a workflow with no ask point 314ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 354ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 340ms
       ✓ a new run in the same chat gets its own session row 343ms
     ✓ opens the next run after a finished one, and after another workflow's run 368ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 368ms
     ✓ design / plan / build / debug book in the current worktree 320ms
     ✓ --lock-held checks the lock is ours 345ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 327ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 428ms
   ✓ bkit workflows start — resume facts (8)
     ✓ an OPEN decision of an earlier run never resurfaces 336ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 395ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 306ms
     ✓ aborts a rebase only when one is in progress 666ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 592ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 616ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 384ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 348ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 367ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 450ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 323ms
     ✓ a debug run in SOAK mode always needs a handover 314ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 952ms
       ✓ counts subagents of an earlier chat the run's session rows name 875ms
       ✓ records no context block, and still closes, outside a Claude Code session 812ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 861ms
     ✓ records ending held and publish false on the workflow-done row 812ms
     ✓ defaults the close row to ending done 890ms
     ✓ refuses an unknown ending 303ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 848ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 822ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 772ms
     ✓ always writes the telemetry, whatever the runtime 719ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 640ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 736ms
     ✓ an unwritable stats path is logged and never fails the close 712ms
     ✓ appends the completeness row before the workflow-done row 837ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 865ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 757ms
     ✓ writes one completeness row per close 1266ms
     ✓ leaves out the previous run's rows that share a second with this run's start 805ms
     ✓ still closes when the completeness check throws 854ms
     ✓ still closes when the completeness row write throws 861ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1015ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1370ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 885ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 796ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1002ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1049ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1140ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1096ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 998ms
     ✓ --record-step writes the close step's row before workflow-done 754ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 845ms
     ✓ --number without --outbox is a usage error 796ms
     ✓ --flush is ship only 302ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1115ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1054ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1058ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1102ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 794ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 453ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 378ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2297ms
     ✓ --flush with nothing to record commits and pushes nothing 1100ms
     ✓ --flush carries the named worktree's logs into the dev commit 2227ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2367ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2487ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2893ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2382ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2747ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2403ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2385ms
     ✓ --push on dev never carries a row whose references name another feature 2135ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2100ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3715ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3107ms
     ✓ --push commits in the named worktree, not the checkout it runs from 931ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2308ms
     ✓ preserves unlanded file deletions and ledger additions on close 4731ms
     ✓ preserves dirty work and uncertain branch evidence during close 5415ms
     ✓ preserves a local feature ref changed after its cleanup proof 5562ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3475ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2383ms
     ✓ a close that landed releases the lock 3426ms
     ✓ removes the worktree before it releases the lock 3503ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3689ms
       ✓ closePr refuses when the PR base is unknown 1731ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1252ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 409ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 654ms
     ✓ a second run's record does not let this FID's close commit 349ms
     ✓ record is present after workflows close and before the push 632ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1189ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 669ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 480ms
     ✓ puts each --line after the summary, in flag order 539ms
     ✓ --summary prints the file and keeps a copy in --outbox 1035ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 436ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 208106ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 613ms
     ✓ rejects missing explicit and ambiguous existing branch selections 571ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 892ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 865ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 551ms
     ✓ a refused --continue carries git's own reason 675ms
     ✓ --file records nothing for a refused rebase 579ms
     ✓ refuses a code conflict and aborts the rebase on the spot 569ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1123ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 486ms
     ✓ produces byte-identical output to merge=union 1258ms
     ✓ restores a trailing newline so the next append starts on its own line 749ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 678ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1034ms
     ✓ refuses a union that leaves a line which is not JSON 666ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 891ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1324ms
     ✓ refuses a lockfile whose regenerate command fails 1117ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1369ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1429ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1149ms
     ✓ refuses and aborts when both sides changed the hand-written region 738ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 850ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1070ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1272ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 696ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 867ms
     ✓ refuses and aborts when a side deleted the install record 703ms
     ✓ refuses a conflicted doc the repo's script does not list 648ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 633ms
     ✓ removes a stale sentinel when the rebase succeeds 845ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1156ms
     ✓ resolves a conflict in each of two replayed commits across rounds 929ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 554ms
       ✓ skips (12) with no anchor 563ms
       ✓ skips (12) when the base is unreachable in this clone 625ms
       ✓ skips (12) when nothing landed since the base 624ms
       ✓ runs (0) with the landed path count once dev moved 1138ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 639ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1159ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 726ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 922ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1317ms
     ✓ runs exactly one git push 1260ms
     ✓ --set-upstream records the upstream 853ms
     ✓ refuses with no branch checked out 701ms
     ✓ --mode=dev refuses a feature checkout 670ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1660ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2564ms
     ✓ --require-ci pushes as-is when dev has not moved 1035ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1856ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2581ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 671ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 873ms
     ✓ --mode=abort pushes when the branch has no open PR 1168ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 850ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 563ms
     ✓ --open-pr carries the MCP answer and skips gh 794ms
     ✓ --mode=abort on dev pushes plainly without probing 762ms
     ✓ rejects an unknown mode 544ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2347ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1320ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1516ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3396ms
     ✓ skip-ci HEAD on the replay is refused 1010ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2357ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3113ms
     ✓ a level local dev is a plain push, recording nothing extra 1260ms
     ✓ a record with no commits pushes nothing 774ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 569ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1485ms
     ✓ a rewritten branch is refused, never forced 857ms
     ✓ refuses dev and main with exit 21 and pushes nothing 555ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1222ms
     ✓ refuses a detached HEAD (exit 5) 576ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1114ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1002ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1087ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1280ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 498ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1091ms
     ✓ an up-to-date branch is a no-op 760ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1199ms
     ✓ a fetch that fails exits 10 558ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 700ms
     ✓ scan-diff still reports a new skip when its test … 660ms
     ✓ scan-diff reports a skip moved onto a different t… 564ms
     ✓ scan-diff does not cancel a skip moved between am… 652ms
     ✓ scan-diff does not spend an unchanged duplicate t… 781ms
     ✓ scan-diff recognizes a renamed test file 676ms
     ✓ scan-diff recognizes a suite moved into a differe… 730ms
     ✓ scan-diff does not let unrelated additions hide a… 645ms
     ✓ scan-diff attributes deletion to its old test ins… 745ms
     ✓ scan-diff consumes each moved assertion once and … 860ms
     ✓ scan-diff does not match identical assertions fro… 824ms
     ✓ scan-diff does not match the same leaf test name … 767ms
     ✓ scan-diff does not match a same-named test with d… 772ms
     ✓ scan-diff does not match a same-named test with c… 722ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 761ms
     ✓ --paths with no match exits 1 695ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 604ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1039ms
     ✓ --marker reads a diff over 1 MiB 808ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1009ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 967ms
     ✓ scan-diff finds an added skip 1044ms
     ✓ scan-diff ignores a skip predating the base 876ms
     ✓ scan-diff reports a disabled test with its line 1057ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 872ms
     ✓ scan-diff ignores a removed comment in a test file 784ms
     ✓ scan-diff ignores an assertion moved within the file 766ms
     ✓ scan-diff still reports a removed assertion 869ms
     ✓ scan-diff reports an assertion re-added only outside the test file 850ms
     ✓ scan-diff finds an added pytest mark skip 987ms
     ✓ scan-diff finds an added unittest skip 1001ms
     ✓ scan-diff finds an added bare skip call 948ms
     ✓ scan-diff ignores a quoted skip in a documentation file 877ms
     ✓ scan-diff ignores a marker literal in a non-test source file 900ms
     ✓ scan-diff ignores an assertion whose expectation changed 887ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 890ms
     ✓ scan-diff reports a deleted test file 908ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 616ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 802ms
     ✓ a title that already carries the marker is left alone 606ms
     ✓ with no open PR: pushes the marker commit and edits no title 652ms
     ✓ a re-run is deduped: no second marker commit 825ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 950ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 301ms
     ✓ --title-set skips gh entirely 528ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1043ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1791ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 979ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2120ms
     ✓ continues only the explicitly recorded target through the public merge command 1726ms
     ✓ fetches the unseen feature head before classifying the base 1681ms
     ✓ fast forwards the feature before either base path is chosen 1972ms
     ✓ merges divergent feature tips without rebasing either side 1437ms
     ✓ continues the feature merge before starting a dev merge 1722ms
     ✓ publishes local code with a CI running head before bookkeeping 1891ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2588ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1647ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1188ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 336ms
     ✓ Path B once dev moved; --head checks a given commit 486ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 490ms
     ✓ --merge-docs merges dev when docs/ is behind 577ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 545ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 792ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 779ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 690ms
     ✓ --merge-docs skips an empty bkit:generate script 609ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 519ms
     ✓ --merge-docs never merges on dev itself 469ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 647ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 666ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 622ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 643ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 361ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 812ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1039ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 966ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 801ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 792ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1047ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 778ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 924ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 589ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 434ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 534ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 745ms
     ✓ a failed install stops ship (16) 642ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 551ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 527ms
     ✓ exits 10 when the fetch fails 394ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1308ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1314ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1303ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1306ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2677ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3031ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 483ms
     ✓ local: names unpushed dev as the cause when the branch carries it 557ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 596ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1389ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1427ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1056ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4455ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1111ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1266ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1074ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 709ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1612ms
     ✓ land removes the worktree when only the copied .env is untracked 1363ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1138ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1232ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1925ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1294ms
     ✓ landPr refuses a main-based PR without retrying 616ms
     ✓ landPr refuses when the PR base is unknown 535ms
     ✓ PR not open (closed): stops (17) at once, no retry 701ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 460ms
     ✓ --attempt names the merge round in a fix commit 448ms
     ✓ commits a rewritten and a deleted tracked file 458ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 383ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 373ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 435ms

 Test Files  176 passed (176)
      Tests  7602 passed | 2 skipped (7604)
   Start at  14:00:39
   Duration  209.05s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/915-min-push-ignores/build-group-gate-1-2.log.reports/vitest-43504.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.48 |    82.23 |   94.36 |   89.93 |                   
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
 engine/commands   |    88.6 |    83.33 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.31 |   96.42 |   94.53 | ...18-821,868-883 
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
 ...mands/workflow |   90.03 |    82.82 |   95.12 |   91.54 |                   
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
Statements   : 88.48% ( 20643/23330 )
Branches     : 82.23% ( 16001/19457 )
Functions    : 94.36% ( 3283/3479 )
Lines        : 89.93% ( 18119/20147 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 440 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 224 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 220 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 226 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 219 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 221 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 89 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 237 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 216 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 215 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 242 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 224 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 233 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 233 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 848 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 551 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 19 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 20 ms
ok 19 stub: the response selector is cleared before running its body # in 19 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 24 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 26 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 22 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 18 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 24 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 17 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 40 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 60 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 580 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 375 ms
ok 30 refresh drops a file deleted in the index from the build # in 341 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 386 ms
ok 32 a key removed from the env file is unset on the next run # in 183 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 165 ms
ok 34 non-BKIT_ keys are skipped # in 156 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 172 ms
ok 36 a failed unsetenv is retried on the next run # in 202 ms
ok 37 logs key names only, never values # in 160 ms
ok 38 missing env file exits 0 without calling launchctl # in 29 ms
ok 39 the sweep prints the summary line the lane greps for # in 321 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 11 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (123.0475ms)
✔ shell cancellation waits for SIGTERM cleanup (172.417959ms)
✔ direct cancellation waits for SIGINT cleanup (119.906833ms)
✔ shell cancellation waits for SIGINT cleanup (169.083084ms)
✔ direct cancellation waits for SIGHUP cleanup (115.884583ms)
✔ shell cancellation waits for SIGHUP cleanup (168.330042ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (386.592875ms)
✔ shell cancellation follows a worker orphaned by a nested shell (236.309875ms)
✔ direct cancellation preserves a nested machine-lock owner (423.8095ms)
✔ shell cancellation preserves a nested machine-lock owner (485.611583ms)
✔ nested shell cancellation preserves a nested machine-lock owner (508.83875ms)
✔ a hard process-group timeout reaches a shell command during cleanup (91.1775ms)
✔ ships a command-scoped sleep prevention wrapper (0.084875ms)
✔ preserves arguments, output and nonzero exit status (50.809959ms)
✔ runs an entire shell chain and retains its failure (32.322667ms)
✔ reports a missing command as 127 (31.933166ms)
✔ requires a command (29.167584ms)
✔ non-macOS platform selection runs commands without sleep prevention (49.069708ms)
✔ hard timeout escalation reaches a command that ignores TERM (157.248791ms)
✔ forwards POSIX cancellation to the command and releases the assertion (56.682417ms)
✔ holds a real macOS assertion only while the command runs (75.231333ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3525.636917
> [bkit] TRUNCATED — kept 1782 of 3361 lines (128 KB of 259 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
