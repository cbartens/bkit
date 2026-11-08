
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
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
 144:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 177:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 186:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 507:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 629:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 702:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 628:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 867:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1044:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1152:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1313:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1371:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

✖ 0 errors, 47 warnings and 0 suggestions in 150 files.
passed: true
skipped: null
files: 150

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> bkit ci slop

[bkit-ci] base b8f96ad08c888820932e1c558f4c357fc91c50e1 (b8f96ad08c888820932e1c558f4c357fc91c50e1) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: b8f96ad08c888820932e1c558f4c357fc91c50e1
base: b8f96ad08c888820932e1c558f4c357fc91c50e1
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 2.8 on 10 cores: unit limits 5900ms per test, 11800ms per hook (x1.18)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 20499ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1137ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 542ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 556ms
     ✓ seals unavailable or unstable representation evidence 508ms
     ✓ uses accepted final preflight eligibility without provider atomicity 492ms
     ✓ rejects marker preserving external edits 555ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1083ms
     ✓ returns owned comment identity and stable representation evidence 498ms
     ✓ selects newest created comment across complete pages 426ms
   ✓ github client (8)
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 445ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 341ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 679ms
     ✓ fetches the issue and its comments as GitHub returns them 370ms
     ✓ github fetch marks a closed issue terminal and an open one not 361ms
   ✓ postCommentOnce (11)
     ✓ reuses matching invocation state without adopting foreign ownership 462ms
     ✓ invalidates missing corrupt and unsupported progress cache 638ms
     ✓ contains cache read and write failures as standalone degradation 536ms
     ✓ uses legacy receipts and contains receipt failures 325ms
     ✓ a failed post reports done false with the reason and never leaks a token 350ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 440ms
   ✓ board move (Projects v2) (3)
     ✓ a board the token cannot see is scope 319ms
   ✓ blockers (4)
     ✓ github: no block, no blockers and no further reads 518ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 702ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 343ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 21981ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 655ms
     ✓ names each net-new and worsened finding in the log and the JSON 711ms
     ✓ fails on a net score rise with no net count change 565ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 552ms
     ✓ treats a net score at or below 0.001 as float noise 966ms
     ✓ passes when the change only resolves findings 525ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 626ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 652ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 742ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 908ms
     ✓ exits 4 on a dropped net field instead of silently passing 745ms
     ✓ exits 4 on no summary instead of silently passing 453ms
     ✓ exits 4 on output that is not JSON instead of silently passing 475ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 817ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 648ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 567ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 554ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 572ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1192ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 521ms
     ✓ explicit globs can select ignored prose and nested checkout files 346ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 414ms
     ✓ fails (exit 1) when vale reports alerts 347ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ fails when vale sync cannot restore the required styles 344ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 364ms
   ✓ bkit ci min-push (9)
     ✓ checks every --ref: one code ref among min-push refs fails the push 406ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 317ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 423ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (115 tests) 25103ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 331ms
     ✓ reports a failed commit with exit 8 without writing the row 1033ms
     ✓ a failed commit leaves no row staged in the index 642ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 567ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 721ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 642ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 537ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1112ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 317ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 344ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 417ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 350ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 376ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 530ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 389ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 386ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 312ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 571ms
     ✓ writeStepRow refuses when a recorded path changed 566ms
     ✓ writeStepRow appends its commit sha to the record 486ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 694ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 430ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 361ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 610ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 424ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 640ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 326ms
     ✓ does not count an artifact the run found committed when it started 343ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 365ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 597ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 26106ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 14807ms
     ✓ every prompt, workflow and utility agent has the three header blocks 312ms
     ✓ sync has nothing left to rewrite 9415ms
     ✓ every clause reaches the cut-off of one surface it applies to 1250ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 28326ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 803ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 404ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 487ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 744ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 557ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 408ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 412ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 550ms
     ✓ PASS is 0 failures with or without reports 571ms
     ✓ clears a previous attempt's reports before the gate runs 506ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1103ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 602ms
     ✓ a log under the outbox is named main-checkout relative in the record 372ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 328ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 765ms
     ✓ numbers runs within the workflow's active run and per step 362ms
     ✓ without --file no row is written and the output carries row null 328ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 701ms
     ✓ a planned test that passes is a vacuous gap, exit 1 303ms
     ✓ a planned test absent from a loaded report is a missing gap 395ms
     ✓ a file that fails to load is a red of kind red-not-loaded 442ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 501ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 677ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 353ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 538ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1101ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 390ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 558ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 629ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 760ms
     ✓ green: a passed-accepted test is already landed, not a gap 657ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 491ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 416ms
     ✓ green: --group audits only that group's tasks 378ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 548ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 490ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 363ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 567ms
     ✓ green: lists each gap kind, with the runner output 415ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 892ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 371ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 31773ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 883ms
     ✓ runs code.ts through its declared gate in the built checkout 915ms
     ✓ runs code.ts through its declared gate in the built checkout 865ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 730ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 757ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 834ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 411ms
     ✓ runs the full gate for replayed debug code 724ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 810ms
     ✓ installs local dependencies against the built target tree 799ms
     ✓ runs the configured frozen install even without root dependencies 806ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 922ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 901ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1134ms
     ✓ never pushes local dev commits missing from origin/dev 1164ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1957ms
     ✓ dev moved before every push: exhausted, nothing landed 2990ms
     ✓ any other refusal is returned, not retried 1697ms
     ✓ pushToDev replays a commit range onto origin/dev 1139ms
     ✓ a replay retries on the new dev when dev moved 1821ms
     ✓ pushToDev log line names what it lands 955ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1166ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1147ms
     ✓ a push that fails without a server answer is returned once, never retried 1138ms
     ✓ a failed fetch is returned before anything is built 378ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1739ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1280ms
     ✓ lands from a clone whose fetch refspec omits dev 1238ms
     ✓ build throwing stops the landing and removes the throwaway checkout 463ms
[feat/test 729740d] gate
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 17692ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 1613ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1565ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 308ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 333ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 374ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2264ms
     ✓ does not fall back through a malformed later success receipt 919ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 610ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 579ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1144ms
     ✓ requires proof even when the pushed increment changes no files 892ms
     ✓ ignores malformed receipts 749ms
     ✓ does not record a tracked tree 355ms
     ✓ does not record a untracked tree 382ms
     ✓ does not record a mutated tree 486ms
     ✓ does not record a committed tree 492ms
     ✓ records no proof for a failed gate or lighter gate 833ms
     ✓ requires integration proof when integration is declared 878ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1629ms
     ✓ invalidates proof when the gate definition changes 705ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 346ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 19896ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 449ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 624ms
     ✓ always writes the marker, even with no plan 418ms
     ✓ writes the linear marker shape, taking the tracker from package.json 568ms
     ✓ exits 5 when the open-PR probe errors 327ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 316ms
     ✓ exits 4 when gh errors and 80 when it needs auth 314ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 338ms
     ✓ runs no merge when the PR is already MERGED 323ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 887ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 452ms
     ✓ prs merge refuses when the PR base is unknown 376ms
     ✓ prs merge reads the base from the one pr view it already makes 490ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 323ms
   ✓ bkit prs update-branch (5)
     ✓ never reads dev's required checks without --only-if-required 309ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 414ms
     ✓ updates when a dev ruleset requires status checks 412ms
     ✓ updates when dev's branch protection requires status checks 339ms
   ✓ bkit prs checks (6)
     ✓ is not green when a check failed, naming it (exit 1) 305ms
     ✓ is not green on an empty rollup (total 0) 328ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 448ms
   ✓ bkit prs verbose-ci (4)
     ✓ strips the marker, with or without its bkit prefix 371ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 317ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 15420ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 9942ms
     ✓ every fence parses under zsh -n 5409ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 13513ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 473ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 378ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 332ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 882ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 471ms
     ✓ counts commits behind origin/dev and the divergence age 531ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 424ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 729ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 375ms
     ✓ from a worktree, still names the main checkout and its outbox 405ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 458ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 565ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 354ms
     ✓ prints the Jira site and project under jira 320ms
     ✓ prints the linear progress and review states, defaults for a key left unset 307ms
     ✓ prints the linear progress and review states, defaults for a key left unset 328ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 323ms
     ✓ prints nulls under github without a board, and for keys left unset 555ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 575ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 18054ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 722ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 671ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 526ms
     ✓ a new run of the same FID rewrites startSha 1083ms
     ✓ a resume of the same FID reuses the record 1083ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 760ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 822ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 931ms
     ✓ a stale record without a lock is replaced 842ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 628ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 582ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 524ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 321ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 343ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 597ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests) 45207ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1510ms
   ✓ preserves the requested event for selected-workflow verification 767ms
   ✓ requires selected other-workflow success at the exact pushed head 1146ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 1410ms
     ✓ filters branch and PR discovery by configured workflow and exact head 818ms
     ✓ freezes explicit workflow run attempt and all failed job pages 721ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1364ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1521ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 332ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 664ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 476ms
     ✓ rejects a workflow result count smaller than its returned records 346ms
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 409ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 401ms
       ✓ a source change past the validated head refuses (17) and names the path 354ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 362ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 474ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 532ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runs dispatch (16)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 479ms
     ✓ a failed re-trigger push names the cause in the log 963ms
     ✓ a failed re-trigger push leaves no orphan commit behind 859ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1053ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 577ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 304ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 481ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 562ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 678ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 656ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1978ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2080ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 611ms
     ✓ re-trigger on dev only uses the record of its own FID 573ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 611ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ without --repo no call gains a --repo flag 351ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 336ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 309ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 355ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 388ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 486ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 390ms
     ✓ --file and --step go together 317ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 17831ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ follows summary cursors even when the first page is shorter than the limit 340ms
     ✓ reports excluded intervals as unread even when pagination finishes 367ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 324ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 503ms
     ✓ rejects missing summaries instead of treating them as empty results 310ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 346ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 577ms
     ✓ follows summary cursors even when the first page is shorter than the limit 453ms
     ✓ reports excluded intervals as unread even when pagination finishes 707ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 549ms
     ✓ reports an unread remainder at the page cap 682ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 566ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 490ms
     ✓ rejects missing summaries instead of treating them as empty results 1104ms
     ✓ reports a failed first page as unavailable 497ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 676ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 7347ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 368ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 479ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 525ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 554ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1031ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 472ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 742ms
     ✓ --file into a missing directory is refused, not created 648ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 405ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1024ms
     ✓ a refused dev push is logged, never fails the close 1987ms
     ✓ an unreachable remote is logged, never fails the close 761ms
(node:69183) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 828ms
     ✓ resolves config from the repo root when run from a subdirectory 496ms
     ✓ exits 6 when the PUT fails 751ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 534ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 771ms
     ✓ counts files committed since --base 468ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 535ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 771ms
     ✓ runs the --fallback gate even when no file changed, as it did before 687ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 318ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1329ms
     ✓ runGit names ENOBUFS when output passes the limit 2181ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 2215ms
> [bkit] TRUNCATED HERE — 54 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 993 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 143 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 214ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 513ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 325ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 806ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 173ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 319ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 295ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 16046ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 15970ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 194ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 352ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-mn7I4Q/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 405ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 265ms
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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 334ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-F8FCaC/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 197ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 200ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 333ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 300ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 293ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 224ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 33ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 213ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 171ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 177ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 154ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 142ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 182ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 183ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 236ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 213ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 211ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 147ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 153ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 186ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 40ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 208ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 185ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 99ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 154ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 76ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 119ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 45ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 113ms
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

 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 88ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 172ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (40 tests) 175ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 35ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 88ms
(node:13341) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:13341) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:13341) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:13341) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 309ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 20ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 93ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 22ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 72ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 25349ms
   ✓ real workflow sources (37)
     ✓ bkit-build resolves cleanly for github 828ms
     ✓ bkit-build resolves cleanly for linear 841ms
     ✓ bkit-build resolves cleanly for jira 935ms
     ✓ bkit-ship resolves cleanly for github 566ms
     ✓ bkit-ship resolves cleanly for linear 675ms
     ✓ bkit-ship resolves cleanly for jira 703ms
     ✓ bkit-debug resolves cleanly for github 606ms
     ✓ bkit-debug resolves cleanly for linear 602ms
     ✓ bkit-debug resolves cleanly for jira 880ms
     ✓ bkit-design resolves cleanly for github 496ms
     ✓ bkit-design resolves cleanly for linear 449ms
     ✓ bkit-design resolves cleanly for jira 511ms
     ✓ bkit-plan resolves cleanly for github 475ms
     ✓ bkit-plan resolves cleanly for linear 469ms
     ✓ bkit-plan resolves cleanly for jira 737ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-design: the github render keeps the warning bullet once and the recovery in Step 1 480ms
     ✓ bkit-design: the linear render keeps the warning bullet once and the recovery in Step 1 395ms
     ✓ bkit-design: the jira render keeps the warning bullet once and the recovery in Step 1 494ms
     ✓ bkit-plan: the github render keeps the warning bullet once and the recovery in Step 1 325ms
     ✓ bkit-plan: the linear render keeps the warning bullet once and the recovery in Step 1 372ms
     ✓ bkit-plan: the jira render keeps the warning bullet once and the recovery in Step 1 461ms
     ✓ bkit-build: the github render keeps the warning bullet once and the recovery in Step 1 639ms
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 717ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 826ms
     ✓ bkit-debug: the github render keeps the warning bullet once and the recovery in Step 1 529ms
     ✓ bkit-debug: the linear render keeps the warning bullet once and the recovery in Step 1 621ms
     ✓ bkit-debug: the jira render keeps the warning bullet once and the recovery in Step 1 700ms
     ✓ bkit-ship: the github render keeps the warning bullet once and the recovery in Step 1 337ms
     ✓ bkit-ship: the linear render keeps the warning bullet once and the recovery in Step 1 363ms
     ✓ bkit-ship: the jira render keeps the warning bullet once and the recovery in Step 1 506ms
   ✓ real prompt sources (10)
     ✓ audit agent gets only the chosen tracker's comment and search tools 311ms
   ✓ issue-scan call sites (#135) (12)
     ✓ bkit-design wires a github scan whose hits the engine reads 338ms
     ✓ bkit-design wires a linear scan whose hits the engine reads 379ms
     ✓ bkit-design wires a jira scan whose hits the engine reads 493ms
     ✓ bkit-plan wires a github scan whose hits the engine reads 367ms
     ✓ bkit-plan wires a linear scan whose hits the engine reads 379ms
     ✓ bkit-plan wires a jira scan whose hits the engine reads 541ms
     ✓ bkit-debug wires a github scan whose hits the engine reads 524ms
     ✓ bkit-debug wires a linear scan whose hits the engine reads 665ms
     ✓ bkit-debug wires a jira scan whose hits the engine reads 610ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 78ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 17ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 170ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 68ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 110ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 72ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 35ms
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

 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 32ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 46ms
(node:15276) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:15276) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 41ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 49ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (68 tests) 239ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 43ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 14ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 39ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 60ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 13ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 63ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 146ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 17ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 13ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794133899867.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794133899869.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794133899869.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794133899874.js — skipping

 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 17ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 16ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 17ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 29ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 86655ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 708ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 311ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 326ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 342ms
       ✓ counts subagents of an earlier chat the run's session rows name 342ms
       ✓ records no context block, and still closes, outside a Claude Code session 383ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 412ms
     ✓ records ending held and publish false on the workflow-done row 376ms
     ✓ defaults the close row to ending done 367ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 374ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 469ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 405ms
     ✓ always writes the telemetry, whatever the runtime 427ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 378ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 399ms
     ✓ an unwritable stats path is logged and never fails the close 461ms
     ✓ appends the completeness row before the workflow-done row 426ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 417ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 465ms
     ✓ writes one completeness row per close 601ms
     ✓ leaves out the previous run's rows that share a second with this run's start 378ms
     ✓ still closes when the completeness check throws 444ms
     ✓ still closes when the completeness row write throws 429ms
     ✓ ship: run.pr, size of the squash commit, and coverage 543ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 697ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 459ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 360ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 486ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 423ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 562ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 467ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 519ms
     ✓ --record-step writes the close step's row before workflow-done 309ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 360ms
     ✓ --number without --outbox is a usage error 312ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 519ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 552ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 705ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 677ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 479ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1745ms
     ✓ --flush with nothing to record commits and pushes nothing 867ms
     ✓ --flush carries the named worktree's logs into the dev commit 1491ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1987ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1797ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2533ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1738ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1947ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1587ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1634ms
     ✓ --push on dev never carries a row whose references name another feature 1717ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1601ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2826ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2473ms
     ✓ --push commits in the named worktree, not the checkout it runs from 799ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2770ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2010ms
     ✓ a close that landed releases the lock 2693ms
     ✓ removes the worktree before it releases the lock 2363ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3481ms
       ✓ closePr refuses when the PR base is unknown 2731ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1986ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 326ms
     ✓ names the branch, not the remote-tracking ref, in each URL 313ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 781ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 389ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1114ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 512ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 525ms
     ✓ a second run's record does not let this FID's close commit 604ms
     ✓ record is present after workflows close and before the push 1119ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1999ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 437ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 421ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 808ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 690ms
     ✓ puts each --line after the summary, in flag order 658ms
     ✓ --summary prints the file and keeps a copy in --outbox 702ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 634ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 53ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 36ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 24ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 4ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (259 tests) 134212ms
   ✓ bkit branches parse (2)
     ✓ rejects missing explicit and ambiguous existing branch selections 318ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 429ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 487ms
     ✓ --file records nothing for a refused rebase 312ms
     ✓ refuses a code conflict and aborts the rebase on the spot 322ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 883ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 379ms
     ✓ produces byte-identical output to merge=union 676ms
     ✓ restores a trailing newline so the next append starts on its own line 432ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 433ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 491ms
     ✓ refuses a union that leaves a line which is not JSON 337ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 423ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1102ms
     ✓ refuses a lockfile whose regenerate command fails 789ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 651ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 639ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 572ms
     ✓ refuses and aborts when both sides changed the hand-written region 362ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 515ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 593ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 756ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 468ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 534ms
     ✓ refuses and aborts when a side deleted the install record 407ms
     ✓ refuses a conflicted doc the repo's script does not list 397ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 364ms
     ✓ removes a stale sentinel when the rebase succeeds 415ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 680ms
     ✓ resolves a conflict in each of two replayed commits across rounds 571ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 338ms
       ✓ skips (12) when the base is unreachable in this clone 386ms
       ✓ skips (12) when nothing landed since the base 329ms
       ✓ runs (0) with the landed path count once dev moved 559ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 621ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 392ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 552ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1177ms
     ✓ runs exactly one git push 939ms
     ✓ --set-upstream records the upstream 499ms
     ✓ refuses with no branch checked out 466ms
     ✓ --mode=dev refuses a feature checkout 392ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 975ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1597ms
     ✓ --require-ci pushes as-is when dev has not moved 712ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1194ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1577ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 430ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1168ms
     ✓ --mode=abort pushes when the branch has no open PR 860ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 615ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 467ms
     ✓ --open-pr carries the MCP answer and skips gh 626ms
     ✓ --mode=abort on dev pushes plainly without probing 637ms
     ✓ rejects an unknown mode 593ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1833ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 919ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1042ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2171ms
     ✓ skip-ci HEAD on the replay is refused 718ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1739ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2357ms
     ✓ a level local dev is a plain push, recording nothing extra 816ms
     ✓ a record with no commits pushes nothing 603ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 431ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1144ms
     ✓ a rewritten branch is refused, never forced 637ms
     ✓ refuses dev and main with exit 21 and pushes nothing 367ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 794ms
     ✓ refuses a detached HEAD (exit 5) 424ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 840ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1094ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1327ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1372ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 567ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1214ms
     ✓ an up-to-date branch is a no-op 989ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1176ms
     ✓ a fetch that fails exits 10 511ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 669ms
     ✓ scan-diff still reports a new skip when its test … 626ms
     ✓ scan-diff reports a skip moved onto a different t… 828ms
     ✓ scan-diff does not cancel a skip moved between am… 636ms
     ✓ scan-diff does not spend an unchanged duplicate t… 633ms
     ✓ scan-diff recognizes a renamed test file 540ms
     ✓ scan-diff recognizes a suite moved into a differe… 538ms
     ✓ scan-diff does not let unrelated additions hide a… 509ms
     ✓ scan-diff attributes deletion to its old test ins… 583ms
     ✓ scan-diff consumes each moved assertion once and … 560ms
     ✓ scan-diff does not match identical assertions fro… 779ms
     ✓ scan-diff does not match the same leaf test name … 697ms
     ✓ scan-diff does not match a same-named test with d… 574ms
     ✓ scan-diff does not match a same-named test with c… 640ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 627ms
     ✓ --paths with no match exits 1 534ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 403ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 802ms
     ✓ --marker reads a diff over 1 MiB 652ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 734ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 667ms
     ✓ scan-diff finds an added skip 676ms
     ✓ scan-diff ignores a skip predating the base 600ms
     ✓ scan-diff reports a disabled test with its line 677ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 658ms
     ✓ scan-diff ignores a removed comment in a test file 617ms
     ✓ scan-diff ignores an assertion moved within the file 612ms
     ✓ scan-diff still reports a removed assertion 631ms
     ✓ scan-diff reports an assertion re-added only outside the test file 629ms
     ✓ scan-diff finds an added pytest mark skip 675ms
     ✓ scan-diff finds an added unittest skip 624ms
     ✓ scan-diff finds an added bare skip call 628ms
     ✓ scan-diff ignores a quoted skip in a documentation file 606ms
     ✓ scan-diff ignores a marker literal in a non-test source file 617ms
     ✓ scan-diff ignores an assertion whose expectation changed 640ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 669ms
     ✓ scan-diff reports a deleted test file 654ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 482ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1425ms
     ✓ a title that already carries the marker is left alone 1030ms
     ✓ with no open PR: pushes the marker commit and edits no title 1059ms
     ✓ a re-run is deduped: no second marker commit 894ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 620ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 352ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 351ms
     ✓ --merge-docs merges dev when docs/ is behind 424ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 409ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 591ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 616ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 480ms
     ✓ --merge-docs skips an empty bkit:generate script 426ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 370ms
     ✓ --merge-docs never merges on dev itself 332ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 483ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 493ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 455ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 476ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 608ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 660ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 753ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 698ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 612ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 804ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 592ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 669ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 436ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 315ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 403ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 601ms
     ✓ a failed install stops ship (16) 547ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 416ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 388ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 961ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 955ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 948ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 960ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1971ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2358ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 371ms
     ✓ local: names unpushed dev as the cause when the branch carries it 425ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 452ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1742ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1146ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 901ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 910ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1022ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1059ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 660ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1160ms
     ✓ land removes the worktree when only the copied .env is untracked 989ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 885ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 933ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1552ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 953ms
     ✓ landPr refuses a main-based PR without retrying 540ms
     ✓ landPr refuses when the PR base is unknown 530ms
     ✓ PR not open (closed): stops (17) at once, no retry 647ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 391ms
     ✓ --attempt names the merge round in a fix commit 353ms
     ✓ commits a rewritten and a deleted tracked file 367ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 314ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 329ms

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts
Error: Hook timed out in 11800ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:124:3
    122|
    123| describe("rendered workflow comment contracts", () => {
    124|   beforeAll(() => {
       |   ^
    125|     renderedReportingWorkflows();
    126|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 172 passed (173)
      Tests  7337 passed | 6 skipped (7343)
   Start at  20:30:13
   Duration  134.83s (tests 94%, setup 2%, import 2%, worker 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/719-cloud-variants-add/run-tests-1.log.reports/vitest-21900.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.79 |    83.34 |   95.06 |   91.14 |                   
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
 ...mands/workflow |   92.29 |    84.64 |   96.29 |   93.74 |                   
  branches.ts      |   90.28 |    83.51 |   98.22 |   92.02 | ...3018,3043,3186 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   92.09 |    87.28 |   92.59 |   94.03 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.48 |    84.05 |    99.1 |   92.56 | ...2403,2435-2439 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 245,356           
  steps.ts         |   89.89 |    83.02 |   90.82 |   91.09 | ...1960,1965,1967 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...93-499,511,534 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.87 |    59.85 |   66.66 |   62.87 | ...1107,1110-1111 
 engine/install    |   93.11 |    84.57 |   94.15 |   95.87 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.76 |    93.52 |   98.93 |   97.35 |                   
  status.ts        |   98.52 |    98.31 |     100 |     100 | 122,153,266       
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
Statements   : 89.79% ( 18892/21039 )
Branches     : 83.34% ( 14107/16927 )
Functions    : 95.06% ( 3043/3201 )
Lines        : 91.14% ( 16562/18172 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1670 of 3203 lines (117 KB of 247 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
