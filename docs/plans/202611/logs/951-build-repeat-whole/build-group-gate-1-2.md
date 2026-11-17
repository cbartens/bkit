
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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
 525:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 647:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 730:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 633:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 872:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1053:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1163:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1255:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1497:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1557:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> bkit ci slop

[bkit-ci] base 5cf3981e367bd9a382ee3bcba6e67da623d7953f (5cf3981e367bd9a382ee3bcba6e67da623d7953f) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 5cf3981e367bd9a382ee3bcba6e67da623d7953f
base: 5cf3981e367bd9a382ee3bcba6e67da623d7953f
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 1.5 on 10 cores: unit limits 5250ms per test, 10500ms per hook (x1.05)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
      Coverage enabled with v8

 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 143ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (108 tests) 26143ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 14112ms
     ✓ every prompt, workflow and utility agent has the three header blocks 311ms
     ✓ sync has nothing left to rewrite 10216ms
     ✓ every clause reaches the cut-off of one surface it applies to 1110ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 26832ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 438ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1107ms
     ✓ always writes the marker, even with no plan 398ms
     ✓ writes the linear marker shape, taking the tracker from package.json 639ms
     ✓ writes the jira marker shape, taking the tracker from package.json 331ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1285ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 443ms
     ✓ retries a failed create once, and exits 5 when it fails twice 494ms
     ✓ exits 5 when the open-PR probe errors 766ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 603ms
     ✓ prs open still opens against any other base 846ms
     ✓ exits 6 when the created PR's base is not --base 462ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 1405ms
     ✓ refuses merged entry when current feature evidence cannot be read 730ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 494ms
   ✓ bkit prs probe (7)
     ✓ exits 1 with found=false when there is none 361ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 369ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 379ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge with a new dev conflict as integration 441ms
     ✓ returns an explicit terminal reason for other merge refusals 544ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 321ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 464ms
     ✓ runs no merge when the PR is already MERGED 313ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 335ms
   ✓ bkit prs update-branch (5)
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 505ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 372ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ updates when dev's branch protection requires status checks 342ms
     ✓ updates when the repo cannot be resolved 561ms
   ✓ bkit prs checks (7)
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 565ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 544ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 540ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 351ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 26991ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 787ms
     ✓ names each net-new and worsened finding in the log and the JSON 840ms
     ✓ fails on a net score rise with no net count change 511ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 646ms
     ✓ treats a net score at or below 0.001 as float noise 1391ms
     ✓ passes when the change only resolves findings 781ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 437ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 532ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 666ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1119ms
     ✓ exits 4 on a dropped net field instead of silently passing 461ms
     ✓ exits 4 on no summary instead of silently passing 590ms
     ✓ exits 4 on output that is not JSON instead of silently passing 596ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 720ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 589ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 593ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 589ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 584ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1100ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 628ms
     ✓ explicit globs can select ignored prose and nested checkout files 364ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 463ms
     ✓ fails (exit 1) when vale reports alerts 371ms
     ✓ exits 6 on a vale runtime error 396ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 473ms
     ✓ fails when vale sync cannot restore the required styles 353ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 433ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 446ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 458ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 303ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 303ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 307ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 364ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 372ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 26999ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 1014ms
     ✓ a failed commit leaves no row staged in the index 765ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 699ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 644ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 815ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 456ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 809ms
   ✓ bkit steps finish (16)
     ✓ --commit=auto never stages a copied-in worktree.copy file 324ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 431ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 354ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 389ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 628ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 443ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 360ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 543ms
     ✓ writeStepRow refuses when a recorded path changed 640ms
     ✓ writeStepRow appends its commit sha to the record 569ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1130ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 414ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 398ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 409ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 658ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 418ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 374ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 631ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 606ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 28118ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 936ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 435ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 623ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 338ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 859ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 753ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 468ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 391ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 381ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 712ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 459ms
     ✓ PASS is 0 failures with or without reports 842ms
     ✓ clears a previous attempt's reports before the gate runs 734ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 465ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 412ms
     ✓ a log under the outbox is named main-checkout relative in the record 358ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 329ms
     ✓ numbers runs within the workflow's active run and per step 671ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 519ms
     ✓ a planned test that passes is a vacuous gap, exit 1 327ms
     ✓ a file that fails to load is a red of kind red-not-loaded 461ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 406ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 504ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 400ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 477ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 707ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 747ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 654ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 459ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 666ms
     ✓ green: a passed-accepted test is already landed, not a gap 366ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 452ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 384ms
     ✓ green: --group audits only that group's tasks 422ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 735ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 705ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 377ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 477ms
     ✓ green: lists each gap kind, with the runner output 395ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 775ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 32084ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 753ms
     ✓ runs code.ts through its declared gate in the built checkout 819ms
     ✓ runs code.ts through its declared gate in the built checkout 798ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 741ms
     ✓ runs an audit template's project-section change through bkit:gate:min 744ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 628ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 764ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 745ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 388ms
     ✓ runs the full gate for replayed debug code 706ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 792ms
     ✓ installs local dependencies against the built target tree 925ms
     ✓ runs the configured frozen install even without root dependencies 886ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 949ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1025ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1098ms
     ✓ never pushes local dev commits missing from origin/dev 1073ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1939ms
     ✓ dev moved before every push: exhausted, nothing landed 2916ms
     ✓ any other refusal is returned, not retried 1371ms
     ✓ pushToDev replays a commit range onto origin/dev 1169ms
     ✓ a replay retries on the new dev when dev moved 1872ms
     ✓ pushToDev log line names what it lands 1029ms
     ✓ runs no git hooks in the throwaway checkout, and says so 949ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1080ms
     ✓ a push that fails without a server answer is returned once, never retried 974ms
     ✓ a failed fetch is returned before anything is built 337ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1539ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1267ms
     ✓ lands from a clone whose fetch refspec omits dev 1315ms
     ✓ build throwing stops the landing and removes the throwaway checkout 484ms
[feat/test 302a1e1] gate
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 15760ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 9708ms
     ✓ every fence parses under zsh -n 5956ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 17719ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 1507ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1500ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1796ms
     ✓ does not fall back through a malformed later success receipt 983ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 649ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 625ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1165ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1233ms
     ✓ requires proof even when the pushed increment changes no files 671ms
     ✓ ignores malformed receipts 709ms
     ✓ does not record a tracked tree 354ms
     ✓ does not record a untracked tree 350ms
     ✓ does not record a mutated tree 436ms
     ✓ does not record a committed tree 492ms
     ✓ records no proof for a failed gate or lighter gate 776ms
     ✓ requires integration proof when integration is declared 972ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1476ms
     ✓ invalidates proof when the gate definition changes 716ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 383ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 19453ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1349ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 563ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 634ms
     ✓ seals unavailable or unstable representation evidence 314ms
     ✓ returns owned comment identity and stable representation evidence 310ms
   ✓ github client (8)
     ✓ github fetch marks a closed issue terminal and an open one not 385ms
   ✓ postCommentOnce (11)
     ✓ caches exact engine source with available progress identity 472ms
     ✓ keeps original body identity separate from time and changed output 317ms
     ✓ reuses matching invocation state without adopting foreign ownership 384ms
     ✓ invalidates missing corrupt and unsupported progress cache 696ms
     ✓ contains cache read and write failures as standalone degradation 348ms
     ✓ uses legacy receipts and contains receipt failures 324ms
     ✓ records an engine-action row and skips the same key + body on a re-run 347ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 343ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 351ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 629ms
     ✓ github: no block, no blockers and no further reads 497ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 442ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 15188ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 803ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 20348ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 305ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 614ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 361ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 308ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 339ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 326ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 301ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 442ms
     ✓ --path records its commit on the run's record, like every other commit mode 433ms
     ✓ a recorded ledger commits only the rows the run appended 622ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 773ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 630ms
     ✓ commitBookkeeping refuses when a recorded path changed 352ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 450ms
     ✓ under --mode=commit counts the squashed paths as something to commit 472ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 400ms
     ✓ another FID's plan file in the range: exit 7 309ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 537ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 314ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 382ms
   ✓ bkit ledgers append --operation (3)
     ✓ keeps ledger operation intents and receipts out of committed book paths 374ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 26844ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 707ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 667ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 574ms
     ✓ a new run of the same FID rewrites startSha 970ms
     ✓ a resume of the same FID reuses the record 966ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 617ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 668ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 747ms
     ✓ a stale record without a lock is replaced 809ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 678ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2404ms
     ✓ names inherited commits and ship recovery in the refusal 578ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 751ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 717ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ ship resumes without fetching or rebasing, and copies the configured list 306ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 323ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 327ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 739ms
       ✓ preserves staged-only mode during landed cleanup 731ms
       ✓ preserves staged-only type during landed cleanup 763ms
       ✓ preserves staged-only deletion during landed cleanup 686ms
       ✓ removes landed staged content when both index and working contents are on dev 707ms
       ✓ deletes the proved local and remote branch at their landed tips 878ms
       ✓ retains the remote branch when origin refuses its conditional deletion 1552ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 306ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 314ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 505ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 55293ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1624ms
   ✓ preserves the requested event for selected-workflow verification 835ms
   ✓ requires selected other-workflow success at the exact pushed head 1224ms
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 1570ms
     ✓ saves the failed job count without the capstone job 486ms
     ✓ counts the capstone job when it is the only failed job 927ms
     ✓ saves no failed job count when no job failed 583ms
     ✓ filters branch and PR discovery by configured workflow and exact head 994ms
     ✓ freezes explicit workflow run attempt and all failed job pages 677ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1062ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1433ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 918ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1177ms
     ✓ checks the named repository base and fails closed on missing evidence 639ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 540ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 617ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 348ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 367ms
       ✓ a validated sha that is not an ancestor refuses (17) 312ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 358ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 637ms
     ✓ a failed re-trigger push names the cause in the log 804ms
     ✓ a failed re-trigger push leaves no orphan commit behind 674ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1077ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 608ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 338ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 568ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 611ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 662ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 687ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1826ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1985ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 518ms
     ✓ re-trigger on dev only uses the record of its own FID 669ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 531ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1508ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 321ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 363ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 480ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 436ms
     ✓ --file and --step go together 335ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 384ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1194ms
     ✓ a refused dev push is logged, never fails the close 1832ms
     ✓ an unreachable remote is logged, never fails the close 451ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 6942ms
   ✓ bkit issues labels --write (5)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 521ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 319ms
     ✓ follows summary cursors even when the first page is shorter than the limit 388ms
     ✓ reports excluded intervals as unread even when pagination finishes 328ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 672ms
     ✓ reports an unread remainder at the page cap 617ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 464ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 364ms
     ✓ rejects missing summaries instead of treating them as empty results 363ms
     ✓ reports a failed first page as unavailable 448ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 836ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 709ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 802ms
     ✓ follows summary cursors even when the first page is shorter than the limit 687ms
     ✓ reports excluded intervals as unread even when pagination finishes 769ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 867ms
     ✓ reports an unread remainder at the page cap 852ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 861ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 824ms
     ✓ rejects missing summaries instead of treating them as empty results 1232ms
     ✓ reports a failed first page as unavailable 781ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 1306ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 7003ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1176ms
     ✓ counts files committed since --base 981ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1126ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1042ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1476ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1167ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 783ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1326ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 532ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1208ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 536ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 676ms
     ✓ --file into a missing directory is refused, not created 581ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 4244ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1326ms
     ✓ runGit names ENOBUFS when output passes the limit 776ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 764ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 646ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 628ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 817ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 470ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 890ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1177ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 614ms
     ✓ an unpinned repo reports nulls and asks no registry 595ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 553ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 634ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 472ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 425ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1111ms
     ✓ resolves config from the repo root when run from a subdirectory 738ms
     ✓ exits 6 when the PUT fails 1024ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 586ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 445ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 332ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 333ms
     ✓ exits 6 when the api answer is not JSON 362ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (46 tests) 2203ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 668ms
     ✓ passes every rule on a clean head 309ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 329ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (28 tests) 1176ms
   ✓ tipsBase (4)
> [bkit] TRUNCATED HERE — 661 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 360 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (87 tests) 5531ms
   ✓ bkit status route holistic cleanBase (5)
     ✓ last clean holistic base is the newest zero-failure row 341ms
     ✓ a holistic row with gaps does not move the base 346ms
     ✓ holistic base falls back to origin/dev with no clean row 340ms
> [bkit] TRUNCATED HERE — 220 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.

No context data. A close records it from the Claude Code session that ran the workflow.

## Direct chats (`utility`)

Rows a direct chat wrote outside any workflow run (`by.workflow` `utility`). They are never added to the workflow figures.

No outcome or compliance rows from direct chats.


stderr | .bkit/core/engine/commands/stats.test.ts > bkit stats > writes .bkit/stats.md, and the same ledgers give the same file
[bkit-stats] wrote .bkit/stats.md
[bkit-stats] wrote .bkit/stats.md

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 50ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > never writes Codex's `.agents/skills/`
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-vikb94/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 979ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 85ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tasks.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-tests.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[test] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
[test] write: .agents/plugins/bkit/agents/bkit-design-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-design-organise.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-design-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-design-spike.md
[test] write: .agents/plugins/bkit/agents/bkit-design-update.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-1.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-review-2.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-scope-check.md
[test] write: .agents/plugins/bkit/agents/bkit-plan-update.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
[test] write: .agents/plugins/bkit/agents/bkit-ship-update-docs.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-decisions.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md
[test] antigravity: .agents/plugins/bkit/plugin.json
[test] antigravity: GEMINI.md
[test] antigravity: .agents/plugins/bkit/hooks.json
[test] antigravity: .agents/plugins/bkit/hooks/bkit-gateguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-readguard.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-rules.cjs
[test] antigravity: .agents/plugins/bkit/hooks/bkit-guardrails.cjs

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 424ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 468ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 115ms
 ✓ .bkit/core/engine/render/trackers.test.ts (107 tests) 320ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 79ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 43ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 94ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 27ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1053ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1009ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 74ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 33ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 287ms
(node:58522) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:58522) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:58522) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:58522) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 68ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 333ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 128ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 67ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 74ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 96ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 70ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 2600ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 404ms
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 300ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 368ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 429ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 360ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 47ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 127ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 31ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 10ms
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

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 46ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 67ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 36ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794722901538.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794722901542.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794722901544.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794722901556.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (34 tests | 2 skipped) 128ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 26ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 24ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 80ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 26ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 117ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 31ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1092ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1446ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 309ms
     ✓ limits execSync and execFileSync the same way 607ms
     ✓ stops a child that ignores SIGTERM at the remaining time 305ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests) 5896ms
   ✓ GitHub selected-evidence context blocks (4)
     ✓ fetches pinned attempts without branch discovery and filters unpinned discovery 2207ms
     ✓ emits complete receipts only after all selected job logs succeed 2221ms
     ✓ ends pinned diffs at selected commits with ancestral same-workflow baselines 1464ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 6704ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 6697ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 95049ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 584ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 349ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 408ms
       ✓ counts subagents of an earlier chat the run's session rows name 377ms
       ✓ records no context block, and still closes, outside a Claude Code session 422ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 460ms
     ✓ records ending held and publish false on the workflow-done row 382ms
     ✓ defaults the close row to ending done 416ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 498ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 437ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 431ms
     ✓ always writes the telemetry, whatever the runtime 409ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 340ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 406ms
     ✓ an unwritable stats path is logged and never fails the close 365ms
     ✓ appends the completeness row before the workflow-done row 517ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 468ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 412ms
     ✓ writes one completeness row per close 741ms
     ✓ leaves out the previous run's rows that share a second with this run's start 398ms
     ✓ still closes when the completeness check throws 457ms
     ✓ still closes when the completeness row write throws 445ms
     ✓ ship: run.pr, size of the squash commit, and coverage 497ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 723ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 472ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 365ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 517ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 540ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 615ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 488ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 527ms
     ✓ --record-step writes the close step's row before workflow-done 353ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 398ms
     ✓ --number without --outbox is a usage error 390ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 574ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 522ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 563ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 598ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 471ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1459ms
     ✓ --flush with nothing to record commits and pushes nothing 789ms
     ✓ --flush carries the named worktree's logs into the dev commit 1372ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1582ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1683ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2004ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1641ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1967ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1739ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1875ms
     ✓ --push on dev never carries a row whose references name another feature 1711ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1672ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2990ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2237ms
     ✓ --push commits in the named worktree, not the checkout it runs from 797ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1743ms
     ✓ preserves unlanded file deletions and ledger additions on close 3361ms
     ✓ preserves dirty work and uncertain branch evidence during close 3207ms
     ✓ preserves a local feature ref changed after its cleanup proof 3781ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2589ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2265ms
     ✓ a close that landed releases the lock 3338ms
     ✓ removes the worktree before it releases the lock 3662ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4985ms
       ✓ closePr refuses when the PR base is unknown 3760ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1239ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 341ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 583ms
     ✓ a second run's record does not let this FID's close commit 327ms
     ✓ record is present after workflows close and before the push 609ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1134ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 455ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 356ms
     ✓ puts each --line after the summary, in flag order 346ms
     ✓ --summary prints the file and keeps a copy in --outbox 349ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 348ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 158968ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 376ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 440ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 325ms
     ✓ a refused --continue carries git's own reason 359ms
     ✓ refuses a code conflict and aborts the rebase on the spot 317ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1334ms
     ✓ produces byte-identical output to merge=union 649ms
     ✓ restores a trailing newline so the next append starts on its own line 437ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 401ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 514ms
     ✓ refuses a union that leaves a line which is not JSON 320ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 437ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1218ms
     ✓ refuses a lockfile whose regenerate command fails 628ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 669ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 669ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 602ms
     ✓ refuses and aborts when both sides changed the hand-written region 389ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 501ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 565ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 727ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 424ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 522ms
     ✓ refuses and aborts when a side deleted the install record 411ms
     ✓ refuses a conflicted doc the repo's script does not list 408ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 406ms
     ✓ removes a stale sentinel when the rebase succeeds 460ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 694ms
     ✓ resolves a conflict in each of two replayed commits across rounds 572ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 317ms
       ✓ skips (12) with no anchor 317ms
       ✓ skips (12) when the base is unreachable in this clone 347ms
       ✓ skips (12) when nothing landed since the base 352ms
       ✓ runs (0) with the landed path count once dev moved 642ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 317ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 629ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 420ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 554ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1009ms
     ✓ runs exactly one git push 961ms
     ✓ --set-upstream records the upstream 496ms
     ✓ refuses with no branch checked out 381ms
     ✓ --mode=dev refuses a feature checkout 316ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 818ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1440ms
     ✓ --require-ci pushes as-is when dev has not moved 634ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1041ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1548ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 399ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 737ms
     ✓ --mode=abort pushes when the branch has no open PR 656ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 549ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 405ms
     ✓ --open-pr carries the MCP answer and skips gh 488ms
     ✓ --mode=abort on dev pushes plainly without probing 498ms
     ✓ rejects an unknown mode 390ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1661ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 907ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1070ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2532ms
     ✓ skip-ci HEAD on the replay is refused 755ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1884ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2394ms
     ✓ a level local dev is a plain push, recording nothing extra 954ms
     ✓ a record with no commits pushes nothing 635ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 482ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 985ms
     ✓ a rewritten branch is refused, never forced 585ms
     ✓ refuses dev and main with exit 21 and pushes nothing 403ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 962ms
     ✓ refuses a detached HEAD (exit 5) 408ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 689ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 748ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 798ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 955ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 395ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 908ms
     ✓ an up-to-date branch is a no-op 533ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 950ms
     ✓ a fetch that fails exits 10 416ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 498ms
     ✓ scan-diff still reports a new skip when its test … 475ms
     ✓ scan-diff reports a skip moved onto a different t… 463ms
     ✓ scan-diff does not cancel a skip moved between am… 477ms
     ✓ scan-diff does not spend an unchanged duplicate t… 493ms
     ✓ scan-diff recognizes a renamed test file 451ms
     ✓ scan-diff recognizes a suite moved into a differe… 414ms
     ✓ scan-diff does not let unrelated additions hide a… 489ms
     ✓ scan-diff attributes deletion to its old test ins… 495ms
     ✓ scan-diff consumes each moved assertion once and … 543ms
     ✓ scan-diff does not match identical assertions fro… 483ms
     ✓ scan-diff does not match the same leaf test name … 532ms
     ✓ scan-diff does not match a same-named test with d… 590ms
     ✓ scan-diff does not match a same-named test with c… 564ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 570ms
     ✓ --paths with no match exits 1 574ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 477ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 919ms
     ✓ --marker reads a diff over 1 MiB 764ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 959ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 893ms
     ✓ scan-diff finds an added skip 965ms
     ✓ scan-diff ignores a skip predating the base 871ms
     ✓ scan-diff reports a disabled test with its line 1074ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 973ms
     ✓ scan-diff ignores a removed comment in a test file 946ms
     ✓ scan-diff ignores an assertion moved within the file 928ms
     ✓ scan-diff still reports a removed assertion 1091ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1046ms
     ✓ scan-diff finds an added pytest mark skip 1087ms
     ✓ scan-diff finds an added unittest skip 1040ms
     ✓ scan-diff finds an added bare skip call 1010ms
     ✓ scan-diff ignores a quoted skip in a documentation file 994ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1095ms
     ✓ scan-diff ignores an assertion whose expectation changed 1001ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 981ms
     ✓ scan-diff reports a deleted test file 665ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 350ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1098ms
     ✓ a title that already carries the marker is left alone 587ms
     ✓ with no open PR: pushes the marker commit and edits no title 607ms
     ✓ a re-run is deduped: no second marker commit 726ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 857ms
     ✓ --title-set skips gh entirely 478ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 944ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1722ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 950ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1950ms
     ✓ continues only the explicitly recorded target through the public merge command 1011ms
     ✓ fetches the unseen feature head before classifying the base 663ms
     ✓ fast forwards the feature before either base path is chosen 1425ms
     ✓ merges divergent feature tips without rebasing either side 874ms
     ✓ continues the feature merge before starting a dev merge 1418ms
     ✓ publishes local code with a CI running head before bookkeeping 1606ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2126ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1382ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 982ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 404ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 403ms
     ✓ --merge-docs merges dev when docs/ is behind 489ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 470ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 663ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 661ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 556ms
     ✓ --merge-docs skips an empty bkit:generate script 496ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 425ms
     ✓ --merge-docs never merges on dev itself 378ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 552ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 556ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 518ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 539ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 692ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 794ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 845ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 734ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 667ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 864ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 654ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 772ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 505ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 355ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 447ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 640ms
     ✓ a failed install stops ship (16) 560ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 438ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 421ms
     ✓ exits 10 when the fetch fails 317ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1150ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1114ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1098ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1101ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2205ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2519ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 425ms
     ✓ local: names unpushed dev as the cause when the branch carries it 619ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 671ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1372ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1219ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 935ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3778ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 842ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 991ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 952ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 670ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1246ms
     ✓ land removes the worktree when only the copied .env is untracked 1025ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 882ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1035ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1653ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1004ms
     ✓ landPr refuses a main-based PR without retrying 530ms
     ✓ landPr refuses when the PR base is unknown 526ms
     ✓ PR not open (closed): stops (17) at once, no retry 700ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 377ms
     ✓ --attempt names the merge round in a fix commit 344ms
     ✓ commits a rewritten and a deleted tracked file 355ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 304ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 324ms

 Test Files  178 passed (178)
      Tests  7733 passed | 2 skipped (7735)
   Start at  16:06:59
   Duration  159.83s (tests 96%, setup 1%, import 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/951-build-repeat-whole/build-group-gate-1-2.log.reports/vitest-10337.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.59 |    82.35 |   94.55 |   90.07 |                   
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
 engine/commands   |    88.6 |    83.24 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.13 |   96.42 |   94.53 | ...20-823,870-885 
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
 ...mands/workflow |   90.15 |    82.98 |   95.33 |   91.68 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.42 |       96 |     100 |   99.08 | 293,704           
  decisions.ts     |   94.61 |    84.22 |   98.07 |   97.31 | ...82,387,464,653 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   94.23 |    73.84 |     100 |   93.75 | 47-48,51          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   94.01 |    88.59 |   96.15 |    95.1 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.08 |    88.35 |     100 |   93.07 | ...1454,1470-1471 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.49 |   92.64 |   83.42 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |    94.8 |    93.13 |     100 |   95.66 | ...04,720,737,878 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |    88.9 |    81.86 |    92.3 |    90.8 | ...2359,2361,2405 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.82 |     66.4 |   86.66 |   88.27 | ...47,364,395,399 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests-jump.ts    |   94.73 |    68.18 |     100 |     100 | 17-25,34-36       
  tests.ts         |   96.84 |    90.03 |   96.59 |   98.21 | ...2262,2358-2360 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.87 |    83.43 |   98.71 |    95.5 | ...1741,1971,2720 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1391,1394-1395 
 engine/install    |   92.05 |    83.16 |   93.95 |   95.17 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.52 |    90.06 |     100 |     100 | ...35,340,346-347 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |   89.14 |    80.57 |    87.5 |   92.96 | ...26-346,370,589 
 engine/ledgers    |   95.44 |    91.86 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.71 |    97.7 |   97.92 | 855,881-887,921   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1849,2007,2368 
 engine/render     |   90.63 |    82.85 |   98.36 |   92.74 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.44 |    97.23 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 269,320           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.88 |    85.41 |   95.85 |   90.67 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.56 |    85.89 |   96.01 |    91.5 | ...1806-1891,1896 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.59% ( 20953/23650 )
Branches     : 82.35% ( 16257/19739 )
Functions    : 94.55% ( 3353/3546 )
Lines        : 90.07% ( 18373/20398 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 498 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 210 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 211 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 251 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 204 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 208 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 69 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 237 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 201 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 206 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 209 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 205 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 208 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 211 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 838 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 530 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 16 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 14 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 30 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 46 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 651 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 351 ms
ok 30 refresh drops a file deleted in the index from the build # in 324 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 404 ms
ok 32 a key removed from the env file is unset on the next run # in 182 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 154 ms
ok 34 non-BKIT_ keys are skipped # in 146 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 153 ms
ok 36 a failed unsetenv is retried on the next run # in 176 ms
ok 37 logs key names only, never values # in 142 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 240 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 10 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/951-build-repeat-whole
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (86.203875ms)
✔ shell cancellation waits for SIGTERM cleanup (133.978416ms)
✔ direct cancellation waits for SIGINT cleanup (90.271458ms)
✔ shell cancellation waits for SIGINT cleanup (136.085416ms)
✔ direct cancellation waits for SIGHUP cleanup (86.188625ms)
✔ shell cancellation waits for SIGHUP cleanup (137.911375ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (392.813958ms)
✔ shell cancellation follows a worker orphaned by a nested shell (202.967541ms)
✔ direct cancellation preserves a nested machine-lock owner (404.876125ms)
✔ shell cancellation preserves a nested machine-lock owner (437.86575ms)
✔ nested shell cancellation preserves a nested machine-lock owner (432.008ms)
✔ a hard process-group timeout reaches a shell command during cleanup (68.566791ms)
✔ ships a command-scoped sleep prevention wrapper (0.074958ms)
✔ preserves arguments, output and nonzero exit status (43.443875ms)
✔ runs an entire shell chain and retains its failure (26.597291ms)
✔ reports a missing command as 127 (24.554834ms)
✔ requires a command (20.790708ms)
✔ non-macOS platform selection runs commands without sleep prevention (36.799958ms)
✔ hard timeout escalation reaches a command that ignores TERM (142.129375ms)
✔ forwards POSIX cancellation to the command and releases the assertion (51.764084ms)
✔ holds a real macOS assertion only while the command runs (58.081625ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3042.242792
> [bkit] TRUNCATED — kept 1664 of 3098 lines (119 KB of 239 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
