
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 62144, since 22:41:56), last run took 10m51s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 62144, since 22:41:56), last run took 10m51s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 62144, since 22:41:56), last run took 10m51s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping (pid 62144, since 22:41:56), last run took 10m51s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 31029, since 22:48:31), last run took 1m7s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 5 min so far) (up to 1200s): in use by vitest .bkit/core/engine/audits/hooks .bkit/core/engine/install/modules .bkit/core/engine/render .bkit/core/engine/audits/templates .bkit/core/engine/tools/instructions .bkit/core/engine/checks/after — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 73709, since 22:49:10), last run took 1m5s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck (pid 56038, since 22:50:38), last run took 3m33s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 7 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck (pid 56038, since 22:50:38), last run took 3m33s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 864-move-project-docs build-group-gate-1 is waiting for tests (still, 8 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 — /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck (pid 56038, since 22:50:38), last run took 3m33s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
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
 714:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 1207:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1449:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1507:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 253:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 344:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 455:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 250:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 378:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 418:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 489:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> bkit ci slop

[bkit-ci] base da97be3876cf42450f57b335b7aac09629f33a59 (da97be3876cf42450f57b335b7aac09629f33a59) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: da97be3876cf42450f57b335b7aac09629f33a59
base: da97be3876cf42450f57b335b7aac09629f33a59
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 5.0 on 10 cores: unit limits 7000ms per test, 14000ms per hook (x1.40)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 27043ms
   ✓ best effort comment friction (4)
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1785ms
   ✓ bounded nonfatal publication (10)
     ✓ reserves new comment opportunity within total delivery budget 523ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 728ms
     ✓ seals unavailable or unstable representation evidence 683ms
     ✓ uses accepted final preflight eligibility without provider atomicity 742ms
     ✓ rejects marker preserving external edits 771ms
     ✓ preserves generated first line and extracts versioned h6 section markers 431ms
     ✓ returns owned comment identity and stable representation evidence 820ms
     ✓ selects newest created comment across complete pages 440ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 773ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 633ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 481ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 476ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 389ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 373ms
     ✓ fetches the issue and its comments as GitHub returns them 349ms
     ✓ github fetch marks a closed issue terminal and an open one not 517ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 470ms
     ✓ caches exact engine source with available progress identity 308ms
     ✓ keeps original body identity separate from time and changed output 380ms
     ✓ reuses matching invocation state without adopting foreign ownership 418ms
     ✓ invalidates missing corrupt and unsupported progress cache 719ms
     ✓ contains cache read and write failures as standalone degradation 469ms
     ✓ uses legacy receipts and contains receipt failures 468ms
     ✓ records an engine-action row and skips the same key + body on a re-run 375ms
     ✓ a recent identical comment counts as done (the final close comment) 433ms
     ✓ a failed post reports done false with the reason and never leaks a token 337ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 391ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 355ms
     ✓ a board the token cannot see is scope 791ms
     ✓ an HTTP 403 from gh is scope 820ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 746ms
     ✓ github: no block, no blockers and no further reads 722ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 651ms
     ✓ a different marker hash posts 389ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 483ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 28998ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 303ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 449ms
     ✓ always writes the marker, even with no plan 887ms
     ✓ writes the linear marker shape, taking the tracker from package.json 355ms
     ✓ writes the jira marker shape, taking the tracker from package.json 353ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 764ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 402ms
     ✓ retries a failed create once, and exits 5 when it fails twice 841ms
     ✓ exits 5 when the open-PR probe errors 610ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 505ms
     ✓ prs open still opens against any other base 519ms
     ✓ exits 6 when the created PR's base is not --base 764ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 771ms
     ✓ exits 1 with found=false when there is none 442ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 485ms
     ✓ --number reads one PR, mergeable included 733ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 700ms
     ✓ exits 4 when gh errors and 80 when it needs auth 667ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 427ms
     ✓ takes an explicit --subject 303ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 404ms
     ✓ prs merge refuses when the PR base is unknown 305ms
     ✓ prs merge reads the base from the one pr view it already makes 348ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 371ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 479ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 396ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 334ms
     ✓ never reads dev's required checks without --only-if-required 383ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 550ms
     ✓ updates when a dev ruleset requires status checks 349ms
     ✓ updates when dev's branch protection requires status checks 497ms
     ✓ ignores dev rulesets that require no checks 331ms
     ✓ updates when the repo cannot be resolved 502ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 462ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 790ms
     ✓ is not green when a check failed, naming it (exit 1) 826ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 853ms
     ✓ is not green on an empty rollup (total 0) 962ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 489ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 395ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 361ms
     ✓ is a no-op when the title already says so 335ms
     ✓ strips the marker, with or without its bkit prefix 616ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 887ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 30725ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 436ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 408ms
     ✓ done --group writes group on the row 344ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 473ms
     ✓ reports a failed commit with exit 8 without writing the row 430ms
     ✓ a failed commit leaves no row staged in the index 466ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 830ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 820ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 739ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 595ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 816ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 310ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 350ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 306ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 444ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 588ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 413ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 496ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 704ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 434ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 468ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 420ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 730ms
     ✓ writeStepRow refuses when a recorded path changed 702ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 324ms
     ✓ writeStepRow appends its commit sha to the record 568ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1272ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 445ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 472ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 326ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 831ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 594ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 415ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 712ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 304ms
     ✓ does not count an artifact the run found committed when it started 398ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 404ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 809ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 33407ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 19687ms
     ✓ every prompt, workflow and utility agent has the three header blocks 422ms
     ✓ sync has nothing left to rewrite 11225ms
     ✓ every clause reaches the cut-off of one surface it applies to 1647ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 36145ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 764ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 412ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 720ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 393ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 516ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 313ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 679ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 614ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 467ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 471ms
     ✓ PASS is 0 failures with or without reports 670ms
     ✓ clears a previous attempt's reports before the gate runs 694ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 753ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 542ms
     ✓ a log under the outbox is named main-checkout relative in the record 440ms
     ✓ a log small enough is copied whole: not clamped, raw null 728ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 602ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 771ms
     ✓ numbers runs within the workflow's active run and per step 640ms
     ✓ without --file no row is written and the output carries row null 331ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 605ms
     ✓ a planned test that passes is a vacuous gap, exit 1 651ms
     ✓ a planned test absent from a loaded report is a missing gap 474ms
     ✓ a file that fails to load is a red of kind red-not-loaded 628ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 686ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 904ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 831ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 795ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1235ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1077ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 904ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 563ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1259ms
     ✓ green: a passed-accepted test is already landed, not a gap 732ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 469ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 849ms
     ✓ green: --group audits only that group's tasks 533ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 594ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 657ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 517ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 852ms
     ✓ green: lists each gap kind, with the runner output 466ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 992ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 404ms
       ✓ green clears an exception-only task from a human commit 324ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 40185ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1279ms
     ✓ runs code.ts through its declared gate in the built checkout 1407ms
     ✓ runs code.ts through its declared gate in the built checkout 1212ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1006ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 909ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1015ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 567ms
     ✓ runs the full gate for replayed debug code 858ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1103ms
     ✓ installs local dependencies against the built target tree 1320ms
     ✓ runs the configured frozen install even without root dependencies 1099ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1165ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1320ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1448ms
     ✓ never pushes local dev commits missing from origin/dev 1408ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2303ms
     ✓ dev moved before every push: exhausted, nothing landed 3599ms
     ✓ any other refusal is returned, not retried 1567ms
     ✓ pushToDev replays a commit range onto origin/dev 1354ms
     ✓ a replay retries on the new dev when dev moved 2212ms
     ✓ pushToDev log line names what it lands 1219ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1408ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1621ms
     ✓ a push that fails without a server answer is returned once, never retried 1362ms
     ✓ a failed fetch is returned before anything is built 441ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1976ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1526ms
     ✓ lands from a clone whose fetch refspec omits dev 1859ms
     ✓ build throwing stops the landing and removes the throwaway checkout 612ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 13037ms
   ✓ bkit runtime detect — the table (17)
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 353ms
     ✓ CI=true -> GITHUB_ACTION 539ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 367ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 372ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 537ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 366ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 370ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 317ms
     ✓ LOCAL -> runtimeHeadless=false 399ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 405ms
     ✓ UNKNOWN -> runtimeHeadless=false 385ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 418ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 838ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 694ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 755ms
     ✓ re-derives per call: one run's answer does not leak into the next 314ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 515ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 380ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 752ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 815ms
     ✓ --file into a missing directory is refused, not created 723ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 24665ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 969ms
     ✓ may debug in place on dev 435ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 861ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 812ms
     ✓ a new run of the same FID rewrites startSha 1289ms
     ✓ a resume of the same FID reuses the record 1274ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 919ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 804ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1031ms
     ✓ a stale record without a lock is replaced 1023ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 802ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 766ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 305ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 360ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 416ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 403ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 440ms
     ✓ never commits an entry only the main checkout's copy list names 352ms
   ✓ bkit worktrees remove (12)
     ✓ leaves a worktree without the marker in place 322ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 369ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 304ms
     ✓ tells a caller inside the removed worktree where to cd 344ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 839ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 591ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 477ms
       ✓ a branch already gone everywhere is reported deleted 400ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 507ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1292ms
[feat/test 4dd4453] gate
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 25725ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 412ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 341ms
     ✓ brand-new untracked ledger is staged and committed 343ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 338ms
     ✓ path containing a space is staged and committed 383ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 819ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 504ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 412ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 444ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 404ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 505ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 356ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 613ms
     ✓ --path records its commit on the run's record, like every other commit mode 585ms
     ✓ a recorded ledger commits only the rows the run appended 779ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 947ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 778ms
     ✓ commitBookkeeping refuses when a recorded path changed 457ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 31538ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1108ms
     ✓ names each net-new and worsened finding in the log and the JSON 845ms
     ✓ fails on a net score rise with no net count change 515ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 811ms
     ✓ treats a net score at or below 0.001 as float noise 533ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 970ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 446ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 518ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 597ms
     ✓ exits 4 on a dropped net field instead of silently passing 751ms
     ✓ exits 4 on no summary instead of silently passing 621ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 839ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 801ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 793ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 848ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 422ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 417ms
     ✓ fails (exit 1) when vale reports alerts 388ms
     ✓ exits 6 on a vale runtime error 382ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 897ms
     ✓ falls back to vale sync when the main worktree has none 779ms
     ✓ fails when vale sync cannot restore the required styles 745ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 504ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 390ms
     ✓ is a usage error when the commit cannot be read 338ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 476ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 551ms
     ✓ exits 1 naming the files outside, whatever the commit message says 557ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 845ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 608ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 405ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 1798ms
     ✓ filters branch and PR discovery by configured workflow and exact head 881ms
     ✓ freezes explicit workflow run attempt and all failed job pages 740ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1479ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2050ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 491ms
       ✓ a source change past the validated head refuses (17) and names the path 456ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 464ms
       ✓ --validated without --month / --fid is a usage error (2) 308ms
       ✓ a validated sha that is not an ancestor refuses (17) 328ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 390ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 635ms
     ✓ a failed re-trigger push names the cause in the log 807ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1357ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1177ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 709ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 407ms
     ✓ gh-error: every poll errored 416ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 712ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 672ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 817ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 706ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2278ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2167ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 579ms
     ✓ re-trigger on dev only uses the record of its own FID 754ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 809ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 402ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 723ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 463ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 522ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 591ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 832ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 573ms
     ✓ --file and --step go together 572ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 25803ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 25616ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2146ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2138ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 338ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 321ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2265ms
     ✓ does not fall back through a malformed later success receipt 1406ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1147ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1063ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2052ms
     ✓ requires proof even when the pushed increment changes no files 1139ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 740ms
     ✓ does not record a committed tree 777ms
     ✓ records no proof for a failed gate or lighter gate 1364ms
     ✓ requires integration proof when integration is declared 1665ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2160ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 963ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 450ms
     ✓ follows summary cursors even when the first page is shorter than the limit 500ms
     ✓ reports excluded intervals as unread even when pagination finishes 453ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 492ms
     ✓ reports an unread remainder at the page cap 489ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 422ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 621ms
     ✓ rejects missing summaries instead of treating them as empty results 496ms
     ✓ reports a failed first page as unavailable 454ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 352ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 581ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 455ms
     ✓ follows summary cursors even when the first page is shorter than the limit 527ms
     ✓ reports excluded intervals as unread even when pagination finishes 408ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 465ms
     ✓ reports an unread remainder at the page cap 426ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 406ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 409ms
     ✓ rejects missing summaries instead of treating them as empty results 1220ms
     ✓ reports a failed first page as unavailable 365ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 12810ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 533ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1670ms
     ✓ a refused dev push is logged, never fails the close 1782ms
     ✓ an unreachable remote is logged, never fails the close 640ms
(node:48608) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 862ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 418ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1774ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 529ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 608ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 432ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 425ms
     ✓ an unpinned repo reports nulls and asks no registry 409ms
   ✓ bkit repo preflight (4)
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 377ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 451ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 351ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 399ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 400ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 369ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 17499ms
   ✓ bkit context clamp (#427 T1) (22)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1897ms
     ✓ keeps each context's own section banner and drops every other context's 4452ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 513ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 331ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 512ms
     ✓ counts files committed since --base 579ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 467ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 746ms
     ✓ runs the --fallback gate even when no file changed, as it did before 654ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 6700ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1328ms
     ✓ runGit names ENOBUFS when output passes the limit 2197ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 2009ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 324ms
   ✓ guardRepoConfig (6)
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 332ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 28934ms
   ✓ real workflow sources (37)
> [bkit] TRUNCATED HERE — 67 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 46 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1037ms
     ✓ source file is not treated as gate config 877ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 930ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 2805ms
> [bkit] TRUNCATED HERE — 707 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 218ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-0YSonF/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-mvoUXb/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iisSvy/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 925ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-Csz4fF/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 855ms
 ✓ .bkit/core/engine/ledgers/journal.test.ts (18 tests) 535ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 715ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (292 tests) 705ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 510ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 114ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (62 tests) 765ms
(node:45197) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:45197) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 102ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (279 tests) 198ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 440ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 232ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 257ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 584ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 211ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 177ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 36ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 286ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 368ms
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 344ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 63ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 139ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

 ✓ .bkit/core/engine/install/project-docs.test.ts (10 tests) 125ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 179ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 141ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 141ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 219ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 98ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-g85uL0/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 104ms
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

stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-L8Bd5r/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 125ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 111ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 138ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 139ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 148ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 86ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 75ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 79ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 74ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 104ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 83ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 61ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 63ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 66ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 66ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 73ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 66ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 92ms
(node:49947) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:49947) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:49947) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:49947) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 65ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 62ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 62ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 66ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 54ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 74ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 80ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 81ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 50ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 54ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 41ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 70ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 38ms
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
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794228949843.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794228949847.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794228949847.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794228949865.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 32ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 31ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 34ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 42ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 27ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 23ms
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

 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 24ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 37ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 17ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 40ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 20ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 21ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 18ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 17ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 22ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 6ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 107092ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 323ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1185ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 318ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 303ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 310ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 435ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 326ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 364ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 301ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 458ms
       ✓ counts subagents of an earlier chat the run's session rows name 444ms
       ✓ records no context block, and still closes, outside a Claude Code session 479ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 500ms
     ✓ records ending held and publish false on the workflow-done row 508ms
     ✓ defaults the close row to ending done 528ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 543ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 532ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 583ms
     ✓ always writes the telemetry, whatever the runtime 551ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 393ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 516ms
     ✓ an unwritable stats path is logged and never fails the close 517ms
     ✓ appends the completeness row before the workflow-done row 517ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 501ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 554ms
     ✓ writes one completeness row per close 915ms
     ✓ leaves out the previous run's rows that share a second with this run's start 558ms
     ✓ still closes when the completeness check throws 539ms
     ✓ still closes when the completeness row write throws 558ms
     ✓ ship: run.pr, size of the squash commit, and coverage 519ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 659ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 489ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 386ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 531ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 549ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 639ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 634ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 630ms
     ✓ --record-step writes the close step's row before workflow-done 449ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 433ms
     ✓ --number without --outbox is a usage error 351ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 673ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 765ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 805ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 924ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 624ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 356ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 303ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1962ms
     ✓ --flush with nothing to record commits and pushes nothing 1069ms
     ✓ --flush carries the named worktree's logs into the dev commit 1864ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2340ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2165ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2497ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2787ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3402ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3136ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2998ms
     ✓ --push on dev never carries a row whose references name another feature 2701ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2316ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4723ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2336ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1048ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2532ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2014ms
     ✓ a close that landed releases the lock 2588ms
     ✓ removes the worktree before it releases the lock 2479ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3337ms
       ✓ closePr refuses when the PR base is unknown 3142ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2205ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 356ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 363ms
     ✓ names the branch, not the remote-tracking ref, in each URL 329ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 302ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 368ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 796ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 491ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1267ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 570ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 526ms
     ✓ a second run's record does not let this FID's close commit 800ms
     ✓ record is present after workflows close and before the push 1387ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2332ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 527ms
     ✓ --plan is appended when the file exists and skipped when it does not 345ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 515ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1029ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 754ms
     ✓ puts each --line after the summary, in flag order 810ms
     ✓ --summary prints the file and keeps a copy in --outbox 737ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 772ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 172530ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 440ms
     ✓ rejects missing explicit and ambiguous existing branch selections 427ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 762ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 736ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 470ms
     ✓ a refused --continue carries git's own reason 570ms
     ✓ --file records nothing for a refused rebase 431ms
     ✓ refuses a code conflict and aborts the rebase on the spot 467ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1059ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 374ms
     ✓ produces byte-identical output to merge=union 898ms
     ✓ restores a trailing newline so the next append starts on its own line 521ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 464ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 646ms
     ✓ refuses a union that leaves a line which is not JSON 384ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 599ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 988ms
     ✓ refuses a lockfile whose regenerate command fails 827ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 785ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 777ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 856ms
     ✓ refuses and aborts when both sides changed the hand-written region 531ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 596ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 781ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 971ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 561ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 609ms
     ✓ refuses and aborts when a side deleted the install record 477ms
     ✓ refuses a conflicted doc the repo's script does not list 444ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 426ms
     ✓ removes a stale sentinel when the rebase succeeds 680ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 910ms
     ✓ resolves a conflict in each of two replayed commits across rounds 769ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 343ms
       ✓ skips (12) when the base is unreachable in this clone 412ms
       ✓ skips (12) when nothing landed since the base 364ms
       ✓ runs (0) with the landed path count once dev moved 613ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 342ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 694ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 551ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 660ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1245ms
     ✓ runs exactly one git push 1268ms
     ✓ --set-upstream records the upstream 626ms
     ✓ refuses with no branch checked out 526ms
     ✓ --mode=dev refuses a feature checkout 466ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1336ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2017ms
     ✓ --require-ci pushes as-is when dev has not moved 785ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1485ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2142ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 596ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 730ms
     ✓ --mode=abort pushes when the branch has no open PR 981ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1036ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 514ms
     ✓ --open-pr carries the MCP answer and skips gh 662ms
     ✓ --mode=abort on dev pushes plainly without probing 606ms
     ✓ rejects an unknown mode 489ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2408ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1600ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1816ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3772ms
     ✓ skip-ci HEAD on the replay is refused 1278ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2740ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3231ms
     ✓ a level local dev is a plain push, recording nothing extra 1208ms
     ✓ a record with no commits pushes nothing 942ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 700ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1796ms
     ✓ a rewritten branch is refused, never forced 915ms
     ✓ refuses dev and main with exit 21 and pushes nothing 598ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1294ms
     ✓ refuses a detached HEAD (exit 5) 578ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1125ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1129ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1022ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1341ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 523ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1242ms
     ✓ an up-to-date branch is a no-op 832ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1264ms
     ✓ a fetch that fails exits 10 523ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 729ms
     ✓ scan-diff still reports a new skip when its test … 725ms
     ✓ scan-diff reports a skip moved onto a different t… 687ms
     ✓ scan-diff does not cancel a skip moved between am… 687ms
     ✓ scan-diff does not spend an unchanged duplicate t… 718ms
     ✓ scan-diff recognizes a renamed test file 742ms
     ✓ scan-diff recognizes a suite moved into a differe… 755ms
     ✓ scan-diff does not let unrelated additions hide a… 692ms
     ✓ scan-diff attributes deletion to its old test ins… 745ms
     ✓ scan-diff consumes each moved assertion once and … 732ms
     ✓ scan-diff does not match identical assertions fro… 691ms
     ✓ scan-diff does not match the same leaf test name … 691ms
     ✓ scan-diff does not match a same-named test with d… 710ms
     ✓ scan-diff does not match a same-named test with c… 725ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 692ms
     ✓ --paths with no match exits 1 662ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 511ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 928ms
     ✓ --marker reads a diff over 1 MiB 743ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 820ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 755ms
     ✓ scan-diff finds an added skip 795ms
     ✓ scan-diff ignores a skip predating the base 721ms
     ✓ scan-diff reports a disabled test with its line 757ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 831ms
     ✓ scan-diff ignores a removed comment in a test file 773ms
     ✓ scan-diff ignores an assertion moved within the file 843ms
     ✓ scan-diff still reports a removed assertion 795ms
     ✓ scan-diff reports an assertion re-added only outside the test file 708ms
     ✓ scan-diff finds an added pytest mark skip 772ms
     ✓ scan-diff finds an added unittest skip 818ms
     ✓ scan-diff finds an added bare skip call 857ms
     ✓ scan-diff ignores a quoted skip in a documentation file 746ms
     ✓ scan-diff ignores a marker literal in a non-test source file 854ms
     ✓ scan-diff ignores an assertion whose expectation changed 761ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 788ms
     ✓ scan-diff reports a deleted test file 735ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 574ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1160ms
     ✓ a title that already carries the marker is left alone 525ms
     ✓ with no open PR: pushes the marker commit and edits no title 551ms
     ✓ a re-run is deduped: no second marker commit 567ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 644ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 345ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 345ms
     ✓ --merge-docs merges dev when docs/ is behind 413ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 397ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 571ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 571ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 481ms
     ✓ --merge-docs skips an empty bkit:generate script 443ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 366ms
     ✓ --merge-docs never merges on dev itself 322ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 479ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 522ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 448ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 467ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 908ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1613ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2586ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1873ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2170ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2525ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 2121ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 2175ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1445ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1309ms
     ✓ exits 10 when the fetch fails 727ms
     ✓ refuses --merge-docs with --head, and an unknown --head 668ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1348ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1716ms
     ✓ a failed install stops ship (16) 1688ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1702ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 694ms
     ✓ exits 10 when the fetch fails 367ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 938ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 929ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 922ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 927ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2083ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2453ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 418ms
     ✓ local: names unpushed dev as the cause when the branch carries it 443ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 530ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1168ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1219ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 882ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 934ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1012ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1351ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 628ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1127ms
     ✓ land removes the worktree when only the copied .env is untracked 957ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1011ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 899ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1545ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 943ms
     ✓ landPr refuses a main-based PR without retrying 535ms
     ✓ landPr refuses when the PR base is unknown 513ms
     ✓ PR not open (closed): stops (17) at once, no retry 617ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 370ms
     ✓ --attempt names the merge round in a fix commit 344ms
     ✓ commits a rewritten and a deleted tracked file 357ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 304ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 318ms

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts
Error: Hook timed out in 17617ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
 ❯ .bkit/core/engine/audits/workflows/catalog-parity.test.ts:124:3
    122|
    123| describe("rendered workflow comment contracts", () => {
    124|   beforeAll(() => {
       |   ^
    125|     renderedReportingWorkflows();
    126|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 173 passed (174)
      Tests  7378 passed | 6 skipped (7384)
   Start at  22:54:04
   Duration  173.65s (tests 96%, import 1%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/864-move-project-docs/build-group-gate-1-3.log.reports/vitest-20657.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.79 |    83.33 |   95.08 |   91.16 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.04 |    86.51 |   95.19 |   95.06 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.45 |    71.42 |     100 |   97.19 | ...00,320,417-418 
  managed.ts       |    81.7 |    87.87 |   58.33 |   83.87 | 216-237           
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
 ...mmands/install |   47.28 |    44.78 |   57.14 |   47.64 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.23 |    30.88 |   33.33 |   33.33 | 351-379,561-1072  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.28 |    84.64 |    96.3 |   93.75 |                   
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
  locks.ts         |   92.09 |    86.44 |   92.59 |   94.03 | ...04-305,474-475 
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
 engine/install    |   93.34 |    84.46 |   94.44 |   96.08 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    87.32 |     100 |     100 | ...19,324,330-331 
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
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1717-1799,1804 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.79% ( 18981/21138 )
Branches     : 83.33% ( 14199/17039 )
Functions    : 95.08% ( 3058/3216 )
Lines        : 91.16% ( 16633/18245 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1761 of 3192 lines (132 KB of 247 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
