
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'


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

[test-timeout-budget] load average 5.8 on 10 cores: unit limits 7400ms per test, 14800ms per hook (x1.48)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 5353ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1345ms
     ✓ runGit names ENOBUFS when output passes the limit 1085ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1128ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 446ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (77 tests) 2426ms
   ✓ check — hole classes (27)
     ✓ a tracker-none run that journals every rendered call is CLEAN 317ms
     ✓ matches a call the Contract allows at any point 364ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (300 tests) 711ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 160ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 388ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 173ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-0mfvdZ/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 131ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 36127ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 491ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 338ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2092ms
   ✓ routine publication policy (8)
     ✓ starts only new source after overflow or missing source 392ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 339ms
     ✓ reserves new comment opportunity within total delivery budget 773ms
   ✓ trackerTarget (3)
     ✓ linear and jira: the uppercased key from the FID, plus team / site 315ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 399ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1070ms
     ✓ seals unavailable or unstable representation evidence 865ms
     ✓ uses accepted final preflight eligibility without provider atomicity 903ms
     ✓ rejects marker preserving external edits 950ms
     ✓ preserves generated first line and extracts versioned h6 section markers 585ms
     ✓ returns owned comment identity and stable representation evidence 849ms
     ✓ selects newest created comment across complete pages 1197ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 491ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 841ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 397ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 688ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 557ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 653ms
     ✓ fetches the issue and its comments as GitHub returns them 685ms
     ✓ github fetch marks a closed issue terminal and an open one not 824ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 543ms
     ✓ caches exact engine source with available progress identity 473ms
     ✓ keeps original body identity separate from time and changed output 706ms
     ✓ reuses matching invocation state without adopting foreign ownership 753ms
     ✓ invalidates missing corrupt and unsupported progress cache 1225ms
     ✓ contains cache read and write failures as standalone degradation 842ms
     ✓ uses legacy receipts and contains receipt failures 831ms
     ✓ skips issue-less runs and tracker none 324ms
     ✓ records an engine-action row and skips the same key + body on a re-run 659ms
     ✓ a recent identical comment counts as done (the final close comment) 436ms
     ✓ a failed post reports done false with the reason and never leaks a token 597ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 484ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 499ms
     ✓ a board the token cannot see is scope 375ms
     ✓ an HTTP 403 from gh is scope 592ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 654ms
     ✓ github: no block, no blockers and no further reads 351ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 424ms
     ✓ a different marker hash posts 708ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 387ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 42170ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 631ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 872ms
     ✓ always writes the marker, even with no plan 769ms
     ✓ writes the linear marker shape, taking the tracker from package.json 598ms
     ✓ writes the jira marker shape, taking the tracker from package.json 848ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 412ms
     ✓ refuses a PR from dev, main, or the base itself 391ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 812ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1247ms
     ✓ exits 5 when the open-PR probe errors 684ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 646ms
     ✓ prs open still opens against any other base 910ms
     ✓ exits 6 when the created PR's base is not --base 765ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2455ms
     ✓ refuses merged entry when current feature evidence cannot be read 1591ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 849ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 842ms
     ✓ exits 1 with found=false when there is none 554ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 775ms
     ✓ --number reads one PR, mergeable included 329ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 729ms
     ✓ exits 4 when gh errors and 80 when it needs auth 716ms
   ✓ bkit prs scan-body (10)
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 336ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 454ms
     ✓ classifies a refused merge with a new dev conflict as integration 514ms
     ✓ returns an explicit terminal reason for other merge refusals 657ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 349ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 778ms
     ✓ drops the force-build marker from the title subject 385ms
     ✓ takes an explicit --subject 580ms
     ✓ runs no merge when the PR is already MERGED 488ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 811ms
     ✓ prs merge refuses a PR whose base is main 577ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 728ms
     ✓ prs merge refuses when the PR base is unknown 378ms
     ✓ prs merge reads the base from the one pr view it already makes 426ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 473ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 312ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 453ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 590ms
     ✓ never reads dev's required checks without --only-if-required 505ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 680ms
     ✓ updates when a dev ruleset requires status checks 520ms
     ✓ updates when dev's branch protection requires status checks 426ms
     ✓ ignores dev rulesets that require no checks 606ms
     ✓ updates when the repo cannot be resolved 404ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 424ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 329ms
     ✓ is not green when a check failed, naming it (exit 1) 309ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 806ms
     ✓ is not green on an empty rollup (total 0) 405ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 403ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 525ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 479ms
     ✓ is a no-op when the title already says so 590ms
     ✓ strips the marker, with or without its bkit prefix 540ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 544ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 48271ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 722ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 755ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 749ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 427ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 830ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 400ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 360ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 455ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1065ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1270ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 372ms
     ✓ PASS is 0 failures with or without reports 903ms
     ✓ clears a previous attempt's reports before the gate runs 652ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 943ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1031ms
     ✓ a log under the outbox is named main-checkout relative in the record 973ms
     ✓ a log small enough is copied whole: not clamped, raw null 925ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1147ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 781ms
     ✓ numbers runs within the workflow's active run and per step 885ms
     ✓ without --file no row is written and the output carries row null 519ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check refuses DEPENDS ON a later group 303ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 881ms
     ✓ a planned test that passes is a vacuous gap, exit 1 537ms
     ✓ a planned test absent from a loaded report is a missing gap 625ms
     ✓ a file that fails to load is a red of kind red-not-loaded 688ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 940ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 328ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1132ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 850ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 575ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1280ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 852ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1042ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 892ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1290ms
     ✓ green: a passed-accepted test is already landed, not a gap 907ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 986ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 659ms
     ✓ green: --group audits only that group's tasks 599ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1028ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 882ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 617ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 918ms
     ✓ green: lists each gap kind, with the runner output 773ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1250ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 447ms
       ✓ green clears an exception-only task from a human commit 410ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 51960ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 537ms
     ✓ finishes a CI round only with its own failed job count 510ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 405ms
     ✓ done --group writes group on the row 336ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 558ms
     ✓ carries extra fields, parsed as JSON when they are JSON 323ms
     ✓ reports a failed commit with exit 8 without writing the row 1240ms
     ✓ a failed commit leaves no row staged in the index 1262ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1234ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1115ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1309ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1001ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1162ms
   ✓ bkit steps verdict (10)
     ✓ only reads above the marker 336ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 560ms
     ✓ --ref reads the status file as committed on that ref, not from disk 516ms
     ✓ --ref exits 3 when the ref does not carry the status file 651ms
     ✓ fails on a placeholder left in the artifact 402ms
     ✓ fails when the row's verdict differs from the artifact's 672ms
     ✓ fails when the row does not list the artifact, or carries another attempt 469ms
     ✓ fails on a missing artifact 401ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 394ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 336ms
     ✓ fails a run-tests row missing its scope, and an empty scope 690ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 736ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 608ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 405ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 638ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 749ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 697ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 738ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1164ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 713ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 628ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 427ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 389ms
     ✓ --attempt-of checks the row carries the derived counter 425ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 963ms
     ✓ writeStepRow refuses when a recorded path changed 1114ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 444ms
     ✓ writeStepRow appends its commit sha to the record 1027ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1323ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 354ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 707ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 639ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 728ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 408ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1021ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 826ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 675ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 488ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1096ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 425ms
     ✓ does not count an artifact the run found committed when it started 552ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 641ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1199ms
   ✓ bkit steps stub --result-file (12)
     ✓ reads held audit keys from the linked worktree's own ledger 354ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 32ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 45253ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ adopts the main checkout even when called from a linked worktree 332ms
     ✓ design and plan in place on main are refused 311ms
     ✓ still adopts a cloud session branch whose upstream is main 538ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1481ms
     ✓ may debug in place on dev 525ms
     ✓ never in place on main 363ms
     ✓ adopts in place when the session is already on feat/{fid} 377ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1212ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1328ms
     ✓ a new run of the same FID rewrites startSha 2165ms
     ✓ a resume of the same FID reuses the record 1847ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1200ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1094ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1403ms
     ✓ a stale record without a lock is replaced 1372ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1058ms
     ✓ refuses inherited unpublished dev commits in every ship mode 3808ms
     ✓ names inherited commits and ship recovery in the refusal 883ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 954ms
     ✓ ship names a missing feat branch 428ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1043ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 367ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 425ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 425ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 444ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 332ms
     ✓ never commits an entry only the main checkout's copy list names 340ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 499ms
     ✓ tells a caller inside the removed worktree where to cd 412ms
     ✓ fails with its own exit code when git cannot remove a marked path 306ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1129ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 14619ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 37941ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1081ms
     ✓ names each net-new and worsened finding in the log and the JSON 829ms
     ✓ fails on a net score rise with no net count change 715ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 862ms
     ✓ treats a net score at or below 0.001 as float noise 804ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 581ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 304ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 845ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 647ms
     ✓ exits 4 on a dropped net field instead of silently passing 668ms
     ✓ exits 4 on no summary instead of silently passing 657ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1014ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1594ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1994ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1114ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 443ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 367ms
     ✓ fails (exit 1) when vale reports alerts 448ms
     ✓ exits 6 on a vale runtime error 407ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 474ms
     ✓ falls back to vale sync when the main worktree has none 407ms
     ✓ fails when vale sync cannot restore the required styles 419ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 439ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 479ms
     ✓ exits 1 naming the files outside, whatever the commit message says 592ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1370ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1009ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 591ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 852ms
     ✓ keeps each context's own section banner and drops every other context's 2084ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 518ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 366ms
> [bkit] TRUNCATED HERE — 41 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 433ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 382ms
     ✓ staging failure: exit 4 and no commit is created, no false success 327ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 389ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 301ms
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 793ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1482ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 488ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 6340ms
   ✓ publication ownership lock (4)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --month is used as given 361ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 358ms
   ✓ bkit locks release (5)
     ✓ locks release removes the FID shared-checkout record 403ms
> [bkit] TRUNCATED HERE — 249 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 320ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 407ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 506ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime row (6)
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 303ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 638ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 334ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > strips bkit block from markered-text file, preserving consumer content
> [bkit] TRUNCATED HERE — 429 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 432 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 756ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 816ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 340ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 98884ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 1861ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2849ms
     ✓ saves the failed job count without the capstone job 734ms
     ✓ counts the capstone job when it is the only failed job 793ms
     ✓ saves no failed job count when no job failed 1119ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1205ms
     ✓ freezes explicit workflow run attempt and all failed job pages 798ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2274ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2520ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2193ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2329ms
     ✓ checks the named repository base and fails closed on missing evidence 1088ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1088ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1190ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 567ms
       ✓ a source change past the validated head refuses (17) and names the path 534ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 629ms
       ✓ --validated without --month / --fid is a usage error (2) 395ms
       ✓ a validated sha that is not an ancestor refuses (17) 545ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 506ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1054ms
     ✓ a failed re-trigger push names the cause in the log 1230ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1176ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2281ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1284ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 630ms
     ✓ gh-error: every poll errored 503ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1046ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1133ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1201ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1266ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3399ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4212ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 885ms
     ✓ re-trigger on dev only uses the record of its own FID 1103ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1031ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ --snapshot scopes its run list and dev lookups to --repo 449ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 329ms
     ✓ a refused capstone records FAIL with its reason 345ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 392ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 646ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 396ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 521ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 746ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 909ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1013ms
     ✓ --file and --step go together 622ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 33ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 65ms
 ❯ .bkit/core/engine/audits/templates/templates.test.ts (253 tests | 1 failed) 231ms
   ❯ audit templates — managed block plus consumer stub (110)
     ✓ ships the finished audit set 6ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ docs/templates/bkit-audit-documentation.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-duplication.md keeps project instructions outside the managed block 1ms
     ✓ docs/templates/bkit-audit-failures.md keeps project instructions outside the managed block 1ms
     ✓ docs/templates/bkit-audit-flakes.md keeps project instructions outside the managed block 1ms
     ✓ docs/templates/bkit-audit-gates.md keeps project instructions outside the managed block 1ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ docs/templates/bkit-audit-documentation.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-duplication.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-failures.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-flakes.md bkit doc anchors resolve to shipped headings 1ms
     ✓ docs/templates/bkit-audit-gates.md bkit doc anchors resolve to shipped headings 1ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ docs/templates/bkit-audit-testing.md bkit doc anchors resolve to shipped headings 1ms
     ✓ docs/templates/bkit-audit-usability.md bkit doc anchors resolve to shipped headings 0ms
     × every shipped doc section is named by an audit, or listed with a reason 77ms
     ✓ every templates.md Contract row is covered by an audit 10ms
     ✓ docs/templates/bkit-audit-accessibility.md dogfood managed block differs only by the managed-version stamp 1ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ docs/templates/bkit-audit-documentation.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-duplication.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-failures.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-flakes.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-gates.md dogfood managed block differs only by the managed-version stamp 1ms
> [bkit] TRUNCATED HERE — 90 lines omitted. Dropped content was NOT read.
     ✓ docs/templates/bkit-audit-duplication.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-duplication.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-failures.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-failures.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-failures.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-flakes.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-flakes.md: bkit:start appears before bkit:end 0ms
> [bkit] TRUNCATED HERE — 99 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 641ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2096ms
     ✓ a refused dev push is logged, never fails the close 2533ms
     ✓ an unreachable remote is logged, never fails the close 811ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests) 1275ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 213ms
> [bkit] TRUNCATED HERE — 179 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 419ms
     ✓ resolves config from the repo root when run from a subdirectory 537ms
     ✓ exits 6 when the PUT fails 483ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 516ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 441ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 840ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 817ms
     ✓ exits 6 when the api answer is not JSON 1221ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
> [bkit] TRUNCATED HERE — 61 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
(node:93206) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:93206) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests | 1 failed) 19116ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 4ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ flags an expired, over-long or stale acceptance 1ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 210ms
     ✓ rejects an --unreachable value that is neither fail nor warn 80ms
   ❯ shipped copy-and-own test files (6)
     ✓ finds the shipped .test.mjs files 1ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 383ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 77ms
     × ci/bkit-test-awake.test.mjs passes when run on its own 7138ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 10364ms
   ✓ capstone env wiring checks (3)
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 736ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 676ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1004ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 478ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1108ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 601ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 631ms
     ✓ an unpinned repo reports nulls and asks no registry 493ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 485ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1007ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 850ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 617ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1188ms
     ✓ counts files committed since --base 1042ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 641ms
     ✓ runs nothing and exits 0 when no file changed 347ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 779ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 426ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 303ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 412ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 327ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1197ms
   ✓ shipped hook templates (5)
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
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 27051ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2853ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2661ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 471ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 406ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 375ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3191ms
     ✓ does not fall back through a malformed later success receipt 1789ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1042ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 875ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1680ms
     ✓ requires proof even when the pushed increment changes no files 1033ms
     ✓ ignores malformed receipts 991ms
     ✓ does not record a tracked tree 468ms
     ✓ does not record a untracked tree 525ms
     ✓ does not record a mutated tree 706ms
     ✓ does not record a committed tree 780ms
     ✓ records no proof for a failed gate or lighter gate 1146ms
     ✓ requires integration proof when integration is declared 1343ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2620ms
     ✓ invalidates proof when the gate definition changes 1065ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 625ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 399ms
   ✓ disk prune step-file templates (7)
     ✓ both copy into place and load as valid steps of both modes 380ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 13761ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1024ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1028ms
     ✓ follows summary cursors even when the first page is shorter than the limit 719ms
     ✓ reports excluded intervals as unread even when pagination finishes 747ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 667ms
     ✓ reports an unread remainder at the page cap 990ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 648ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 513ms
     ✓ rejects missing summaries instead of treating them as empty results 543ms
     ✓ reports a failed first page as unavailable 645ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 736ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 733ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 859ms
     ✓ follows summary cursors even when the first page is shorter than the limit 728ms
     ✓ reports excluded intervals as unread even when pagination finishes 416ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 499ms
     ✓ reports an unread remainder at the page cap 434ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 434ms
     ✓ rejects missing summaries instead of treating them as empty results 364ms
     ✓ reports a failed first page as unavailable 458ms
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

 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 29ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 75ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 54ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 63ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 10ms
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

 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 178ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 11ms
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

 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 38ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
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

 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 29ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 40ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 10ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 4680ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ writes plugin prompts + workflow skills, and stamps the managed version 566ms
     ✓ never writes Codex's `.agents/skills/` 1043ms
     ✓ is idempotent — a second render writes nothing 1617ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 667ms
     ✓ warns when Codex is also installed (skill-overlap advisory) 362ms
     ✓ stays silent about the overlap when Codex is absent 412ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 11ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1123ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 34ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 150ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 53ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 9658ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 9648ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 56531ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1887ms
     ✓ runs code.ts through its declared gate in the built checkout 1855ms
     ✓ runs code.ts through its declared gate in the built checkout 1868ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1751ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1785ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1703ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1023ms
     ✓ runs the full gate for replayed debug code 1654ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1919ms
     ✓ installs local dependencies against the built target tree 2239ms
     ✓ runs the configured frozen install even without root dependencies 2029ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1779ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1599ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1908ms
     ✓ never pushes local dev commits missing from origin/dev 1843ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3580ms
     ✓ dev moved before every push: exhausted, nothing landed 5382ms
     ✓ any other refusal is returned, not retried 2061ms
     ✓ pushToDev replays a commit range onto origin/dev 2359ms
     ✓ a replay retries on the new dev when dev moved 2861ms
     ✓ pushToDev log line names what it lands 1281ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1300ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1646ms
     ✓ a push that fails without a server answer is returned once, never retried 1188ms
     ✓ a failed fetch is returned before anything is built 415ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2635ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1886ms
     ✓ lands from a clone whose fetch refspec omits dev 2272ms
     ✓ build throwing stops the landing and removes the throwaway checkout 793ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 26516ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 15641ms
     ✓ every fence parses under zsh -n 10767ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (165 tests) 161437ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 440ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1411ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 568ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 415ms
       ✓ a new run in the same chat gets its own session row 500ms
       ✓ writes none outside Claude Code 347ms
     ✓ opens the next run after a finished one, and after another workflow's run 415ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 438ms
     ✓ design / plan / build / debug book in the current worktree 384ms
     ✓ --lock-held checks the lock is ours 529ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 455ms
   ✓ bkit workflows start — resume facts (11)
     ✓ an OPEN decision of an earlier run never resurfaces 488ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 538ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 374ms
     ✓ writes no row when status.jsonl does not exist 300ms
     ✓ aborts a rebase only when one is in progress 578ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 508ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 609ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 383ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 366ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 682ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 509ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 417ms
     ✓ a debug run in SOAK mode always needs a handover 597ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 974ms
       ✓ counts subagents of an earlier chat the run's session rows name 972ms
       ✓ records no context block, and still closes, outside a Claude Code session 1144ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1178ms
     ✓ records ending held and publish false on the workflow-done row 1133ms
     ✓ defaults the close row to ending done 1010ms
     ✓ refuses an unknown ending 337ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1119ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 962ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 931ms
     ✓ always writes the telemetry, whatever the runtime 835ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 781ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 740ms
     ✓ an unwritable stats path is logged and never fails the close 798ms
     ✓ appends the completeness row before the workflow-done row 766ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 833ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 791ms
     ✓ writes one completeness row per close 1422ms
     ✓ leaves out the previous run's rows that share a second with this run's start 739ms
     ✓ still closes when the completeness check throws 781ms
     ✓ still closes when the completeness row write throws 750ms
     ✓ ship: run.pr, size of the squash commit, and coverage 938ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1296ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 790ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 754ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 945ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 890ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1200ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1005ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1000ms
     ✓ --record-step writes the close step's row before workflow-done 752ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 760ms
     ✓ --number without --outbox is a usage error 790ms
     ✓ --flush is ship only 310ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1222ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1247ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1346ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1120ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 905ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 593ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 419ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2678ms
     ✓ --flush with nothing to record commits and pushes nothing 1413ms
     ✓ --flush carries the named worktree's logs into the dev commit 2389ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2956ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3144ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4546ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3096ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3929ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3741ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3176ms
     ✓ --push on dev never carries a row whose references name another feature 2983ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2936ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5521ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3162ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1400ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3307ms
     ✓ preserves unlanded file deletions and ledger additions on close 6365ms
     ✓ preserves dirty work and uncertain branch evidence during close 5834ms
     ✓ preserves a local feature ref changed after its cleanup proof 5864ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3456ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2564ms
     ✓ a close that landed releases the lock 3420ms
     ✓ removes the worktree before it releases the lock 3083ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3570ms
       ✓ closePr refuses when the PR base is unknown 3001ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2803ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 377ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 397ms
     ✓ rejects a workflow other than design or plan 326ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 442ms
     ✓ names the branch, not the remote-tracking ref, in each URL 426ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 374ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 406ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1005ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 695ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1289ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 372ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 396ms
     ✓ a second run's record does not let this FID's close commit 408ms
     ✓ record is present after workflows close and before the push 792ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1459ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 329ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 608ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 466ms
     ✓ puts each --line after the summary, in flag order 471ms
     ✓ --summary prints the file and keeps a copy in --outbox 480ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 495ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 256981ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 740ms
     ✓ rejects missing explicit and ambiguous existing branch selections 510ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 812ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 828ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 720ms
     ✓ a refused --continue carries git's own reason 841ms
     ✓ --file records nothing for a refused rebase 653ms
     ✓ refuses a code conflict and aborts the rebase on the spot 743ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1909ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 528ms
     ✓ produces byte-identical output to merge=union 1514ms
     ✓ restores a trailing newline so the next append starts on its own line 692ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 626ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 991ms
     ✓ refuses a union that leaves a line which is not JSON 538ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 846ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1810ms
     ✓ refuses a lockfile whose regenerate command fails 1460ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1785ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1343ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1561ms
     ✓ refuses and aborts when both sides changed the hand-written region 969ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1109ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1280ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1531ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 778ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 935ms
     ✓ refuses and aborts when a side deleted the install record 741ms
     ✓ refuses a conflicted doc the repo's script does not list 723ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 682ms
     ✓ removes a stale sentinel when the rebase succeeds 932ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1041ms
     ✓ resolves a conflict in each of two replayed commits across rounds 971ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 560ms
       ✓ skips (12) with no anchor 510ms
       ✓ skips (12) when the base is unreachable in this clone 607ms
       ✓ skips (12) when nothing landed since the base 547ms
       ✓ runs (0) with the landed path count once dev moved 1033ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 610ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1115ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 674ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 943ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1836ms
     ✓ runs exactly one git push 1336ms
     ✓ --set-upstream records the upstream 834ms
     ✓ refuses with no branch checked out 681ms
     ✓ --mode=dev refuses a feature checkout 616ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1533ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2983ms
     ✓ --require-ci pushes as-is when dev has not moved 1300ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1844ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2869ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 697ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1176ms
     ✓ --mode=abort pushes when the branch has no open PR 1260ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 850ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 684ms
     ✓ --open-pr carries the MCP answer and skips gh 805ms
     ✓ --mode=abort on dev pushes plainly without probing 816ms
     ✓ rejects an unknown mode 715ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3017ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1836ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2743ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3833ms
     ✓ skip-ci HEAD on the replay is refused 1234ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3702ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4164ms
     ✓ a level local dev is a plain push, recording nothing extra 1537ms
     ✓ a record with no commits pushes nothing 1086ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 805ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1475ms
     ✓ a rewritten branch is refused, never forced 1057ms
     ✓ refuses dev and main with exit 21 and pushes nothing 743ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1730ms
     ✓ refuses a detached HEAD (exit 5) 983ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1559ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1357ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1376ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1697ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 677ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1803ms
     ✓ an up-to-date branch is a no-op 1072ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1540ms
     ✓ a fetch that fails exits 10 741ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 954ms
     ✓ scan-diff still reports a new skip when its test … 921ms
     ✓ scan-diff reports a skip moved onto a different t… 852ms
     ✓ scan-diff does not cancel a skip moved between am… 894ms
     ✓ scan-diff does not spend an unchanged duplicate t… 922ms
     ✓ scan-diff recognizes a renamed test file 1001ms
     ✓ scan-diff recognizes a suite moved into a differe… 799ms
     ✓ scan-diff does not let unrelated additions hide a… 996ms
     ✓ scan-diff attributes deletion to its old test ins… 878ms
     ✓ scan-diff consumes each moved assertion once and … 1026ms
     ✓ scan-diff does not match identical assertions fro… 850ms
     ✓ scan-diff does not match the same leaf test name … 784ms
     ✓ scan-diff does not match a same-named test with d… 758ms
     ✓ scan-diff does not match a same-named test with c… 745ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 838ms
     ✓ --paths with no match exits 1 751ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 541ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1035ms
     ✓ --marker reads a diff over 1 MiB 952ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1162ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 886ms
     ✓ scan-diff finds an added skip 962ms
     ✓ scan-diff ignores a skip predating the base 779ms
     ✓ scan-diff reports a disabled test with its line 1091ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 857ms
     ✓ scan-diff ignores a removed comment in a test file 892ms
     ✓ scan-diff ignores an assertion moved within the file 866ms
     ✓ scan-diff still reports a removed assertion 832ms
     ✓ scan-diff reports an assertion re-added only outside the test file 859ms
     ✓ scan-diff finds an added pytest mark skip 931ms
     ✓ scan-diff finds an added unittest skip 873ms
     ✓ scan-diff finds an added bare skip call 892ms
     ✓ scan-diff ignores a quoted skip in a documentation file 986ms
     ✓ scan-diff ignores a marker literal in a non-test source file 867ms
     ✓ scan-diff ignores an assertion whose expectation changed 678ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 696ms
     ✓ scan-diff reports a deleted test file 648ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 512ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1723ms
     ✓ a title that already carries the marker is left alone 1218ms
     ✓ with no open PR: pushes the marker commit and edits no title 1120ms
     ✓ a re-run is deduped: no second marker commit 1294ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1973ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 650ms
     ✓ --title-set skips gh entirely 1006ms
     ✓ refuses dev and main (exit 21) 610ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 2403ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 3395ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1164ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2678ms
     ✓ continues only the explicitly recorded target through the public merge command 1837ms
     ✓ fetches the unseen feature head before classifying the base 1289ms
     ✓ fast forwards the feature before either base path is chosen 2456ms
     ✓ merges divergent feature tips without rebasing either side 1602ms
     ✓ continues the feature merge before starting a dev merge 2276ms
     ✓ publishes local code with a CI running head before bookkeeping 1859ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2571ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1710ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1478ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 402ms
     ✓ Path B once dev moved; --head checks a given commit 610ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 935ms
     ✓ --merge-docs merges dev when docs/ is behind 1698ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1500ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1999ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1089ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 812ms
     ✓ --merge-docs skips an empty bkit:generate script 702ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 623ms
     ✓ --merge-docs never merges on dev itself 563ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 792ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 820ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 761ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 804ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 427ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1001ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 968ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1256ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 956ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1013ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1049ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 719ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 874ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 574ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 422ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 658ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1237ms
     ✓ a failed install stops ship (16) 704ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 532ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 493ms
     ✓ exits 10 when the fetch fails 374ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1342ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1463ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1315ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1253ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3101ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4010ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 593ms
     ✓ local: names unpushed dev as the cause when the branch carries it 661ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 726ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1873ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1996ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1369ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6051ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1864ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1636ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1284ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 780ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2536ms
     ✓ land removes the worktree when only the copied .env is untracked 2232ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2253ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2167ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2632ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1639ms
     ✓ landPr refuses a main-based PR without retrying 575ms
     ✓ landPr refuses when the PR base is unknown 553ms
     ✓ PR not open (closed): stops (17) at once, no retry 814ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 1250ms
     ✓ --attempt names the merge round in a fix commit 1166ms
     ✓ commits a rewritten and a deleted tracked file 934ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 530ms
     ✓ reports undeclared and runs nothing with no scripts 388ms
     ✓ reports undeclared and runs nothing with an empty script 473ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 615ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 517ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 440ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > shipped copy-and-own test files > ci/bkit-test-awake.test.mjs passes when run on its own
AssertionError: ✔ direct cancellation waits for SIGTERM cleanup (226.351125ms)
✔ shell cancellation waits for SIGTERM cleanup (319.703875ms)
✔ direct cancellation waits for SIGINT cleanup (205.251792ms)
✔ shell cancellation waits for SIGINT cleanup (332.001125ms)
✔ direct cancellation waits for SIGHUP cleanup (216.464042ms)
✖ shell cancellation waits for SIGHUP cleanup (227.436625ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (654.422041ms)
✔ shell cancellation follows a worker orphaned by a nested shell (425.3075ms)
✔ direct cancellation preserves a nested machine-lock owner (967.103875ms)
✔ shell cancellation preserves a nested machine-lock owner (1044.7105ms)
✔ nested shell cancellation preserves a nested machine-lock owner (1061.904166ms)
✔ a hard process-group timeout reaches a shell command during cleanup (194.479875ms)
✔ ships a command-scoped sleep prevention wrapper (0.129083ms)
✔ preserves arguments, output and nonzero exit status (131.333208ms)
✔ runs an entire shell chain and retains its failure (77.300292ms)
✔ reports a missing command as 127 (165.697834ms)
✔ requires a command (68.377667ms)
✔ non-macOS platform selection runs commands without sleep prevention (105.643291ms)
✔ hard timeout escalation reaches a command that ignores TERM (268.969667ms)
✔ forwards POSIX cancellation to the command and releases the assertion (159.623333ms)
✔ holds a real macOS assertion only while the command runs (194.380792ms)
ℹ tests 21
ℹ suites 0
ℹ pass 20
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7055.771042

✖ failing tests:

test at .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:90:5
✖ shell cancellation waits for SIGHUP cleanup (227.436625ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  '' !== 'SIGHUP'
  
      at TestContext.<anonymous> (file:///Users/christian/Documents/GitHub/bkit/.worktrees/917-docs-node-test/.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:110:16)
      at async Test.run (node:internal/test_runner/test:1313:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:897:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: '',
    expected: 'SIGHUP',
    operator: 'strictEqual',
    diff: 'simple'
  }
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ TestContext.<anonymous> .bkit/templates/scripts/ci/bkit-test-awake.test.mjs:110:16
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:134:49
    132|       encoding: "utf-8",
    133|     });
    134|     expect(res.status, res.stdout + res.stderr).toBe(0);
       |                                                 ^
    135|   });
    136| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/templates.test.ts > audit templates — managed block plus consumer stub > every shipped doc section is named by an audit, or listed with a reason
AssertionError: expected [ …(7) ] to deeply equal [ …(6) ]

- Expected
+ Received

@@ -3,6 +3,7 @@
    "data-schema.md § Project facts to record",
    "deployments.md § Project facts to record",
    "setup.md § Project facts to record",
    "technology.md § Project facts to record",
    "testing.md § Project facts to record",
+   "testing.md § Test first",
  ]

 ❯ .bkit/core/engine/audits/templates/templates.test.ts:215:48
    213|   it("every shipped doc section is named by an audit, or listed with a…
    214|     const contents = audits.map((rel) => fs.readFileSync(path.join(COR…
    215|     expect(uncoveredBkitDocSections(contents)).toEqual(Object.keys(UNA…
       |                                                ^
    216|   });
    217|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 175 passed (177)
      Tests  2 failed | 7660 passed | 2 skipped (7664)
   Start at  08:41:15
   Duration  259.08s (tests 96%, import 1%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/917-docs-node-test/run-tests-1.log.reports/vitest-88045.xml
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
 engine/commands   |    88.6 |     83.2 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.06 |   96.42 |   94.53 | ...18-821,868-883 
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
 ...mands/workflow |   90.14 |    82.97 |   95.28 |   91.66 |                   
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
  locks.ts         |   92.81 |    88.59 |    92.3 |    94.4 | ...91-292,461-462 
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
> [bkit] TRUNCATED — kept 1770 of 3763 lines (122 KB of 290 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
