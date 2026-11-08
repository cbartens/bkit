
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 353:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 361:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 504:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 626:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 699:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> bkit ci slop

[bkit-ci] base 9fa6e8e6a5cfda93a7227c840a1add7b6af3f8a3 (9fa6e8e6a5cfda93a7227c840a1add7b6af3f8a3) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 9fa6e8e6a5cfda93a7227c840a1add7b6af3f8a3
base: 9fa6e8e6a5cfda93a7227c840a1add7b6af3f8a3
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 1.9 on 10 cores: unit limits 5450ms per test, 10900ms per hook (x1.09)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (100 tests) 22047ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 681ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 403ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 532ms
     ✓ seals unavailable or unstable representation evidence 685ms
     ✓ uses accepted final preflight eligibility without provider atomicity 366ms
     ✓ rejects marker preserving external edits 759ms
     ✓ preserves generated first line and extracts versioned h6 section markers 628ms
     ✓ returns owned comment identity and stable representation evidence 604ms
     ✓ selects newest created comment across complete pages 407ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 398ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 437ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 462ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 551ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1146ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 449ms
     ✓ fetches the issue and its comments as GitHub returns them 517ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 305ms
     ✓ keeps original body identity separate from time and changed output 473ms
     ✓ reuses matching invocation state without adopting foreign ownership 346ms
     ✓ invalidates missing corrupt and unsupported progress cache 636ms
     ✓ contains cache read and write failures as standalone degradation 423ms
     ✓ uses legacy receipts and contains receipt failures 501ms
     ✓ records an engine-action row and skips the same key + body on a re-run 601ms
     ✓ a recent identical comment counts as done (the final close comment) 738ms
     ✓ a failed post reports done false with the reason and never leaks a token 450ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 831ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 649ms
     ✓ a board the token cannot see is scope 426ms
     ✓ an HTTP 403 from gh is scope 347ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 443ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 368ms
     ✓ a different marker hash posts 690ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 769ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 22485ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 586ms
     ✓ runs code.ts through its declared gate in the built checkout 648ms
     ✓ runs code.ts through its declared gate in the built checkout 891ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 630ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 559ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 615ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 330ms
     ✓ runs the full gate for replayed debug code 660ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 626ms
     ✓ installs local dependencies against the built target tree 643ms
     ✓ runs the configured frozen install even without root dependencies 605ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 696ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 675ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 718ms
     ✓ never pushes local dev commits missing from origin/dev 673ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1153ms
     ✓ dev moved before every push: exhausted, nothing landed 2089ms
     ✓ any other refusal is returned, not retried 1347ms
     ✓ pushToDev replays a commit range onto origin/dev 774ms
     ✓ a replay retries on the new dev when dev moved 1265ms
     ✓ pushToDev log line names what it lands 640ms
     ✓ runs no git hooks in the throwaway checkout, and says so 641ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 675ms
     ✓ a push that fails without a server answer is returned once, never retried 615ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1421ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 933ms
     ✓ lands from a clone whose fetch refspec omits dev 821ms
     ✓ build throwing stops the landing and removes the throwaway checkout 333ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 22681ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 756ms
     ✓ names each net-new and worsened finding in the log and the JSON 838ms
     ✓ fails on a net score rise with no net count change 556ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1137ms
     ✓ treats a net score at or below 0.001 as float noise 318ms
     ✓ passes when the change only resolves findings 634ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 798ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 886ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 570ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 542ms
     ✓ exits 4 on a dropped net field instead of silently passing 439ms
     ✓ exits 4 on no summary instead of silently passing 663ms
     ✓ exits 4 on output that is not JSON instead of silently passing 455ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1157ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 475ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 445ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 495ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 530ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1509ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 557ms
     ✓ explicit globs can select ignored prose and nested checkout files 654ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 639ms
     ✓ fails (exit 1) when vale reports alerts 450ms
     ✓ exits 6 on a vale runtime error 789ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 700ms
     ✓ falls back to vale sync when the main worktree has none 466ms
     ✓ fails when vale sync cannot restore the required styles 332ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 319ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 27306ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 410ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1112ms
     ✓ always writes the marker, even with no plan 420ms
     ✓ writes the linear marker shape, taking the tracker from package.json 841ms
     ✓ writes the jira marker shape, taking the tracker from package.json 641ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 317ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 644ms
     ✓ retries a failed create once, and exits 5 when it fails twice 794ms
     ✓ exits 5 when the open-PR probe errors 591ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 554ms
     ✓ prs open still opens against any other base 509ms
     ✓ exits 6 when the created PR's base is not --base 443ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 569ms
     ✓ exits 1 with found=false when there is none 538ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1177ms
     ✓ --number reads one PR, mergeable included 419ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 497ms
     ✓ exits 4 when gh errors and 80 when it needs auth 562ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 598ms
     ✓ drops the force-build marker from the title subject 474ms
     ✓ takes an explicit --subject 522ms
     ✓ runs no merge when the PR is already MERGED 654ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 414ms
     ✓ prs merge refuses a PR whose base is main 709ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 799ms
     ✓ prs merge refuses when the PR base is unknown 755ms
     ✓ prs merge reads the base from the one pr view it already makes 347ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 476ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 487ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ updates when a dev ruleset requires status checks 576ms
     ✓ updates when dev's branch protection requires status checks 674ms
     ✓ ignores dev rulesets that require no checks 678ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 488ms
     ✓ is not green when a check failed, naming it (exit 1) 395ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 406ms
     ✓ is not green on an empty rollup (total 0) 355ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 375ms
   ✓ bkit prs verbose-ci (4)
     ✓ is a no-op when the title already says so 545ms
     ✓ strips the marker, with or without its bkit prefix 542ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 378ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 31148ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1241ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 889ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 623ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 324ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 637ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 566ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 664ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 594ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 355ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 542ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 468ms
     ✓ PASS is 0 failures with or without reports 465ms
     ✓ clears a previous attempt's reports before the gate runs 499ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 453ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 487ms
     ✓ a log under the outbox is named main-checkout relative in the record 1149ms
     ✓ a log small enough is copied whole: not clamped, raw null 415ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 503ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 488ms
     ✓ numbers runs within the workflow's active run and per step 309ms
     ✓ without --file no row is written and the output carries row null 530ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 593ms
     ✓ a planned test that passes is a vacuous gap, exit 1 723ms
     ✓ a planned test absent from a loaded report is a missing gap 807ms
     ✓ a file that fails to load is a red of kind red-not-loaded 834ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 557ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 826ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 440ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 486ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1217ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 765ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 772ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 566ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 637ms
     ✓ green: a passed-accepted test is already landed, not a gap 349ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 339ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 631ms
     ✓ green: --group audits only that group's tasks 453ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 520ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 572ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 856ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 701ms
     ✓ green: lists each gap kind, with the runner output 685ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 800ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 32687ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 16670ms
     ✓ sync has nothing left to rewrite 11582ms
     ✓ every clause reaches the cut-off of one surface it applies to 1787ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 2251ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 12653ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 477ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 528ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 386ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 382ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 332ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 412ms
     ✓ counts commits behind origin/dev and the divergence age 648ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 448ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 462ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ from a worktree, still names the main checkout and its outbox 370ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 430ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 702ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 852ms
     ✓ prints the Jira site and project under jira 386ms
     ✓ prints nulls under github without a board, and for keys left unset 427ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ an unknown newest release (remembered registry failure) is null, never an error 436ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 12581ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 500ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 421ms
     ✓ a recorded ledger commits only the rows the run appended 312ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 708ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 839ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 327ms
     ✓ under --mode=commit counts the squashed paths as something to commit 337ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (185 tests) 37923ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1269ms
   ✓ preserves the requested event for selected-workflow verification 720ms
   ✓ requires selected other-workflow success at the exact pushed head 1732ms
   ✓ bkit runs locate (11)
     ✓ locates CI evidence using prompt saved issue and local precedence 1621ms
     ✓ filters branch and PR discovery by configured workflow and exact head 835ms
     ✓ freezes explicit workflow run attempt and all failed job pages 539ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 963ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1430ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 1146ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 447ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 453ms
     ✓ rejects a workflow result count smaller than its returned records 514ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 733ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 775ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1177ms
   ✓ bkit runs dispatch (16)
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 392ms
     ✓ a failed re-trigger push names the cause in the log 844ms
     ✓ a failed re-trigger push leaves no orphan commit behind 944ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 641ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 422ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 355ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 396ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 416ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 438ms
     ✓ CLI: verdict JSON, body scan, exit codes 355ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 605ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1378ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1413ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1690ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 338ms
     ✓ re-trigger on dev only uses the record of its own FID 388ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 394ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 416ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 400ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 311ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 7160ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 445ms
     ✓ LOCAL -> runtimeHeadless=false 435ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 431ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 12945ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ design and plan in place on main are refused 371ms
     ✓ refuses a detached HEAD 384ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 557ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 523ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 426ms
     ✓ a new run of the same FID rewrites startSha 728ms
     ✓ a resume of the same FID reuses the record 681ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 386ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 465ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 516ms
     ✓ a stale record without a lock is replaced 585ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 442ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 374ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 357ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 503ms
[feat/test b4cbbe4] gate
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 6500ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 844ms
     ✓ follows summary cursors even when the first page is shorter than the limit 323ms
     ✓ reports excluded intervals as unread even when pagination finishes 404ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 378ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 328ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 302ms
     ✓ reports a failed commit with exit 8 without writing the row 648ms
     ✓ a failed commit leaves no row staged in the index 477ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 598ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 353ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 773ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 697ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1007ms
   ✓ bkit steps finish (16)
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 348ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 12624ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 1416ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1292ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1353ms
     ✓ does not fall back through a malformed later success receipt 811ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 576ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 526ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 813ms
     ✓ requires proof even when the pushed increment changes no files 443ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 324ms
     ✓ does not record a committed tree 356ms
     ✓ records no proof for a failed gate or lighter gate 538ms
     ✓ requires integration proof when integration is declared 671ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 973ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 6032ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ never touches the main checkout and never pushes its local dev commits 874ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 856ms
     ✓ a refused dev push is logged, never fails the close 1048ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 5149ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 3868ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
(node:74696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:74696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests | 1 failed) 10035ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 3ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ flags an expired, over-long or stale acceptance 0ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 182ms
     ✓ rejects an --unreachable value that is neither fail nor warn 43ms
   ❯ shipped copy-and-own test files (6)
     ✓ finds the shipped .test.mjs files 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 256ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 49ms
     × ci/bkit-test-awake.test.mjs passes when run on its own 4397ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 4490ms
   ✓ capstone env wiring checks (3)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 3168ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1313ms
     ✓ runGit names ENOBUFS when output passes the limit 555ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 657ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 528ms
     ✓ counts files committed since --base 444ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 349ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 374ms
     ✓ runs the --fallback gate even when no file changed, as it did before 579ms
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
     ✓ ship: run.pr, size of the squash commit, and coverage 310ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 468ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 325ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 354ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ handover --push commits the record when a copy entry points outside the checkout 346ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 357ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 863ms
     ✓ --flush with nothing to record commits and pushes nothing 462ms
     ✓ --flush carries the named worktree's logs into the dev commit 1044ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1379ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1205ms
     ✓ a close that landed releases the lock 1232ms
     ✓ removes the worktree before it releases the lock 1409ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 1670ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1077ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 423ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 626ms
     ✓ a second run's record does not let this FID's close commit 320ms
     ✓ record is present after workflows close and before the push 629ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1216ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 492ms
> [bkit] TRUNCATED HERE — 943 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (60 tests) 331ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 168ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 203ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 357ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 193ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 121ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 269ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 119ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 183ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 47ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 166ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 117ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 50ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 61ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 104ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 45ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 112ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 72ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 129ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 41ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 163ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 76ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 61ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 110ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 49ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-aAv6M2/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 67ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (57 tests) 80ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 65ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 65ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 39ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 45ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-Pg6Joo/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 45ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 39ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 71ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 26ms
(node:65135) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:65135) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (68 tests | 1 failed) 78ms
   ❯ this repo adopts its own templates (68)
     ✓ every template has an entry, and every entry is a template 4ms
     ✓ .github/workflows/bkit-health.yml 0ms
     ✓ .github/dependabot.yml 0ms
     ✓ scripts/ci/bkit-check-accepted-divergences.mjs 0ms
     ✓ scripts/ci/bkit-check-accepted-divergences.test.mjs 0ms
     ✓ scripts/ci/bkit-accepted-divergences.json 0ms
     ✓ scripts/cleanup/bkit-disk-prune.machine.mjs 0ms
     ✓ scripts/launchd/bkit-launchd.plist 0ms
     ✓ scripts/launchd/bkit-launchd.env.example 0ms
     ✓ docs/capabilities.md 0ms
     ✓ .claude/hooks/bkit-cloud-bootstrap.sh 1ms
     ✓ .github/workflows/bkit-ci.yml 3ms
     ✓ .github/renovate.json5 1ms
     ✓ .github/ISSUE_TEMPLATE/bkit-idea.yml 0ms
     ✓ .github/ISSUE_TEMPLATE/bkit-change.yml 0ms
     ✓ .github/ISSUE_TEMPLATE/bkit-bug.yml 0ms
     ✓ .husky/pre-commit 0ms
     ✓ .husky/pre-push 0ms
     ✓ .prettierignore 0ms
     ✓ .lintstagedrc.json 0ms
     ✓ .oxlintrc.json 0ms
     ✓ scripts/ci/lanes/bkit-resolve-push-base.mjs 0ms
     ✓ scripts/ci/lanes/bkit-resolve-push-base.test.mjs 0ms
     ✓ scripts/ci/bkit-machine-lock.sh 0ms
     ✓ scripts/ci/bkit-test-awake.mjs 0ms
     × scripts/ci/bkit-test-awake.test.mjs 9ms
     ✓ scripts/ci/bkit-check-capstone.mjs 0ms
     ✓ scripts/ci/bkit-check-capstone.test.mjs 0ms
     ✓ scripts/ci/bkit-check-dependency-audit.mjs 0ms
     ✓ scripts/ci/bkit-check-dependency-audit.test.mjs 0ms
     ✓ scripts/ci/bkit-accepted-advisories.json 0ms
     ✓ .vale.ini 0ms
     ✓ .vale/styles/Bkit/Filler.yml 0ms
     ✓ .vale/styles/Bkit/Hedging.yml 0ms
     ✓ .vale/styles/Bkit/LLMSlop.yml 0ms
     ✓ .vale/styles/Bkit/Verbose.yml 0ms
     ✓ slop-scan.config.json 0ms
     ✓ .envrc 0ms
     ✓ .cursor/settings.json 0ms
     ✓ .cursor/environment.json 0ms
     ✓ .cursor/Dockerfile 0ms
     ✓ .graphifyignore 0ms
     ✓ .serena/project.yml 0ms
     ✓ scripts/graphify/bkit-graph-drift-rules.json 0ms
     ✓ scripts/graphify/bkit-graph-external-rules.json 0ms
     ✓ scripts/graphify/bkit-graph-drift.py 0ms
     ✓ scripts/graphify/bkit-graph-eager.py 0ms
     ✓ scripts/graphify/bkit-graph-imports.py 0ms
     ✓ scripts/graphify/bkit-graph-eager-rules.json 0ms
     ✓ scripts/graphify/bkit-graph-embed.py 0ms
     ✓ scripts/graphify/bkit-graph-pre-push.sh 0ms
     ✓ scripts/graphify/bkit-graph-repair.py 0ms
     ✓ scripts/graphify/bkit-graph-surface.py 8ms
     ✓ scripts/graphify/bkit-graphify-graphml.py 0ms
     ✓ scripts/cleanup/bkit-disk-prune.mjs 0ms
     ✓ scripts/cleanup/bkit-tmp-prune.mjs 0ms
     ✓ scripts/prettier/bkit-insert-ignore.mjs 1ms
     ✓ scripts/secrets/bkit-secrets.mjs 1ms
     ✓ scripts/secrets/bkit-secrets.config.mjs 0ms
     ✓ scripts/slop/bkit-slop-type-suppression.mjs 0ms
     ✓ scripts/serena/bkit-serena-mcp.sh 0ms
     ✓ scripts/serena/bkit-serena.mcp.json 0ms
     ✓ scripts/launchd/bkit-launchd-env.sh 0ms
     ✓ scripts/graphify/bkit-graphify.sh 1ms
     ✓ scripts/graphify/bkit-graphify-rollup.py 1ms
     ✓ .github/workflows/bkit-cloud.yml 29ms
     ✓ .github/workflows/bkit-renovate.yml 2ms
     ✓ .github/workflows/bkit-trivy.yml 2ms
(node:65399) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:65399) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:65399) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:65399) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 34ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 14ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 43ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 43ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 49ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 50ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 44ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 28ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 60ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 40ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 60ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 49ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 16ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 58ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 18ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 24ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 17ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794097354433.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794097354435.md (end before start) — skipping

 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 9ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794097354436.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794097354442.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 21ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 13ms
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

 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (40 tests) 22ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 24ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 21ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 24ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 23ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 14ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 9ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 14ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 6ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 4ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 5ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 3ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 3ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 3ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 2ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (259 tests) 97576ms
   ✓ branches rebase: behaviour (30)
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 926ms
     ✓ produces byte-identical output to merge=union 447ms
     ✓ restores a trailing newline so the next append starts on its own line 330ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 306ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 409ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 310ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 965ms
     ✓ refuses a lockfile whose regenerate command fails 715ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 388ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 479ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 409ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 318ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 481ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 320ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 414ms
     ✓ resolves a conflict in each of two replayed commits across rounds 330ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ runs (0) with the landed path count once dev moved 448ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 445ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 386ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 995ms
     ✓ runs exactly one git push 829ms
     ✓ --set-upstream records the upstream 320ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 555ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 864ms
     ✓ --require-ci pushes as-is when dev has not moved 356ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 897ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1214ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 347ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1086ms
     ✓ --mode=abort pushes when the branch has no open PR 557ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 729ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 348ms
     ✓ --open-pr carries the MCP answer and skips gh 416ms
     ✓ --mode=abort on dev pushes plainly without probing 366ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1070ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 604ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 788ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2860ms
     ✓ skip-ci HEAD on the replay is refused 528ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1282ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1760ms
     ✓ a level local dev is a plain push, recording nothing extra 588ms
     ✓ a record with no commits pushes nothing 457ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 354ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 821ms
     ✓ a rewritten branch is refused, never forced 463ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 826ms
     ✓ refuses a detached HEAD (exit 5) 317ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 599ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 574ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 570ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 814ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 316ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 713ms
     ✓ an up-to-date branch is a no-op 467ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 662ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 368ms
     ✓ scan-diff still reports a new skip when its test … 388ms
     ✓ scan-diff reports a skip moved onto a different t… 365ms
     ✓ scan-diff does not cancel a skip moved between am… 369ms
     ✓ scan-diff does not spend an unchanged duplicate t… 361ms
     ✓ scan-diff recognizes a renamed test file 366ms
     ✓ scan-diff recognizes a suite moved into a differe… 352ms
     ✓ scan-diff does not let unrelated additions hide a… 344ms
     ✓ scan-diff attributes deletion to its old test ins… 361ms
     ✓ scan-diff consumes each moved assertion once and … 346ms
     ✓ scan-diff does not match identical assertions fro… 346ms
     ✓ scan-diff does not match the same leaf test name … 361ms
     ✓ scan-diff does not match a same-named test with d… 437ms
     ✓ scan-diff does not match a same-named test with c… 356ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 414ms
     ✓ --paths with no match exits 1 320ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 492ms
     ✓ --marker reads a diff over 1 MiB 461ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 540ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 409ms
     ✓ scan-diff finds an added skip 389ms
     ✓ scan-diff ignores a skip predating the base 447ms
     ✓ scan-diff reports a disabled test with its line 445ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 440ms
     ✓ scan-diff ignores a removed comment in a test file 422ms
     ✓ scan-diff ignores an assertion moved within the file 400ms
     ✓ scan-diff still reports a removed assertion 444ms
     ✓ scan-diff reports an assertion re-added only outside the test file 388ms
     ✓ scan-diff finds an added pytest mark skip 457ms
     ✓ scan-diff finds an added unittest skip 420ms
     ✓ scan-diff finds an added bare skip call 476ms
     ✓ scan-diff ignores a quoted skip in a documentation file 438ms
     ✓ scan-diff ignores a marker literal in a non-test source file 465ms
     ✓ scan-diff ignores an assertion whose expectation changed 469ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 623ms
     ✓ scan-diff reports a deleted test file 468ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 342ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1022ms
     ✓ a title that already carries the marker is left alone 550ms
     ✓ with no open PR: pushes the marker commit and edits no title 398ms
     ✓ a re-run is deduped: no second marker commit 454ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 504ms
   ✓ branches sync (28)
     ✓ --merge-docs merges dev when docs/ is behind 309ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 303ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 438ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 438ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 366ms
     ✓ --merge-docs skips an empty bkit:generate script 321ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 364ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 360ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 335ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 341ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 443ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 545ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 525ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 509ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 467ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 568ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 425ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 497ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 328ms
   ✓ branches sync-dev (6)
     ✓ on dev: moves the checkout too, and installs only because dev moved 485ms
     ✓ a failed install stops ship (16) 433ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 312ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 317ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 709ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 894ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 758ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 777ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1698ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2465ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 328ms
     ✓ local: names unpushed dev as the cause when the branch carries it 406ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 640ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1170ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 959ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 767ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 757ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 846ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 803ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 609ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 862ms
     ✓ land removes the worktree when only the copied .env is untracked 739ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 677ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 672ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1615ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 695ms
     ✓ landPr refuses a main-based PR without retrying 491ms
     ✓ landPr refuses when the PR base is unknown 494ms
     ✓ PR not open (closed): stops (17) at once, no retry 574ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 336ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > scripts/ci/bkit-test-awake.test.mjs
AssertionError: expected '// Example. Copy into scripts/ci/ and…' to be '// Example. Copy into scripts/ci/ and…' // Object.is equality

- Expected
+ Received

@@ -119,66 +119,10 @@
        },
      );
    }
  }

- test(
-   "shell cancellation reads complete readiness JSON when publication is interrupted",
-   { skip: process.platform === "win32", timeout: 12000 },
-   (t) => {
-     const base = resolve("tmp");
-     mkdirSync(base, { recursive: true });
-     const dir = mkdtempSync(join(base, "awake-publish-"));
-     t.after(() => rmSync(dir, { recursive: true, force: true }));
-     const preload = join(dir, "pause-publication.cjs");
-     const receipt = join(dir, "publication-observed");
-     writeFileSync(
-       preload,
-       `
-       if (process.argv[1]?.endsWith("worker.cjs")) {
-         const fs = require("node:fs");
-         const writeFileSync = fs.writeFileSync;
-         fs.writeFileSync = function (file, data, ...options) {
-           if (typeof data !== "string" || !data.startsWith('{"pid":'))
-             return writeFileSync.call(this, file, data, ...options);
-           const fd = fs.openSync(file, "w");
-           try {
-             writeFileSync(${JSON.stringify(receipt)}, "paused");
-             Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
-             writeFileSync(fd, data, ...options);
-           } finally {
-             fs.closeSync(fd);
-           }
-         };
-       }
-     `,
-     );
-     const result = spawnSync(
-       process.execPath,
-       [
-         "--test",
-         "--test-name-pattern=^shell cancellation waits for SIGTERM cleanup$",
-         fileURLToPath(import.meta.url),
-       ],
-       {
-         encoding: "utf8",
-         env: {
-           ...process.env,
-           NODE_TEST_CONTEXT: undefined,
-           NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --require=${JSON.stringify(preload)}`,
-         },
-       },
-     );
-     assert.equal(
-       existsSync(receipt),
-       true,
-       `the worker must pause after opening its JSON file\n${result.stdout}${result.stderr}`,
-     );
-     assert.equal(result.status, 0, result.stdout + result.stderr);
-   },
- );
-
  test(
    "shell cancellation follows a worker orphaned by a nested shell",
    {
      skip: process.platform === "win32",
      timeout: 12000,

 ❯ expectCopyMatchesTemplate .bkit/core/engine/audits/repo/dogfood-templates.test.ts:808:18
    806|     const applied = apply(template, copy, entry.edits, rel);
    807|     expect(applied.problems).toEqual([]);
    808|     expect(copy).toBe(applied.text);
       |                  ^
    809|     return { template, copy };
    810|   }
 ❯ .bkit/core/engine/audits/repo/dogfood-templates.test.ts:814:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own
AssertionError: ✔ direct cancellation waits for SIGTERM cleanup (172.583166ms)
✔ shell cancellation waits for SIGTERM cleanup (232.341833ms)
✔ direct cancellation waits for SIGINT cleanup (143.532375ms)
✔ shell cancellation waits for SIGINT cleanup (236.948917ms)
✔ direct cancellation waits for SIGHUP cleanup (146.649959ms)
✔ shell cancellation waits for SIGHUP cleanup (235.116209ms)
✖ shell cancellation reads complete readiness JSON when publication is interrupted (194.537583ms)
✔ shell cancellation follows a worker orphaned by a nested shell (311.34ms)
✔ direct cancellation preserves a nested machine-lock owner (545.061333ms)
✔ shell cancellation preserves a nested machine-lock owner (645.652584ms)
✔ nested shell cancellation preserves a nested machine-lock owner (659.646833ms)
✔ a hard process-group timeout reaches a shell command during cleanup (129.933167ms)
✔ ships a command-scoped sleep prevention wrapper (0.085625ms)
✔ preserves arguments, output and nonzero exit status (73.479ms)
✔ runs an entire shell chain and retains its failure (44.754292ms)
✔ reports a missing command as 127 (53.891708ms)
✔ requires a command (43.778958ms)
✔ non-macOS platform selection runs commands without sleep prevention (80.904542ms)
✔ hard timeout escalation reaches a command that ignores TERM (200.523667ms)
✔ forwards POSIX cancellation to the command and releases the assertion (69.647417ms)
✔ holds a real macOS assertion only while the command runs (121.30975ms)
ℹ tests 21
ℹ suites 0
ℹ pass 20
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4348.123917

✖ failing tests:

test at .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:124:1
✖ shell cancellation reads complete readiness JSON when publication is interrupted (194.537583ms)
  AssertionError [ERR_ASSERTION]: ✖ shell cancellation waits for SIGTERM cleanup (91.294041ms)
  ℹ tests 1
  ℹ suites 0
  ℹ pass 0
  ℹ fail 1
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 151.384
  
  ✖ failing tests:
  
  test at .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:89:5
  ✖ shell cancellation waits for SIGTERM cleanup (91.294041ms)
    SyntaxError: Unexpected end of JSON input
        at JSON.parse (<anonymous>)
        at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:105:30)
        at async Test.run (node:internal/test_runner/test:1313:7)
        at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3)
  
  
  1 !== 0
  
      at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/826-append-routine-workflow/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:176:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1306:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:897:18)
      at Test.postRun (node:internal/test_runner/test:1447:19)
      at Test.run (node:internal/test_runner/test:1372:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: 1,
    expected: 0,
    operator: 'strictEqual',
    diff: 'simple'
  }
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ TestContext.<anonymous> .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:105:30
 ❯ TestContext.<anonymous> .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:176:12
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:134:49
    132|       encoding: "utf-8",
    133|     });
    134|     expect(res.status, res.stdout + res.stderr).toBe(0);
       |                                                 ^
    135|   });
    136| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 171 passed (173)
      Tests  2 failed | 7325 passed | 2 skipped (7329)
   Start at  10:21:35
   Duration  98.27s (tests 97%, import 2%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/826-append-routine-workflow/context-tests-local-1.log.reports/vitest-86101.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.78 |    83.29 |   95.09 |   91.12 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.47 |     85.6 |   95.19 |   94.36 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   93.15 |    88.61 |     100 |    94.4 | ...76-277,405-407 
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
 ...mmands/install |   47.86 |    45.74 |   58.75 |   48.22 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |    92.3 |    84.61 |   96.34 |   93.75 |                   
  branches.ts      |   90.28 |    83.51 |   98.22 |   92.02 | ...3018,3043,3186 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1057,1072-1082 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.22 |    86.44 |   96.29 |   95.36 | ...04-305,474-475 
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
  tests-changed.ts |   92.95 |     75.8 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   88.96 |    80.47 |   96.66 |   91.07 | ...2080,2106-2111 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.87 |    59.85 |   66.66 |   62.87 | ...1107,1110-1111 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
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
 engine/tools      |   89.92 |    85.46 |   95.47 |   90.53 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.64 |    85.96 |   95.62 |    91.4 | ...1713-1795,1800 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.78% ( 18834/20977 )
Branches     : 83.29% ( 14036/16850 )
Functions    : 95.09% ( 3043/3200 )
Lines        : 91.12% ( 16505/18112 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1679 of 3201 lines (109 KB of 239 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
