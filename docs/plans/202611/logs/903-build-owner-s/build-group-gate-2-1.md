
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 5 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 7 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 8 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 9 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 10 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-2 is waiting for tests (still, 11 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 97433, since 17:55:58), last run took 4m3s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
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
 434:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 515:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 637:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 720:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 1047:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1159:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1251:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1493:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1553:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 385:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 456:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 docs/deployments.md
 122:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 251:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 380:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 420:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 491:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> bkit ci slop

[bkit-ci] base 263f04b7c30c06833042d1dbb5031941bfb77b3d (263f04b7c30c06833042d1dbb5031941bfb77b3d) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 263f04b7c30c06833042d1dbb5031941bfb77b3d
base: 263f04b7c30c06833042d1dbb5031941bfb77b3d
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 9.2 on 10 cores: unit limits 9100ms per test, 18200ms per hook (x1.82)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 55776ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 331ms
     ✓ continues after friction and diagnostic writes fail without recursion 505ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 428ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2891ms
   ✓ routine publication policy (8)
     ✓ deduplicates known reports using available receipts and bounded markers 302ms
     ✓ classifies attention and terminal reports from structured purpose 314ms
     ✓ rolls over after intervening comments external edits and deletion 628ms
     ✓ starts only new source after overflow or missing source 418ms
     ✓ uses exact new comment after a failed eligibility read 389ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 310ms
     ✓ reserves new comment opportunity within total delivery budget 707ms
     ✓ contains preparation state lock and reconciliation exceptions 309ms
     ✓ attempts independent attention after routine uncertainty 310ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 327ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1341ms
     ✓ seals unavailable or unstable representation evidence 1656ms
     ✓ uses accepted final preflight eligibility without provider atomicity 1233ms
     ✓ rejects marker preserving external edits 1638ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1773ms
     ✓ returns owned comment identity and stable representation evidence 1449ms
     ✓ selects newest created comment across complete pages 1240ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 1212ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 818ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1671ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1043ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1026ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 530ms
     ✓ fetches the issue and its comments as GitHub returns them 638ms
     ✓ github fetch marks a closed issue terminal and an open one not 956ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 533ms
     ✓ caches exact engine source with available progress identity 734ms
     ✓ keeps original body identity separate from time and changed output 637ms
     ✓ reuses matching invocation state without adopting foreign ownership 1075ms
     ✓ invalidates missing corrupt and unsupported progress cache 1461ms
     ✓ contains cache read and write failures as standalone degradation 1242ms
     ✓ uses legacy receipts and contains receipt failures 1178ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1112ms
     ✓ a recent identical comment counts as done (the final close comment) 1220ms
     ✓ a failed post reports done false with the reason and never leaks a token 1244ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1237ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 972ms
     ✓ a board the token cannot see is scope 1381ms
     ✓ an HTTP 403 from gh is scope 824ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1681ms
     ✓ github: no block, no blockers and no further reads 1398ms
     ✓ jira: issues linked as 'is blocked by', open unless their status category is done 405ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 985ms
     ✓ a different marker hash posts 1626ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1113ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 65750ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 804ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 580ms
     ✓ done --group writes group on the row 508ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 721ms
     ✓ carries extra fields, parsed as JSON when they are JSON 430ms
     ✓ rejects ["--verdict=MAYBE"] 317ms
     ✓ reports a failed commit with exit 8 without writing the row 763ms
     ✓ a failed commit leaves no row staged in the index 1800ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1861ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1353ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1672ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1600ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1729ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 344ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 391ms
     ✓ --ref reads the status file as committed on that ref, not from disk 450ms
     ✓ --ref exits 3 when the ref does not carry the status file 508ms
     ✓ fails on a placeholder left in the artifact 374ms
     ✓ fails when the row's verdict differs from the artifact's 445ms
     ✓ fails when the row does not list the artifact, or carries another attempt 400ms
     ✓ fails on a missing artifact 425ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 479ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 337ms
     ✓ fails a run-tests row missing its scope, and an empty scope 417ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 578ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 675ms
     ✓ rejects --attempt with --attempt-of, and --agent with --verdict 402ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 471ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 805ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1185ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 885ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 944ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1310ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 793ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 337ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 652ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 568ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 446ms
     ✓ --attempt-of checks the row carries the derived counter 476ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1152ms
     ✓ writeStepRow refuses when a recorded path changed 1495ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 762ms
     ✓ writeStepRow appends its commit sha to the record 1431ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2258ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 485ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 3392ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1394ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 599ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1831ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1455ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 1035ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 719ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1985ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 547ms
     ✓ does not count an artifact the run found committed when it started 810ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 551ms
     ✓ commits a package.json change outside bkit.workflows 917ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1444ms
   ✓ bkit steps stub --result-file (12)
     ✓ derives supported header fields and rejects stale bodies without false PASS 303ms
     ✓ renders and verifies the header of every prompt that declares one 361ms
     ✓ renders no PASS from a result that omits its evidence 332ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 71298ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 540ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1204ms
     ✓ always writes the marker, even with no plan 530ms
     ✓ writes the linear marker shape, taking the tracker from package.json 811ms
     ✓ writes the jira marker shape, taking the tracker from package.json 968ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 495ms
     ✓ refuses a PR from dev, main, or the base itself 438ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1089ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2136ms
     ✓ exits 5 when the open-PR probe errors 1377ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1653ms
     ✓ prs open still opens against any other base 1390ms
     ✓ exits 6 when the created PR's base is not --base 1695ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 3686ms
     ✓ refuses merged entry when current feature evidence cannot be read 1283ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 1095ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 791ms
     ✓ exits 1 with found=false when there is none 1531ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1390ms
     ✓ --number reads one PR, mergeable included 422ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 866ms
     ✓ exits 4 when gh errors and 80 when it needs auth 650ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 706ms
     ✓ classifies a refused merge with a new dev conflict as integration 1039ms
     ✓ returns an explicit terminal reason for other merge refusals 791ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 833ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1201ms
     ✓ drops the force-build marker from the title subject 1046ms
     ✓ takes an explicit --subject 1300ms
     ✓ runs no merge when the PR is already MERGED 1039ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1273ms
     ✓ prs merge refuses a PR whose base is main 1053ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 935ms
     ✓ prs merge refuses when the PR base is unknown 480ms
     ✓ prs merge reads the base from the one pr view it already makes 1082ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1486ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1164ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1284ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1309ms
     ✓ never reads dev's required checks without --only-if-required 680ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1053ms
     ✓ updates when a dev ruleset requires status checks 953ms
     ✓ updates when dev's branch protection requires status checks 1505ms
     ✓ ignores dev rulesets that require no checks 1205ms
     ✓ updates when the repo cannot be resolved 2174ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1855ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 763ms
     ✓ is not green when a check failed, naming it (exit 1) 560ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 560ms
     ✓ is not green on an empty rollup (total 0) 809ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 856ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1211ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 773ms
     ✓ is a no-op when the title already says so 1227ms
     ✓ strips the marker, with or without its bkit prefix 1518ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1501ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 311ms
     ✓ records a skip token found in the body, then exits 1 338ms
     ✓ exits 8 on an unreadable commit, writing nothing 365ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 73655ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2207ms
     ✓ runs code.ts through its declared gate in the built checkout 2080ms
     ✓ runs code.ts through its declared gate in the built checkout 2349ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1716ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1546ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1428ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 878ms
     ✓ runs the full gate for replayed debug code 1320ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1793ms
     ✓ installs local dependencies against the built target tree 1866ms
     ✓ runs the configured frozen install even without root dependencies 1851ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1954ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2216ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2014ms
     ✓ never pushes local dev commits missing from origin/dev 2373ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4936ms
     ✓ dev moved before every push: exhausted, nothing landed 5769ms
     ✓ any other refusal is returned, not retried 2837ms
     ✓ pushToDev replays a commit range onto origin/dev 2944ms
     ✓ a replay retries on the new dev when dev moved 7489ms
     ✓ pushToDev log line names what it lands 2625ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2833ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2940ms
     ✓ a push that fails without a server answer is returned once, never retried 2652ms
     ✓ a failed fetch is returned before anything is built 754ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3536ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2261ms
     ✓ lands from a clone whose fetch refspec omits dev 3256ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1197ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 76051ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 884ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 489ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 531ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 972ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 508ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 737ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 509ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 666ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1537ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1589ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1480ms
     ✓ PASS is 0 failures with or without reports 1731ms
     ✓ clears a previous attempt's reports before the gate runs 1282ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1532ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1591ms
     ✓ a log under the outbox is named main-checkout relative in the record 1698ms
     ✓ a log small enough is copied whole: not clamped, raw null 980ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 990ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1329ms
     ✓ numbers runs within the workflow's active run and per step 778ms
     ✓ without --file no row is written and the output carries row null 1401ms
   ✓ bkit tests plan-check (35)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 321ms
     ✓ plan-check refuses DEPENDS ON a later group 467ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 899ms
     ✓ a planned test that passes is a vacuous gap, exit 1 1198ms
     ✓ a planned test absent from a loaded report is a missing gap 1199ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1483ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1623ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 402ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1616ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 940ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1624ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 301ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 4344ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1295ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1502ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1750ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 2376ms
     ✓ green: a passed-accepted test is already landed, not a gap 2636ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1507ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 339ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1563ms
     ✓ green: --group audits only that group's tasks 1394ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1976ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1696ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1205ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1215ms
     ✓ green: lists each gap kind, with the runner output 1283ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2292ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 779ms
       ✓ green clears an exception-only task from a human commit 689ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 100466ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 36143ms
     ✓ every prompt, workflow and utility agent has the three header blocks 517ms
     ✓ sync has nothing left to rewrite 29639ms
     ✓ every clause reaches the cut-off of one surface it applies to 2214ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 31351ms
[feat/test 9f0397d] gate
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 36168ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1059ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1847ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1048ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1756ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1093ms
     ✓ gh not on PATH at all also falls back to the remote 372ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 660ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1038ms
     ✓ counts commits behind origin/dev and the divergence age 1157ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 793ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1655ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1062ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 579ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 810ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 586ms
     ✓ an unpinned repo reports nulls and asks no registry 976ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 417ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 696ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 529ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1053ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 56447ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2448ms
     ✓ names each net-new and worsened finding in the log and the JSON 1607ms
     ✓ fails on a net score rise with no net count change 1147ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1318ms
     ✓ treats a net score at or below 0.001 as float noise 1189ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 942ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 468ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1558ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1116ms
     ✓ exits 4 on a dropped net field instead of silently passing 1039ms
     ✓ exits 4 on no summary instead of silently passing 985ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1413ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1121ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2107ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2480ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 1102ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1304ms
     ✓ fails (exit 1) when vale reports alerts 1273ms
     ✓ exits 6 on a vale runtime error 1157ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 719ms
     ✓ falls back to vale sync when the main worktree has none 1195ms
     ✓ fails when vale sync cannot restore the required styles 1121ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 635ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 529ms
     ✓ is a usage error when the commit cannot be read 362ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 658ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 530ms
     ✓ exits 1 naming the files outside, whatever the commit message says 538ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1053ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 663ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 563ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 36180ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3594ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 4571ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 601ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 621ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 940ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3951ms
     ✓ does not fall back through a malformed later success receipt 2305ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1525ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1371ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2629ms
     ✓ requires proof even when the pushed increment changes no files 1019ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 896ms
     ✓ does not record a committed tree 769ms
     ✓ records no proof for a failed gate or lighter gate 1322ms
     ✓ requires integration proof when integration is declared 1751ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2885ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 650ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 673ms
     ✓ staging failure: exit 4 and no commit is created, no false success 402ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 360ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 350ms
> [bkit] TRUNCATED HERE — 85 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 420ms
     ✓ fails with a fetch error when there is no origin to rebase onto 531ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 458ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 408ms
     ✓ tells a caller inside the removed worktree where to cd 452ms
     ✓ fails with its own exit code when git cannot remove a marked path 379ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1402ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 365ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 479ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 906ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 336ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 402ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 670ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 536ms
     ✓ --file into a missing directory is refused, not created 729ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 351ms
     ✓ filters branch and PR discovery by configured workflow and exact head 2032ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1399ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2358ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3834ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2603ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2773ms
     ✓ checks the named repository base and fails closed on missing evidence 1314ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1085ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1107ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 366ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 373ms
       ✓ a run still in progress whose capstone already passed passes 466ms
       ✓ a capstone still running is in progress (11) 1050ms
       ✓ a failed capstone fails (12) even when every other job passed 382ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 1416ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 657ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 927ms
       ✓ a source change past the validated head refuses (17) and names the path 888ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1066ms
       ✓ --validated without --month / --fid is a usage error (2) 690ms
       ✓ a validated sha that is not an ancestor refuses (17) 686ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 844ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1672ms
     ✓ a failed re-trigger push names the cause in the log 2254ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1970ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2662ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1486ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 917ms
     ✓ gh-error: every poll errored 752ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1641ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1316ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1716ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1410ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4197ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4325ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 639ms
     ✓ re-trigger on dev only uses the record of its own FID 994ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1334ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 534ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1465ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1210ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 392ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 665ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1036ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1398ms
     ✓ --file and --step go together 851ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
(node:65791) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 708ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1971ms
     ✓ a refused dev push is logged, never fails the close 2506ms
     ✓ an unreachable remote is logged, never fails the close 793ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 7668ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 897ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 967ms
     ✓ follows summary cursors even when the first page is shorter than the limit 596ms
     ✓ reports excluded intervals as unread even when pagination finishes 592ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 996ms
     ✓ reports an unread remainder at the page cap 913ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 485ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 563ms
     ✓ rejects missing summaries instead of treating them as empty results 1263ms
     ✓ reports a failed first page as unavailable 566ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 351ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 508ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 457ms
     ✓ follows summary cursors even when the first page is shorter than the limit 883ms
     ✓ reports excluded intervals as unread even when pagination finishes 440ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 511ms
     ✓ reports an unread remainder at the page cap 453ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 468ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 782ms
     ✓ rejects missing summaries instead of treating them as empty results 600ms
     ✓ reports a failed first page as unavailable 774ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 398ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 33004ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 777ms
     ✓ resolves config from the repo root when run from a subdirectory 491ms
     ✓ exits 6 when the PUT fails 533ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 369ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 502ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 820ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 533ms
     ✓ exits 6 when the api answer is not JSON 579ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 9733ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 798ms
     ✓ counts files committed since --base 1651ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1057ms
     ✓ runs nothing and exits 0 when no file changed 726ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1351ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 688ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1374ms
     ✓ runGit names ENOBUFS when output passes the limit 1052ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1416ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 668ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1388ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 488ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 4072ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 837ms
     ✓ passes every rule on a clean head 399ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 368ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (82 tests) 4399ms
   ✓ bkit status invocation (7)
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
     ✓ answers for the cwd, not an inherited GIT_DIR 500ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 365ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 401ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 342ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 861 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 190 lines omitted. Dropped content was NOT read.
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

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 414ms
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 684ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 431ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 311ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 210ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-m312hk/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 270ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 387ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 291ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 408ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 275ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 214ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 271ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 93ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 226ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 139ms
(node:88358) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:88358) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 152ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 143ms
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

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 166ms
stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 201ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 86ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 63ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-XNNWmH/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 168ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 132ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 110ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 253ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 226ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 242ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 199ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 183ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 89ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 129ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 100ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 144ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 200ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 113ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 110ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 179ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 350ms
   ✓ textOmit audit (12)
     ✓ no workflow or prompt code span reads an omitted key 326ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 103ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 90ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 136ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 149ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 33ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 122ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 65ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 46ms
(node:91365) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:91365) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:91365) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:91365) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 89ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 50ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 70ms
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
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 44ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794471115792.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794471115797.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794471115798.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794471115808.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (34 tests) 39ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 53ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 117ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 30ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (15 tests) 32ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 64ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 46ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 42ms
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

 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 54ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 38ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 39ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 33ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 63ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 19ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 26ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 20ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 18ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 22ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 87ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 14ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 17ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 41ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 43ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (162 tests) 186889ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 563ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1833ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 548ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 343ms
     ✓ writes no limits for a workflow with no ask point 302ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 323ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 426ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 478ms
       ✓ a new run in the same chat gets its own session row 719ms
       ✓ writes none outside Claude Code 496ms
     ✓ opens the next run after a finished one, and after another workflow's run 642ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 564ms
     ✓ design / plan / build / debug book in the current worktree 439ms
     ✓ --lock-held checks the lock is ours 371ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 323ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 608ms
   ✓ bkit workflows start — resume facts (8)
     ✓ an OPEN decision of an earlier run never resurfaces 309ms
     ✓ openDecision carries the Gate header 300ms
     ✓ openDecision gate is null without the header 317ms
     ✓ openDecision gate ignores a Gate line below the header 306ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 364ms
     ✓ aborts a rebase only when one is in progress 658ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 771ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 536ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 352ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 431ms
     ✓ --max-exceeded says a handover is due without any sentinel 309ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 383ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 366ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 448ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 777ms
       ✓ counts subagents of an earlier chat the run's session rows name 888ms
       ✓ records no context block, and still closes, outside a Claude Code session 892ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 903ms
     ✓ records ending held and publish false on the workflow-done row 1083ms
     ✓ defaults the close row to ending done 1006ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 750ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 939ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1168ms
     ✓ always writes the telemetry, whatever the runtime 1439ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 935ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1141ms
     ✓ an unwritable stats path is logged and never fails the close 1020ms
     ✓ appends the completeness row before the workflow-done row 990ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 963ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 993ms
     ✓ writes one completeness row per close 1377ms
     ✓ leaves out the previous run's rows that share a second with this run's start 764ms
     ✓ still closes when the completeness check throws 1070ms
     ✓ still closes when the completeness row write throws 1044ms
     ✓ refuses without status.jsonl and writes nothing 308ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1025ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1771ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1210ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 951ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1565ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 2714ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 3036ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1377ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1802ms
     ✓ --record-step writes the close step's row before workflow-done 977ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1528ms
     ✓ --number without --outbox is a usage error 1117ms
     ✓ --flush is ship only 426ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1293ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1692ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1577ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1818ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 929ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 554ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 520ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3289ms
     ✓ --flush with nothing to record commits and pushes nothing 1906ms
     ✓ --flush carries the named worktree's logs into the dev commit 3926ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4728ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 4773ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4491ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3841ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4446ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2985ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3637ms
     ✓ --push on dev never carries a row whose references name another feature 3432ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3046ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 7970ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4224ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1972ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3114ms
     ✓ preserves unlanded file deletions and ledger additions on close 5839ms
     ✓ preserves dirty work and uncertain branch evidence during close 6338ms
     ✓ preserves a local feature ref changed after its cleanup proof 7267ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4148ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2994ms
     ✓ a close that landed releases the lock 4028ms
     ✓ removes the worktree before it releases the lock 4273ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6131ms
       ✓ closePr refuses when the PR base is unknown 3575ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1053ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 643ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 324ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 890ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 355ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 307ms
     ✓ a second run's record does not let this FID's close commit 400ms
     ✓ record is present after workflows close and before the push 774ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1343ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 618ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 622ms
     ✓ puts each --line after the summary, in flag order 538ms
     ✓ --summary prints the file and keeps a copy in --outbox 499ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 581ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 272980ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 863ms
     ✓ rejects missing explicit and ambiguous existing branch selections 680ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1163ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1045ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 746ms
     ✓ a refused --continue carries git's own reason 1187ms
     ✓ --file records nothing for a refused rebase 853ms
     ✓ refuses a code conflict and aborts the rebase on the spot 792ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2541ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 534ms
     ✓ produces byte-identical output to merge=union 1428ms
     ✓ restores a trailing newline so the next append starts on its own line 701ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 803ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1184ms
     ✓ refuses a union that leaves a line which is not JSON 642ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 817ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2362ms
     ✓ refuses a lockfile whose regenerate command fails 1699ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1425ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1705ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1135ms
     ✓ refuses and aborts when both sides changed the hand-written region 712ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 974ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1438ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 2161ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1054ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1257ms
     ✓ refuses and aborts when a side deleted the install record 826ms
     ✓ refuses a conflicted doc the repo's script does not list 790ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 763ms
     ✓ removes a stale sentinel when the rebase succeeds 984ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1167ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1226ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 593ms
       ✓ skips (12) with no anchor 707ms
       ✓ skips (12) when the base is unreachable in this clone 811ms
       ✓ skips (12) when nothing landed since the base 845ms
       ✓ runs (0) with the landed path count once dev moved 1554ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 703ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1738ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 2674ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 2427ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2709ms
     ✓ runs exactly one git push 2829ms
     ✓ --set-upstream records the upstream 1512ms
     ✓ refuses with no branch checked out 821ms
     ✓ --mode=dev refuses a feature checkout 884ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2547ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3599ms
     ✓ --require-ci pushes as-is when dev has not moved 1423ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2334ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3927ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1234ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1821ms
     ✓ --mode=abort pushes when the branch has no open PR 2329ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 2027ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1192ms
     ✓ --open-pr carries the MCP answer and skips gh 1804ms
     ✓ --mode=abort on dev pushes plainly without probing 1179ms
     ✓ rejects an unknown mode 881ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3731ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2090ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2421ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5439ms
     ✓ skip-ci HEAD on the replay is refused 1233ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3745ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4332ms
     ✓ a level local dev is a plain push, recording nothing extra 1762ms
     ✓ a record with no commits pushes nothing 1175ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 840ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3043ms
     ✓ a rewritten branch is refused, never forced 1618ms
     ✓ refuses dev and main with exit 21 and pushes nothing 845ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1780ms
     ✓ refuses a detached HEAD (exit 5) 763ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2487ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2073ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1420ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1639ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 637ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1545ms
     ✓ an up-to-date branch is a no-op 961ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1555ms
     ✓ a fetch that fails exits 10 646ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 817ms
     ✓ scan-diff still reports a new skip when its test … 993ms
     ✓ scan-diff reports a skip moved onto a different t… 915ms
     ✓ scan-diff does not cancel a skip moved between am… 847ms
     ✓ scan-diff does not spend an unchanged duplicate t… 899ms
     ✓ scan-diff recognizes a renamed test file 870ms
     ✓ scan-diff recognizes a suite moved into a differe… 945ms
     ✓ scan-diff does not let unrelated additions hide a… 923ms
     ✓ scan-diff attributes deletion to its old test ins… 981ms
     ✓ scan-diff consumes each moved assertion once and … 916ms
     ✓ scan-diff does not match identical assertions fro… 995ms
     ✓ scan-diff does not match the same leaf test name … 850ms
     ✓ scan-diff does not match a same-named test with d… 832ms
     ✓ scan-diff does not match a same-named test with c… 1615ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1164ms
     ✓ --paths with no match exits 1 957ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 741ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1466ms
     ✓ --marker reads a diff over 1 MiB 1132ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1231ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1094ms
     ✓ scan-diff finds an added skip 1209ms
     ✓ scan-diff ignores a skip predating the base 987ms
     ✓ scan-diff reports a disabled test with its line 1045ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1074ms
     ✓ scan-diff ignores a removed comment in a test file 1176ms
     ✓ scan-diff ignores an assertion moved within the file 1094ms
     ✓ scan-diff still reports a removed assertion 1195ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1079ms
     ✓ scan-diff finds an added pytest mark skip 1365ms
     ✓ scan-diff finds an added unittest skip 1298ms
     ✓ scan-diff finds an added bare skip call 1139ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1215ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1120ms
     ✓ scan-diff ignores an assertion whose expectation changed 1072ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1041ms
     ✓ scan-diff reports a deleted test file 581ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 411ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1185ms
     ✓ a title that already carries the marker is left alone 746ms
     ✓ with no open PR: pushes the marker commit and edits no title 1010ms
     ✓ a re-run is deduped: no second marker commit 1276ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1177ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 338ms
     ✓ --title-set skips gh entirely 545ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1109ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2229ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1416ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2982ms
     ✓ continues only the explicitly recorded target through the public merge command 1915ms
     ✓ fetches the unseen feature head before classifying the base 1379ms
     ✓ fast forwards the feature before either base path is chosen 2420ms
     ✓ merges divergent feature tips without rebasing either side 1238ms
     ✓ continues the feature merge before starting a dev merge 1786ms
     ✓ publishes local code with a CI running head before bookkeeping 2379ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3883ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2079ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1102ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 410ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 432ms
     ✓ --merge-docs merges dev when docs/ is behind 575ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 556ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 866ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 662ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 540ms
     ✓ --merge-docs skips an empty bkit:generate script 477ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 465ms
     ✓ --merge-docs never merges on dev itself 397ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 542ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 737ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 621ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 574ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 736ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 765ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 825ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 675ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 678ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 873ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 642ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 822ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 525ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 373ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 438ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 657ms
     ✓ a failed install stops ship (16) 556ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 485ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 471ms
     ✓ exits 10 when the fetch fails 342ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 307ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1108ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1145ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1192ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1124ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2281ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2548ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 424ms
     ✓ local: names unpushed dev as the cause when the branch carries it 478ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 513ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1444ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1373ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 997ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4593ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1081ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2344ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1545ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 969ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2795ms
     ✓ land removes the worktree when only the copied .env is untracked 2360ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2144ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2055ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3059ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2108ms
     ✓ landPr refuses a main-based PR without retrying 674ms
     ✓ landPr refuses when the PR base is unknown 633ms
     ✓ PR not open (closed): stops (17) at once, no retry 794ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 735ms
     ✓ --attempt names the merge round in a fix commit 1001ms
     ✓ commits a rewritten and a deleted tracked file 791ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 665ms
     ✓ reports undeclared and runs nothing with no scripts 460ms
     ✓ reports undeclared and runs nothing with an empty script 380ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 466ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 535ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 364ms

 Test Files  176 passed (176)
      Tests  7597 passed | 2 skipped (7599)
   Start at  18:09:05
   Duration  274.34s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/903-build-owner-s/build-group-gate-2-1.log.reports/vitest-36336.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.49 |    82.26 |   94.44 |   89.95 |                   
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
 engine/commands   |    88.6 |    83.33 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.31 |   96.42 |   94.53 | ...18-821,868-883 
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
 ...mands/workflow |   90.07 |    82.88 |   95.25 |   91.59 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.34 |    96.18 |     100 |   99.06 | 314,694           
  decisions.ts     |   94.57 |     83.5 |   98.07 |   97.29 | ...82,387,464,651 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.09 |    86.93 |   97.43 |    95.6 | ...1299,1314-1324 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.21 |    86.84 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.01 |    88.42 |     100 |   93.01 | ...1444,1460-1461 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.45 |   92.64 |   83.42 | ...3087,3119-3123 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |   88.97 |    81.85 |    92.3 |   90.78 | ...2357,2359,2403 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |    93.8 |    83.02 |    98.7 |   95.45 | ...1717,1947,2679 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1388,1391-1392 
 engine/install    |    91.8 |    83.22 |   93.29 |   94.81 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |    97.4 |    90.14 |     100 |     100 | ...19,324,330-331 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   95.44 |    91.83 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.63 |    97.7 |   97.92 | 851,877-883,917   
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
Statements   : 88.49% ( 20671/23359 )
Branches     : 82.26% ( 16050/19511 )
Functions    : 94.44% ( 3296/3490 )
Lines        : 89.95% ( 18138/20164 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 463 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 240 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 274 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 238 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 218 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 222 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 90 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 309 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 240 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 225 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 233 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 234 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 242 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 254 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 990 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 650 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 21 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 23 ms
ok 19 stub: the response selector is cleared before running its body # in 22 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 28 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 31 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 24 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 22 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 28 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 23 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 57 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 99 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 657 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 526 ms
ok 30 refresh drops a file deleted in the index from the build # in 427 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 402 ms
ok 32 a key removed from the env file is unset on the next run # in 203 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 178 ms
ok 34 non-BKIT_ keys are skipped # in 178 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 193 ms
ok 36 a failed unsetenv is retried on the next run # in 218 ms
ok 37 logs key names only, never values # in 200 ms
ok 38 missing env file exits 0 without calling launchctl # in 33 ms
ok 39 the sweep prints the summary line the lane greps for # in 459 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 15 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (144.025709ms)
✔ shell cancellation waits for SIGTERM cleanup (208.845375ms)
✔ direct cancellation waits for SIGINT cleanup (134.782875ms)
✔ shell cancellation waits for SIGINT cleanup (208.439083ms)
✔ direct cancellation waits for SIGHUP cleanup (153.833875ms)
✔ shell cancellation waits for SIGHUP cleanup (204.851583ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (440.734875ms)
✔ shell cancellation follows a worker orphaned by a nested shell (281.207625ms)
✔ direct cancellation preserves a nested machine-lock owner (683.654458ms)
✔ shell cancellation preserves a nested machine-lock owner (673.158542ms)
✔ nested shell cancellation preserves a nested machine-lock owner (578.511083ms)
✔ a hard process-group timeout reaches a shell command during cleanup (86.765542ms)
✔ ships a command-scoped sleep prevention wrapper (0.105208ms)
✔ preserves arguments, output and nonzero exit status (60.635042ms)
✔ runs an entire shell chain and retains its failure (36.058625ms)
✔ reports a missing command as 127 (37.464375ms)
✔ requires a command (30.17075ms)
✔ non-macOS platform selection runs commands without sleep prevention (54.225667ms)
✔ hard timeout escalation reaches a command that ignores TERM (162.821542ms)
✔ forwards POSIX cancellation to the command and releases the assertion (60.349041ms)
✔ holds a real macOS assertion only while the command runs (87.017417ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4379.879625
> [bkit] TRUNCATED — kept 1805 of 3492 lines (131 KB of 271 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
