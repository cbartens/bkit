
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 467:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 354:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 362:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 710:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 1314:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1372:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 124:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/testing.md
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 382:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 422:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 493:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 382:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 422:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 493:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> bkit ci slop

[bkit-ci] base d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab (d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
base: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 3.2 on 10 cores: unit limits 6100ms per test, 12200ms per hook (x1.22)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 20086ms
   ✓ bkit prs open (36)
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1104ms
     ✓ always writes the marker, even with no plan 392ms
     ✓ writes the linear marker shape, taking the tracker from package.json 305ms
     ✓ writes the jira marker shape, taking the tracker from package.json 625ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 315ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 313ms
     ✓ retries a failed create once, and exits 5 when it fails twice 464ms
     ✓ exits 5 when the open-PR probe errors 357ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 563ms
     ✓ prs open still opens against any other base 348ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 335ms
     ✓ exits 1 with found=false when there is none 420ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 371ms
     ✓ --number reads one PR, mergeable included 408ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 607ms
     ✓ exits 4 when gh errors and 80 when it needs auth 655ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 304ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 302ms
     ✓ prs merge refuses a PR whose base is main 509ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 373ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 348ms
     ✓ never reads dev's required checks without --only-if-required 336ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 405ms
     ✓ updates when dev's branch protection requires status checks 316ms
     ✓ updates when the repo cannot be resolved 353ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 676ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 401ms
   ✓ bkit prs verbose-ci (4)
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 305ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 21289ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 571ms
     ✓ names each net-new and worsened finding in the log and the JSON 826ms
     ✓ fails on a net score rise with no net count change 510ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 747ms
     ✓ treats a net score at or below 0.001 as float noise 513ms
     ✓ passes when the change only resolves findings 656ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 539ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 569ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 543ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 438ms
     ✓ exits 4 on a dropped net field instead of silently passing 544ms
     ✓ exits 4 on no summary instead of silently passing 553ms
     ✓ exits 4 on output that is not JSON instead of silently passing 560ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 688ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 580ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 561ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 592ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 602ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1113ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 593ms
     ✓ explicit globs can select ignored prose and nested checkout files 340ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 321ms
     ✓ exits 6 on a vale runtime error 338ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 439ms
     ✓ fails when vale sync cannot restore the required styles 661ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 438ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 443ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 445ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 23052ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 310ms
     ✓ reports a failed commit with exit 8 without writing the row 407ms
     ✓ a failed commit leaves no row staged in the index 432ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 575ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 534ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 402ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 421ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 554ms
   ✓ bkit steps finish (16)
     ✓ --commit=auto never stages a copied-in worktree.copy file 341ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 420ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 370ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 382ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 576ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 368ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 365ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 550ms
     ✓ writeStepRow refuses when a recorded path changed 626ms
     ✓ writeStepRow appends its commit sha to the record 473ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 738ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 419ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 346ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 667ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 458ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 386ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 630ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ does not count an artifact the run found committed when it started 368ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 364ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 623ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (146 tests) 25383ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1013ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 375ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 511ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 421ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 428ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 489ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 346ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 417ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 323ms
     ✓ PASS is 0 failures with or without reports 382ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 329ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 384ms
     ✓ a log under the outbox is named main-checkout relative in the record 435ms
     ✓ a log small enough is copied whole: not clamped, raw null 404ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 549ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 409ms
     ✓ numbers runs within the workflow's active run and per step 657ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 348ms
     ✓ a planned test that passes is a vacuous gap, exit 1 588ms
     ✓ a planned test absent from a loaded report is a missing gap 345ms
     ✓ a file that fails to load is a red of kind red-not-loaded 383ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 484ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 507ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 372ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 653ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 910ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 437ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 590ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 480ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 609ms
     ✓ green: a passed-accepted test is already landed, not a gap 379ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 446ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 386ms
     ✓ green: --group audits only that group's tasks 511ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 461ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 477ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 383ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 490ms
     ✓ green: lists each gap kind, with the runner output 372ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 737ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 26704ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 15381ms
     ✓ sync has nothing left to rewrite 9682ms
     ✓ every clause reaches the cut-off of one surface it applies to 1107ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 30598ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 760ms
     ✓ runs code.ts through its declared gate in the built checkout 829ms
     ✓ runs code.ts through its declared gate in the built checkout 911ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 700ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 777ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 769ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 418ms
     ✓ runs the full gate for replayed debug code 756ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 955ms
     ✓ installs local dependencies against the built target tree 1020ms
     ✓ runs the configured frozen install even without root dependencies 886ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 885ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1114ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1138ms
     ✓ never pushes local dev commits missing from origin/dev 1052ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1834ms
     ✓ dev moved before every push: exhausted, nothing landed 2703ms
     ✓ any other refusal is returned, not retried 1078ms
     ✓ pushToDev replays a commit range onto origin/dev 1221ms
     ✓ a replay retries on the new dev when dev moved 1922ms
     ✓ pushToDev log line names what it lands 1106ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1095ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1138ms
     ✓ a push that fails without a server answer is returned once, never retried 944ms
     ✓ a failed fetch is returned before anything is built 311ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1463ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1215ms
     ✓ lands from a clone whose fetch refspec omits dev 1169ms
     ✓ build throwing stops the landing and removes the throwaway checkout 414ms
[feat/test 529a22f] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 13915ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 1574ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1508ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1666ms
     ✓ does not fall back through a malformed later success receipt 897ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 549ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 568ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 951ms
     ✓ requires proof even when the pushed increment changes no files 574ms
     ✓ ignores malformed receipts 616ms
     ✓ does not record a mutated tree 314ms
     ✓ does not record a committed tree 313ms
     ✓ records no proof for a failed gate or lighter gate 540ms
     ✓ requires integration proof when integration is declared 667ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1078ms
     ✓ invalidates proof when the gate definition changes 502ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 8739ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 558ms
     ✓ follows summary cursors even when the first page is shorter than the limit 317ms
     ✓ reports a failed first page as unavailable 341ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 430ms
     ✓ follows summary cursors even when the first page is shorter than the limit 421ms
     ✓ reports excluded intervals as unread even when pagination finishes 359ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 688ms
     ✓ reports an unread remainder at the page cap 620ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 670ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 384ms
     ✓ rejects missing summaries instead of treating them as empty results 594ms
     ✓ reports a failed first page as unavailable 571ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 613ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 12080ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 8202ms
     ✓ every fence parses under zsh -n 3820ms
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92288) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 12317ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 4574ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 6850ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (190 tests) 38942ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1069ms
   ✓ preserves the requested event for selected-workflow verification 668ms
   ✓ requires selected other-workflow success at the exact pushed head 1213ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 1076ms
     ✓ filters branch and PR discovery by configured workflow and exact head 619ms
     ✓ freezes explicit workflow run attempt and all failed job pages 632ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 980ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1280ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 558ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 324ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 649ms
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 399ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 334ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 361ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 547ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 659ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1078ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 312ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 516ms
     ✓ a failed re-trigger push names the cause in the log 544ms
     ✓ a failed re-trigger push leaves no orphan commit behind 556ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 926ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 567ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 358ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 496ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 477ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 543ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 550ms
     ✓ CLI: verdict JSON, body scan, exit codes 491ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 350ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 789ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1581ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1476ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1527ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 350ms
     ✓ re-trigger on dev only uses the record of its own FID 414ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 458ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 391ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 343ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 403ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 387ms
     ✓ --file and --step go together 304ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 21170ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1289ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 555ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 344ms
     ✓ rejects marker preserving external edits 431ms
     ✓ returns owned comment identity and stable representation evidence 336ms
   ✓ github client (8)
     ✓ gh exit 1 (error connecting to api.github.com) -> network 347ms
     ✓ fetches the issue and its comments as GitHub returns them 375ms
     ✓ github fetch marks a closed issue terminal and an open one not 350ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 337ms
     ✓ caches exact engine source with available progress identity 847ms
     ✓ keeps original body identity separate from time and changed output 696ms
     ✓ reuses matching invocation state without adopting foreign ownership 486ms
     ✓ invalidates missing corrupt and unsupported progress cache 1021ms
     ✓ contains cache read and write failures as standalone degradation 533ms
     ✓ uses legacy receipts and contains receipt failures 641ms
     ✓ records an engine-action row and skips the same key + body on a re-run 567ms
     ✓ a recent identical comment counts as done (the final close comment) 511ms
     ✓ a failed post reports done false with the reason and never leaks a token 346ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 601ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 638ms
     ✓ a different marker hash posts 565ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 335ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 15731ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 611ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 635ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 610ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 523ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1049ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ from a worktree, still names the main checkout and its outbox 340ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 469ms
   ✓ bkit runtime row (6)
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 330ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 12837ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 382ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1187ms
     ✓ a refused dev push is logged, never fails the close 1341ms
     ✓ an unreachable remote is logged, never fails the close 455ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 15782ms
   ✓ bkit worktrees setup — debug (5)
> [bkit] TRUNCATED HERE — 64 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 3314ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1312ms
     ✓ runGit names ENOBUFS when output passes the limit 629ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 596ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 522ms
     ✓ counts files committed since --base 370ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 307ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 354ms
     ✓ runs the --fallback gate even when no file changed, as it did before 398ms
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
> [bkit] TRUNCATED HERE — 972 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 131 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 181ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 164ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 134ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 135ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 96ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 216ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 204ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 109ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 124ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 91ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 141ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 99ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 95ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-bTGT9f/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 83ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 55ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 56ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 67ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 96ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 88ms
(node:72846) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:72846) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:72846) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:72846) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 44ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-Zq8Jhb/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 70ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 97ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 49ms
(node:73253) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:73253) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 75ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 52ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 51ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 43ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 43ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 50ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 52ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 54ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 52ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 53ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 29ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 49ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 44ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 58ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 37ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 45ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 33ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 24ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 43ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 20ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 18ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 26ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 22ms
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

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 23ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 29ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 23ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 19ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 20ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 24ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794234790211.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794234790214.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794234790215.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 14ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794234790222.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 19ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 17ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 12ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 40ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 17ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 12ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 11ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 16ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 6ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 13ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 6ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 4ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 4ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 3ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (8 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (156 tests) 69729ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 623ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 354ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 318ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 345ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 379ms
       ✓ counts subagents of an earlier chat the run's session rows name 362ms
       ✓ records no context block, and still closes, outside a Claude Code session 340ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 443ms
     ✓ records ending held and publish false on the workflow-done row 440ms
     ✓ defaults the close row to ending done 464ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 437ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 424ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 474ms
     ✓ always writes the telemetry, whatever the runtime 362ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 346ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 371ms
     ✓ an unwritable stats path is logged and never fails the close 356ms
     ✓ appends the completeness row before the workflow-done row 411ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 432ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 390ms
     ✓ writes one completeness row per close 639ms
     ✓ leaves out the previous run's rows that share a second with this run's start 423ms
     ✓ still closes when the completeness check throws 366ms
     ✓ still closes when the completeness row write throws 319ms
     ✓ ship: run.pr, size of the squash commit, and coverage 420ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 626ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 395ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 367ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 568ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 526ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 587ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 497ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 514ms
     ✓ --record-step writes the close step's row before workflow-done 347ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 414ms
     ✓ --number without --outbox is a usage error 412ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 600ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 601ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 633ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 633ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 454ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1364ms
     ✓ --flush with nothing to record commits and pushes nothing 733ms
     ✓ --flush carries the named worktree's logs into the dev commit 1306ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1504ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1344ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1507ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1219ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1469ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1294ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1623ms
     ✓ --push on dev never carries a row whose references name another feature 1362ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1394ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2640ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1676ms
     ✓ --push commits in the named worktree, not the checkout it runs from 759ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1874ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1534ms
     ✓ a close that landed releases the lock 1797ms
     ✓ removes the worktree before it releases the lock 1577ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2728ms
       ✓ closePr refuses when the PR base is unknown 2205ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1650ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 360ms
     ✓ names the branch, not the remote-tracking ref, in each URL 309ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 319ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 743ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 434ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1095ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 416ms
     ✓ record is present after workflows close and before the push 404ms
     ✓ failed handover from dev removes the record and keeps recorded paths 750ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 115066ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 307ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 381ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 476ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 335ms
     ✓ a refused --continue carries git's own reason 392ms
     ✓ refuses a code conflict and aborts the rebase on the spot 322ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 655ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 312ms
     ✓ produces byte-identical output to merge=union 718ms
     ✓ restores a trailing newline so the next append starts on its own line 408ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 357ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 604ms
     ✓ refuses a union that leaves a line which is not JSON 356ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 486ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 705ms
     ✓ refuses a lockfile whose regenerate command fails 692ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 671ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 580ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 702ms
     ✓ refuses and aborts when both sides changed the hand-written region 424ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 495ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 557ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 769ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 420ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 519ms
     ✓ refuses and aborts when a side deleted the install record 350ms
     ✓ refuses a conflicted doc the repo's script does not list 336ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 370ms
     ✓ removes a stale sentinel when the rebase succeeds 479ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 636ms
     ✓ resolves a conflict in each of two replayed commits across rounds 554ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) when the base is unreachable in this clone 330ms
       ✓ skips (12) when nothing landed since the base 321ms
       ✓ runs (0) with the landed path count once dev moved 602ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 311ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 691ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 413ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 538ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 785ms
     ✓ runs exactly one git push 821ms
     ✓ --set-upstream records the upstream 517ms
     ✓ refuses with no branch checked out 401ms
     ✓ --mode=dev refuses a feature checkout 369ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 956ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1391ms
     ✓ --require-ci pushes as-is when dev has not moved 600ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 994ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1473ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 368ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 518ms
     ✓ --mode=abort pushes when the branch has no open PR 670ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 515ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 351ms
     ✓ --open-pr carries the MCP answer and skips gh 462ms
     ✓ --mode=abort on dev pushes plainly without probing 368ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1263ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 678ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 777ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2425ms
     ✓ skip-ci HEAD on the replay is refused 559ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1641ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2181ms
     ✓ a level local dev is a plain push, recording nothing extra 850ms
     ✓ a record with no commits pushes nothing 555ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 400ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 964ms
     ✓ a rewritten branch is refused, never forced 589ms
     ✓ refuses dev and main with exit 21 and pushes nothing 394ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 910ms
     ✓ refuses a detached HEAD (exit 5) 394ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 864ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 798ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 858ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1034ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 419ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 942ms
     ✓ an up-to-date branch is a no-op 628ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 969ms
     ✓ a fetch that fails exits 10 358ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 454ms
     ✓ scan-diff still reports a new skip when its test … 577ms
     ✓ scan-diff reports a skip moved onto a different t… 563ms
     ✓ scan-diff does not cancel a skip moved between am… 534ms
     ✓ scan-diff does not spend an unchanged duplicate t… 531ms
     ✓ scan-diff recognizes a renamed test file 517ms
     ✓ scan-diff recognizes a suite moved into a differe… 536ms
     ✓ scan-diff does not let unrelated additions hide a… 521ms
     ✓ scan-diff attributes deletion to its old test ins… 522ms
     ✓ scan-diff consumes each moved assertion once and … 544ms
     ✓ scan-diff does not match identical assertions fro… 570ms
     ✓ scan-diff does not match the same leaf test name … 545ms
     ✓ scan-diff does not match a same-named test with d… 550ms
     ✓ scan-diff does not match a same-named test with c… 629ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 523ms
     ✓ --paths with no match exits 1 607ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 457ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 820ms
     ✓ --marker reads a diff over 1 MiB 609ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 809ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 632ms
     ✓ scan-diff finds an added skip 424ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 531ms
     ✓ a title that already carries the marker is left alone 492ms
     ✓ with no open PR: pushes the marker commit and edits no title 472ms
     ✓ a re-run is deduped: no second marker commit 545ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 609ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 341ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 339ms
     ✓ --merge-docs merges dev when docs/ is behind 415ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 394ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 556ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 568ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 472ms
     ✓ --merge-docs skips an empty bkit:generate script 423ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 359ms
     ✓ --merge-docs never merges on dev itself 320ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 465ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 478ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 438ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 461ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 594ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 644ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 704ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 628ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 596ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 750ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 536ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 644ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 425ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 302ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 385ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 573ms
     ✓ a failed install stops ship (16) 512ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 398ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 385ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 919ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 919ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 915ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 927ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1934ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2326ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 357ms
     ✓ local: names unpushed dev as the cause when the branch carries it 411ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 429ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1156ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1129ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 879ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 861ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 979ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 907ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 625ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1133ms
     ✓ land removes the worktree when only the copied .env is untracked 961ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 858ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 895ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1510ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 915ms
     ✓ landPr refuses a main-based PR without retrying 495ms
     ✓ landPr refuses when the PR base is unknown 512ms
     ✓ PR not open (closed): stops (17) at once, no retry 651ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 372ms
     ✓ --attempt names the merge round in a fix commit 342ms
     ✓ commits a rewritten and a deleted tracked file 348ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 324ms

 Test Files  175 passed (175)
      Tests  7398 passed | 2 skipped (7400)
   Start at  00:32:05
   Duration  115.74s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/891-build-gate-stuck/build-group-gate-3-2.log.reports/vitest-65534.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.36 |    83.08 |   94.49 |   90.73 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.14 |    86.65 |   95.19 |   95.06 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.45 |    71.42 |     100 |   97.19 | ...00,320,417-418 
  managed.ts       |   82.92 |    89.39 |   58.33 |   83.87 | 216-237           
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
 engine/commands   |   89.65 |    84.31 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.89 |   97.05 |   97.28 | ...51,487,539-542 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.59 |    45.02 |   58.75 |   47.98 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   91.55 |     84.2 |   95.36 |   93.03 |                   
  branches.ts      |   90.41 |    83.62 |   98.22 |   92.29 | ...3028,3053,3196 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.57 |    96.19 |     100 |   98.93 | 240,620           
  decisions.ts     |   94.77 |    83.79 |   97.87 |   97.02 | ...52,357,434,599 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.22 |    86.44 |   96.29 |   95.36 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.57 |    84.15 |    99.1 |   92.67 | ...2403,2435-2439 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    89.9 |    83.04 |   90.82 |    91.1 | ...1963,1968,1970 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   26.14 |    28.18 |   21.42 |   23.77 | 112-121,147-283   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |    96.8 |       90 |   96.51 |   98.18 | ...2224,2320-2322 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1765,1939,2671 
  worktrees.ts     |   61.38 |    59.06 |   67.85 |   62.53 | ...1128,1131-1132 
 engine/install    |   93.11 |    84.57 |   94.15 |   95.87 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
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
 engine/shared     |   99.44 |    97.23 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.93 |    85.49 |   95.47 |   90.54 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1718-1800,1805 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.36% ( 19048/21315 )
Branches     : 83.08% ( 14300/17212 )
Functions    : 94.49% ( 3072/3251 )
Lines        : 90.73% ( 16696/18401 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 446 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 197 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 199 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 192 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 190 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 191 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 70 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 225 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 188 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 195 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 203 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 196 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 210 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 265 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 816 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 479 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 14 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 17 ms
ok 19 stub: the response selector is cleared before running its body # in 14 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 18 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 14 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 45 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 581 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 337 ms
ok 30 refresh drops a file deleted in the index from the build # in 309 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 389 ms
ok 32 a key removed from the env file is unset on the next run # in 163 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 143 ms
ok 34 non-BKIT_ keys are skipped # in 140 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 147 ms
ok 36 a failed unsetenv is retried on the next run # in 161 ms
ok 37 logs key names only, never values # in 135 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 240 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 8 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (86.796709ms)
✔ shell cancellation waits for SIGTERM cleanup (136.377834ms)
✔ direct cancellation waits for SIGINT cleanup (106.356667ms)
✔ shell cancellation waits for SIGINT cleanup (138.567708ms)
✔ direct cancellation waits for SIGHUP cleanup (88.093458ms)
✔ shell cancellation waits for SIGHUP cleanup (138.55575ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (378.579958ms)
✔ shell cancellation follows a worker orphaned by a nested shell (227.339459ms)
✔ direct cancellation preserves a nested machine-lock owner (397.137542ms)
✔ shell cancellation preserves a nested machine-lock owner (432.622ms)
✔ nested shell cancellation preserves a nested machine-lock owner (430.809541ms)
✔ a hard process-group timeout reaches a shell command during cleanup (68.586125ms)
✔ ships a command-scoped sleep prevention wrapper (0.07025ms)
✔ preserves arguments, output and nonzero exit status (42.45625ms)
✔ runs an entire shell chain and retains its failure (28.276375ms)
✔ reports a missing command as 127 (23.594834ms)
✔ requires a command (22.361166ms)
✔ non-macOS platform selection runs commands without sleep prevention (38.979833ms)
✔ hard timeout escalation reaches a command that ignores TERM (139.934667ms)
✔ forwards POSIX cancellation to the command and releases the assertion (43.634333ms)
✔ holds a real macOS assertion only while the command runs (58.012458ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3056.108333
> [bkit] TRUNCATED — kept 1619 of 3082 lines (115 KB of 239 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
