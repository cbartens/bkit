
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 1011, since 21:10:40), last run took 3m18s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 787-show-authoring-rules build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 1011, since 21:10:40), last run took 3m18s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> bkit ci slop

[bkit-ci] base da97be3876cf42450f57b335b7aac09629f33a59 (da97be3876cf42450f57b335b7aac09629f33a59) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: da97be3876cf42450f57b335b7aac09629f33a59
base: da97be3876cf42450f57b335b7aac09629f33a59
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 6.8 on 10 cores: unit limits 7900ms per test, 15800ms per hook (x1.58)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 29723ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 741ms
     ✓ names each net-new and worsened finding in the log and the JSON 1160ms
     ✓ fails on a net score rise with no net count change 658ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1107ms
     ✓ treats a net score at or below 0.001 as float noise 1063ms
     ✓ passes when the change only resolves findings 673ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 842ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 894ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 348ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 725ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 702ms
     ✓ exits 4 on a dropped net field instead of silently passing 1303ms
     ✓ exits 4 on no summary instead of silently passing 1029ms
     ✓ exits 4 on output that is not JSON instead of silently passing 862ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1022ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 738ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 762ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 760ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 764ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1399ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 723ms
     ✓ explicit globs can select ignored prose and nested checkout files 714ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 451ms
     ✓ fails (exit 1) when vale reports alerts 520ms
     ✓ exits 6 on a vale runtime error 347ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 422ms
     ✓ falls back to vale sync when the main worktree has none 362ms
     ✓ fails when vale sync cannot restore the required styles 522ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 312ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 381ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 566ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 335ms
     ✓ exits 1 naming the files outside, whatever the commit message says 344ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 602ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 466ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 308ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 541ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 31632ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 312ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1456ms
     ✓ always writes the marker, even with no plan 470ms
     ✓ writes the linear marker shape, taking the tracker from package.json 919ms
     ✓ writes the jira marker shape, taking the tracker from package.json 540ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 706ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 893ms
     ✓ retries a failed create once, and exits 5 when it fails twice 509ms
     ✓ exits 5 when the open-PR probe errors 529ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 840ms
     ✓ prs open still opens against any other base 612ms
     ✓ exits 6 when the created PR's base is not --base 952ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 682ms
     ✓ exits 1 with found=false when there is none 683ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 577ms
     ✓ --number reads one PR, mergeable included 659ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 987ms
     ✓ exits 4 when gh errors and 80 when it needs auth 559ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 321ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 429ms
     ✓ drops the force-build marker from the title subject 305ms
     ✓ takes an explicit --subject 312ms
     ✓ runs no merge when the PR is already MERGED 505ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 432ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 316ms
     ✓ prs merge refuses when the PR base is unknown 509ms
     ✓ prs merge reads the base from the one pr view it already makes 722ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 405ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 484ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 526ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 521ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 562ms
     ✓ updates when a dev ruleset requires status checks 727ms
     ✓ updates when dev's branch protection requires status checks 768ms
     ✓ ignores dev rulesets that require no checks 756ms
     ✓ updates when the repo cannot be resolved 544ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 337ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 337ms
     ✓ is not green when a check failed, naming it (exit 1) 300ms
     ✓ is not green on an empty rollup (total 0) 376ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 667ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 400ms
     ✓ is a no-op when the title already says so 346ms
     ✓ strips the marker, with or without its bkit prefix 836ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 476ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 33042ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 378ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 343ms
     ✓ done --group writes group on the row 317ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 548ms
     ✓ reports a failed commit with exit 8 without writing the row 1167ms
     ✓ a failed commit leaves no row staged in the index 518ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1021ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 742ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 945ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 774ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1044ms
   ✓ bkit steps gate (8)
     ✓ --ref exits 3 when the ref does not carry the status file 340ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 343ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 392ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 357ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 442ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 585ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 380ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 545ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 748ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 406ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 432ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 334ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 700ms
     ✓ writeStepRow refuses when a recorded path changed 760ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 379ms
     ✓ writeStepRow appends its commit sha to the record 692ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 979ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 564ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 526ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 372ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 826ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 564ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 443ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 848ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 328ms
     ✓ does not count an artifact the run found committed when it started 459ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 425ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 795ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 36782ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 21396ms
     ✓ every prompt, workflow and utility agent has the three header blocks 357ms
     ✓ sync has nothing left to rewrite 13055ms
     ✓ every clause reaches the cut-off of one surface it applies to 1623ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 37290ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 977ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 329ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 508ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 723ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 538ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 899ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 503ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 739ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 530ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 605ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 808ms
     ✓ PASS is 0 failures with or without reports 853ms
     ✓ clears a previous attempt's reports before the gate runs 950ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 659ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 753ms
     ✓ a log under the outbox is named main-checkout relative in the record 528ms
     ✓ a log small enough is copied whole: not clamped, raw null 646ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 546ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1018ms
     ✓ numbers runs within the workflow's active run and per step 534ms
     ✓ without --file no row is written and the output carries row null 301ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 923ms
     ✓ a planned test that passes is a vacuous gap, exit 1 428ms
     ✓ a planned test absent from a loaded report is a missing gap 386ms
     ✓ a file that fails to load is a red of kind red-not-loaded 647ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 699ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 787ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 818ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 737ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1007ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 636ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 971ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1153ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 958ms
     ✓ green: a passed-accepted test is already landed, not a gap 507ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 524ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 539ms
     ✓ green: --group audits only that group's tasks 478ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 606ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 650ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 515ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 669ms
     ✓ green: lists each gap kind, with the runner output 541ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 996ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 413ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 41288ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1165ms
     ✓ runs code.ts through its declared gate in the built checkout 1428ms
     ✓ runs code.ts through its declared gate in the built checkout 1345ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 937ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1067ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 983ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 556ms
     ✓ runs the full gate for replayed debug code 899ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1120ms
     ✓ installs local dependencies against the built target tree 1200ms
     ✓ runs the configured frozen install even without root dependencies 1249ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1251ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1286ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1493ms
     ✓ never pushes local dev commits missing from origin/dev 1490ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2435ms
     ✓ dev moved before every push: exhausted, nothing landed 3630ms
     ✓ any other refusal is returned, not retried 1964ms
     ✓ pushToDev replays a commit range onto origin/dev 1574ms
     ✓ a replay retries on the new dev when dev moved 2451ms
     ✓ pushToDev log line names what it lands 1306ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1408ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1575ms
     ✓ a push that fails without a server answer is returned once, never retried 1300ms
     ✓ a failed fetch is returned before anything is built 451ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2009ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1524ms
     ✓ lands from a clone whose fetch refspec omits dev 1644ms
     ✓ build throwing stops the landing and removes the throwaway checkout 536ms
[feat/test 358387d] gate
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 21720ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ adopts the main checkout even when called from a linked worktree 320ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 921ms
     ✓ may debug in place on dev 375ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 926ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 930ms
     ✓ a new run of the same FID rewrites startSha 1181ms
     ✓ a resume of the same FID reuses the record 1122ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 721ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 793ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 896ms
     ✓ a stale record without a lock is replaced 1048ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 784ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 717ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 310ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 333ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 385ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 323ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 594ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 402ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 411ms
       ✓ a branch already gone everywhere is reported deleted 346ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 313ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 772ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 16477ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 563ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 381ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 385ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 380ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 387ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 481ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 498ms
     ✓ counts commits behind origin/dev and the divergence age 577ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 351ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 783ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 548ms
     ✓ from a worktree, still names the main checkout and its outbox 444ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 525ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 411ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 407ms
     ✓ prints the Jira site and project under jira 521ms
     ✓ prints the board under github 391ms
     ✓ prints the github progress and review states, defaults for a key left unset 397ms
     ✓ prints the linear progress and review states, defaults for a key left unset 403ms
     ✓ prints the jira progress and review states, defaults for a key left unset 401ms
     ✓ prints the linear progress and review states, defaults for a key left unset 396ms
     ✓ prints null progress and review states under none 413ms
     ✓ prints buildPublishRemote and buildPublishLocal 418ms
     ✓ prints the publish defaults when package.json omits them 401ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 573ms
     ✓ prints nulls under github without a board, and for keys left unset 692ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 669ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 407ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 412ms
     ✓ an unpinned repo reports nulls and asks no registry 549ms
   ✓ bkit repo preflight (4)
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 369ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 405ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 21466ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 425ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 352ms
     ✓ brand-new untracked ledger is staged and committed 332ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 311ms
     ✓ path containing a space is staged and committed 335ms
     ✓ --mode=stage stages the sweep but creates no commit 308ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 897ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 501ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 490ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 401ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 380ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 340ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 434ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 589ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 384ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 321ms
     ✓ fetches the issue and its comments as GitHub returns them 398ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 462ms
     ✓ invalidates missing corrupt and unsupported progress cache 991ms
     ✓ contains cache read and write failures as standalone degradation 570ms
     ✓ uses legacy receipts and contains receipt failures 393ms
     ✓ records an engine-action row and skips the same key + body on a re-run 408ms
     ✓ a recent identical comment counts as done (the final close comment) 340ms
     ✓ a failed post reports done false with the reason and never leaks a token 373ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 643ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 360ms
     ✓ a different marker hash posts 350ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 322ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (190 tests) 56167ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1996ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 1772ms
     ✓ filters branch and PR discovery by configured workflow and exact head 927ms
     ✓ freezes explicit workflow run attempt and all failed job pages 817ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1401ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1942ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 434ms
       ✓ a source change past the validated head refuses (17) and names the path 425ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 451ms
       ✓ --validated without --month / --fid is a usage error (2) 345ms
       ✓ a validated sha that is not an ancestor refuses (17) 351ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 397ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 697ms
     ✓ a failed re-trigger push names the cause in the log 997ms
     ✓ a failed re-trigger push leaves no orphan commit behind 905ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1204ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 709ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 437ms
     ✓ gh-error: every poll errored 366ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 663ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 695ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 754ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 711ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2035ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2155ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 598ms
     ✓ re-trigger on dev only uses the record of its own FID 720ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 633ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
       ✓ without --repo no call gains a --repo flag 441ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 433ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 317ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 348ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 479ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 506ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 510ms
     ✓ --file and --step go together 478ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 20314ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2013ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1931ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 301ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2269ms
     ✓ does not fall back through a malformed later success receipt 1262ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 803ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 804ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1520ms
     ✓ requires proof even when the pushed increment changes no files 863ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 485ms
     ✓ does not record a committed tree 540ms
     ✓ records no proof for a failed gate or lighter gate 820ms
     ✓ requires integration proof when integration is declared 1179ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1818ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 7880ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 372ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1288ms
     ✓ a refused dev push is logged, never fails the close 2030ms
     ✓ an unreachable remote is logged, never fails the close 461ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 12775ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 640ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 371ms
     ✓ follows summary cursors even when the first page is shorter than the limit 454ms
     ✓ reports excluded intervals as unread even when pagination finishes 849ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 422ms
     ✓ reports an unread remainder at the page cap 360ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 402ms
     ✓ rejects missing summaries instead of treating them as empty results 439ms
     ✓ reports a failed first page as unavailable 360ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 477ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 366ms
     ✓ follows summary cursors even when the first page is shorter than the limit 787ms
     ✓ reports excluded intervals as unread even when pagination finishes 828ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 810ms
     ✓ reports an unread remainder at the page cap 835ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 531ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 628ms
     ✓ rejects missing summaries instead of treating them as empty results 1114ms
     ✓ reports a failed first page as unavailable 979ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 623ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 7626ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 715ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1062ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 938ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 505ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1058ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 331ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 558ms
     ✓ --file into a missing directory is refused, not created 521ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 833ms
     ✓ resolves config from the repo root when run from a subdirectory 998ms
     ✓ exits 6 when the PUT fails 685ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 716ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1171ms
     ✓ counts files committed since --base 690ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 541ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 556ms
     ✓ runs the --fallback gate even when no file changed, as it did before 646ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 3934ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1327ms
     ✓ runGit names ENOBUFS when output passes the limit 869ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 759ms
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
> [bkit] TRUNCATED HERE — 986 lines omitted. Dropped content was NOT read.
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 128 lines omitted. Dropped content was NOT read.
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
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-ma8Hdq/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 182ms
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

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

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

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

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

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — markered-text (#422) > template with a slash-prefixed HTML marker (// <!-- bkit:start -->) is classified html-comment, not slash-comment (site-9 mis-classification trap)
[bkit-upgrade] upgrade (merge): weird.js

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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 147ms
stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 276ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 173ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 129ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-3GICio/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 111ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 140ms
(node:13784) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:13784) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 122ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 129ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 122ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 187ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 55ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 102ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 64ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 100ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 101ms
(node:14424) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:14424) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:14424) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:14424) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 106ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 76ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 38ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 49ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 95ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 58ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 89ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 72ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 63ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 41ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 38ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 65ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 60ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 70ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 69ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 67ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 80ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 65ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 75ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 71ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 62ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 52ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 36ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 31ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 19ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 50ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 38ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 26ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 34ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 25ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 41ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 30ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 40ms
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

 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 46ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 50ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 44ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 25ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 38ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 17ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794222924246.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794222924250.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794222924250.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794222924258.js — skipping

 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 24ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 25ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 19ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 23ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 18ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 16ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 9ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 92139ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 986ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 376ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 422ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 364ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 382ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 496ms
       ✓ counts subagents of an earlier chat the run's session rows name 524ms
       ✓ records no context block, and still closes, outside a Claude Code session 543ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 513ms
     ✓ records ending held and publish false on the workflow-done row 552ms
     ✓ defaults the close row to ending done 471ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 572ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 565ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 599ms
     ✓ always writes the telemetry, whatever the runtime 579ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 399ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 538ms
     ✓ an unwritable stats path is logged and never fails the close 603ms
     ✓ appends the completeness row before the workflow-done row 522ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 590ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 552ms
     ✓ writes one completeness row per close 735ms
     ✓ leaves out the previous run's rows that share a second with this run's start 489ms
     ✓ still closes when the completeness check throws 527ms
     ✓ still closes when the completeness row write throws 495ms
     ✓ ship: run.pr, size of the squash commit, and coverage 644ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 824ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 514ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 479ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 689ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 695ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 728ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 700ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 736ms
     ✓ --record-step writes the close step's row before workflow-done 471ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 444ms
     ✓ --number without --outbox is a usage error 455ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 685ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 801ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 875ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 860ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 645ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 352ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 319ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1928ms
     ✓ --flush with nothing to record commits and pushes nothing 1090ms
     ✓ --flush carries the named worktree's logs into the dev commit 1922ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2185ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2021ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2549ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2029ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2509ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1999ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2157ms
     ✓ --push on dev never carries a row whose references name another feature 2072ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1902ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3323ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2124ms
     ✓ --push commits in the named worktree, not the checkout it runs from 857ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1696ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1447ms
     ✓ a close that landed releases the lock 1743ms
     ✓ removes the worktree before it releases the lock 1966ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3150ms
       ✓ closePr refuses when the PR base is unknown 2807ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2242ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 333ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 384ms
     ✓ names the branch, not the remote-tracking ref, in each URL 367ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 314ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 394ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 867ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 614ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1505ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 622ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 583ms
     ✓ a second run's record does not let this FID's close commit 768ms
     ✓ record is present after workflows close and before the push 987ms
     ✓ failed handover from dev removes the record and keeps recorded paths 896ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 310ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 140502ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 389ms
     ✓ rejects missing explicit and ambiguous existing branch selections 326ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 687ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 776ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 485ms
     ✓ a refused --continue carries git's own reason 604ms
     ✓ --file records nothing for a refused rebase 483ms
     ✓ refuses a code conflict and aborts the rebase on the spot 386ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 931ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 419ms
     ✓ produces byte-identical output to merge=union 880ms
     ✓ restores a trailing newline so the next append starts on its own line 536ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 468ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 693ms
     ✓ refuses a union that leaves a line which is not JSON 399ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 583ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1220ms
     ✓ refuses a lockfile whose regenerate command fails 902ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 952ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 889ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 781ms
     ✓ refuses and aborts when both sides changed the hand-written region 551ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 648ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 791ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1029ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 581ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 642ms
     ✓ refuses and aborts when a side deleted the install record 598ms
     ✓ refuses a conflicted doc the repo's script does not list 483ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 415ms
     ✓ removes a stale sentinel when the rebase succeeds 532ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 820ms
     ✓ resolves a conflict in each of two replayed commits across rounds 709ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 411ms
       ✓ skips (12) with no anchor 399ms
       ✓ skips (12) when the base is unreachable in this clone 425ms
       ✓ skips (12) when nothing landed since the base 415ms
       ✓ runs (0) with the landed path count once dev moved 797ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 453ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 851ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 573ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 735ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1422ms
     ✓ runs exactly one git push 1192ms
     ✓ --set-upstream records the upstream 693ms
     ✓ refuses with no branch checked out 524ms
     ✓ --mode=dev refuses a feature checkout 516ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1266ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2009ms
     ✓ --require-ci pushes as-is when dev has not moved 789ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1444ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2096ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 522ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 768ms
     ✓ --mode=abort pushes when the branch has no open PR 1032ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 869ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 488ms
     ✓ --open-pr carries the MCP answer and skips gh 692ms
     ✓ --mode=abort on dev pushes plainly without probing 647ms
     ✓ rejects an unknown mode 500ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2099ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1221ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1322ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2872ms
     ✓ skip-ci HEAD on the replay is refused 896ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2183ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2769ms
     ✓ a level local dev is a plain push, recording nothing extra 1043ms
     ✓ a record with no commits pushes nothing 720ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 494ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1395ms
     ✓ a rewritten branch is refused, never forced 638ms
     ✓ refuses dev and main with exit 21 and pushes nothing 443ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1013ms
     ✓ refuses a detached HEAD (exit 5) 426ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 831ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 754ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 709ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1042ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 430ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 971ms
     ✓ an up-to-date branch is a no-op 544ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1084ms
     ✓ a fetch that fails exits 10 509ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 640ms
     ✓ scan-diff still reports a new skip when its test … 614ms
     ✓ scan-diff reports a skip moved onto a different t… 575ms
     ✓ scan-diff does not cancel a skip moved between am… 578ms
     ✓ scan-diff does not spend an unchanged duplicate t… 623ms
     ✓ scan-diff recognizes a renamed test file 655ms
     ✓ scan-diff recognizes a suite moved into a differe… 726ms
     ✓ scan-diff does not let unrelated additions hide a… 633ms
     ✓ scan-diff attributes deletion to its old test ins… 669ms
     ✓ scan-diff consumes each moved assertion once and … 736ms
     ✓ scan-diff does not match identical assertions fro… 723ms
     ✓ scan-diff does not match the same leaf test name … 746ms
     ✓ scan-diff does not match a same-named test with d… 738ms
     ✓ scan-diff does not match a same-named test with c… 730ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 742ms
     ✓ --paths with no match exits 1 660ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 582ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1014ms
     ✓ --marker reads a diff over 1 MiB 910ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1022ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 810ms
     ✓ scan-diff finds an added skip 840ms
     ✓ scan-diff ignores a skip predating the base 731ms
     ✓ scan-diff reports a disabled test with its line 538ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 304ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 555ms
     ✓ a title that already carries the marker is left alone 458ms
     ✓ with no open PR: pushes the marker commit and edits no title 475ms
     ✓ a re-run is deduped: no second marker commit 577ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 618ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 340ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 346ms
     ✓ --merge-docs merges dev when docs/ is behind 407ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 392ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 561ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 575ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 497ms
     ✓ --merge-docs skips an empty bkit:generate script 413ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 357ms
     ✓ --merge-docs never merges on dev itself 319ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 464ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 469ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 439ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 451ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 594ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 653ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 706ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 633ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 598ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 752ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 568ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 638ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 421ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 314ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 384ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 626ms
     ✓ a failed install stops ship (16) 504ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 482ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 431ms
     ✓ exits 10 when the fetch fails 320ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1222ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1169ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1129ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1137ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2265ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2785ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 439ms
     ✓ local: names unpushed dev as the cause when the branch carries it 495ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 548ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1379ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1232ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 860ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 907ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 965ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 899ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 659ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1139ms
     ✓ land removes the worktree when only the copied .env is untracked 953ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 871ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 904ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1521ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 906ms
     ✓ landPr refuses a main-based PR without retrying 547ms
     ✓ landPr refuses when the PR base is unknown 523ms
     ✓ PR not open (closed): stops (17) at once, no retry 673ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 377ms
     ✓ --attempt names the merge round in a fix commit 344ms
     ✓ commits a rewritten and a deleted tracked file 353ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 303ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 327ms

 Test Files  173 passed (173)
      Tests  7370 passed | 2 skipped (7372)
   Start at  21:13:57
   Duration  141.15s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/787-show-authoring-rules/build-group-gate-1-4.log.reports/vitest-4228.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    89.8 |    83.35 |   95.11 |   91.16 |                   
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
 ...mmands/install |   47.59 |    45.02 |   58.75 |   47.98 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.29 |    84.65 |   96.35 |   93.76 |                   
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
  locks.ts         |   93.22 |    87.28 |   96.29 |    94.7 | ...04-305,474-475 
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
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.38 |     59.2 |   67.85 |   62.53 | ...1124,1127-1128 
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
 engine/shared     |   99.44 |     97.2 |     100 |     100 |                   
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
Statements   : 89.8% ( 18930/21080 )
Branches     : 83.35% ( 14159/16987 )
Functions    : 95.11% ( 3054/3211 )
Lines        : 91.16% ( 16597/18206 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 517 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 202 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 200 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 198 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 193 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 193 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 72 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 234 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 197 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 193 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 204 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 194 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 209 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 207 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 766 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 482 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 14 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 17 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 20 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 18 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 46 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 571 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 344 ms
ok 30 refresh drops a file deleted in the index from the build # in 328 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 394 ms
ok 32 a key removed from the env file is unset on the next run # in 167 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 145 ms
ok 34 non-BKIT_ keys are skipped # in 135 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 145 ms
ok 36 a failed unsetenv is retried on the next run # in 163 ms
ok 37 logs key names only, never values # in 140 ms
ok 38 missing env file exits 0 without calling launchctl # in 23 ms
ok 39 the sweep prints the summary line the lane greps for # in 245 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 8 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (108.131958ms)
✔ shell cancellation waits for SIGTERM cleanup (136.78025ms)
✔ direct cancellation waits for SIGINT cleanup (84.589458ms)
✔ shell cancellation waits for SIGINT cleanup (138.211ms)
✔ direct cancellation waits for SIGHUP cleanup (105.356375ms)
✔ shell cancellation waits for SIGHUP cleanup (138.193583ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (368.872958ms)
✔ shell cancellation follows a worker orphaned by a nested shell (231.934375ms)
✔ direct cancellation preserves a nested machine-lock owner (400.051791ms)
✔ shell cancellation preserves a nested machine-lock owner (432.358208ms)
✔ nested shell cancellation preserves a nested machine-lock owner (455.775125ms)
✔ a hard process-group timeout reaches a shell command during cleanup (68.610042ms)
✔ ships a command-scoped sleep prevention wrapper (0.051458ms)
✔ preserves arguments, output and nonzero exit status (40.795167ms)
✔ runs an entire shell chain and retains its failure (25.114709ms)
✔ reports a missing command as 127 (25.829458ms)
✔ requires a command (22.260792ms)
✔ non-macOS platform selection runs commands without sleep prevention (37.437042ms)
✔ hard timeout escalation reaches a command that ignores TERM (141.408708ms)
✔ forwards POSIX cancellation to the command and releases the assertion (52.720459ms)
✔ holds a real macOS assertion only while the command runs (60.683708ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3103.574833
> [bkit] TRUNCATED — kept 1720 of 3284 lines (123 KB of 254 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
