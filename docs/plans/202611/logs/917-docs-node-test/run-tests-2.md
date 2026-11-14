
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 917-docs-node-test build-run-tests is waiting for tests (up to 1200s), 1st in line: in use by vitest .bkit/core/engine/audits/workflows/ship-invariants.test.ts .bkit/core/engine/render .bkit/core/engine/audits — /Users/christian/Documents/GitHub/bkit (pid 24827, since 08:49:59), last run took 1m12s

> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
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
 516:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 638:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 721:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 634:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 873:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1054:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1166:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1258:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1500:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1560:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 396:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 467:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 251:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 383:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 423:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 494:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> bkit ci slop

[bkit-ci] base a2c8e2741d434cb4d5f83e59adc265d936e2be42 (a2c8e2741d434cb4d5f83e59adc265d936e2be42) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: a2c8e2741d434cb4d5f83e59adc265d936e2be42
base: a2c8e2741d434cb4d5f83e59adc265d936e2be42
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 6.2 on 10 cores: unit limits 7600ms per test, 15200ms per hook (x1.52)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
      Coverage enabled with v8

(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:48012) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 20280ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 634ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 8242ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 9778ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 447ms
     ✓ the template's step (5)
       ✓ passes with the script present and the lanes green 330ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 51032ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 311ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 324ms
     ✓ adopts the main checkout even when called from a linked worktree 415ms
     ✓ plan refuses to work in place on dev 532ms
     ✓ design and plan in place on main are refused 519ms
     ✓ still adopts a cloud session branch whose upstream is main 450ms
     ✓ refuses a detached HEAD 456ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1585ms
     ✓ may debug in place on dev 903ms
     ✓ adopts in place when the session is already on feat/{fid} 435ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1331ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 829ms
     ✓ a new run of the same FID rewrites startSha 1789ms
     ✓ a resume of the same FID reuses the record 1640ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 968ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1303ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1114ms
     ✓ a stale record without a lock is replaced 1839ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1403ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4659ms
     ✓ names inherited commits and ship recovery in the refusal 1269ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1172ms
     ✓ ship names a missing feat branch 384ms
     ✓ ship on dev refuses with the releases-stay-manual text 329ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1148ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 504ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 384ms
     ✓ fails with a fetch error when there is no origin to rebase onto 447ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 307ms
       ✓ checks no disk when there are no cleanup step files 424ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 647ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 573ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 394ms
     ✓ never commits an entry only the main checkout's copy list names 414ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 435ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 645ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 354ms
     ✓ tells a caller inside the removed worktree where to cd 641ms
     ✓ fails with its own exit code when git cannot remove a marked path 339ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1179ms
       ✓ preserves staged-only mode during landed cleanup 1327ms
       ✓ preserves staged-only type during landed cleanup 1440ms
       ✓ preserves staged-only deletion during landed cleanup 1202ms
       ✓ removes landed staged content when both index and working contents are on dev 1504ms
       ✓ deletes the proved local and remote branch at their landed tips 1738ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2485ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 459ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 440ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 524ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 409ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 911ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 51108ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1473ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 687ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 596ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 391ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 528ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 421ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 384ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 840ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 387ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 468ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 647ms
     ✓ PASS is 0 failures with or without reports 916ms
     ✓ clears a previous attempt's reports before the gate runs 912ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 629ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 956ms
     ✓ a log under the outbox is named main-checkout relative in the record 790ms
     ✓ a log small enough is copied whole: not clamped, raw null 955ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 970ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1185ms
     ✓ numbers runs within the workflow's active run and per step 791ms
     ✓ without --file no row is written and the output carries row null 1016ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 383ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 667ms
     ✓ a planned test that passes is a vacuous gap, exit 1 526ms
     ✓ a planned test absent from a loaded report is a missing gap 901ms
     ✓ a file that fails to load is a red of kind red-not-loaded 774ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1047ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 328ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 871ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 610ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 732ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1398ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 771ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1460ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 927ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1344ms
     ✓ green: a passed-accepted test is already landed, not a gap 686ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 813ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 709ms
     ✓ green: --group audits only that group's tasks 720ms
     ✓ green: --group naming a group with no tasks is refused 401ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 765ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 924ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 883ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 950ms
     ✓ green: lists each gap kind, with the runner output 1399ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1968ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 534ms
       ✓ green clears an exception-only task from a human commit 418ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 59504ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 976ms
     ✓ finishes a CI round only with its own failed job count 586ms
   ✓ progress command output (4)
     ✓ gate progress number validation 384ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 567ms
     ✓ done --group writes group on the row 502ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 753ms
     ✓ --commit=none writes the row and leaves it uncommitted 439ms
     ✓ build-group-start records parentSha and group 327ms
     ✓ carries extra fields, parsed as JSON when they are JSON 554ms
     ✓ rejects ["--strategy=YOLO"] 393ms
     ✓ reports a failed commit with exit 8 without writing the row 815ms
     ✓ a failed commit leaves no row staged in the index 1645ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 994ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1097ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1403ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1003ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1651ms
   ✓ bkit steps verdict (10)
     ✓ bad failures artifact exits 4 355ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 520ms
     ✓ --ref reads the status file as committed on that ref, not from disk 506ms
     ✓ --ref exits 3 when the ref does not carry the status file 677ms
     ✓ fails on a placeholder left in the artifact 429ms
     ✓ fails when the row's verdict differs from the artifact's 429ms
     ✓ fails when the row does not list the artifact, or carries another attempt 406ms
     ✓ fails on a missing artifact 684ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 392ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 507ms
     ✓ fails a run-tests row missing its scope, and an empty scope 695ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 760ms
     ✓ re-asks on a PENDING header (exit 5) and writes nothing 322ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 599ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 369ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 611ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1086ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 617ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 770ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1447ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 705ms
     ✓ --post needs --number; without --post there is no tracker key 487ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 439ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 951ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 572ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 333ms
     ✓ --attempt-of checks the row carries the derived counter 600ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1074ms
     ✓ writeStepRow refuses when a recorded path changed 1545ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 614ms
     ✓ writeStepRow appends its commit sha to the record 1309ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1453ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 652ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 816ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 626ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 856ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 366ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1432ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 828ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 802ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 663ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1318ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 477ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 496ms
     ✓ does not count an artifact the run found committed when it started 595ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 384ms
     ✓ commits a package.json change outside bkit.workflows 903ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1197ms
   ✓ bkit steps stub --result-file (12)
     ✓ renders and verifies the header of every prompt that declares one 430ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 39505ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 749ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 768ms
     ✓ always writes the marker, even with no plan 403ms
     ✓ writes the linear marker shape, taking the tracker from package.json 392ms
     ✓ writes the jira marker shape, taking the tracker from package.json 408ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 456ms
     ✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 332ms
     ✓ refuses a PR from dev, main, or the base itself 621ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 457ms
     ✓ retries a failed create once, and exits 5 when it fails twice 503ms
     ✓ exits 5 when the open-PR probe errors 493ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 543ms
     ✓ prs open still opens against any other base 478ms
     ✓ exits 6 when the created PR's base is not --base 560ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2539ms
     ✓ refuses merged entry when current feature evidence cannot be read 746ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 1008ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 472ms
     ✓ exits 1 with found=false when there is none 439ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 500ms
     ✓ --number reads one PR, mergeable included 331ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 548ms
     ✓ exits 4 when gh errors and 80 when it needs auth 552ms
   ✓ bkit prs scan-body (10)
     ✓ flags [actions skip] in the landed commit body (exit 1) 322ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 353ms
     ✓ classifies a refused merge with a new dev conflict as integration 582ms
     ✓ returns an explicit terminal reason for other merge refusals 687ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 468ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 523ms
     ✓ drops the force-build marker from the title subject 679ms
     ✓ takes an explicit --subject 384ms
     ✓ runs no merge when the PR is already MERGED 387ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 521ms
     ✓ prs merge refuses a PR whose base is main 498ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 528ms
     ✓ prs merge refuses when the PR base is unknown 387ms
     ✓ prs merge reads the base from the one pr view it already makes 377ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1266ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1119ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 838ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 348ms
     ✓ never reads dev's required checks without --only-if-required 316ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 735ms
     ✓ updates when a dev ruleset requires status checks 519ms
     ✓ updates when dev's branch protection requires status checks 443ms
     ✓ ignores dev rulesets that require no checks 392ms
     ✓ updates when the repo cannot be resolved 651ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 541ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 415ms
     ✓ is not green when a check failed, naming it (exit 1) 624ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 422ms
     ✓ is not green on an empty rollup (total 0) 332ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 637ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 577ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 358ms
     ✓ is a no-op when the title already says so 356ms
     ✓ strips the marker, with or without its bkit prefix 696ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 613ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 304ms
     ✓ needs --scan or --scan-result 344ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 67889ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2182ms
     ✓ runs code.ts through its declared gate in the built checkout 2329ms
     ✓ runs code.ts through its declared gate in the built checkout 2436ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1846ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1561ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1684ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 962ms
     ✓ runs the full gate for replayed debug code 1658ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2034ms
     ✓ installs local dependencies against the built target tree 2430ms
     ✓ runs the configured frozen install even without root dependencies 2171ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2134ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2447ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2187ms
     ✓ never pushes local dev commits missing from origin/dev 2167ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4128ms
     ✓ dev moved before every push: exhausted, nothing landed 6199ms
     ✓ any other refusal is returned, not retried 2723ms
     ✓ pushToDev replays a commit range onto origin/dev 2493ms
     ✓ a replay retries on the new dev when dev moved 3257ms
     ✓ pushToDev log line names what it lands 2128ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2438ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2398ms
     ✓ a push that fails without a server answer is returned once, never retried 2175ms
     ✓ a failed fetch is returned before anything is built 666ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2869ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2120ms
     ✓ lands from a clone whose fetch refspec omits dev 3041ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1007ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 29417ms
   ✓ bkit fids find (6)
     ✓ exits 1 when nothing is logged, or docs/plans does not exist 311ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ github reads "please do #12 today" as issue 12 302ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 40261ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 942ms
     ✓ names each net-new and worsened finding in the log and the JSON 911ms
     ✓ fails on a net score rise with no net count change 1079ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 933ms
     ✓ treats a net score at or below 0.001 as float noise 820ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 716ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 336ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 968ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 742ms
     ✓ exits 4 on a dropped net field instead of silently passing 848ms
     ✓ exits 4 on no summary instead of silently passing 906ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1067ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1594ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1436ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1015ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 474ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 795ms
     ✓ fails (exit 1) when vale reports alerts 480ms
     ✓ exits 6 on a vale runtime error 454ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 727ms
     ✓ falls back to vale sync when the main worktree has none 441ms
     ✓ fails when vale sync cannot restore the required styles 827ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 566ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 381ms
     ✓ is a usage error when the commit cannot be read 339ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 545ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 488ms
     ✓ exits 1 naming the files outside, whatever the commit message says 565ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1002ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 597ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 518ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 447ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 427ms
     ✓ staging failure: exit 4 and no commit is created, no false success 600ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 428ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 386ms
> [bkit] TRUNCATED HERE — 57 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 36772ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 331ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 594ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3387ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 561ms
     ✓ starts only new source after overflow or missing source 486ms
     ✓ uses exact new comment after a failed eligibility read 465ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 434ms
     ✓ recognizes append success within budget without unnecessary resend 329ms
     ✓ preserves a human correction after lost append recognition and a later report 360ms
     ✓ contains exhausted append and create failures without fabricated success 396ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 332ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 308ms
     ✓ reserves new comment opportunity within total delivery budget 930ms
     ✓ attempts independent attention after routine uncertainty 397ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 455ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 429ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 828ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 438ms
     ✓ fetches the issue and its comments as GitHub returns them 493ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 653ms
     ✓ invalidates missing corrupt and unsupported progress cache 1254ms
     ✓ contains cache read and write failures as standalone degradation 604ms
     ✓ uses legacy receipts and contains receipt failures 532ms
     ✓ skips issue-less runs and tracker none 319ms
     ✓ records an engine-action row and skips the same key + body on a re-run 582ms
     ✓ a recent identical comment counts as done (the final close comment) 440ms
     ✓ a failed post reports done false with the reason and never leaks a token 444ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 503ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 406ms
     ✓ a different marker hash posts 570ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 427ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 30513ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3153ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3275ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 433ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 433ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 422ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3461ms
     ✓ does not fall back through a malformed later success receipt 1825ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1268ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1216ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2228ms
     ✓ requires proof even when the pushed increment changes no files 1304ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 813ms
     ✓ does not record a committed tree 817ms
     ✓ records no proof for a failed gate or lighter gate 1213ms
     ✓ requires integration proof when integration is declared 1353ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2354ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 105364ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1887ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2436ms
     ✓ saves the failed job count without the capstone job 1241ms
     ✓ counts the capstone job when it is the only failed job 1003ms
     ✓ saves no failed job count when no job failed 1057ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 348ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1429ms
     ✓ freezes explicit workflow run attempt and all failed job pages 997ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1824ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3075ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2072ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2400ms
     ✓ checks the named repository base and fails closed on missing evidence 1381ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1244ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1174ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 956ms
       ✓ a source change past the validated head refuses (17) and names the path 606ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 648ms
       ✓ --validated without --month / --fid is a usage error (2) 616ms
       ✓ a validated sha that is not an ancestor refuses (17) 570ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 1168ms
   ✓ bkit runs wait (10)
     ✓ CLI: a failed gh workflow run exits 5 314ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1169ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 663ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1235ms
     ✓ a failed re-trigger push names the cause in the log 1872ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1433ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2446ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1274ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 753ms
     ✓ gh-error: every poll errored 570ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1189ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1086ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1624ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1499ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3368ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3124ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 930ms
     ✓ re-trigger on dev only uses the record of its own FID 1053ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1422ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 355ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 654ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 389ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 434ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 615ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 765ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 863ms
     ✓ --file and --step go together 595ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 746ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 414ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1029ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 505ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 538ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 662ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 574ms
     ✓ an unpinned repo reports nulls and asks no registry 564ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 371ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 344ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 386ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 356ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 944ms
     ✓ keeps each context's own section banner and drops every other context's 2019ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 319ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 423ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 715ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2303ms
     ✓ a refused dev push is logged, never fails the close 2510ms
     ✓ an unreachable remote is logged, never fails the close 963ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 12871ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 476ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 458ms
     ✓ follows summary cursors even when the first page is shorter than the limit 692ms
     ✓ reports excluded intervals as unread even when pagination finishes 916ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 745ms
     ✓ reports an unread remainder at the page cap 466ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 520ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 307ms
     ✓ rejects missing summaries instead of treating them as empty results 601ms
     ✓ reports a failed first page as unavailable 407ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 340ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 631ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 488ms
     ✓ follows summary cursors even when the first page is shorter than the limit 581ms
     ✓ reports excluded intervals as unread even when pagination finishes 638ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 881ms
     ✓ reports an unread remainder at the page cap 639ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 488ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 358ms
     ✓ rejects missing summaries instead of treating them as empty results 983ms
     ✓ reports a failed first page as unavailable 637ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 614ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 12233ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 308ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 462ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 413ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 657ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 679ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 370ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 498ms
     ✓ --file into a missing directory is refused, not created 394ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 697ms
     ✓ resolves config from the repo root when run from a subdirectory 659ms
     ✓ exits 6 when the PUT fails 716ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 411ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 718ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 356ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 560ms
     ✓ exits 6 when the api answer is not JSON 547ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 348ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 343ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 405ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
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
     ✓ runs bkit:gate:changed with the changed files as its arguments 899ms
     ✓ counts files committed since --base 951ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1007ms
     ✓ runs nothing and exits 0 when no file changed 380ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 800ms
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
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 599ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1209ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 466ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 467ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1433ms
     ✓ runGit names ENOBUFS when output passes the limit 2587ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 2154ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 912ms
     ✓ passes every rule on a clean head 421ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 428ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (49 tests) 3870ms
   ✓ bkit decisions compose (26)
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 300ms
     ✓ passes when only another key changed, such as a branch's upstream 321ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 364ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 436ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 520ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 3214ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 133 lines omitted. Dropped content was NOT read.
   ✓ Harvest dedup by per-kind composite identity (WS4-T2) (3)
     ✓ repeat harvest of same rows does not duplicate (idempotent) 415ms
 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests | 1 failed) 2688ms
   ✓ checkCoverage (10)
     ✓ the fixture passes 10ms
     ✓ a standing line no entry matches fails and prints the entry to add 1ms
     ✓ a local entry whose text left its file fails 1ms
     ✓ a listed verbatim carrier without the text fails 0ms
     ✓ a condensed carrier without a tagged local line fails 0ms
     ✓ a clause tagged with the rule backs a condensed carrier 1ms
     ✓ a tag naming no rule fails instead of pointing at another rule 1ms
     ✓ a clause rule or tag naming no rule fails 0ms
     ✓ two entries 80% alike are flagged 1ms
     ✓ a drift excerpt not on its cited line fails 2ms
   ✓ checkCarry (5)
     ✓ a carry line naming each prompt that holds the whole rule passes 1ms
     ✓ a carry line naming a prompt without the whole rule fails 1ms
     ✓ a prompt holding a bkit rule its carry line does not name fails 0ms
     ✓ sync rewrites a copy of the rule's retired text in a carrying prompt's block 1ms
     ✓ a prompt that carries no rule is listed 0ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a drift item without a kept reason is open 1ms
   ❯ the repo (7)
     × has no coverage findings 1662ms
     ✓ has no unreviewed near-alike entries 336ms
     ✓ every fit tag matches its target or records why it stays 8ms
> [bkit] TRUNCATED HERE — 655 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 208 lines omitted. Dropped content was NOT read.


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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 456ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 1011ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 692ms
 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (300 tests) 1186ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 987ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 843ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (77 tests) 6858ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 1051ms
     ✓ derives a required call from each {BKIT} literal of every live step section 372ms
   ✓ check — hole classes (27)
     ✓ a tracker-none run that journals every rendered call is CLEAN 893ms
     ✓ charges calls below a step's finish line to that step 1002ms
     ✓ never requires the workflows start call, which a fresh run cannot journal 808ms
     ✓ reports an untaken route arm as unexercised 332ms
     ✓ never reports the rows build writes outside its numbered steps as unexpected 509ms
     ✓ matches a call the Contract allows at any point 459ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 406ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 191ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 1304ms
   ✓ bkit completeness check (6)
     ✓ renders the contract for the tracker of the repo holding the file 627ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 786ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 444ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 315ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 444ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 345ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 686ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 394ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 147ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 176ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 268ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 252ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 138ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 142ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 215ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-THdB15/nonexistent.md — skipping .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 168ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 805ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 190ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 241ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 192ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 234ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 500ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 441ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 320ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 262ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 242ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 133ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 65ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 226ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 256ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 169ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-wdJQEF/architecture.md — skipping (expected exactly one start/end)

(node:78779) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:78779) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:78779) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:78779) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 218ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 346ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 364ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 201ms
(node:78942) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:78942) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 369ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 294ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 164ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 176ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 208ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 179ms
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

 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 215ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 63ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 311ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 362ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 107ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 256ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 249ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 226ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 128ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 182ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 92ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 67ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 38ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 166ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 129ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 65ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 26ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 176ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 100ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 122ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 123ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 37ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 387ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 56ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794610557439.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794610557444.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794610557445.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 51ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794610557457.js — skipping

 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 26ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 34ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 85ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 27ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 57ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 22ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 54ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 28ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 128ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 80ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 27ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 20ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 16ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 13ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 13ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (165 tests) 177692ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 788ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2519ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 551ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 431ms
     ✓ writes no limits for a workflow with no ask point 375ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 661ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 644ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 533ms
       ✓ a new run in the same chat gets its own session row 888ms
       ✓ writes none outside Claude Code 364ms
     ✓ opens the next run after a finished one, and after another workflow's run 478ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 371ms
     ✓ design / plan / build / debug book in the current worktree 401ms
     ✓ refuses when the lock is live, writing no row 424ms
     ✓ --lock-held checks the lock is ours 383ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 495ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a resumed run prints its last DONE step; a closed decision is not open 490ms
     ✓ an OPEN decision of an earlier run never resurfaces 410ms
     ✓ openDecision carries the Gate header 340ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 726ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 441ms
     ✓ writes no row when status.jsonl does not exist 637ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 341ms
     ✓ aborts a rebase only when one is in progress 746ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 567ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 980ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 552ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 547ms
     ✓ --max-exceeded says a handover is due without any sentinel 649ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 377ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 472ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 464ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 424ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 332ms
     ✓ a debug run in SOAK mode always needs a handover 424ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1245ms
       ✓ counts subagents of an earlier chat the run's session rows name 984ms
       ✓ records no context block, and still closes, outside a Claude Code session 1225ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 889ms
     ✓ records ending held and publish false on the workflow-done row 1190ms
     ✓ defaults the close row to ending done 908ms
     ✓ refuses an unknown ending 521ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 940ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1323ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 929ms
     ✓ always writes the telemetry, whatever the runtime 1200ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 821ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1267ms
     ✓ an unwritable stats path is logged and never fails the close 855ms
     ✓ appends the completeness row before the workflow-done row 1375ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 907ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1177ms
     ✓ writes one completeness row per close 1501ms
     ✓ leaves out the previous run's rows that share a second with this run's start 993ms
     ✓ still closes when the completeness check throws 992ms
     ✓ still closes when the completeness row write throws 1231ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1032ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1106ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 966ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 907ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1521ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1173ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1520ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1340ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1155ms
     ✓ --record-step writes the close step's row before workflow-done 992ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 968ms
     ✓ --number without --outbox is a usage error 1291ms
     ✓ --flush is ship only 344ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1121ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1363ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1430ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1361ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1026ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 648ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 584ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3149ms
     ✓ --flush with nothing to record commits and pushes nothing 1436ms
     ✓ --flush carries the named worktree's logs into the dev commit 2772ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3165ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3011ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3810ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3149ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3741ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2650ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2715ms
     ✓ --push on dev never carries a row whose references name another feature 2837ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2693ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5540ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3026ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1346ms
     ✓ rejects --push with --flush, and --flush outside ship 303ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3705ms
     ✓ preserves unlanded file deletions and ledger additions on close 7142ms
     ✓ preserves dirty work and uncertain branch evidence during close 7666ms
     ✓ preserves a local feature ref changed after its cleanup proof 7195ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4337ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3314ms
     ✓ a close that landed releases the lock 3710ms
     ✓ removes the worktree before it releases the lock 3988ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4710ms
       ✓ closePr refuses when the PR base is unknown 3516ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1901ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 542ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 350ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 953ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 384ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 373ms
     ✓ a second run's record does not let this FID's close commit 461ms
     ✓ record is present after workflows close and before the push 874ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1569ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 330ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 382ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 817ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 507ms
     ✓ puts each --line after the summary, in flag order 505ms
     ✓ --summary prints the file and keeps a copy in --outbox 504ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 505ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 262531ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 907ms
     ✓ rejects missing explicit and ambiguous existing branch selections 606ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1342ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1162ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1140ms
     ✓ a refused --continue carries git's own reason 989ms
     ✓ --file records nothing for a refused rebase 890ms
     ✓ refuses a code conflict and aborts the rebase on the spot 817ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1501ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 553ms
     ✓ produces byte-identical output to merge=union 1461ms
     ✓ restores a trailing newline so the next append starts on its own line 949ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 859ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1194ms
     ✓ refuses a union that leaves a line which is not JSON 750ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1121ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1798ms
     ✓ refuses a lockfile whose regenerate command fails 1149ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1681ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1548ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1660ms
     ✓ refuses and aborts when both sides changed the hand-written region 887ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1298ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1070ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1606ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 815ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1187ms
     ✓ refuses and aborts when a side deleted the install record 801ms
     ✓ refuses a conflicted doc the repo's script does not list 924ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 689ms
     ✓ removes a stale sentinel when the rebase succeeds 1130ms
     ✓ exits 4 when no rebase is in progress 301ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1437ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1314ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 620ms
       ✓ skips (12) with no anchor 611ms
       ✓ skips (12) when the base is unreachable in this clone 835ms
       ✓ skips (12) when nothing landed since the base 678ms
       ✓ runs (0) with the landed path count once dev moved 1277ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 762ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1307ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 978ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 890ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2858ms
     ✓ runs exactly one git push 1230ms
     ✓ --set-upstream records the upstream 1091ms
     ✓ refuses with no branch checked out 721ms
     ✓ --mode=dev refuses a feature checkout 1045ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1812ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3057ms
     ✓ --require-ci pushes as-is when dev has not moved 1272ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2131ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3220ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 878ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1362ms
     ✓ --mode=abort pushes when the branch has no open PR 1329ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 987ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 701ms
     ✓ --open-pr carries the MCP answer and skips gh 933ms
     ✓ --mode=abort on dev pushes plainly without probing 876ms
     ✓ rejects an unknown mode 715ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3061ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1619ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1898ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4003ms
     ✓ skip-ci HEAD on the replay is refused 1278ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3291ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3642ms
     ✓ a level local dev is a plain push, recording nothing extra 1484ms
     ✓ a record with no commits pushes nothing 941ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 726ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1452ms
     ✓ a rewritten branch is refused, never forced 1095ms
     ✓ refuses dev and main with exit 21 and pushes nothing 671ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1594ms
     ✓ refuses a detached HEAD (exit 5) 746ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1473ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1418ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1406ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1852ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 731ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1884ms
     ✓ an up-to-date branch is a no-op 1034ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1832ms
     ✓ a fetch that fails exits 10 766ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1045ms
     ✓ scan-diff still reports a new skip when its test … 963ms
     ✓ scan-diff reports a skip moved onto a different t… 1038ms
     ✓ scan-diff does not cancel a skip moved between am… 967ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1007ms
     ✓ scan-diff recognizes a renamed test file 1048ms
     ✓ scan-diff recognizes a suite moved into a differe… 997ms
     ✓ scan-diff does not let unrelated additions hide a… 857ms
     ✓ scan-diff attributes deletion to its old test ins… 970ms
     ✓ scan-diff consumes each moved assertion once and … 984ms
     ✓ scan-diff does not match identical assertions fro… 981ms
     ✓ scan-diff does not match the same leaf test name … 1028ms
     ✓ scan-diff does not match a same-named test with d… 1003ms
     ✓ scan-diff does not match a same-named test with c… 970ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1079ms
     ✓ --paths with no match exits 1 1030ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 907ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1553ms
     ✓ --marker reads a diff over 1 MiB 1115ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1082ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1148ms
     ✓ scan-diff finds an added skip 1093ms
     ✓ scan-diff ignores a skip predating the base 1186ms
     ✓ scan-diff reports a disabled test with its line 1317ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1060ms
     ✓ scan-diff ignores a removed comment in a test file 972ms
     ✓ scan-diff ignores an assertion moved within the file 1044ms
     ✓ scan-diff still reports a removed assertion 996ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1207ms
     ✓ scan-diff finds an added pytest mark skip 1170ms
     ✓ scan-diff finds an added unittest skip 1177ms
     ✓ scan-diff finds an added bare skip call 913ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1085ms
     ✓ scan-diff ignores a marker literal in a non-test source file 890ms
     ✓ scan-diff ignores an assertion whose expectation changed 951ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 969ms
     ✓ scan-diff reports a deleted test file 1061ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 702ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1982ms
     ✓ a title that already carries the marker is left alone 1449ms
     ✓ with no open PR: pushes the marker commit and edits no title 1745ms
     ✓ a re-run is deduped: no second marker commit 1904ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1911ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 719ms
     ✓ --title-set skips gh entirely 964ms
     ✓ refuses dev and main (exit 21) 396ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1373ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2470ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1390ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2840ms
     ✓ continues only the explicitly recorded target through the public merge command 2305ms
     ✓ fetches the unseen feature head before classifying the base 1402ms
     ✓ fast forwards the feature before either base path is chosen 2802ms
     ✓ merges divergent feature tips without rebasing either side 1338ms
     ✓ continues the feature merge before starting a dev merge 2238ms
     ✓ publishes local code with a CI running head before bookkeeping 2682ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3399ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1710ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1324ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 358ms
     ✓ Path B once dev moved; --head checks a given commit 606ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 513ms
     ✓ --merge-docs merges dev when docs/ is behind 604ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 567ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 856ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 834ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 671ms
     ✓ --merge-docs skips an empty bkit:generate script 609ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 510ms
     ✓ --merge-docs never merges on dev itself 495ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 878ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1121ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 947ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 688ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 370ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 799ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 824ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1010ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 804ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 811ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1042ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 749ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 948ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 670ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 525ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 519ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 694ms
     ✓ a failed install stops ship (16) 661ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 647ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 535ms
     ✓ exits 10 when the fetch fails 409ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1290ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1309ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1358ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1303ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2699ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3201ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 517ms
     ✓ local: names unpushed dev as the cause when the branch carries it 693ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 780ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2063ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1734ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1087ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4586ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1154ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1188ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1126ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 935ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2440ms
     ✓ land removes the worktree when only the copied .env is untracked 1714ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 3436ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2788ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2279ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1542ms
     ✓ landPr refuses a main-based PR without retrying 620ms
     ✓ landPr refuses when the PR base is unknown 606ms
     ✓ PR not open (closed): stops (17) at once, no retry 798ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 631ms
     ✓ --attempt names the merge round in a fix commit 563ms
     ✓ commits a rewritten and a deleted tracked file 579ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 497ms
     ✓ reports undeclared and runs nothing with no scripts 362ms
     ✓ reports undeclared and runs nothing with an empty script 365ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 439ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 514ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 396ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions-coverage.test.ts > the repo > has no coverage findings
AssertionError: expected [ …(2) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/docs/templates/bkit-audit-testing.md:42: no entry — add under #### bkit-audit-testing: bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not \"didn't fail\"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § What each tier must do; § Test first; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs",
+   "bkit-audit-testing: local entry no longer in the file: bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not \"didn't fail\"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs",
+ ]

 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts:278:42
    276| describe("the repo", () => {
    277|   it("has no coverage findings", { timeout: 60_000 }, () => {
    278|     expect(checkCoverage(STORE, CORPUS)).toEqual([]);
       |                                          ^
    279|   });
    280|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 176 passed (177)
      Tests  1 failed | 7661 passed | 2 skipped (7664)
   Start at  08:53:20
   Duration  263.67s (tests 96%, import 2%, setup 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/917-docs-node-test/run-tests-2.log.reports/vitest-47942.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.56 |    82.33 |   94.49 |   90.03 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.12 |    86.83 |   95.57 |   94.59 |                   
  auth.ts          |   99.04 |    94.94 |     100 |     100 | ...05,215,228,241 
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.96 |     100 |    97.2 | ...01,321,419-420 
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
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.31 |   96.42 |   94.53 | ...18-821,868-883 
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
 ...mands/workflow |   90.14 |    82.96 |   95.28 |   91.66 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.61 |    83.89 |   98.07 |   97.31 | ...82,387,464,653 
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
  runs.ts          |      82 |    74.49 |   92.64 |   83.42 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |      89 |    81.96 |    92.3 |   90.81 | ...2365,2367,2411 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests-jump.ts    |   94.73 |    68.18 |     100 |     100 | 17-25,34-36       
  tests.ts         |   96.84 |    90.03 |   96.59 |   98.21 | ...2262,2358-2360 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.83 |    82.98 |   98.71 |   95.48 | ...1725,1955,2695 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1391,1394-1395 
 engine/install    |   91.98 |    83.08 |   93.92 |   95.13 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    90.14 |     100 |     100 | ...19,324,330-331 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |   89.14 |    80.57 |    87.5 |   92.96 | ...26-346,370,589 
 engine/ledgers    |   95.44 |    91.86 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.71 |    97.7 |   97.92 | 855,881-887,921   
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
Statements   : 88.56% ( 20848/23539 )
Branches     : 82.33% ( 16210/19689 )
Functions    : 94.49% ( 3329/3523 )
Lines        : 90.03% ( 18286/20310 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1870 of 3526 lines (133 KB of 269 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
