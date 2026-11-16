
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 75429, since 20:40:12), last run took 15m52s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 1 min so far) (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 75429, since 20:40:12), last run took 15m52s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 2 min so far) (up to 1200s), 2nd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block (pid 75429, since 20:40:12), last run took 15m52s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 3 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 4 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 5 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 6 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 7 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 8 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 895-one-question-format build-group-gate-2 is waiting for tests (still, 9 min so far) (up to 1200s), 1st in line: in use by bkit tests run bkit:gate:static-unit 914-build-planned-test build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/914-build-planned-test (pid 45153, since 20:55:53), last run took 5m58s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
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
 518:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 640:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 723:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> bkit ci slop

[bkit-ci] base dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 (dd8b4390c4bbba6cc0bffdd59303832b8dc6d826) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
base: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 5.6 on 10 cores: unit limits 7300ms per test, 14600ms per hook (x1.46)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/895-one-question-format
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 63310ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1074ms
     ✓ names each net-new and worsened finding in the log and the JSON 1158ms
     ✓ fails on a net score rise with no net count change 874ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1216ms
     ✓ treats a net score at or below 0.001 as float noise 1089ms
     ✓ passes when the change only resolves findings 990ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 958ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 448ms
     ✓ skips (exit 0) when the base resolves to HEAD 400ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1111ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 564ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 367ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1165ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1033ms
     ✓ exits 4 on a dropped net field instead of silently passing 1000ms
     ✓ exits 4 on no summary instead of silently passing 1473ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1079ms
     ✓ exits 5 when the base worktree cannot be created 574ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1344ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1551ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1733ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1637ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 3045ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2315ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 313ms
     ✓ defaults to every markdown file outside node_modules 365ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1015ms
     ✓ explicit globs can select ignored prose and nested checkout files 605ms
     ✓ fails closed when the git index cannot be read 309ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 533ms
     ✓ fails (exit 1) when vale reports alerts 629ms
     ✓ exits 6 on a vale runtime error 927ms
     ✓ skips with exit 0 when no file matches 343ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1135ms
     ✓ falls back to vale sync when the main worktree has none 729ms
     ✓ fails when vale sync cannot restore the required styles 585ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 693ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 491ms
     ✓ is a usage error when the commit cannot be read 387ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 644ms
     ✓ exits 1 naming the code file, whatever the commit message says 588ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 749ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 553ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1174ms
     ✓ exits 7 when a commit cannot be read 548ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 923ms
     ✓ exits 1 naming the files outside, whatever the commit message says 715ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1588ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 908ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 673ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1327ms
     ✓ a top-level glob in the setting does not reach into folders 611ms
     ✓ a push that changes no files is not proven a min push 673ms
     ✓ exits 7 when a commit or its base cannot be read 708ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 628ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 726ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 835ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 1545ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 1061ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 992ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 958ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 835ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 807ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 792ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 683ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 954ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 1609ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 63191ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1079ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 713ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 891ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 515ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1098ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 523ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 307ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 477ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 604ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 527ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 473ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1433ms
     ✓ PASS is 0 failures with or without reports 1269ms
     ✓ clears a previous attempt's reports before the gate runs 794ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 706ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1102ms
     ✓ a log under the outbox is named main-checkout relative in the record 748ms
     ✓ a log small enough is copied whole: not clamped, raw null 1214ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 499ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1082ms
     ✓ numbers runs within the workflow's active run and per step 837ms
     ✓ without --file no row is written and the output carries row null 417ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 518ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 739ms
     ✓ plan-check matches a Markdown heading symbol 643ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 316ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 329ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 470ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 373ms
     ✓ plan-check refuses a delete with no supersession row 309ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 358ms
     ✓ plan-check refuses a group with 26 planned tests 336ms
     ✓ plan-check follows bkit.workflows.tasks 392ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 328ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1171ms
     ✓ a planned test that passes is a vacuous gap, exit 1 897ms
     ✓ a planned test absent from a loaded report is a missing gap 1080ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1384ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1095ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 433ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1213ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 682ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 756ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 384ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1722ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1258ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1689ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1196ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1526ms
     ✓ green: a passed-accepted test is already landed, not a gap 834ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 858ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 323ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 859ms
     ✓ green: --group audits only that group's tasks 883ms
     ✓ green: --group naming a group with no tasks is refused 347ms
     ✓ green: a code fence never closed is the reason, not missing task markers 349ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1919ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1324ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 930ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1252ms
     ✓ green: lists each gap kind, with the runner output 937ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1858ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1360ms
       ✓ green clears an exception-only task from a human commit 701ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 70337ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 423ms
     ✓ adopts the main checkout even when called from a linked worktree 509ms
     ✓ plan refuses to work in place on dev 323ms
     ✓ build refuses to work in place on dev 308ms
     ✓ ship refuses to work in place on dev 323ms
     ✓ build in place on main is refused 451ms
     ✓ design and plan in place on main are refused 792ms
     ✓ still adopts a cloud session branch whose upstream is main 484ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1813ms
     ✓ may debug in place on dev 670ms
     ✓ adopts in place when the session is already on feat/{fid} 401ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1300ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1106ms
     ✓ a new run of the same FID rewrites startSha 2412ms
     ✓ a resume of the same FID reuses the record 2245ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1666ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1730ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1815ms
     ✓ a stale record without a lock is replaced 2210ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 2964ms
     ✓ refuses inherited unpublished dev commits in every ship mode 6233ms
     ✓ names inherited commits and ship recovery in the refusal 1992ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2434ms
     ✓ ship names a missing feat branch 534ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1544ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 571ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 496ms
     ✓ fails with a fetch error when there is no origin to rebase onto 610ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 415ms
       ✓ checks no disk when there are no cleanup step files 614ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 912ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 728ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 650ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 473ms
     ✓ never commits an entry only the main checkout's copy list names 725ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 392ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 363ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 818ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 453ms
     ✓ tells a caller inside the removed worktree where to cd 596ms
     ✓ fails with its own exit code when git cannot remove a marked path 452ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1752ms
       ✓ preserves staged-only mode during landed cleanup 1678ms
       ✓ preserves staged-only type during landed cleanup 2762ms
       ✓ preserves staged-only deletion during landed cleanup 2088ms
       ✓ removes landed staged content when both index and working contents are on dev 1917ms
       ✓ deletes the proved local and remote branch at their landed tips 2101ms
       ✓ retains the remote branch when origin refuses its conditional deletion 3606ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 921ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 977ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 569ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 303ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1079ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1257ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 77808ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 808ms
     ✓ finishes a CI round only with its own failed job count 792ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 917ms
     ✓ done --group writes group on the row 725ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 909ms
     ✓ carries extra fields, parsed as JSON when they are JSON 518ms
     ✓ reports a failed commit with exit 8 without writing the row 1009ms
     ✓ a failed commit leaves no row staged in the index 1234ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1091ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 962ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1138ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 741ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1434ms
   ✓ bkit steps verdict (10)
     ✓ disallowed artifact exits 3 367ms
     ✓ only reads above the marker 307ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 471ms
     ✓ --ref reads the status file as committed on that ref, not from disk 636ms
     ✓ --ref exits 3 when the ref does not carry the status file 679ms
     ✓ fails on a placeholder left in the artifact 571ms
     ✓ fails when the row's verdict differs from the artifact's 636ms
     ✓ fails when the row does not list the artifact, or carries another attempt 720ms
     ✓ fails on a missing artifact 748ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 1318ms
     ✓ refuses a negative or non-integer attempt (2) 455ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 443ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 335ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ passes attempt 0, and gate --attempt=0 matches it 319ms
     ✓ fails a diagnose row missing its strategy, passes with it 537ms
     ✓ fails a run-tests row missing its scope, and an empty scope 637ms
     ✓ asks nothing of a step that writes none of them 310ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 1024ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 318ms
     ✓ records the header's Strategy on the row 316ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 877ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 740ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 1620ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1325ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 850ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1017ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1539ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1133ms
     ✓ --post needs --number; without --post there is no tracker key 382ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 477ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 573ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1218ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1049ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 445ms
     ✓ --attempt-of checks the row carries the derived counter 638ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1535ms
     ✓ writeStepRow refuses when a recorded path changed 1839ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 863ms
     ✓ writeStepRow appends its commit sha to the record 2106ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2294ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 537ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1317ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1197ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 1109ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 666ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 2619ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1347ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 1351ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 857ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1934ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 588ms
     ✓ does not count an artifact the run found committed when it started 925ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 534ms
     ✓ commits a package.json change outside bkit.workflows 919ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1691ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 346ms
     ✓ renders and verifies the header of every prompt that declares one 970ms
     ✓ reads held audit keys from the linked worktree's own ledger 420ms
     ✓ refuses a result file left from an earlier round 322ms
 ❯ .bkit/core/engine/commands/land.test.ts (45 tests | 1 failed) 94750ms
   ✓ landBackoffMs (2)
     ✓ doubles from the start wait, caps it, and jitters down by at most half 5ms
     ✓ ten tries wait at most three minutes in all 2ms
   ✓ devMoved / devRefused (3)
     ✓ dev moved before or while the push was sent: retry 1ms
     ✓ a server refusal (hook, ruleset, HTTP 403): the PR route 2ms
     ✓ no server answer: neither 1ms
   ✓ devRefRace (2)
     ✓ another fetch moved or holds origin/dev: retry 1ms
     ✓ any other fetch failure, or another ref: not a race 1ms
   ✓ landDir (6)
     ✓ names the throwaway beside the feature worktrees 1ms
     ✓ refuses "../x" as a feature id 2ms
     ✓ refuses "a/b" as a feature id 1ms
     ✓ refuses "" as a feature id 1ms
     ✓ refuses ".hidden" as a feature id 1ms
     ✓ refuses "a..b" as a feature id 2ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2008ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2638ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2069ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 2294ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2621ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1506ms
     ✓ runs the full gate for replayed debug code 3219ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 3621ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ never pushes local dev commits missing from origin/dev 3259ms
     ✓ dev moved: rebuilds on the new dev and pushes again 5174ms
     × dev moved before every push: exhausted, nothing landed 7394ms
     ✓ any other refusal is returned, not retried 3571ms
     ✓ pushToDev replays a commit range onto origin/dev 3486ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 3047ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2691ms
     ✓ a push that fails without a server answer is returned once, never retried 2155ms
     ✓ a failed fetch is returned before anything is built 752ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 4134ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2405ms
     ✓ lands from a clone whose fetch refspec omits dev 3333ms
     ✓ build throwing stops the landing and removes the throwaway checkout 991ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 531ms
     ✓ continues after friction and diagnostic writes fail without recursion 426ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 781ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 4529ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 690ms
     ✓ starts only new source after overflow or missing source 604ms
     ✓ uses exact new comment after a failed eligibility read 394ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 585ms
     ✓ recognizes append success within budget without unnecessary resend 433ms
     ✓ preserves a human correction after lost append recognition and a later report 524ms
     ✓ contains exhausted append and create failures without fabricated success 486ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 582ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 306ms
     ✓ reserves new comment opportunity within total delivery budget 1677ms
     ✓ contains preparation state lock and reconciliation exceptions 320ms
     ✓ attempts independent attention after routine uncertainty 433ms
     ✓ seals an acknowledged segment after a postflight intervening comment 426ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 747ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 517ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 500ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 762ms
     ✓ fetches the issue and its comments as GitHub returns them 551ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1069ms
     ✓ invalidates missing corrupt and unsupported progress cache 1573ms
     ✓ contains cache read and write failures as standalone degradation 732ms
     ✓ uses legacy receipts and contains receipt failures 887ms
     ✓ skips issue-less runs and tracker none 318ms
     ✓ records an engine-action row and skips the same key + body on a re-run 692ms
     ✓ a recent identical comment counts as done (the final close comment) 519ms
     ✓ a failed post reports done false with the reason and never leaks a token 965ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 629ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 564ms
     ✓ a different marker hash posts 606ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 457ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 41497ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 4412ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 4236ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 592ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 545ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 499ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4500ms
     ✓ does not fall back through a malformed later success receipt 2367ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1429ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1232ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 3035ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 3036ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 790ms
     ✓ does not record a committed tree 992ms
     ✓ records no proof for a failed gate or lighter gate 1215ms
     ✓ requires integration proof when integration is declared 2423ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3147ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 556ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 628ms
     ✓ retries a failed create once, and exits 5 when it fails twice 773ms
     ✓ exits 5 when the open-PR probe errors 471ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 715ms
     ✓ prs open still opens against any other base 542ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 528ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 845ms
     ✓ exits 4 when gh errors and 80 when it needs auth 805ms
   ✓ bkit prs scan-body (10)
     ✓ flags [actions skip] in the landed commit body (exit 1) 333ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 352ms
     ✓ passes a token-free body 363ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 356ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 551ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 431ms
     ✓ runs no merge when the PR is already MERGED 438ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 612ms
     ✓ prs merge refuses a PR whose base is main 490ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 626ms
     ✓ prs merge refuses when the PR base is unknown 574ms
     ✓ prs merge reads the base from the one pr view it already makes 496ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 389ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 573ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 479ms
     ✓ never reads dev's required checks without --only-if-required 575ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 425ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 685ms
     ✓ is not green when a check failed, naming it (exit 1) 962ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 567ms
     ✓ is not green on an empty rollup (total 0) 743ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1190ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1107ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 423ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 505ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 398ms
     ✓ staging failure: exit 4 and no commit is created, no false success 511ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 462ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 432ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 462ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 323ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1234ms
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2663ms
     ✓ saves the failed job count without the capstone job 1281ms
     ✓ counts the capstone job when it is the only failed job 1076ms
     ✓ saves no failed job count when no job failed 1189ms
     ✓ counts fallback evidence jobs without the capstone job 447ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 525ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1135ms
     ✓ freezes explicit workflow run attempt and all failed job pages 929ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2625ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2906ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2598ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 4013ms
     ✓ checks the named repository base and fails closed on missing evidence 2171ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1376ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1589ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 351ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 386ms
     ✓ tells an API error (20) from no run (10) 419ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 373ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 370ms
     ✓ --event (5)
       ✓ without --event the newer green pull_request run masks the failed push run 440ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 667ms
       ✓ a run still in progress whose capstone already passed passes 426ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 534ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1132ms
       ✓ a source change past the validated head refuses (17) and names the path 855ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1052ms
       ✓ --validated without --month / --fid is a usage error (2) 679ms
       ✓ a validated sha that is not an ancestor refuses (17) 735ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1085ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1922ms
     ✓ a failed re-trigger push names the cause in the log 1766ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1688ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3226ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1620ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1062ms
     ✓ gh-error: every poll errored 880ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1195ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1419ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1444ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1531ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4595ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3818ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1094ms
     ✓ re-trigger on dev only uses the record of its own FID 959ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1771ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 477ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 691ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 479ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 330ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 674ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 878ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 848ms
     ✓ --file and --step go together 682ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 851ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1015ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1004ms
     ✓ reports excluded intervals as unread even when pagination finishes 840ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 658ms
     ✓ reports an unread remainder at the page cap 568ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 534ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 423ms
     ✓ rejects missing summaries instead of treating them as empty results 666ms
     ✓ reports a failed first page as unavailable 558ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 508ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 794ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 560ms
     ✓ follows summary cursors even when the first page is shorter than the limit 722ms
     ✓ reports excluded intervals as unread even when pagination finishes 841ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1004ms
     ✓ reports an unread remainder at the page cap 666ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1182ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1035ms
     ✓ rejects missing summaries instead of treating them as empty results 1104ms
     ✓ reports a failed first page as unavailable 1118ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 1127ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 31284ms
   ✓ bkit repo info (11)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 977ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 555ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1108ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 574ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1183ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1276ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1374ms
     ✓ an unpinned repo reports nulls and asks no registry 1172ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1036ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 737ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 953ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 738ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 487ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 473ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 422ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 490ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 576ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 729ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 536ms
     ✓ --file into a missing directory is refused, not created 448ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 464ms
     ✓ resolves config from the repo root when run from a subdirectory 558ms
     ✓ exits 6 when the PUT fails 487ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 617ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 799ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 491ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 468ms
     ✓ exits 6 when the api answer is not JSON 388ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 17187ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ renders header fields in the order the flags were given 997ms
     ✓ raw lines follow the links (Fetch Context's not-configured line) 333ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 314ms
     ✓ failure: --error-file carries the error text, trailing newlines dropped; a missing file exits 3 309ms
   ✓ bkit issues comment --post (7)
     ✓ skips tracker none and an issue-less FID 438ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 950ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3383ms
     ✓ a refused dev push is logged, never fails the close 3695ms
     ✓ an unreachable remote is logged, never fails the close 971ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 7969ms
   ✓ bkit disk prune — step files (10)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1403ms
     ✓ counts files committed since --base 907ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 983ms
     ✓ runs nothing and exits 0 when no file changed 476ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 871ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 566ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1393ms
     ✓ runGit names ENOBUFS when output passes the limit 2200ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1248ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 442ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 411ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 379ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 944ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1700ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 511ms
 ✓ .bkit/core/engine/commands/workflow/decisions.test.ts (66 tests) 5497ms
   ✓ bkit decisions compose (36)
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 323ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 415ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 462ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 450ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (46 tests) 3754ms
   ✓ bkit status resume (37)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1081ms
     ✓ passes every rule on a clean head 447ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 516ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests) 1852ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1559ms
> [bkit] TRUNCATED HERE — 140 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1448ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 316ms
     ✓ limits execSync and execFileSync the same way 610ms
     ✓ stops a child that ignores SIGTERM at the remaining time 304ms
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
> [bkit] TRUNCATED HERE — 669 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 836ms
 ✓ .bkit/core/engine/render/trackers.test.ts (107 tests) 1168ms
   ✓ substituteWorkflow — tracker groups (14)
     ✓ does not rescan the whole document for each hard-break check 356ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 233ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 358ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 35ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 233ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 315ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 387ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 146ms
(node:58813) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:58813) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 256ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-q9mHVj/nonexistent.md — skipping .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 358ms
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

 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 105ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 150ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 541ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 188ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 359ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 268ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 262ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 433ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (66 tests) 87ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 216ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 260ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 123ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 331ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 118ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 120ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 124ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-e7p0lC/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 213ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 113ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 158ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 212ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 106ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 167ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 41ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 233ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 216ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 239ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 109ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (72 tests) 195ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 83ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 37ms
(node:61631) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:61631) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:61631) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:61631) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 155ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 90ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 82ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 82ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 79ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 115ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 122ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 168ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 48ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 60ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 48ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 157ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 23ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 108ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 28ms
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

 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 84ms
stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 51ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 35ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 56ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 35ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 183ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 49ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 32ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 33ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 47ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 37ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 34ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 43ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 45ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 53ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 29ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794654394405.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794654394409.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794654394410.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794654394433.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 49ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 36ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 25ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 25ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 43ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 88ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 26ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 20ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 19ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 202193ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 624ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1976ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 587ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 654ms
     ✓ writes no limits for a workflow with no ask point 711ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 434ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 468ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 646ms
       ✓ a new run in the same chat gets its own session row 567ms
       ✓ writes none outside Claude Code 572ms
     ✓ opens the next run after a finished one, and after another workflow's run 475ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 480ms
     ✓ design / plan / build / debug book in the current worktree 495ms
     ✓ refuses when the lock is live, writing no row 334ms
     ✓ --lock-held checks the lock is ours 406ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 404ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 608ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a new run has no last step and no open decision 329ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 394ms
     ✓ an OPEN decision of an earlier run never resurfaces 645ms
     ✓ an OPEN decision mid-build prints its header fields 490ms
     ✓ openDecision carries the Gate header 459ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 412ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 834ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 503ms
     ✓ openDecision gate is null without the header 438ms
     ✓ openDecision gate ignores a Gate line below the header 388ms
     ✓ reads Test attempt from a tests pause 329ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 816ms
     ✓ writes no row when status.jsonl does not exist 513ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 766ms
     ✓ aborts a rebase only when one is in progress 1088ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 837ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1090ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 668ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 814ms
     ✓ --max-exceeded says a handover is due without any sentinel 631ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 1164ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1265ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 772ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 425ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 375ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 313ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 455ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 444ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 677ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 722ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 559ms
     ✓ bkit workflows fail treats an empty --next-step as absent 353ms
     ✓ a debug run in SOAK mode always needs a handover 565ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1821ms
       ✓ counts subagents of an earlier chat the run's session rows name 2319ms
       ✓ records no context block, and still closes, outside a Claude Code session 1299ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1245ms
     ✓ records ending held and publish false on the workflow-done row 1207ms
     ✓ defaults the close row to ending done 1332ms
     ✓ refuses an unknown ending 470ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1649ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1595ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1601ms
     ✓ always writes the telemetry, whatever the runtime 1224ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1051ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1135ms
     ✓ an unwritable stats path is logged and never fails the close 1162ms
     ✓ appends the completeness row before the workflow-done row 1309ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1965ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1934ms
     ✓ writes one completeness row per close 2135ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1122ms
     ✓ still closes when the completeness check throws 1201ms
     ✓ still closes when the completeness row write throws 1857ms
     ✓ refuses without status.jsonl and writes nothing 404ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1686ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 2378ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1543ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1216ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1481ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1655ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1757ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1711ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1796ms
     ✓ --record-step writes the close step's row before workflow-done 1054ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 998ms
     ✓ --number without --outbox is a usage error 1079ms
     ✓ --flush is ship only 350ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1308ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1438ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1951ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1417ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1216ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 650ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 544ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3564ms
     ✓ --flush with nothing to record commits and pushes nothing 1821ms
     ✓ --flush carries the named worktree's logs into the dev commit 3538ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4108ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3973ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4180ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3072ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4969ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3409ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3078ms
     ✓ --push on dev never carries a row whose references name another feature 3034ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2670ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6432ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4706ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2011ms
     ✓ rejects --push with --flush, and --flush outside ship 434ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 5015ms
     ✓ preserves unlanded file deletions and ledger additions on close 8633ms
     ✓ preserves dirty work and uncertain branch evidence during close 9117ms
     ✓ preserves a local feature ref changed after its cleanup proof 8582ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3150ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1261ms
     ✓ a close that landed releases the lock 1841ms
     ✓ removes the worktree before it releases the lock 1612ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2517ms
       ✓ closePr refuses when the PR base is unknown 2009ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1391ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 582ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1097ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 331ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 301ms
     ✓ a second run's record does not let this FID's close commit 448ms
     ✓ record is present after workflows close and before the push 786ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1348ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 314ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 437ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 557ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 535ms
     ✓ puts each --line after the summary, in flag order 421ms
     ✓ --summary prints the file and keeps a copy in --outbox 425ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 406ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 311510ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 868ms
     ✓ rejects missing explicit and ambiguous existing branch selections 751ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1329ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1753ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 863ms
     ✓ a refused --continue carries git's own reason 1318ms
     ✓ --file records nothing for a refused rebase 807ms
     ✓ refuses a code conflict and aborts the rebase on the spot 802ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1755ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 668ms
     ✓ produces byte-identical output to merge=union 2124ms
     ✓ restores a trailing newline so the next append starts on its own line 1255ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1218ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 2029ms
     ✓ refuses a union that leaves a line which is not JSON 1118ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1322ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1780ms
     ✓ refuses a lockfile whose regenerate command fails 1794ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2969ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1808ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 2079ms
     ✓ refuses and aborts when both sides changed the hand-written region 1220ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1636ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 2512ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1964ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1051ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1424ms
     ✓ refuses and aborts when a side deleted the install record 1172ms
     ✓ refuses a conflicted doc the repo's script does not list 1122ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1093ms
     ✓ removes a stale sentinel when the rebase succeeds 1663ms
     ✓ exits 4 when no rebase is in progress 459ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1882ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1469ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 744ms
       ✓ skips (12) with no anchor 852ms
       ✓ skips (12) when the base is unreachable in this clone 1206ms
       ✓ skips (12) when nothing landed since the base 1611ms
       ✓ runs (0) with the landed path count once dev moved 1801ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 962ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1842ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1060ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 2048ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2081ms
     ✓ runs exactly one git push 1962ms
     ✓ --set-upstream records the upstream 1473ms
     ✓ refuses with no branch checked out 1039ms
     ✓ --mode=dev refuses a feature checkout 901ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2675ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3672ms
     ✓ --require-ci pushes as-is when dev has not moved 1928ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2425ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3592ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1406ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1370ms
     ✓ --mode=abort pushes when the branch has no open PR 1560ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1252ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 801ms
     ✓ --open-pr carries the MCP answer and skips gh 1204ms
     ✓ --mode=abort on dev pushes plainly without probing 1305ms
     ✓ rejects an unknown mode 852ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3847ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2069ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2221ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5434ms
     ✓ skip-ci HEAD on the replay is refused 1647ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3267ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5439ms
     ✓ a level local dev is a plain push, recording nothing extra 1780ms
     ✓ a record with no commits pushes nothing 1210ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 853ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1729ms
     ✓ a rewritten branch is refused, never forced 1138ms
     ✓ refuses dev and main with exit 21 and pushes nothing 733ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1778ms
     ✓ refuses a detached HEAD (exit 5) 706ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1550ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1444ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1247ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1706ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 695ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3100ms
     ✓ an up-to-date branch is a no-op 2129ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2199ms
     ✓ a fetch that fails exits 10 1035ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1368ms
     ✓ scan-diff still reports a new skip when its test … 1307ms
     ✓ scan-diff reports a skip moved onto a different t… 1510ms
     ✓ scan-diff does not cancel a skip moved between am… 1258ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1423ms
     ✓ scan-diff recognizes a renamed test file 1241ms
     ✓ scan-diff recognizes a suite moved into a differe… 1167ms
     ✓ scan-diff does not let unrelated additions hide a… 1164ms
     ✓ scan-diff attributes deletion to its old test ins… 1157ms
     ✓ scan-diff consumes each moved assertion once and … 1331ms
     ✓ scan-diff does not match identical assertions fro… 1353ms
     ✓ scan-diff does not match the same leaf test name … 1284ms
     ✓ scan-diff does not match a same-named test with d… 1353ms
     ✓ scan-diff does not match a same-named test with c… 1320ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1113ms
     ✓ --paths with no match exits 1 1225ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 825ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1702ms
     ✓ --marker reads a diff over 1 MiB 1156ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1789ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1255ms
     ✓ scan-diff finds an added skip 1339ms
     ✓ scan-diff ignores a skip predating the base 1208ms
     ✓ scan-diff reports a disabled test with its line 1331ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1176ms
     ✓ scan-diff ignores a removed comment in a test file 1213ms
     ✓ scan-diff ignores an assertion moved within the file 1096ms
     ✓ scan-diff still reports a removed assertion 849ms
     ✓ scan-diff reports an assertion re-added only outside the test file 410ms
     ✓ scan-diff finds an added pytest mark skip 495ms
     ✓ scan-diff finds an added unittest skip 441ms
     ✓ scan-diff finds an added bare skip call 405ms
     ✓ scan-diff ignores a quoted skip in a documentation file 508ms
     ✓ scan-diff ignores a marker literal in a non-test source file 600ms
     ✓ scan-diff ignores an assertion whose expectation changed 424ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 437ms
     ✓ scan-diff reports a deleted test file 439ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 316ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1106ms
     ✓ a title that already carries the marker is left alone 762ms
     ✓ with no open PR: pushes the marker commit and edits no title 1165ms
     ✓ a re-run is deduped: no second marker commit 927ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1090ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 357ms
     ✓ --title-set skips gh entirely 577ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1212ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2289ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1437ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2522ms
     ✓ continues only the explicitly recorded target through the public merge command 2140ms
     ✓ fetches the unseen feature head before classifying the base 1301ms
     ✓ fast forwards the feature before either base path is chosen 2636ms
     ✓ merges divergent feature tips without rebasing either side 1511ms
     ✓ continues the feature merge before starting a dev merge 2420ms
     ✓ publishes local code with a CI running head before bookkeeping 2829ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3789ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2543ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1688ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 611ms
     ✓ Path B once dev moved; --head checks a given commit 1052ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 937ms
     ✓ --merge-docs merges dev when docs/ is behind 903ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 840ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1169ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1112ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 898ms
     ✓ --merge-docs skips an empty bkit:generate script 858ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 712ms
     ✓ --merge-docs never merges on dev itself 671ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1041ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1110ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1046ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 990ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 475ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1352ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1350ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1660ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1096ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1307ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1487ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1087ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1330ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 961ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 598ms
     ✓ exits 10 when the fetch fails 437ms
     ✓ refuses --merge-docs with --head, and an unknown --head 412ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 703ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1048ms
     ✓ a failed install stops ship (16) 909ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 987ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 739ms
     ✓ exits 10 when the fetch fails 569ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 402ms
     ✓ preserves unlanded file type changes in the shared landed comparison 399ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 302ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 601ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1996ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1861ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2193ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2054ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4191ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4746ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 713ms
     ✓ local: names unpushed dev as the cause when the branch carries it 884ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1065ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2243ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2153ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1491ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6536ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1724ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1715ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1681ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1037ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2634ms
     ✓ land removes the worktree when only the copied .env is untracked 2334ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1650ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1814ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3189ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1844ms
     ✓ landPr refuses a main-based PR without retrying 724ms
     ✓ landPr refuses when the PR base is unknown 669ms
     ✓ PR not open (closed): stops (17) at once, no retry 928ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 707ms
     ✓ --attempt names the merge round in a fix commit 695ms
     ✓ commits a rewritten and a deleted tracked file 679ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 585ms
     ✓ reports undeclared and runs nothing with no scripts 448ms
     ✓ reports undeclared and runs nothing with an empty script 526ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 541ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 619ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 463ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/land.test.ts > pushToDev > dev moved before every push: exhausted, nothing landed
Error: git worktree unlock /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-land-main-CfI9k9/.worktrees/_land-x did not finish within 1 ms (the running test's remaining time)
 ❯ target.<computed> vitest.child-deadline.ts:64:15
     62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
     63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
     64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
       |               ^
     65|       }
     66|       return result;
 ❯ runGit .bkit/core/engine/commands/lib.ts:988:15
 ❯ dropLandTree .bkit/core/engine/commands/land.ts:90:3
 ❯ Module.pushToDev .bkit/core/engine/commands/land.ts:272:7
 ❯ .bkit/core/engine/commands/land.test.ts:442:17

Caused by: Error: spawnSync git ETIMEDOUT
 ❯ target.<computed> vitest.child-deadline.ts:55:27
 ❯ runGit .bkit/core/engine/commands/lib.ts:988:15
 ❯ dropLandTree .bkit/core/engine/commands/land.ts:90:3
 ❯ Module.pushToDev .bkit/core/engine/commands/land.ts:272:7
 ❯ .bkit/core/engine/commands/land.test.ts:442:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync git', path: 'git', spawnargs: [ 'worktree', 'unlock', '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-land-main-CfI9k9/.worktrees/_land-x' ] }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 177 passed (178)
      Tests  1 failed | 7747 passed | 2 skipped (7750)
   Start at  21:03:36
   Duration  313.18s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/895-one-question-format/build-group-gate-2-1.log.reports/vitest-17001.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    88.6 |    82.37 |   94.53 |   90.08 |                   
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
 engine/commands   |    88.6 |    83.37 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.38 |   96.42 |   94.53 | ...20-823,870-885 
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
 ...mands/workflow |   90.15 |    82.99 |    95.3 |   91.69 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.81 |    84.24 |   98.27 |   97.54 | ...07,445,522,716 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   94.23 |    73.84 |     100 |   93.75 | 47-48,51          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.81 |    87.71 |    92.3 |    94.4 | ...91-292,461-462 
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
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
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
  settings.ts      |   99.06 |    98.51 |     100 |     100 | 267,318           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.88 |    85.41 |   95.85 |   90.67 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.56 |    85.89 |   96.01 |    91.5 | ...1806-1891,1896 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.6% ( 20985/23685 )
Branches     : 82.37% ( 16299/19787 )
Functions    : 94.53% ( 3359/3553 )
Lines        : 90.08% ( 18401/20427 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1887 of 3591 lines (137 KB of 278 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
