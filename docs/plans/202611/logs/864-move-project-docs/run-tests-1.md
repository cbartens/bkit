
> @cbartens/bkit@6.1.1 bkit:gate:static-unit-integration /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 864-move-project-docs build-run-tests is waiting for tests (up to 1200s): in use by bkit:gate:static-unit-integration-e2e-live — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 23296, since 20:41:10), last run took 54m33s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 864-move-project-docs build-run-tests is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit:gate:static-unit-integration-e2e-live — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 23296, since 20:41:10), last run took 54m33s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 864-move-project-docs build-run-tests is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit:gate:static-unit-integration-e2e-live — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 23296, since 20:41:10), last run took 54m33s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 864-move-project-docs build-run-tests is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit:gate:static-unit-integration-e2e-live — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 23296, since 20:41:10), last run took 54m33s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit-integration 864-move-project-docs build-run-tests is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit:gate:static-unit-integration-e2e-live — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 23296, since 20:41:10), last run took 54m33s

> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


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
 1245:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1487:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1545:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

[test-timeout-budget] load average 22.6 on 10 cores: unit limits 15800ms per test, 31600ms per hook (x3.16)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 75960ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 1407ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1675ms
     ✓ --file needs --workflow 446ms
     ✓ always writes the marker, even with no plan 901ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1478ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1306ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1633ms
     ✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 392ms
     ✓ refuses a github marker with fid "12-x" issue "abc" (exit 2) 349ms
     ✓ refuses a github marker with fid "12-x" issue "13" (exit 2) 322ms
     ✓ refuses a title carrying [skip ci] before calling gh (exit 4) 344ms
     ✓ refuses a title carrying [no ci] before calling gh (exit 4) 371ms
     ✓ refuses a title carrying [skip actions] before calling gh (exit 4) 515ms
     ✓ refuses a title carrying [actions skip] before calling gh (exit 4) 447ms
     ✓ refuses a PR from dev, main, or the base itself 1521ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1588ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2016ms
     ✓ exits 5 when the open-PR probe errors 1281ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1519ms
     ✓ prs open refuses --base=main 477ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 359ms
     ✓ prs open refuses --base=origin/main, the same branch as main 502ms
     ✓ prs open refuses --base=heads/main, the same branch as main 361ms
     ✓ prs open refuses --base=refs/remotes/origin/main, the same branch as main 993ms
     ✓ prs open still opens against any other base 1061ms
     ✓ exits 6 when the created PR's base is not --base 973ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1558ms
     ✓ exits 1 with found=false when there is none 1843ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1261ms
     ✓ --number reads one PR, mergeable included 1371ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 950ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1374ms
     ✓ refuses a bad --state or --number 478ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 602ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 486ms
     ✓ flags [no ci] in the landed commit body (exit 1) 492ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 622ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 702ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 710ms
     ✓ passes a token-free body 707ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 526ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 485ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 718ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 912ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1369ms
     ✓ drops the force-build marker from the title subject 815ms
     ✓ takes an explicit --subject 874ms
     ✓ runs no merge when the PR is already MERGED 1042ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1174ms
     ✓ prs merge refuses a PR whose base is main 680ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 888ms
     ✓ prs merge refuses when the PR base is unknown 871ms
     ✓ prs merge reads the base from the one pr view it already makes 959ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 939ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 944ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1275ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 946ms
     ✓ exits 2 on a bad --number 320ms
     ✓ never reads dev's required checks without --only-if-required 753ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 803ms
     ✓ updates when a dev ruleset requires status checks 1073ms
     ✓ updates when dev's branch protection requires status checks 1034ms
     ✓ ignores dev rulesets that require no checks 1132ms
     ✓ updates when the repo cannot be resolved 734ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 915ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 946ms
     ✓ is not green when a check failed, naming it (exit 1) 777ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 948ms
     ✓ is not green on an empty rollup (total 0) 1284ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1207ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1562ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 845ms
     ✓ is a no-op when the title already says so 816ms
     ✓ strips the marker, with or without its bkit prefix 1028ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1629ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 582ms
     ✓ records a skip token found in the body, then exits 1 526ms
     ✓ exits 8 on an unreadable commit, writing nothing 795ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 1036ms
     ✓ needs --scan or --scan-result 645ms
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests | 1 failed) 92886ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 1107ms
     ✓ continues after friction and diagnostic writes fail without recursion 1607ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 1926ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 8401ms
   ✓ routine publication policy (8)
     ✓ creates then appends routine sections under explicit invocation ownership 1129ms
     ✓ deduplicates known reports using available receipts and bounded markers 1002ms
     ✓ appends changed report versions without replacing prior text 624ms
     ✓ classifies attention and terminal reports from structured purpose 1424ms
     ✓ rolls over after intervening comments external edits and deletion 1721ms
     ✓ starts only new source after overflow or missing source 1248ms
     ✓ keeps standalone fallback exact and unassociated calls conservative 588ms
     ✓ uses exact new comment after a failed eligibility read 1120ms
   ❯ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 1115ms
     ✓ recognizes append success within budget without unnecessary resend 1324ms
     ✓ preserves a human correction after lost append recognition and a later report 858ms
     ✓ contains exhausted append and create failures without fabricated success 833ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 729ms
     ✓ keeps positive acknowledgment after receipt cache or postflight failure 723ms
     × reserves new comment opportunity within total delivery budget 2637ms
     ✓ contains preparation state lock and reconciliation exceptions 1169ms
     ✓ attempts independent attention after routine uncertainty 1455ms
     ✓ seals an acknowledged segment after a postflight intervening comment 954ms
   ✓ trackerTarget (3)
     ✓ github: the issue from the FID, owner/repo from origin 469ms
     ✓ linear and jira: the uppercased key from the FID, plus team / site 589ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 1033ms
   ✓ splitAt (7)
     ✓ budgets continuation headers beyond ninety nine parts 6ms
     ✓ refuses aggregation with an unverified provider budget 2ms
     ✓ budgets the entire encoded body at limit and overflow 4ms
     ✓ keeps non BMP code points intact in deterministic parts 4ms
     ✓ keeps a body at the limit whole 6ms
     ✓ splits one over the limit at line breaks; every part generated-marked, labelled, under the limit 5ms
     ✓ hard-splits a single line longer than the limit 2ms
   ✓ progress inspection (11)
     ✓ rejects inconclusive Linear creation order before selecting recent comments 332ms
     ✓ orders Linear comments by creation instant across timestamp offsets 394ms
     ✓ reads Jira ownership evidence and seals HTML or anonymous representations 459ms
     ✓ edits Jira comments with verified preflight evidence 367ms
     ✓ edits by verified comment id through each existing transport 1948ms
     ✓ seals unavailable or unstable representation evidence 1034ms
     ✓ uses accepted final preflight eligibility without provider atomicity 1093ms
     ✓ rejects marker preserving external edits 1047ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1031ms
     ✓ returns owned comment identity and stable representation evidence 1159ms
     ✓ selects newest created comment across complete pages 1639ms
   ✓ classification (7)
     ✓ HTTP 401  -> auth 9ms
     ✓ HTTP 403 Resource not accessible by personal access token -> scope 5ms
     ✓ HTTP 403 API rate limit exceeded -> rate-limit 2ms
     ✓ HTTP 404  -> not-found 6ms
     ✓ HTTP 429  -> rate-limit 5ms
     ✓ HTTP 500  -> http-500 3ms
     ✓ network errors: DNS failure, refused connection, timeout 5ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 775ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 944ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 908ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1037ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 925ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 793ms
     ✓ fetches the issue and its comments as GitHub returns them 1232ms
     ✓ github fetch marks a closed issue terminal and an open one not 2113ms
   ✓ linear client (6)
     ✓ linear fetch marks a completed state renamed Shipped terminal 326ms
     ✓ linear fetch marks a canceled state terminal and a started state not 346ms
     ✓ posts through GraphQL commentCreate with the API key as Authorization 394ms
     ✓ no key -> auth, and fetch is never called 257ms
     ✓ GraphQL errors map by code; DNS failure is network 271ms
     ✓ fetches title, url, state, labels, description and comments 446ms
   ✓ jira client (MCP over HTTP) (6)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 394ms
     ✓ splits a body over 32,767 characters into consecutive comments 367ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 548ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 401ms
     ✓ jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not 422ms
     ✓ pins the Rovo tool names .bkit/trackers.md lists 31ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 1468ms
     ✓ caches exact engine source with available progress identity 917ms
     ✓ keeps original body identity separate from time and changed output 1359ms
     ✓ reuses matching invocation state without adopting foreign ownership 2475ms
     ✓ invalidates missing corrupt and unsupported progress cache 4426ms
     ✓ contains cache read and write failures as standalone degradation 1815ms
     ✓ uses legacy receipts and contains receipt failures 1204ms
     ✓ skips issue-less runs and tracker none 683ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1507ms
     ✓ a recent identical comment counts as done (the final close comment) 1089ms
     ✓ a failed post reports done false with the reason and never leaks a token 1353ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1364ms
     ✓ linear: label ids by name (creating a missing one), then the state by name 416ms
     ✓ linear: a state the team lacks is not-found, after the labels landed 330ms
     ✓ jira: the full label set (keeping labels that are not bkit's), then the matching transition 515ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1318ms
     ✓ a board the token cannot see is scope 1159ms
     ✓ an HTTP 403 from gh is scope 909ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1259ms
     ✓ github: no block, no blockers and no further reads 1350ms
     ✓ linear: inverse blocks relations; done and canceled are closed 498ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 424ms
   ✓ generated marker hash (2)
     ✓ stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are 6ms
     ✓ reads the hash from a markdown heading, an HTML h6 and leading blank lines 3ms
   ✓ writeBodyFile (1)
     ✓ writes the body verbatim under the checkout's tmp/ and returns the absolute path 325ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 1028ms
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 399ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 541ms
     ✓ a different marker hash posts 1162ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1010ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 312ms
     ✓ fetchIssue pages comments past the first page 290ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 370ms
     ✓ an ADF comment or description body reads as text, never a JSON blob 303ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 110913ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 2008ms
   ✓ resolveGate (6)
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 564ms
     ✓ no package.json, no scripts, or unparseable -> null 792ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1407ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1016ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 669ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1085ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 588ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 393ms
     ✓ no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix) 334ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 597ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 780ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1161ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1637ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1320ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1372ms
     ✓ PASS is 0 failures with or without reports 1154ms
     ✓ clears a previous attempt's reports before the gate runs 1025ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 693ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1997ms
     ✓ a log under the outbox is named main-checkout relative in the record 1567ms
     ✓ a log small enough is copied whole: not clamped, raw null 776ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1636ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1939ms
     ✓ numbers runs within the workflow's active run and per step 2026ms
     ✓ without --file no row is written and the output carries row null 710ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 639ms
     ✓ plan-check refuses a task without DONE WHEN 406ms
     ✓ plan-check refuses DEPENDS ON a later group 579ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 460ms
     ✓ plan-check matches a Markdown heading symbol 527ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 331ms
     ✓ plan-check walks a dotted key through indented JSON, YAML and TOML 446ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 386ms
     ✓ plan-check skips existence on ticked tasks 343ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 583ms
     ✓ plan-check refuses an unmapped matrix row 326ms
     ✓ plan-check refuses a delete with no supersession row 450ms
     ✓ plan-check refuses a matrix row mapped to two tasks 357ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 539ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 449ms
     ✓ plan-check refuses a Task cell naming an undefined task 548ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 779ms
     ✓ plan-check refuses a group with 6 tasks 306ms
     ✓ plan-check refuses a group with 26 planned tests 325ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 312ms
     ✓ plan-check report lists groups, not a verdict 346ms
     ✓ plan-check follows bkit.workflows.tasks 677ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 527ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1629ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1679ms
     ✓ a planned test absent from a loaded report is a missing gap 1401ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1897ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 2253ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 935ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2760ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 2453ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 2382ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 1017ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 3791ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 2168ms
       ✓ a later unproven result never replaces a proven red of the same lines 572ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 3690ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 2245ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 4546ms
     ✓ green: a passed-accepted test is already landed, not a gap 2182ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1766ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 760ms
     ✓ green refuses a plan with no task markers 561ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1552ms
     ✓ green: --group audits only that group's tasks 1232ms
     ✓ green: --group naming a group with no tasks is refused 507ms
     ✓ green: a code fence never closed is the reason, not missing task markers 632ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1990ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 2666ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1555ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 2393ms
     ✓ green: lists each gap kind, with the runner output 2347ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 3636ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1454ms
       ✓ green clears an exception-only task from a human commit 921ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 151762ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 2821ms
     ✓ preserves local clamp enforcement when completing test rounds 842ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 886ms
     ✓ done prints progressLine 552ms
     ✓ gate progress number validation 934ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 2316ms
     ✓ done --group writes group on the row 882ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 1436ms
     ✓ --commit=none writes the row and leaves it uncommitted 559ms
     ✓ build-group-start records parentSha and group 740ms
     ✓ carries extra fields, parsed as JSON when they are JSON 1542ms
     ✓ refuses artifact ["--artifact=logs/missing.md"] before writing anything 567ms
     ✓ refuses artifact ["--artifact=../outside.md"] before writing anything 399ms
     ✓ refuses an empty artifact 410ms
     ✓ rejects ["--verdict=PASS","--failures=1"] 429ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 681ms
     ✓ rejects ["--verdict=MAYBE"] 662ms
     ✓ rejects ["--strategy=YOLO"] 776ms
     ✓ rejects ["--failures=-1"] 520ms
     ✓ rejects ["--field=verdict=PASS"] 621ms
     ✓ rejects ["--status=SKIPPED"] 574ms
     ✓ needs a message unless --commit=none 740ms
     ✓ reports a failed commit with exit 8 without writing the row 1768ms
     ✓ a failed commit leaves no row staged in the index 2501ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 2868ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 3062ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2325ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1531ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1770ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 522ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ no marker artifact exits 2 451ms
     ✓ disallowed artifact exits 3 387ms
     ✓ bad failures artifact exits 4 311ms
     ✓ a required field that is absent is invalid (re-prompt) 435ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 365ms
     ✓ only reads above the marker 625ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1177ms
     ✓ fails when no row was written for the step 373ms
     ✓ --ref reads the status file as committed on that ref, not from disk 1075ms
     ✓ --ref exits 3 when the ref does not carry the status file 1645ms
     ✓ fails on a placeholder left in the artifact 1247ms
     ✓ fails when the row's verdict differs from the artifact's 1109ms
     ✓ fails when the row does not list the artifact, or carries another attempt 1418ms
     ✓ fails on a missing artifact 1453ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 1099ms
     ✓ refuses a negative or non-integer attempt (2) 422ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 599ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 463ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 441ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 635ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 513ms
     ✓ fails a diagnose row missing its strategy, passes with it 1066ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1403ms
     ✓ names every missing field at once 512ms
     ✓ asks nothing of a step that writes none of them 730ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ re-asks (exit 6) when a field the prompt declares is missing 410ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 446ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 716ms
     ✓ a true | false header field is true when any agent sets it true 686ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 1265ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 2885ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 5037ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 2282ms
     ✓ --post needs --number; without --post there is no tracker key 828ms
   ✓ bkit steps stub (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ checks the FID's shape for the wired tracker 577ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 841ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 390ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1929ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1514ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 1464ms
       ✓ gate --issue without --fid is a usage error 641ms
       ✓ gate --issue="" under none keeps today's check 629ms
     ✓ --attempt-of checks the row carries the derived counter 1126ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 97971ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2058ms
     ✓ names each net-new and worsened finding in the log and the JSON 2624ms
     ✓ fails on a net score rise with no net count change 2411ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 2101ms
     ✓ treats a net score at or below 0.001 as float noise 1837ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 2331ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 1255ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1914ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 2027ms
     ✓ exits 4 on a dropped net field instead of silently passing 2769ms
     ✓ exits 4 on no summary instead of silently passing 1752ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1697ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 2912ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2506ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2984ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1630ms
     ✓ explicit globs can select ignored prose and nested checkout files 1057ms
     ✓ fails closed when the git index cannot be read 838ms
     ✓ fails closed when a selected prose source cannot be read 670ms
     ✓ fails when vale is not installed 375ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1017ms
     ✓ fails (exit 1) when vale reports alerts 1049ms
     ✓ exits 6 on a vale runtime error 1224ms
     ✓ skips with exit 0 when no file matches 662ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1781ms
     ✓ falls back to vale sync when the main worktree has none 1340ms
     ✓ fails when vale sync cannot restore the required styles 1598ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 2089ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 1276ms
     ✓ is a usage error when the commit cannot be read 1137ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 1591ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 1800ms
     ✓ exits 1 naming the files outside, whatever the commit message says 2078ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 3149ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 2085ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 1360ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1276ms
     ✓ source file is not treated as gate config 1378ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 1195ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 4613ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ runs code.ts through its declared gate in the built checkout 5298ms
     ✓ runs code.ts through its declared gate in the built checkout 7292ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 5861ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 5956ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 4501ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 3301ms
     ✓ runs the full gate for replayed debug code 4621ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 6240ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 6989ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 6561ms
     ✓ a push that fails without a server answer is returned once, never retried 5802ms
     ✓ a failed fetch is returned before anything is built 1901ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 8224ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 4942ms
     ✓ lands from a clone whose fetch refspec omits dev 7290ms
     ✓ build throwing stops the landing and removes the throwaway checkout 2457ms
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 861ms
     ✓ fails with a fetch error when there is no origin to rebase onto 1380ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 834ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 914ms
     ✓ tells a caller inside the removed worktree where to cd 953ms
     ✓ fails with its own exit code when git cannot remove a marked path 603ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 3024ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1298ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 835ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1163ms
     ✓ reports excluded intervals as unread even when pagination finishes 917ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 991ms
     ✓ reports an unread remainder at the page cap 1004ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1120ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 606ms
     ✓ rejects missing summaries instead of treating them as empty results 840ms
     ✓ reports a failed first page as unavailable 771ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 464ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1475ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 848ms
     ✓ follows summary cursors even when the first page is shorter than the limit 885ms
     ✓ reports excluded intervals as unread even when pagination finishes 894ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1005ms
     ✓ reports an unread remainder at the page cap 944ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 888ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 753ms
     ✓ rejects missing summaries instead of treating them as empty results 711ms
     ✓ reports a failed first page as unavailable 704ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 579ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (190 tests) 224699ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 1560ms
     ✓ filters branch and PR discovery by configured workflow and exact head 3172ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1693ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 6626ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 4737ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ validates normalized fallback evidence against the requested identity 1389ms
   ✓ fixture gh stub (10)
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 348ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 328ms
   ✓ bkit runs gate (68)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 484ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 389ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 333ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 435ms
       ✓ both floor steps failing is regenerable 312ms
       ✓ any failed step off the list makes the whole result unregenerable 380ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 435ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 417ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 386ms
       ✓ a timed-out step counts as failed 347ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 668ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 486ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 447ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 362ms
     ✓ tells an API error (20) from no run (10) 672ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 398ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 507ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 468ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --event (5)
       ✓ --event push selects the green push run beside an in-flight pull_request run 399ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 505ms
       ✓ without --event the newer green pull_request run masks the failed push run 511ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 700ms
       ✓ a run still in progress whose capstone already passed passes 479ms
       ✓ a failed capstone fails (12) even when every other job passed 337ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 1140ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 1068ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 3008ms
       ✓ a source change past the validated head refuses (17) and names the path 2260ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 2869ms
       ✓ --validated equal to --head is the plain head check 400ms
       ✓ --validated without --month / --fid is a usage error (2) 2189ms
       ✓ a validated sha that is not an ancestor refuses (17) 1663ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 458ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 352ms
     ✓ CLI: a failed gh workflow run exits 5 417ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1364ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1605ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 3091ms
     ✓ a failed re-trigger push names the cause in the log 2834ms
     ✓ a failed re-trigger push leaves no orphan commit behind 3683ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 5714ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2266ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1296ms
     ✓ gh-error: every poll errored 1321ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2287ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2748ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 3294ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 2859ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 11400ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 9884ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 2644ms
     ✓ re-trigger on dev only uses the record of its own FID 3245ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 3327ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] inherited into the landed commit body 494ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 752ms
     ✓ an empty or unreadable sha is an error, not a clean result 476ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 926ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 712ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 680ms
     ✓ a refused capstone records FAIL with its reason 748ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1055ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1712ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1657ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 800ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1900ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2192ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1709ms
     ✓ --file and --step go together 1874ms
[feat/test 9bcc875] gate
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 1741ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 1319ms
     ✓ staging failure: exit 4 and no commit is created, no false success 1434ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1251ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 1060ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 1065ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 1140ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 360ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 339ms
     ✓ --root defaults to the working directory 1292ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 1579ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 1261ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 740ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 2429ms
> [bkit] TRUNCATED HERE — 75 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 665ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 722ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 645ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 697ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1569ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1290ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1047ms
     ✓ --file into a missing directory is refused, not created 1222ms
   ✓ bkit runtime assert (8)
     ✓ derives runtimeHeadless from the row's runtime; the row never stores it 354ms
(node:71867) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1821ms
     ✓ resolves config from the repo root when run from a subdirectory 1351ms
     ✓ exits 6 when the PUT fails 754ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 506ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 853ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 637ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 630ms
     ✓ exits 6 when the api answer is not JSON 782ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 84179ms
> [bkit] TRUNCATED HERE — 76 lines omitted. Dropped content was NOT read.
     ✓ a bare number with no issue prints a hint to write #N 816ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 4542ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 463ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 787ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ refuses (exit 9) to mint from the workflow name when the prompt holds only a bare number 1129ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 1712ms
     ✓ 6. a FID that fails the format check exits 1 1245ms
     ✓ a missing title or prompt file exits 7 537ms
   ✓ bkit fids plans (2)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 91901ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 9099ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 8944ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 1183ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 1223ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 1344ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 9820ms
     ✓ does not fall back through a malformed later success receipt 4732ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 3522ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 2971ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 6332ms
     ✓ requires proof even when the pushed increment changes no files 3680ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 2251ms
     ✓ does not record a committed tree 2399ms
     ✓ records no proof for a failed gate or lighter gate 3775ms
     ✓ requires integration proof when integration is declared 6650ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 9369ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 3200ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1206ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2845ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1200ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1611ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1494ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1167ms
     ✓ an unpinned repo reports nulls and asks no registry 1166ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 659ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 572ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 745ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 495ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 100096ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1334ms
     ✓ counts files committed since --base 1473ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1327ms
     ✓ runs nothing and exits 0 when no file changed 780ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1297ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 507ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1392ms
     ✓ runGit names ENOBUFS when output passes the limit 1508ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1431ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests) 20493ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 555ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 354ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 513ms
     ✓ refuses an unknown phase or on/off value 424ms
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 3435ms
     ✓ keeps each context's own section banner and drops every other context's 4154ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 521ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 356ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 371ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 651ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1353ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3192ms
     ✓ a refused dev push is logged, never fails the close 3912ms
     ✓ an unreachable remote is logged, never fails the close 1308ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (37 tests) 7047ms
   ✓ bkit challenge merge (32)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 884ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1707ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 750ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 10300ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests) 6986ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 367ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 397ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 452ms
   ✓ bkit locks acquire --kind=workflow — ship (1)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1173ms
     ✓ passes every rule on a clean head 513ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 585ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (42 tests) 4450ms
   ✓ runLines (5)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 473ms
     ✓ passes when only another key changed, such as a branch's upstream 444ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 569ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 643ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 484ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (75 tests) 3308ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 4514ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
   ✓ documented read-only ledger helper (11)
     ✓ keeps numeric winners, later ties and implicit ACTIVE rows before filtering 723ms
     ✓ reports malformed input as an error 663ms
     ✓ rejects null timestamp instead of reporting a successful read 405ms
     ✓ rejects empty key instead of reporting a successful read 373ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 370ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 341ms
     ✓ runs from the checkout top even when called from a subfolder 414ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (89 tests) 4212ms
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
   ✓ ship gate against the template's job names (2)
     ✓ finds the capstone among the template's jobs and passes when it is green 520ms
     ✓ refuses when the template's capstone job fails 425ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 658 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 180 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 912ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 1790ms
   ✓ bkit completeness check (6)
     ✓ always exits 0 on a holey run 379ms
     ✓ infers each run's workflow when --workflow is absent 362ms
     ✓ renders the contract for the tracker of the repo holding the file 805ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 1033ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (54 tests) 1327ms
   ✓ readChangelogVersionDelta (5)
     ✓ resolves CHANGELOG.md from the built dist/ layout 386ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 2404ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1997ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 1303ms
   ✓ detectProjectDocs (19)
     ✓ recognizes the v6.1.1 untouched security starter as unpopulated 307ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 479ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 1278ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 935ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 903ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 771ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 453ms
(node:94810) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:94810) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 758ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 475ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 1128ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 317ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 551ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 420ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-llbIXw/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 567ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 686ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 458ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-D2UqFA/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > a consumer edit survives a no-op upgrade and is a conflict on the next template change
[bkit-upgrade] conflict: .bkit/scripts/bkit-foo.sh — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 412ms
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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 301ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 267ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 185ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 345ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 316ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 23641ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 23619ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 215ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 163ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 314ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 205ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 157ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 212ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 405ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 229ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 318ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 323ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 231ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 196ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 164ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 150ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 207ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 195ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 223ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 163ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 234ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 114ms
(node:99378) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:99378) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:99378) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:99378) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 189ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 136ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 383ms
   ✓ consumer-facing names carry the bkit prefix (6)
     ✓ workflow and job display names 343ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 76ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 137ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 73ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 92ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 94ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 74ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 75ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (48 tests) 278ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 108ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 57ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794311623398.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794311623412.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794311623414.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794311623666.js — skipping

 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 252ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 305ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 286ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 81ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 145ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 338ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 83ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 136ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 323ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 145ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 60ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 109ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 106ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 75ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 164ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 219ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 100ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 51ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 104ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 34ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 80ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 118ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 38ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 50ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 16ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 62ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 40ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 36ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 19ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 13ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 29ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 18ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 356187ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 1844ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 6458ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 763ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 807ms
     ✓ writes no limits for a workflow with no ask point 866ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 1114ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 1519ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 1443ms
       ✓ a new run in the same chat gets its own session row 2223ms
       ✓ writes none outside Claude Code 1110ms
     ✓ opens the next run after a finished one, and after another workflow's run 1809ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 1202ms
     ✓ design / plan / build / debug book in the current worktree 1950ms
     ✓ refuses when the lock is live, writing no row 763ms
     ✓ --lock-held checks the lock is ours 1044ms
     ✓ rejects an unknown workflow 442ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 1163ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 2578ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 1417ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 793ms
     ✓ an OPEN decision of an earlier run never resurfaces 1078ms
     ✓ an OPEN decision mid-build prints its header fields 887ms
     ✓ reads Test attempt from a tests pause 815ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 1534ms
     ✓ writes no row when status.jsonl does not exist 1297ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 1175ms
     ✓ aborts a rebase only when one is in progress 2376ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1800ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 2522ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 1239ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1632ms
     ✓ --max-exceeded says a handover is due without any sentinel 1292ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 1108ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1296ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 1486ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 616ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 672ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 700ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 659ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 896ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 1265ms
     ✓ a debug run in SOAK mode always needs a handover 1370ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 2523ms
       ✓ counts subagents of an earlier chat the run's session rows name 5408ms
       ✓ records no context block, and still closes, outside a Claude Code session 3461ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 2488ms
     ✓ records ending held and publish false on the workflow-done row 3290ms
     ✓ defaults the close row to ending done 3204ms
     ✓ refuses an unknown ending 1545ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 4222ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 2393ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 2508ms
     ✓ always writes the telemetry, whatever the runtime 1993ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1501ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 2401ms
     ✓ an unwritable stats path is logged and never fails the close 3526ms
     ✓ appends the completeness row before the workflow-done row 2782ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 3633ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 2763ms
     ✓ writes one completeness row per close 3346ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1846ms
     ✓ still closes when the completeness check throws 2359ms
     ✓ still closes when the completeness row write throws 2355ms
     ✓ refuses without status.jsonl and writes nothing 949ms
     ✓ ship: run.pr, size of the squash commit, and coverage 3041ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 3958ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 2638ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 2432ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 3633ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 4807ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 5063ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 3655ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 3102ms
     ✓ --record-step writes the close step's row before workflow-done 2842ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 2535ms
     ✓ --number without --outbox is a usage error 3131ms
     ✓ --flush is ship only 1249ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 3971ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 3088ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 3642ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 4064ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 2985ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 1405ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 1393ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 8245ms
     ✓ --flush with nothing to record commits and pushes nothing 4395ms
     ✓ --flush carries the named worktree's logs into the dev commit 8011ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 8275ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 8347ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 10438ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 9640ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 12175ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 10908ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 8728ms
     ✓ --push on dev never carries a row whose references name another feature 7155ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 6805ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 7640ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4517ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2425ms
     ✓ rejects --push with --flush, and --flush outside ship 485ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 7061ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 7307ms
     ✓ a close that landed releases the lock 7860ms
     ✓ removes the worktree before it releases the lock 6623ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5036ms
       ✓ closePr refuses when the PR base is unknown 2464ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1715ms
   ✓ bkit workflows links (2)
     ✓ names the branch, not the remote-tracking ref, in each URL 312ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 353ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 877ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 619ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1524ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 438ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 467ms
     ✓ a second run's record does not let this FID's close commit 513ms
     ✓ record is present after workflows close and before the push 861ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1710ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 328ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 454ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1160ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 859ms
     ✓ puts each --line after the summary, in flag order 861ms
     ✓ --summary prints the file and keeps a copy in --outbox 849ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1035ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 468837ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 2949ms
     ✓ rejects missing explicit and ambiguous existing branch selections 2545ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 1012ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 3081ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 2850ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 2568ms
     ✓ a refused --continue carries git's own reason 3514ms
     ✓ --file records nothing for a refused rebase 2526ms
     ✓ refuses a code conflict and aborts the rebase on the spot 2878ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2736ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 3152ms
     ✓ produces byte-identical output to merge=union 4635ms
     ✓ restores a trailing newline so the next append starts on its own line 2894ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 2685ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 3958ms
     ✓ refuses a union that leaves a line which is not JSON 2484ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 3421ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 3426ms
     ✓ refuses a lockfile whose regenerate command fails 3253ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 4681ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 6734ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 4422ms
     ✓ refuses and aborts when both sides changed the hand-written region 3016ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 3923ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 4459ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 4906ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 2388ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 2596ms
     ✓ refuses and aborts when a side deleted the install record 2258ms
     ✓ refuses a conflicted doc the repo's script does not list 2613ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 2037ms
     ✓ removes a stale sentinel when the rebase succeeds 3834ms
     ✓ exits 4 when no rebase is in progress 1017ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 3690ms
     ✓ resolves a conflict in each of two replayed commits across rounds 2486ms
   ✓ branches anchor-stamp (19)
     ✓ records the bkit release, and warns visibly under the block when it is outdated 379ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 303ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 373ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1504ms
       ✓ skips (12) with no anchor 1452ms
       ✓ skips (12) when the base is unreachable in this clone 1722ms
       ✓ skips (12) when nothing landed since the base 2245ms
       ✓ runs (0) with the landed path count once dev moved 3311ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 1910ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 4114ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 2346ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 3291ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 5866ms
     ✓ runs exactly one git push 4230ms
     ✓ --set-upstream records the upstream 2907ms
     ✓ refuses with no branch checked out 2231ms
     ✓ --mode=dev refuses a feature checkout 1818ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 5979ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 9111ms
     ✓ --require-ci pushes as-is when dev has not moved 3418ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 5897ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 8792ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 2399ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2758ms
     ✓ --mode=abort pushes when the branch has no open PR 3053ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2615ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1757ms
     ✓ --open-pr carries the MCP answer and skips gh 3014ms
     ✓ --mode=abort on dev pushes plainly without probing 2334ms
     ✓ rejects an unknown mode 1686ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 8949ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 4466ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 5041ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 10472ms
     ✓ skip-ci HEAD on the replay is refused 4011ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 9701ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 13896ms
     ✓ a level local dev is a plain push, recording nothing extra 5103ms
     ✓ a record with no commits pushes nothing 3131ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1723ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3481ms
     ✓ a rewritten branch is refused, never forced 2939ms
     ✓ refuses dev and main with exit 21 and pushes nothing 3134ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 3097ms
     ✓ refuses a detached HEAD (exit 5) 1092ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2161ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2020ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2284ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2943ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1256ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2744ms
     ✓ an up-to-date branch is a no-op 1761ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2757ms
     ✓ a fetch that fails exits 10 2170ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 2446ms
     ✓ scan-diff still reports a new skip when its test … 2388ms
     ✓ scan-diff reports a skip moved onto a different t… 2724ms
     ✓ scan-diff does not cancel a skip moved between am… 1997ms
     ✓ scan-diff does not spend an unchanged duplicate t… 2965ms
     ✓ scan-diff recognizes a renamed test file 1972ms
     ✓ scan-diff recognizes a suite moved into a differe… 1872ms
     ✓ scan-diff does not let unrelated additions hide a… 2179ms
     ✓ scan-diff attributes deletion to its old test ins… 1425ms
     ✓ scan-diff consumes each moved assertion once and … 1805ms
     ✓ scan-diff does not match identical assertions fro… 2306ms
     ✓ scan-diff does not match the same leaf test name … 1809ms
     ✓ scan-diff does not match a same-named test with d… 1207ms
     ✓ scan-diff does not match a same-named test with c… 619ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 542ms
     ✓ --paths with no match exits 1 413ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 301ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 588ms
     ✓ --marker reads a diff over 1 MiB 494ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1451ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 650ms
     ✓ scan-diff finds an added skip 506ms
     ✓ scan-diff ignores a skip predating the base 452ms
     ✓ scan-diff reports a disabled test with its line 542ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 621ms
     ✓ scan-diff ignores a removed comment in a test file 668ms
     ✓ scan-diff ignores an assertion moved within the file 740ms
     ✓ scan-diff still reports a removed assertion 965ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1009ms
     ✓ scan-diff finds an added pytest mark skip 766ms
     ✓ scan-diff finds an added unittest skip 591ms
     ✓ scan-diff finds an added bare skip call 573ms
     ✓ scan-diff ignores a quoted skip in a documentation file 539ms
     ✓ scan-diff ignores a marker literal in a non-test source file 556ms
     ✓ scan-diff ignores an assertion whose expectation changed 545ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 518ms
     ✓ scan-diff reports a deleted test file 601ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 407ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1731ms
     ✓ a title that already carries the marker is left alone 1599ms
     ✓ with no open PR: pushes the marker commit and edits no title 1599ms
     ✓ a re-run is deduped: no second marker commit 2128ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1979ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 414ms
     ✓ --title-set skips gh entirely 581ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 387ms
     ✓ Path B once dev moved; --head checks a given commit 556ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 625ms
     ✓ --merge-docs merges dev when docs/ is behind 787ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1878ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2070ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1500ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1764ms
     ✓ --merge-docs skips an empty bkit:generate script 1702ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1940ms
     ✓ --merge-docs never merges on dev itself 1459ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1442ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1061ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 732ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 820ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 443ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1258ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1540ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1501ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2047ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1798ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 3090ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1968ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 2421ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1522ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1261ms
     ✓ exits 10 when the fetch fails 761ms
     ✓ refuses --merge-docs with --head, and an unknown --head 537ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 807ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 984ms
     ✓ a failed install stops ship (16) 959ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1447ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 2598ms
     ✓ exits 10 when the fetch fails 1274ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 525ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 691ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2863ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2411ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2504ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 3767ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3716ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 7252ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1110ms
     ✓ local: names unpushed dev as the cause when the branch carries it 916ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 853ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2388ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 3157ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1437ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1745ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1736ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1636ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 937ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2481ms
     ✓ land removes the worktree when only the copied .env is untracked 1919ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1806ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2178ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3217ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1856ms
     ✓ landPr refuses a main-based PR without retrying 727ms
     ✓ landPr refuses when the PR base is unknown 708ms
     ✓ PR not open (closed): stops (17) at once, no retry 881ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 622ms
     ✓ --attempt names the merge round in a fix commit 619ms
     ✓ commits a rewritten and a deleted tracked file 845ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1344ms
     ✓ reports undeclared and runs nothing with no scripts 1036ms
     ✓ reports undeclared and runs nothing with an empty script 919ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 701ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 678ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 444ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.test.ts > bounded nonfatal publication > reserves new comment opportunity within total delivery budget
AssertionError: expected { Object (done, action, ...) } to match object { done: true }
(2 matching properties omitted from actual)

- Expected
+ Received

  {
-   "done": true,
+   "done": false,
  }

 ❯ requireOutcomeUrl .bkit/core/engine/commands/workflow/tracker.test.ts:335:18
    333| }
    334| function requireOutcomeUrl(result: Awaited<ReturnType<typeof postComme…
    335|   expect(result).toMatchObject({ done: true });
       |                  ^
    336|   if (!("done" in result) || !result.done) throw new Error("expected a…
    337|   return result.url;
 ❯ .bkit/core/engine/commands/workflow/tracker.test.ts:720:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 173 passed (174)
      Tests  1 failed | 7416 passed | 2 skipped (7419)
   Start at  21:48:14
   Duration  471.10s (tests 97%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/864-move-project-docs/run-tests-1.log.reports/vitest-40631.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.83 |    83.42 |   95.14 |   91.19 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   91.03 |    86.68 |   95.57 |   94.48 |                   
  auth.ts          |   98.09 |    93.93 |     100 |   98.85 | 71                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   95.48 |    92.36 |     100 |   97.03 | 264-265,276-277   
  index.ts         |   85.58 |    71.42 |     100 |    97.2 | ...01,321,418-419 
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
 ...mands/workflow |   92.31 |    84.71 |   96.36 |    93.8 |                   
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
  locks.ts         |   93.22 |    88.98 |   96.29 |   95.36 | ...09-211,474-475 
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
  summary.ts       |      96 |    89.54 |    94.2 |   96.29 | ...15-621,644,667 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   88.91 |    80.49 |   96.69 |   90.98 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.38 |     59.2 |   67.85 |   62.53 | ...1124,1127-1128 
 engine/install    |   93.34 |    85.11 |   94.44 |   96.08 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    90.14 |     100 |     100 | ...19,324,330-331 
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
Statements   : 89.83% ( 19170/21340 )
Branches     : 83.42% ( 14339/17188 )
Functions    : 95.14% ( 3076/3233 )
Lines        : 91.19% ( 16788/18409 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1996 of 3969 lines (142 KB of 301 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
