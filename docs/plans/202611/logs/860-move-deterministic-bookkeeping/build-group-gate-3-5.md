
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 5 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 7 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 78873, since 14:13:10), last run took 12m11s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 15.5 on 10 cores: unit limits 12250ms per test, 24500ms per hook (x2.45)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 47356ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 348ms
     ✓ continues after friction and diagnostic writes fail without recursion 386ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 657ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 4128ms
   ✓ routine publication policy (8)
     ✓ creates then appends routine sections under explicit invocation ownership 493ms
     ✓ deduplicates known reports using available receipts and bounded markers 510ms
     ✓ appends changed report versions without replacing prior text 420ms
     ✓ classifies attention and terminal reports from structured purpose 402ms
     ✓ rolls over after intervening comments external edits and deletion 478ms
     ✓ starts only new source after overflow or missing source 453ms
     ✓ uses exact new comment after a failed eligibility read 306ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 455ms
     ✓ contains exhausted append and create failures without fabricated success 493ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 444ms
     ✓ reserves new comment opportunity within total delivery budget 901ms
     ✓ contains preparation state lock and reconciliation exceptions 309ms
     ✓ attempts independent attention after routine uncertainty 579ms
     ✓ seals an acknowledged segment after a postflight intervening comment 426ms
   ✓ trackerTarget (3)
     ✓ linear and jira: the uppercased key from the FID, plus team / site 323ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 544ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1584ms
     ✓ seals unavailable or unstable representation evidence 692ms
     ✓ uses accepted final preflight eligibility without provider atomicity 1427ms
     ✓ rejects marker preserving external edits 791ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1049ms
     ✓ returns owned comment identity and stable representation evidence 879ms
     ✓ selects newest created comment across complete pages 1488ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 732ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 738ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 632ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 640ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 462ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 467ms
     ✓ fetches the issue and its comments as GitHub returns them 532ms
     ✓ github fetch marks a closed issue terminal and an open one not 987ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 564ms
     ✓ caches exact engine source with available progress identity 524ms
     ✓ keeps original body identity separate from time and changed output 625ms
     ✓ reuses matching invocation state without adopting foreign ownership 661ms
     ✓ invalidates missing corrupt and unsupported progress cache 1583ms
     ✓ contains cache read and write failures as standalone degradation 992ms
     ✓ uses legacy receipts and contains receipt failures 712ms
     ✓ skips issue-less runs and tracker none 349ms
     ✓ records an engine-action row and skips the same key + body on a re-run 792ms
     ✓ a recent identical comment counts as done (the final close comment) 706ms
     ✓ a failed post reports done false with the reason and never leaks a token 753ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 648ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 729ms
     ✓ a board the token cannot see is scope 707ms
     ✓ an HTTP 403 from gh is scope 961ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 714ms
     ✓ github: no block, no blockers and no further reads 528ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1069ms
     ✓ a different marker hash posts 869ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 766ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 48095ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 544ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1567ms
     ✓ always writes the marker, even with no plan 569ms
     ✓ writes the linear marker shape, taking the tracker from package.json 874ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1018ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 682ms
     ✓ refuses a PR from dev, main, or the base itself 503ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1121ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1244ms
     ✓ exits 5 when the open-PR probe errors 1097ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 844ms
     ✓ prs open still opens against any other base 706ms
     ✓ exits 6 when the created PR's base is not --base 835ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1280ms
     ✓ exits 1 with found=false when there is none 728ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1612ms
     ✓ --number reads one PR, mergeable included 712ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1175ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1655ms
     ✓ refuses a bad --state or --number 394ms
   ✓ bkit prs scan-body (10)
     ✓ flags [ci skip] in the landed commit body (exit 1) 753ms
     ✓ flags [no ci] in the landed commit body (exit 1) 383ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 516ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 458ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 458ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 341ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 551ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 738ms
     ✓ drops the force-build marker from the title subject 465ms
     ✓ takes an explicit --subject 485ms
     ✓ runs no merge when the PR is already MERGED 443ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 663ms
     ✓ prs merge refuses a PR whose base is main 513ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 600ms
     ✓ prs merge refuses when the PR base is unknown 465ms
     ✓ prs merge reads the base from the one pr view it already makes 603ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 529ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 724ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 408ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 401ms
     ✓ never reads dev's required checks without --only-if-required 647ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 591ms
     ✓ updates when a dev ruleset requires status checks 610ms
     ✓ updates when dev's branch protection requires status checks 509ms
     ✓ ignores dev rulesets that require no checks 772ms
     ✓ updates when the repo cannot be resolved 781ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 835ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 397ms
     ✓ is not green when a check failed, naming it (exit 1) 545ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 743ms
     ✓ is not green on an empty rollup (total 0) 560ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 581ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 843ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 399ms
     ✓ is a no-op when the title already says so 960ms
     ✓ strips the marker, with or without its bkit prefix 1468ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1047ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 321ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 67655ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1032ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 468ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1104ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 637ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 744ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 715ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 349ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 430ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 708ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 877ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 985ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1215ms
     ✓ PASS is 0 failures with or without reports 1185ms
     ✓ clears a previous attempt's reports before the gate runs 633ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 535ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 928ms
     ✓ a log under the outbox is named main-checkout relative in the record 1595ms
     ✓ a log small enough is copied whole: not clamped, raw null 1142ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1494ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1494ms
     ✓ numbers runs within the workflow's active run and per step 2177ms
     ✓ without --file no row is written and the output carries row null 1210ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 447ms
     ✓ plan-check refuses DEPENDS ON a later group 355ms
     ✓ plan-check refuses a delete with no supersession row 320ms
     ✓ plan-check follows bkit.workflows.tasks 342ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 312ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1140ms
     ✓ a planned test that passes is a vacuous gap, exit 1 857ms
     ✓ a planned test absent from a loaded report is a missing gap 1009ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1018ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1339ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 612ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2554ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 971ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1213ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 340ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 2534ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 911ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1806ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1396ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2099ms
     ✓ green: a passed-accepted test is already landed, not a gap 1353ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 981ms
     ✓ green refuses a plan with no task markers 555ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1331ms
     ✓ green: --group audits only that group's tasks 1283ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1192ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1057ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 757ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1022ms
     ✓ green: lists each gap kind, with the runner output 833ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1532ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 627ms
       ✓ green clears an exception-only task from a human commit 486ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (121 tests) 67988ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 896ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 521ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 752ms
     ✓ done --group writes group on the row 513ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1014ms
     ✓ --commit=none writes the row and leaves it uncommitted 402ms
     ✓ build-group-start records parentSha and group 317ms
     ✓ carries extra fields, parsed as JSON when they are JSON 795ms
     ✓ reports a failed commit with exit 8 without writing the row 1445ms
     ✓ a failed commit leaves no row staged in the index 1790ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1366ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 950ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1533ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1048ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1541ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 569ms
     ✓ --ref reads the status file as committed on that ref, not from disk 477ms
     ✓ --ref exits 3 when the ref does not carry the status file 728ms
     ✓ fails on a placeholder left in the artifact 826ms
     ✓ fails when the row's verdict differs from the artifact's 747ms
     ✓ fails when the row does not list the artifact, or carries another attempt 929ms
     ✓ fails on a missing artifact 967ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 534ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 526ms
     ✓ fails a run-tests row missing its scope, and an empty scope 670ms
     ✓ names every missing field at once 335ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 744ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 648ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 420ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 826ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1011ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 807ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1197ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1324ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1108ms
     ✓ --post needs --number; without --post there is no tracker key 659ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 409ms
     ✓ --strip-header drops the prior version's own header 404ms
     ✓ exits 4 when the prior version is missing or empty 430ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 435ms
     ✓ checks the FID's shape for the wired tracker 466ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 463ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 919ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 703ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 530ms
     ✓ --attempt-of checks the row carries the derived counter 968ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1420ms
     ✓ writeStepRow refuses when a recorded path changed 1455ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 725ms
     ✓ writeStepRow appends its commit sha to the record 1239ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1591ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 477ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 1201ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1299ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 544ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 2424ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1259ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 948ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 508ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1428ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 618ms
     ✓ does not count an artifact the run found committed when it started 738ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 383ms
     ✓ commits a package.json change outside bkit.workflows 782ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1341ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 84151ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2871ms
     ✓ runs code.ts through its declared gate in the built checkout 3085ms
     ✓ runs code.ts through its declared gate in the built checkout 2618ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2080ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1953ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2046ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1161ms
     ✓ runs the full gate for replayed debug code 2060ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2396ms
     ✓ installs local dependencies against the built target tree 3966ms
     ✓ runs the configured frozen install even without root dependencies 3161ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2899ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2643ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2735ms
     ✓ never pushes local dev commits missing from origin/dev 2578ms
     ✓ dev moved: rebuilds on the new dev and pushes again 6220ms
     ✓ dev moved before every push: exhausted, nothing landed 7738ms
     ✓ any other refusal is returned, not retried 3449ms
     ✓ pushToDev replays a commit range onto origin/dev 3934ms
     ✓ a replay retries on the new dev when dev moved 4415ms
     ✓ pushToDev log line names what it lands 2226ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2274ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2342ms
     ✓ a push that fails without a server answer is returned once, never retried 2455ms
     ✓ a failed fetch is returned before anything is built 828ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3450ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2470ms
     ✓ lands from a clone whose fetch refspec omits dev 3012ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1067ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (102 tests) 42364ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 745ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 577ms
     ✓ brand-new untracked ledger is staged and committed 513ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 522ms
     ✓ path containing a space is staged and committed 556ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 652ms
     ✓ staging failure: exit 4 and no commit is created, no false success 570ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 636ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 595ms
     ✓ --mode=stage stages the sweep but creates no commit 528ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 2375ms
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 943ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 492ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1375ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 628ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 660ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 685ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 687ms
     ✓ an unpinned repo reports nulls and asks no registry 731ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 438ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 522ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 571ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 514ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 45854ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1118ms
     ✓ names each net-new and worsened finding in the log and the JSON 858ms
     ✓ fails on a net score rise with no net count change 845ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 794ms
     ✓ treats a net score at or below 0.001 as float noise 1014ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1332ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 314ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 978ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 953ms
     ✓ exits 4 on a dropped net field instead of silently passing 998ms
     ✓ exits 4 on no summary instead of silently passing 809ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1387ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1322ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1244ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1397ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 822ms
     ✓ explicit globs can select ignored prose and nested checkout files 592ms
     ✓ fails closed when a selected prose source cannot be read 314ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 573ms
     ✓ fails (exit 1) when vale reports alerts 563ms
     ✓ exits 6 on a vale runtime error 785ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 595ms
     ✓ falls back to vale sync when the main worktree has none 936ms
     ✓ fails when vale sync cannot restore the required styles 581ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 604ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 419ms
     ✓ is a usage error when the commit cannot be read 372ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 640ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 643ms
     ✓ exits 1 naming the files outside, whatever the commit message says 542ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1258ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 894ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 717ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 365ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1524ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1021ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2839ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3261ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 1013ms
     ✓ exit 12 failed steps (10)
       ✓ any failed step off the list makes the whole result unregenerable 313ms
     ✓ tells an API error (20) from no run (10) 361ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 305ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 828ms
       ✓ a source change past the validated head refuses (17) and names the path 898ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1572ms
       ✓ --validated equal to --head is the plain head check 427ms
       ✓ --validated without --month / --fid is a usage error (2) 963ms
       ✓ a validated sha that is not an ancestor refuses (17) 627ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 598ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1122ms
     ✓ a failed re-trigger push names the cause in the log 1367ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1348ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2284ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1588ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 977ms
     ✓ gh-error: every poll errored 1039ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1320ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1138ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1199ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1208ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4006ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4021ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1035ms
     ✓ re-trigger on dev only uses the record of its own FID 1257ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1466ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --snapshot scopes its run list and dev lookups to --repo 468ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 455ms
     ✓ a refused capstone records FAIL with its reason 345ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 601ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 753ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 563ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 381ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 747ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1117ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1125ms
     ✓ --file and --step go together 757ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 11766ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 526ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 523ms
     ✓ follows summary cursors even when the first page is shorter than the limit 646ms
     ✓ reports excluded intervals as unread even when pagination finishes 492ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 622ms
     ✓ reports an unread remainder at the page cap 544ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 922ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 366ms
     ✓ rejects missing summaries instead of treating them as empty results 477ms
     ✓ reports a failed first page as unavailable 462ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 406ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 513ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 534ms
     ✓ follows summary cursors even when the first page is shorter than the limit 635ms
     ✓ reports excluded intervals as unread even when pagination finishes 497ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 577ms
     ✓ reports an unread remainder at the page cap 471ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 509ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 347ms
     ✓ rejects missing summaries instead of treating them as empty results 453ms
     ✓ reports a failed first page as unavailable 450ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 790ms
[feat/test 3331393] gate
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 477ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 553ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 348ms
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1762ms
     ✓ source file is not treated as gate config 2072ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 892ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 3547ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 316ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 728ms
     ✓ 6. a FID that fails the format check exits 1 324ms
   ✓ bkit fids plans (2)
     ✓ none: no plan file at all 423ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 35175ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3471ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3924ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 678ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 611ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 517ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3893ms
     ✓ does not fall back through a malformed later success receipt 2106ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1331ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1264ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2273ms
     ✓ requires proof even when the pushed increment changes no files 1464ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 834ms
     ✓ does not record a committed tree 828ms
     ✓ records no proof for a failed gate or lighter gate 1345ms
     ✓ requires integration proof when integration is declared 1777ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3781ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:33540) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 710ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 499ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 616ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 350ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 330ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 333ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 379ms
     ✓ --file into a missing directory is refused, not created 329ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (92 tests) 11288ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 337ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 338ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 494ms
     ✓ trackerState for {"tracker":{"default":"github"}}: phase start null, hand-off null 314ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 762ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2369ms
     ✓ a refused dev push is logged, never fails the close 2696ms
     ✓ an unreachable remote is logged, never fails the close 1025ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 12179ms
   ✓ real workflow sources (37)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 416ms
     ✓ resolves config from the repo root when run from a subdirectory 346ms
     ✓ exits 6 when the PUT fails 384ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 380ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 417ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 431ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 478ms
     ✓ exits 6 when the api answer is not JSON 571ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 14721ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1005ms
     ✓ counts files committed since --base 1109ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 903ms
     ✓ runs nothing and exits 0 when no file changed 434ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 911ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 651ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1424ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 437ms
 ✓ .bkit/core/engine/commands/lib.test.ts (72 tests) 5658ms
   ✓ repo facts on a real repository (4)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 337ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1346ms
     ✓ runGit names ENOBUFS when output passes the limit 991ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1106ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 808ms
     ✓ passes every rule on a clean head 376ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 390ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 5870ms
   ✓ bkit disk prune — step files (10)
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 305ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 387ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 400ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 402ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (62 tests) 2757ms
   ✓ bkit counters route --point (7)
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 988 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 216 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 513ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 383ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 332ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 329ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-puzk0x/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 356ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 607ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 638ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 378ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 171ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 315ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 484ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 221ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 252ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 51ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-2aXckX/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 363ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 349ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 288ms
(node:27830) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:27830) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:27830) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:27830) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 329ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 156ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 152ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 169ms
(node:28282) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:28282) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 176ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 233ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 271ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 218ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 248ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 143ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 144ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 92ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 88ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 146ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 125ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 156ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 104ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 190ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 149ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 86ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 134ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 139ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 114ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 125ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 130ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 175ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 118ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 61ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 46ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 71ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 50ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 43ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 42ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 36ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 50ms
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
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 36ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 62ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 60ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 37ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (14 tests) 71ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 65ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 31ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 121ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 30ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 84ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 35ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794285212649.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794285212652.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794285212653.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794285212663.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 27ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 44ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 74ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 22ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 25ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 34ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 33ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 35ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 11ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 174353ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 580ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2576ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 453ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 325ms
     ✓ writes no limits for a workflow with no ask point 844ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 500ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 778ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 786ms
       ✓ a new run in the same chat gets its own session row 529ms
       ✓ writes none outside Claude Code 497ms
     ✓ opens the next run after a finished one, and after another workflow's run 551ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 483ms
     ✓ design / plan / build / debug book in the current worktree 569ms
     ✓ refuses when the lock is live, writing no row 444ms
     ✓ --lock-held checks the lock is ours 592ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 383ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 805ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 468ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 350ms
     ✓ an OPEN decision of an earlier run never resurfaces 833ms
     ✓ an OPEN decision mid-build prints its header fields 433ms
     ✓ reads Test attempt from a tests pause 340ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 681ms
     ✓ writes no row when status.jsonl does not exist 359ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 581ms
     ✓ aborts a rebase only when one is in progress 1081ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 745ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 822ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 542ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 584ms
     ✓ --max-exceeded says a handover is due without any sentinel 498ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 420ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 655ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 777ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 563ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 457ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 619ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 548ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 556ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 594ms
     ✓ a debug run in SOAK mode always needs a handover 463ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1652ms
       ✓ counts subagents of an earlier chat the run's session rows name 1475ms
       ✓ records no context block, and still closes, outside a Claude Code session 1577ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1213ms
     ✓ records ending held and publish false on the workflow-done row 1531ms
     ✓ defaults the close row to ending done 1391ms
     ✓ refuses an unknown ending 552ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1453ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1298ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1505ms
     ✓ always writes the telemetry, whatever the runtime 2178ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1324ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1147ms
     ✓ an unwritable stats path is logged and never fails the close 1456ms
     ✓ appends the completeness row before the workflow-done row 1673ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1518ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1337ms
     ✓ writes one completeness row per close 2241ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1440ms
     ✓ still closes when the completeness check throws 1870ms
     ✓ still closes when the completeness row write throws 1499ms
     ✓ refuses without status.jsonl and writes nothing 465ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1737ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1698ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 963ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 915ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1341ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1117ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1396ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1195ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1143ms
     ✓ --record-step writes the close step's row before workflow-done 729ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 956ms
     ✓ --number without --outbox is a usage error 1171ms
     ✓ --flush is ship only 422ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1477ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1316ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1610ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1581ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1089ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 566ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 510ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3370ms
     ✓ --flush with nothing to record commits and pushes nothing 1779ms
     ✓ --flush carries the named worktree's logs into the dev commit 3477ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4849ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3500ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4506ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3337ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4156ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3319ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3304ms
     ✓ --push on dev never carries a row whose references name another feature 3394ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3076ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6706ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3260ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1421ms
     ✓ rejects --push with --flush, and --flush outside ship 369ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3582ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3035ms
     ✓ a close that landed releases the lock 3616ms
     ✓ removes the worktree before it releases the lock 3525ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4888ms
       ✓ closePr refuses when the PR base is unknown 5001ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3498ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 338ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 343ms
     ✓ stamps the anchor from the runtime-resolved base commit 334ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 494ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 541ms
     ✓ names the branch, not the remote-tracking ref, in each URL 548ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 441ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 537ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 814ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 305ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 688ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 309ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 315ms
     ✓ a second run's record does not let this FID's close commit 425ms
     ✓ record is present after workflows close and before the push 658ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1163ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 479ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 426ms
     ✓ puts each --line after the summary, in flag order 432ms
     ✓ --summary prints the file and keeps a copy in --outbox 352ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 351ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 228015ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 814ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1237ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1300ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1789ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1225ms
     ✓ a refused --continue carries git's own reason 1153ms
     ✓ --file records nothing for a refused rebase 775ms
     ✓ refuses a code conflict and aborts the rebase on the spot 791ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1837ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 776ms
     ✓ produces byte-identical output to merge=union 1836ms
     ✓ restores a trailing newline so the next append starts on its own line 1171ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1092ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1534ms
     ✓ refuses a union that leaves a line which is not JSON 895ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1168ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1990ms
     ✓ refuses a lockfile whose regenerate command fails 1957ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2438ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1765ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1688ms
     ✓ refuses and aborts when both sides changed the hand-written region 968ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1090ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1391ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1739ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 995ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1187ms
     ✓ refuses and aborts when a side deleted the install record 873ms
     ✓ refuses a conflicted doc the repo's script does not list 844ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 943ms
     ✓ removes a stale sentinel when the rebase succeeds 2088ms
     ✓ exits 4 when no rebase is in progress 574ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1556ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1434ms
   ✓ branches anchor-stamp (19)
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 751ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 733ms
       ✓ skips (12) with no anchor 690ms
       ✓ skips (12) when the base is unreachable in this clone 815ms
       ✓ skips (12) when nothing landed since the base 804ms
       ✓ runs (0) with the landed path count once dev moved 1346ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 765ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1784ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1333ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1751ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2597ms
     ✓ runs exactly one git push 1853ms
     ✓ --set-upstream records the upstream 1016ms
     ✓ refuses with no branch checked out 849ms
     ✓ --mode=dev refuses a feature checkout 811ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2028ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2998ms
     ✓ --require-ci pushes as-is when dev has not moved 1337ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2580ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3746ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1051ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1614ms
     ✓ --mode=abort pushes when the branch has no open PR 1563ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1066ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 868ms
     ✓ --open-pr carries the MCP answer and skips gh 1129ms
     ✓ --mode=abort on dev pushes plainly without probing 1086ms
     ✓ rejects an unknown mode 806ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4019ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2525ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2530ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3967ms
     ✓ skip-ci HEAD on the replay is refused 1696ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3769ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4404ms
     ✓ a level local dev is a plain push, recording nothing extra 1713ms
     ✓ a record with no commits pushes nothing 1205ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 888ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1662ms
     ✓ a rewritten branch is refused, never forced 1397ms
     ✓ refuses dev and main with exit 21 and pushes nothing 823ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1898ms
     ✓ refuses a detached HEAD (exit 5) 880ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1699ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1580ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2382ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2230ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 743ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1843ms
     ✓ an up-to-date branch is a no-op 1011ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1792ms
     ✓ a fetch that fails exits 10 765ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1043ms
     ✓ scan-diff still reports a new skip when its test … 1006ms
     ✓ scan-diff reports a skip moved onto a different t… 960ms
     ✓ scan-diff does not cancel a skip moved between am… 1039ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1081ms
     ✓ scan-diff recognizes a renamed test file 1022ms
     ✓ scan-diff recognizes a suite moved into a differe… 1218ms
     ✓ scan-diff does not let unrelated additions hide a… 1108ms
     ✓ scan-diff attributes deletion to its old test ins… 1052ms
     ✓ scan-diff consumes each moved assertion once and … 1025ms
     ✓ scan-diff does not match identical assertions fro… 1073ms
     ✓ scan-diff does not match the same leaf test name … 1148ms
     ✓ scan-diff does not match a same-named test with d… 1099ms
     ✓ scan-diff does not match a same-named test with c… 1014ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1073ms
     ✓ --paths with no match exits 1 872ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 777ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1472ms
     ✓ --marker reads a diff over 1 MiB 1178ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1442ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1452ms
     ✓ scan-diff finds an added skip 1311ms
     ✓ scan-diff ignores a skip predating the base 1158ms
     ✓ scan-diff reports a disabled test with its line 1230ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1040ms
     ✓ scan-diff ignores a removed comment in a test file 1102ms
     ✓ scan-diff ignores an assertion moved within the file 1044ms
     ✓ scan-diff still reports a removed assertion 1111ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1130ms
     ✓ scan-diff finds an added pytest mark skip 717ms
     ✓ scan-diff finds an added unittest skip 463ms
     ✓ scan-diff finds an added bare skip call 386ms
     ✓ scan-diff ignores a quoted skip in a documentation file 404ms
     ✓ scan-diff ignores a marker literal in a non-test source file 467ms
     ✓ scan-diff ignores an assertion whose expectation changed 410ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 400ms
     ✓ scan-diff reports a deleted test file 400ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 940ms
     ✓ a title that already carries the marker is left alone 634ms
     ✓ with no open PR: pushes the marker commit and edits no title 761ms
     ✓ a re-run is deduped: no second marker commit 944ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 887ms
     ✓ --title-set skips gh entirely 390ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 431ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 408ms
     ✓ --merge-docs merges dev when docs/ is behind 462ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 457ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 660ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 674ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 570ms
     ✓ --merge-docs skips an empty bkit:generate script 537ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 611ms
     ✓ --merge-docs never merges on dev itself 439ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 585ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 599ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 526ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 530ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 310ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 734ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1023ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1083ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 834ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 973ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 968ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 686ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 880ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 670ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 645ms
     ✓ exits 10 when the fetch fails 364ms
     ✓ refuses --merge-docs with --head, and an unknown --head 333ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 515ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 701ms
     ✓ a failed install stops ship (16) 613ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 451ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 441ms
     ✓ exits 10 when the fetch fails 371ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 319ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1201ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1045ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1036ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1052ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2722ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2889ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 447ms
     ✓ local: names unpushed dev as the cause when the branch carries it 510ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 528ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1263ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1211ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 907ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 937ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1038ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 984ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 743ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2035ms
     ✓ land removes the worktree when only the copied .env is untracked 1369ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 971ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1227ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1755ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1017ms
     ✓ landPr refuses a main-based PR without retrying 537ms
     ✓ landPr refuses when the PR base is unknown 537ms
     ✓ PR not open (closed): stops (17) at once, no retry 648ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 399ms
     ✓ --attempt names the merge round in a fix commit 370ms
     ✓ commits a rewritten and a deleted tracked file 476ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 438ms
     ✓ reports undeclared and runs nothing with no scripts 304ms
     ✓ reports undeclared and runs nothing with an empty script 301ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 355ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 396ms

 Test Files  173 passed (173)
      Tests  7396 passed | 2 skipped (7398)
   Start at  14:30:48
   Duration  228.89s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/860-move-deterministic-bookkeeping/build-group-gate-3-5.log.reports/vitest-16582.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.58 |    83.07 |   95.08 |   90.99 |                   
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
 engine/commands   |   89.12 |     83.6 |   93.64 |   90.67 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   92.13 |    87.09 |   97.43 |    96.4 | ...60,663,723-726 
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
 ...mands/workflow |   91.89 |    84.22 |   96.28 |   93.38 |                   
  branches.ts      |   90.43 |    83.65 |   98.23 |    92.3 | ...3037,3062,3205 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.38 |    94.69 |     100 |    98.8 | 240,557           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 206,311,380       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |    93.4 |    85.49 |    97.4 |   95.07 | ...1275,1290-1300 
  ledgers.ts       |    89.3 |    79.02 |   96.15 |   92.28 | ...2099-2100,2128 
  locks.ts         |   92.21 |    86.84 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 490-491           
  runs.ts          |   91.57 |    84.15 |    99.1 |   92.67 | ...2403,2435-2439 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |    94.7 |    92.87 |     100 |   95.58 | ...86,695,712,853 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    88.7 |     81.2 |   92.18 |   90.46 | ...2317,2319,2342 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.48 |    82.68 |    97.4 |   95.09 | ...1768,1942,2674 
  worktrees.ts     |   61.24 |     59.2 |   66.66 |   62.37 | ...1132,1135-1136 
 engine/install    |   93.11 |    84.57 |   94.15 |   95.87 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   95.67 |    92.07 |   98.15 |   96.61 |                   
  status.ts        |   94.44 |    93.97 |    97.1 |   97.18 | 624,650-656,690   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1858,2016,2377 
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
Statements   : 89.58% ( 19502/21770 )
Branches     : 83.07% ( 14703/17698 )
Functions    : 95.08% ( 3152/3315 )
Lines        : 90.99% ( 17117/18810 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 243 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 205 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 212 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 209 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 202 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 198 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 109 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 268 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 240 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 229 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 224 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 448 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 213 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 205 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 801 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 511 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 16 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 32 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 48 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 342 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 375 ms
ok 30 refresh drops a file deleted in the index from the build # in 325 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 406 ms
ok 32 a key removed from the env file is unset on the next run # in 176 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 149 ms
ok 34 non-BKIT_ keys are skipped # in 141 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 151 ms
ok 36 a failed unsetenv is retried on the next run # in 168 ms
ok 37 logs key names only, never values # in 137 ms
ok 38 missing env file exits 0 without calling launchctl # in 22 ms
ok 39 the sweep prints the summary line the lane greps for # in 242 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 8 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (107.389375ms)
✔ shell cancellation waits for SIGTERM cleanup (156.959791ms)
✔ direct cancellation waits for SIGINT cleanup (84.995625ms)
✔ shell cancellation waits for SIGINT cleanup (157.674792ms)
✔ direct cancellation waits for SIGHUP cleanup (83.282917ms)
✔ shell cancellation waits for SIGHUP cleanup (156.147458ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (380.66475ms)
✔ shell cancellation follows a worker orphaned by a nested shell (224.347292ms)
✔ direct cancellation preserves a nested machine-lock owner (414.391334ms)
✔ shell cancellation preserves a nested machine-lock owner (449.917708ms)
✔ nested shell cancellation preserves a nested machine-lock owner (449.918666ms)
✔ a hard process-group timeout reaches a shell command during cleanup (84.0535ms)
✔ ships a command-scoped sleep prevention wrapper (0.064333ms)
✔ preserves arguments, output and nonzero exit status (46.621708ms)
✔ runs an entire shell chain and retains its failure (25.510458ms)
✔ reports a missing command as 127 (25.698292ms)
✔ requires a command (23.806958ms)
✔ non-macOS platform selection runs commands without sleep prevention (39.90625ms)
✔ hard timeout escalation reaches a command that ignores TERM (144.347167ms)
✔ forwards POSIX cancellation to the command and releases the assertion (50.853833ms)
✔ holds a real macOS assertion only while the command runs (62.109416ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3199.903541
> [bkit] TRUNCATED — kept 1818 of 3693 lines (131 KB of 285 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
