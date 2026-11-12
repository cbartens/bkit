
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-3 — /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s (pid 30669, since 18:30:28), last run took 0m4s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-3 — /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s (pid 30669, since 18:30:28), last run took 0m4s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-3 — /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s (pid 30669, since 18:30:28), last run took 0m4s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit 903-build-owner-s build-group-gate-3 — /Users/christian/Documents/GitHub/bkit/.worktrees/903-build-owner-s (pid 30669, since 18:30:28), last run took 0m4s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 71172, since 18:34:47), last run took 6m15s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 5 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 71172, since 18:34:47), last run took 6m15s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 71172, since 18:34:47), last run took 6m15s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 918-ad-hoc-agent build-group-gate-1 is waiting for tests (still, 7 min so far) (up to 1200s): in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores (pid 71172, since 18:34:47), last run took 6m15s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
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

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 5.4 on 10 cores: unit limits 7200ms per test, 14400ms per hook (x1.44)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 43512ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 632ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 525ms
     ✓ brand-new untracked ledger is staged and committed 452ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 458ms
     ✓ path containing a space is staged and committed 597ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 443ms
     ✓ staging failure: exit 4 and no commit is created, no false success 438ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 379ms
     ✓ --mode=stage stages the sweep but creates no commit 484ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1570ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 1213ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 728ms
     ✓ --root defaults to the working directory 460ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 609ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 772ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 750ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 624ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 430ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 332ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 619ms
     ✓ --path records its commit on the run's record, like every other commit mode 621ms
     ✓ a recorded ledger commits only the rows the run appended 849ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1417ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1138ms
     ✓ commitBookkeeping refuses when a recorded path changed 695ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 834ms
     ✓ under --mode=commit counts the squashed paths as something to commit 814ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 534ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 375ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 590ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 341ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ keeps rows on separate lines when the destination has no final newline 351ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 560ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 835ms
     ✓ a source file in the range: exit 7, path listed 829ms
     ✓ another FID's plan file in the range: exit 7 594ms
     ✓ from not an ancestor of to: exit 7 503ms
     ✓ unknown commit exits 3; a missing flag exits 2 334ms
   ✓ bkit ledgers append (20)
     ✓ append refuses a writer not listed for the kind 326ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 420ms
   ✓ bkit ledgers triage (11)
     ✓ triage marks an unjustified deferral lazy 334ms
     ✓ triage writes an unjustified row with a minted ts 391ms
     ✓ triage reports an adjudicated unjustified row outside exempt 341ms
     ✓ triage ignores another feature's deferral rows 460ms
     ✓ triage writes nothing when the FID has no deferral row 385ms
     ✓ triage refuses a plan with no task blocks 535ms
     ✓ triage refuses a plan whose task blocks do not parse 351ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 344ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 1596ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 1130ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 1252ms
     ✓ lands a standalone corrected candidate and reports the spend 660ms
     ✓ issues the same operation for rows whose keys are reordered 719ms
   ✓ bkit ledgers append --operation (3)
     ✓ returns durable append receipt and permits a deliberate same-key update 398ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 957ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 44293ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 320ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 492ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2892ms
   ✓ routine publication policy (8)
     ✓ classifies attention and terminal reports from structured purpose 336ms
     ✓ rolls over after intervening comments external edits and deletion 454ms
     ✓ starts only new source after overflow or missing source 367ms
     ✓ uses exact new comment after a failed eligibility read 311ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 590ms
     ✓ recognizes append success within budget without unnecessary resend 664ms
     ✓ preserves a human correction after lost append recognition and a later report 548ms
     ✓ contains exhausted append and create failures without fabricated success 459ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 427ms
     ✓ reserves new comment opportunity within total delivery budget 675ms
     ✓ contains preparation state lock and reconciliation exceptions 350ms
     ✓ attempts independent attention after routine uncertainty 403ms
     ✓ seals an acknowledged segment after a postflight intervening comment 366ms
   ✓ trackerTarget (3)
     ✓ linear and jira: the uppercased key from the FID, plus team / site 347ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 618ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1370ms
     ✓ seals unavailable or unstable representation evidence 1149ms
     ✓ uses accepted final preflight eligibility without provider atomicity 1304ms
     ✓ rejects marker preserving external edits 722ms
     ✓ preserves generated first line and extracts versioned h6 section markers 471ms
     ✓ returns owned comment identity and stable representation evidence 1150ms
     ✓ selects newest created comment across complete pages 674ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 632ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 493ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 673ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 744ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 742ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 465ms
     ✓ fetches the issue and its comments as GitHub returns them 749ms
     ✓ github fetch marks a closed issue terminal and an open one not 750ms
   ✓ jira client (MCP over HTTP) (6)
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 302ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 537ms
     ✓ caches exact engine source with available progress identity 490ms
     ✓ keeps original body identity separate from time and changed output 589ms
     ✓ reuses matching invocation state without adopting foreign ownership 1075ms
     ✓ invalidates missing corrupt and unsupported progress cache 1454ms
     ✓ contains cache read and write failures as standalone degradation 779ms
     ✓ uses legacy receipts and contains receipt failures 888ms
     ✓ skips issue-less runs and tracker none 383ms
     ✓ records an engine-action row and skips the same key + body on a re-run 612ms
     ✓ a recent identical comment counts as done (the final close comment) 643ms
     ✓ a failed post reports done false with the reason and never leaks a token 623ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1036ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 912ms
     ✓ a board the token cannot see is scope 546ms
     ✓ an HTTP 403 from gh is scope 641ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 729ms
     ✓ github: no block, no blockers and no further reads 674ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 819ms
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 347ms
     ✓ a different marker hash posts 680ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 728ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 51280ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 605ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 703ms
     ✓ always writes the marker, even with no plan 1580ms
     ✓ writes the linear marker shape, taking the tracker from package.json 488ms
     ✓ writes the jira marker shape, taking the tracker from package.json 499ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1065ms
     ✓ refuses a title carrying [no ci] before calling gh (exit 4) 394ms
     ✓ refuses a PR from dev, main, or the base itself 552ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 772ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1724ms
     ✓ exits 5 when the open-PR probe errors 578ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 832ms
     ✓ prs open still opens against any other base 1524ms
     ✓ exits 6 when the created PR's base is not --base 1259ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2935ms
     ✓ refuses merged entry when current feature evidence cannot be read 1285ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 986ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 813ms
     ✓ exits 1 with found=false when there is none 694ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 776ms
     ✓ --number reads one PR, mergeable included 658ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 654ms
     ✓ exits 4 when gh errors and 80 when it needs auth 605ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip actions] in the landed commit body (exit 1) 470ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 302ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 521ms
     ✓ classifies a refused merge with a new dev conflict as integration 770ms
     ✓ returns an explicit terminal reason for other merge refusals 942ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 486ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1222ms
     ✓ drops the force-build marker from the title subject 489ms
     ✓ takes an explicit --subject 472ms
     ✓ runs no merge when the PR is already MERGED 694ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 837ms
     ✓ prs merge refuses a PR whose base is main 654ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 526ms
     ✓ prs merge refuses when the PR base is unknown 432ms
     ✓ prs merge reads the base from the one pr view it already makes 522ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 792ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 428ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 590ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 831ms
     ✓ never reads dev's required checks without --only-if-required 414ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 619ms
     ✓ updates when a dev ruleset requires status checks 913ms
     ✓ updates when dev's branch protection requires status checks 652ms
     ✓ ignores dev rulesets that require no checks 847ms
     ✓ updates when the repo cannot be resolved 467ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 535ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 406ms
     ✓ is not green when a check failed, naming it (exit 1) 465ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 383ms
     ✓ is not green on an empty rollup (total 0) 480ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 429ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 979ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 406ms
     ✓ is a no-op when the title already says so 413ms
     ✓ strips the marker, with or without its bkit prefix 913ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 698ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ records a skip token found in the body, then exits 1 301ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 335ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (76 tests) 3170ms
   ✓ source derivation (6)
     ✓ derives the expected step universe for every workflow 395ms
   ✓ check — hole classes (26)
     ✓ a tracker-none run that journals every rendered call is CLEAN 460ms
     ✓ never requires the workflows start call, which a fresh run cannot journal 308ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 56358ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 352ms
     ✓ adopts the main checkout even when called from a linked worktree 365ms
     ✓ build refuses to work in place on dev 302ms
     ✓ design and plan in place on main are refused 573ms
     ✓ still adopts a cloud session branch whose upstream is main 344ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1460ms
     ✓ may debug in place on dev 1156ms
     ✓ never in place on main 317ms
     ✓ refuses a detached HEAD before anything else 332ms
     ✓ adopts in place when the session is already on feat/{fid} 513ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1088ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1265ms
     ✓ a new run of the same FID rewrites startSha 2464ms
     ✓ a resume of the same FID reuses the record 1504ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 934ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 947ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1365ms
     ✓ a stale record without a lock is replaced 1482ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1194ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4391ms
     ✓ names inherited commits and ship recovery in the refusal 1332ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1541ms
     ✓ ship names a missing feat branch 492ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1287ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 478ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 344ms
     ✓ fails with a fetch error when there is no origin to rebase onto 531ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 653ms
       ✓ checks no disk when there are no cleanup step files 584ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 665ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 626ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 519ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 412ms
     ✓ never commits an entry only the main checkout's copy list names 747ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 312ms
   ✓ bkit worktrees remove (18)
     ✓ leaves a worktree without the marker in place 365ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 944ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 453ms
     ✓ tells a caller inside the removed worktree where to cd 870ms
     ✓ fails with its own exit code when git cannot remove a marked path 609ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 2049ms
       ✓ preserves staged-only mode during landed cleanup 1958ms
       ✓ preserves staged-only type during landed cleanup 1681ms
       ✓ preserves staged-only deletion during landed cleanup 1687ms
       ✓ removes landed staged content when both index and working contents are on dev 1664ms
       ✓ deletes the proved local and remote branch at their landed tips 1972ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2482ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 661ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 620ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 301ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 632ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1038ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 59043ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1190ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 538ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 515ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 553ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 932ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 470ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 653ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 876ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 924ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1147ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 962ms
     ✓ PASS is 0 failures with or without reports 1209ms
     ✓ clears a previous attempt's reports before the gate runs 471ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 431ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1459ms
     ✓ a log under the outbox is named main-checkout relative in the record 1236ms
     ✓ a log small enough is copied whole: not clamped, raw null 1316ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 703ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 882ms
     ✓ numbers runs within the workflow's active run and per step 842ms
     ✓ without --file no row is written and the output carries row null 695ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check matches a Markdown heading symbol 314ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1141ms
     ✓ a planned test that passes is a vacuous gap, exit 1 661ms
     ✓ a planned test absent from a loaded report is a missing gap 787ms
     ✓ a file that fails to load is a red of kind red-not-loaded 887ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1079ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 455ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1204ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1001ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 933ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 313ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1836ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1516ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1744ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1398ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1565ms
     ✓ green: a passed-accepted test is already landed, not a gap 1144ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 969ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 395ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1398ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 982ms
     ✓ green: lists each gap kind, with the runner output 1099ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1623ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1032ms
       ✓ green clears an exception-only task from a human commit 1170ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 290ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 64245ms
   ✓ test-round completion evidence (2)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ rejects ["--status=SKIPPED"] 351ms
     ✓ needs a message unless --commit=none 443ms
     ✓ reports a failed commit with exit 8 without writing the row 1085ms
     ✓ a failed commit leaves no row staged in the index 1129ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1585ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1169ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1037ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1385ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1440ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 356ms
     ✓ --ref reads the status file as committed on that ref, not from disk 461ms
     ✓ --ref exits 3 when the ref does not carry the status file 558ms
     ✓ fails on a placeholder left in the artifact 444ms
     ✓ fails when the row's verdict differs from the artifact's 395ms
     ✓ fails when the row does not list the artifact, or carries another attempt 421ms
     ✓ fails on a missing artifact 484ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 378ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 434ms
     ✓ fails a run-tests row missing its scope, and an empty scope 565ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 580ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 991ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1735ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1066ms
     ✓ --post needs --number; without --post there is no tracker key 352ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks the FID's shape for the wired tracker 343ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 651ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1184ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 773ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 806ms
       ✓ gate --issue="" under none keeps today's check 339ms
     ✓ --attempt-of checks the row carries the derived counter 750ms
> [bkit] TRUNCATED HERE — 677 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 343 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 367ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1345ms
     ✓ runGit names ENOBUFS when output passes the limit 1623ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1207ms
> [bkit] TRUNCATED HERE — 74 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 615ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1275ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 424ms
stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting
> [bkit] TRUNCATED HERE — 83 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 706ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1981ms
     ✓ a refused dev push is logged, never fails the close 2264ms
     ✓ an unreachable remote is logged, never fails the close 821ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 79ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 282ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 37278ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1065ms
     ✓ names each net-new and worsened finding in the log and the JSON 768ms
     ✓ fails on a net score rise with no net count change 775ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 820ms
     ✓ treats a net score at or below 0.001 as float noise 844ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 809ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 431ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1073ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 833ms
     ✓ exits 4 on a dropped net field instead of silently passing 896ms
     ✓ exits 4 on no summary instead of silently passing 916ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1169ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1300ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1237ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1209ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 497ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 467ms
     ✓ fails (exit 1) when vale reports alerts 472ms
     ✓ exits 6 on a vale runtime error 712ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 603ms
     ✓ falls back to vale sync when the main worktree has none 543ms
     ✓ fails when vale sync cannot restore the required styles 739ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 425ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 402ms
     ✓ exits 1 naming the files outside, whatever the commit message says 479ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 834ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 546ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 479ms
> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 752ms
     ✓ passes every rule on a clean head 321ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 362ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 867ms
   ✓ template bkit-ci.yml, filled in (2)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 499ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1349ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1151ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2488ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3028ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2357ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2579ms
     ✓ checks the named repository base and fails closed on missing evidence 1458ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1660ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1622ms
     ✓ rejects MCP capstone jobs belonging to another run 2579ms
     ✓ --fetch refreshes origin/<branch> before gating 1261ms
     ✓ rejects a run without the capstone job (13) 306ms
     ✓ exit 12 failed steps (10)
       ✓ both floor steps failing is regenerable 301ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 409ms
     ✓ tells an API error (20) from no run (10) 313ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 406ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 352ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 347ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 916ms
       ✓ a source change past the validated head refuses (17) and names the path 801ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 929ms
       ✓ --validated without --month / --fid is a usage error (2) 556ms
       ✓ a validated sha that is not an ancestor refuses (17) 627ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1514ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1644ms
     ✓ a failed re-trigger push names the cause in the log 1864ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1591ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2314ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1282ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 690ms
     ✓ gh-error: every poll errored 632ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1214ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1265ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1524ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1595ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3083ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3030ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 767ms
     ✓ re-trigger on dev only uses the record of its own FID 878ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 962ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 389ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 691ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 398ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 338ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 694ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 791ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 707ms
     ✓ --file and --step go together 606ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 495ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 648ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 551ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 567ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 618ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 502ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 575ms
     ✓ --file into a missing directory is refused, not created 553ms
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 853ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 517ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1002ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 699ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 588ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 769ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 576ms
     ✓ an unpinned repo reports nulls and asks no registry 978ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 648ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 534ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 737ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1035ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 76 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 530ms
     ✓ resolves config from the repo root when run from a subdirectory 506ms
     ✓ exits 6 when the PUT fails 533ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 515ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 520ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 984ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 775ms
     ✓ exits 6 when the api answer is not JSON 784ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 49ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 943ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1074ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1414ms
     ✓ reports excluded intervals as unread even when pagination finishes 962ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 567ms
     ✓ reports an unread remainder at the page cap 755ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 479ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 400ms
     ✓ rejects missing summaries instead of treating them as empty results 888ms
     ✓ reports a failed first page as unavailable 506ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 440ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 647ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 811ms
     ✓ follows summary cursors even when the first page is shorter than the limit 625ms
     ✓ reports excluded intervals as unread even when pagination finishes 480ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 544ms
     ✓ reports an unread remainder at the page cap 485ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1026ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 614ms
     ✓ rejects missing summaries instead of treating them as empty results 563ms
     ✓ reports a failed first page as unavailable 861ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 478ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 191ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1216ms
     ✓ counts files committed since --base 822ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1030ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 616ms
     ✓ runs the --fallback gate even when no file changed, as it did before 702ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 30719ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2785ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3104ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 423ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 395ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 406ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2842ms
     ✓ does not fall back through a malformed later success receipt 1355ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1045ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1020ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2052ms
     ✓ requires proof even when the pushed increment changes no files 1088ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 672ms
     ✓ does not record a committed tree 704ms
     ✓ records no proof for a failed gate or lighter gate 1060ms
     ✓ requires integration proof when integration is declared 1297ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2302ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 310ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 3945ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 652ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 355ms
(node:65204) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:65204) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:65204) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:65204) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 81ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 4436ms
   ✓ renderParts (4)
     ✓ replaces a JS or shell part line with the part's text, leaving every other line 440ms
     ✓ throws on a missing part 402ms
   ✓ shipped hook templates (5)
     ✓ the parts sit outside the copied payload, so install never copies them 319ms
     ✓ every part is used by at least two hosts, and no part line survives rendering 948ms
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1966ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 48ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 108ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 27ms
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

 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 9ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 65ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 34ms
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

 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
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

 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 85ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
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

 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 30ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 2640ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ writes plugin prompts + workflow skills, and stamps the managed version 327ms
     ✓ never writes Codex's `.agents/skills/` 342ms
     ✓ is idempotent — a second render writes nothing 868ms
   ✓ runAntigravityModule (3)
     ✓ warns when Codex is also installed (skill-overlap advisory) 379ms
     ✓ stays silent about the overlap when Codex is absent 423ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 88506ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 40099ms
     ✓ every prompt, workflow and utility agent has the three header blocks 812ms
     ✓ sync has nothing left to rewrite 20320ms
     ✓ every clause reaches the cut-off of one surface it applies to 2100ms
   ✓ the recovery precedence contract (1)
     ✓ renders one recovery precedence contract for all hosts and tracker adapters 24731ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 24ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 69ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 35ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 21ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1252ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 127ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 18ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 31ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 64812ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1779ms
     ✓ runs code.ts through its declared gate in the built checkout 1983ms
     ✓ runs code.ts through its declared gate in the built checkout 1839ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1453ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1635ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1661ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 990ms
     ✓ runs the full gate for replayed debug code 1694ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2032ms
     ✓ installs local dependencies against the built target tree 2281ms
     ✓ runs the configured frozen install even without root dependencies 1602ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1985ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1940ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2070ms
     ✓ never pushes local dev commits missing from origin/dev 2145ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3795ms
     ✓ dev moved before every push: exhausted, nothing landed 5813ms
     ✓ any other refusal is returned, not retried 2567ms
     ✓ pushToDev replays a commit range onto origin/dev 2134ms
     ✓ a replay retries on the new dev when dev moved 3624ms
     ✓ pushToDev log line names what it lands 1795ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1883ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1809ms
     ✓ a push that fails without a server answer is returned once, never retried 1540ms
     ✓ a failed fetch is returned before anything is built 641ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 6685ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2032ms
     ✓ lands from a clone whose fetch refspec omits dev 2486ms
     ✓ build throwing stops the landing and removes the throwaway checkout 897ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 7459ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 7452ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 22894ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 18206ms
     ✓ every fence parses under zsh -n 4607ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (161 tests) 168210ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 524ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1833ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 463ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 482ms
     ✓ writes no limits for a workflow with no ask point 396ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 303ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 400ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 569ms
       ✓ a new run in the same chat gets its own session row 509ms
       ✓ writes none outside Claude Code 446ms
     ✓ opens the next run after a finished one, and after another workflow's run 1086ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 656ms
     ✓ design / plan / build / debug book in the current worktree 543ms
     ✓ --lock-held checks the lock is ours 332ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 384ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 703ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 426ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 480ms
     ✓ an OPEN decision of an earlier run never resurfaces 661ms
     ✓ an OPEN decision mid-build prints its header fields 481ms
     ✓ openDecision carries the Gate header 387ms
     ✓ openDecision gate is null without the header 418ms
     ✓ openDecision gate ignores a Gate line below the header 301ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 435ms
     ✓ writes no row when status.jsonl does not exist 302ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 320ms
     ✓ aborts a rebase only when one is in progress 680ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 524ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 776ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 465ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 455ms
     ✓ --max-exceeded says a handover is due without any sentinel 315ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 387ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 521ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 508ms
     ✓ a debug run in SOAK mode always needs a handover 398ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 978ms
       ✓ counts subagents of an earlier chat the run's session rows name 964ms
       ✓ records no context block, and still closes, outside a Claude Code session 962ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1033ms
     ✓ records ending held and publish false on the workflow-done row 1380ms
     ✓ defaults the close row to ending done 1042ms
     ✓ refuses an unknown ending 392ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 972ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1075ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1188ms
     ✓ always writes the telemetry, whatever the runtime 1446ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 923ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1329ms
     ✓ an unwritable stats path is logged and never fails the close 1303ms
     ✓ appends the completeness row before the workflow-done row 1683ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 2102ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1483ms
     ✓ writes one completeness row per close 2308ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1293ms
     ✓ still closes when the completeness check throws 1338ms
     ✓ still closes when the completeness row write throws 1303ms
     ✓ refuses without status.jsonl and writes nothing 320ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1323ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1942ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1187ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 935ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1230ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1279ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1952ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2209ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1255ms
     ✓ --record-step writes the close step's row before workflow-done 982ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1001ms
     ✓ --number without --outbox is a usage error 874ms
     ✓ --flush is ship only 349ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1228ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1284ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1375ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1395ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1096ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 613ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 483ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3329ms
     ✓ --flush with nothing to record commits and pushes nothing 1929ms
     ✓ --flush carries the named worktree's logs into the dev commit 2938ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3059ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2876ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3425ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2614ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3231ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2831ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2952ms
     ✓ --push on dev never carries a row whose references name another feature 2505ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2625ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5257ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3192ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1657ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3269ms
     ✓ preserves unlanded file deletions and ledger additions on close 5686ms
     ✓ preserves dirty work and uncertain branch evidence during close 6301ms
     ✓ preserves a local feature ref changed after its cleanup proof 5740ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 7708ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2873ms
     ✓ a close that landed releases the lock 2463ms
     ✓ removes the worktree before it releases the lock 1782ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2777ms
       ✓ closePr refuses when the PR base is unknown 2293ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1564ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 383ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 608ms
     ✓ a second run's record does not let this FID's close commit 334ms
     ✓ record is present after workflows close and before the push 618ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1184ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 476ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 330ms
     ✓ puts each --line after the summary, in flag order 356ms
     ✓ --summary prints the file and keeps a copy in --outbox 331ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 356ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 237342ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 715ms
     ✓ rejects missing explicit and ambiguous existing branch selections 632ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1008ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1277ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 656ms
     ✓ a refused --continue carries git's own reason 1057ms
     ✓ --file records nothing for a refused rebase 932ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1296ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1420ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 793ms
     ✓ produces byte-identical output to merge=union 2104ms
     ✓ restores a trailing newline so the next append starts on its own line 1182ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 829ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1105ms
     ✓ refuses a union that leaves a line which is not JSON 603ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 993ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1258ms
     ✓ refuses a lockfile whose regenerate command fails 1156ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1590ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1384ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1443ms
     ✓ refuses and aborts when both sides changed the hand-written region 867ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1127ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1581ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1575ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 977ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1280ms
     ✓ refuses and aborts when a side deleted the install record 1296ms
     ✓ refuses a conflicted doc the repo's script does not list 925ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 894ms
     ✓ removes a stale sentinel when the rebase succeeds 1566ms
     ✓ exits 4 when no rebase is in progress 380ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1853ms
     ✓ resolves a conflict in each of two replayed commits across rounds 2057ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 995ms
       ✓ skips (12) with no anchor 892ms
       ✓ skips (12) when the base is unreachable in this clone 958ms
       ✓ skips (12) when nothing landed since the base 879ms
       ✓ runs (0) with the landed path count once dev moved 1637ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 726ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1628ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1074ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1409ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2093ms
     ✓ runs exactly one git push 1911ms
     ✓ --set-upstream records the upstream 1005ms
     ✓ refuses with no branch checked out 1365ms
     ✓ --mode=dev refuses a feature checkout 1556ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2045ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3107ms
     ✓ --require-ci pushes as-is when dev has not moved 1250ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2113ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3348ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 890ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1333ms
     ✓ --mode=abort pushes when the branch has no open PR 1639ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1241ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 806ms
     ✓ --open-pr carries the MCP answer and skips gh 1011ms
     ✓ --mode=abort on dev pushes plainly without probing 1025ms
     ✓ rejects an unknown mode 796ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3255ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1443ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1743ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3804ms
     ✓ skip-ci HEAD on the replay is refused 1123ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2791ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3555ms
     ✓ a level local dev is a plain push, recording nothing extra 1474ms
     ✓ a record with no commits pushes nothing 1049ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 836ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1645ms
     ✓ a rewritten branch is refused, never forced 1125ms
     ✓ refuses dev and main with exit 21 and pushes nothing 694ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1615ms
     ✓ refuses a detached HEAD (exit 5) 681ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1481ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1526ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1434ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1760ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 692ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1825ms
     ✓ an up-to-date branch is a no-op 1115ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1744ms
     ✓ a fetch that fails exits 10 686ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 902ms
     ✓ scan-diff still reports a new skip when its test … 885ms
     ✓ scan-diff reports a skip moved onto a different t… 750ms
     ✓ scan-diff does not cancel a skip moved between am… 706ms
     ✓ scan-diff does not spend an unchanged duplicate t… 774ms
     ✓ scan-diff recognizes a renamed test file 855ms
     ✓ scan-diff recognizes a suite moved into a differe… 878ms
     ✓ scan-diff does not let unrelated additions hide a… 951ms
     ✓ scan-diff attributes deletion to its old test ins… 896ms
     ✓ scan-diff consumes each moved assertion once and … 910ms
     ✓ scan-diff does not match identical assertions fro… 936ms
     ✓ scan-diff does not match the same leaf test name … 882ms
     ✓ scan-diff does not match a same-named test with d… 828ms
     ✓ scan-diff does not match a same-named test with c… 939ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 928ms
     ✓ --paths with no match exits 1 726ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 501ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1072ms
     ✓ --marker reads a diff over 1 MiB 852ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1053ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1006ms
     ✓ scan-diff finds an added skip 4820ms
     ✓ scan-diff ignores a skip predating the base 1069ms
     ✓ scan-diff reports a disabled test with its line 1132ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 933ms
     ✓ scan-diff ignores a removed comment in a test file 922ms
     ✓ scan-diff ignores an assertion moved within the file 1012ms
     ✓ scan-diff still reports a removed assertion 917ms
     ✓ scan-diff reports an assertion re-added only outside the test file 846ms
     ✓ scan-diff finds an added pytest mark skip 629ms
     ✓ scan-diff finds an added unittest skip 523ms
     ✓ scan-diff finds an added bare skip call 562ms
     ✓ scan-diff ignores a quoted skip in a documentation file 507ms
     ✓ scan-diff ignores a marker literal in a non-test source file 448ms
     ✓ scan-diff ignores an assertion whose expectation changed 452ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 458ms
     ✓ scan-diff reports a deleted test file 431ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 347ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1191ms
     ✓ a title that already carries the marker is left alone 872ms
     ✓ with no open PR: pushes the marker commit and edits no title 880ms
     ✓ a re-run is deduped: no second marker commit 1090ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1192ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 371ms
     ✓ --title-set skips gh entirely 549ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 964ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1663ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 946ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2124ms
     ✓ continues only the explicitly recorded target through the public merge command 1336ms
     ✓ fetches the unseen feature head before classifying the base 936ms
     ✓ fast forwards the feature before either base path is chosen 1654ms
     ✓ merges divergent feature tips without rebasing either side 824ms
     ✓ continues the feature merge before starting a dev merge 1821ms
     ✓ publishes local code with a CI running head before bookkeeping 1905ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2343ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1434ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 954ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 390ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 378ms
     ✓ --merge-docs merges dev when docs/ is behind 440ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 451ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 638ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 658ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 571ms
     ✓ --merge-docs skips an empty bkit:generate script 507ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 424ms
     ✓ --merge-docs never merges on dev itself 361ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 576ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 575ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 523ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 518ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 695ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 712ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 873ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 690ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 638ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 815ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 581ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 759ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 506ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 368ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 433ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 677ms
     ✓ a failed install stops ship (16) 580ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 441ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 415ms
     ✓ exits 10 when the fetch fails 313ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1125ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1121ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1039ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1038ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2180ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2635ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 519ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1687ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 2255ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2792ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1440ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1093ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5056ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1203ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1054ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 997ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 664ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1290ms
     ✓ land removes the worktree when only the copied .env is untracked 1126ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1041ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1153ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1650ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1052ms
     ✓ landPr refuses a main-based PR without retrying 542ms
     ✓ landPr refuses when the PR base is unknown 545ms
     ✓ PR not open (closed): stops (17) at once, no retry 636ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 381ms
     ✓ --attempt names the merge round in a fix commit 357ms
     ✓ commits a rewritten and a deleted tracked file 360ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 314ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 350ms

 Test Files  176 passed (176)
      Tests  7589 passed | 2 skipped (7591)
   Start at  18:40:00
   Duration  239.22s (tests 96%, import 1%, transform 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/918-ad-hoc-agent/build-group-gate-1-2.log.reports/vitest-40203.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.48 |    82.24 |   94.36 |   89.93 |                   
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
 ...mands/workflow |   90.06 |    82.86 |   95.13 |   91.57 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.34 |    96.18 |     100 |   99.06 | 314,694           
  decisions.ts     |   94.38 |    83.15 |      98 |   97.21 | ...63,368,445,632 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.81 |    87.71 |    92.3 |    94.4 | ...91-292,461-462 
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
  summary.ts       |   96.03 |    90.27 |    94.2 |   96.33 | ...32-638,661,684 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.49 |    82.65 |    97.4 |    95.1 | ...1773,1947,2679 
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
Statements   : 88.48% ( 20635/23320 )
Branches     : 82.24% ( 16009/19465 )
Functions    : 94.36% ( 3281/3477 )
Lines        : 89.93% ( 18118/20146 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 493 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 274 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 201 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 288 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 208 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 236 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 68 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 221 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 202 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 192 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 294 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 203 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 266 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 201 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 901 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 512 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 20 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 21 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 14 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 48 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 528 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 351 ms
ok 30 refresh drops a file deleted in the index from the build # in 315 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 425 ms
ok 32 a key removed from the env file is unset on the next run # in 268 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 154 ms
ok 34 non-BKIT_ keys are skipped # in 142 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 154 ms
ok 36 a failed unsetenv is retried on the next run # in 175 ms
ok 37 logs key names only, never values # in 145 ms
ok 38 missing env file exits 0 without calling launchctl # in 23 ms
ok 39 the sweep prints the summary line the lane greps for # in 263 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/918-ad-hoc-agent
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (85.413ms)
✔ shell cancellation waits for SIGTERM cleanup (159.453791ms)
✔ direct cancellation waits for SIGINT cleanup (83.969667ms)
✔ shell cancellation waits for SIGINT cleanup (159.504791ms)
✔ direct cancellation waits for SIGHUP cleanup (83.959084ms)
✔ shell cancellation waits for SIGHUP cleanup (160.503667ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (376.236125ms)
✔ shell cancellation follows a worker orphaned by a nested shell (226.930959ms)
✔ direct cancellation preserves a nested machine-lock owner (414.57475ms)
✔ shell cancellation preserves a nested machine-lock owner (451.853292ms)
✔ nested shell cancellation preserves a nested machine-lock owner (454.371041ms)
✔ a hard process-group timeout reaches a shell command during cleanup (64.290667ms)
✔ ships a command-scoped sleep prevention wrapper (0.0555ms)
✔ preserves arguments, output and nonzero exit status (42.276167ms)
✔ runs an entire shell chain and retains its failure (25.01375ms)
✔ reports a missing command as 127 (24.38575ms)
✔ requires a command (21.539625ms)
✔ non-macOS platform selection runs commands without sleep prevention (37.051833ms)
✔ hard timeout escalation reaches a command that ignores TERM (145.810125ms)
✔ forwards POSIX cancellation to the command and releases the assertion (47.707042ms)
✔ holds a real macOS assertion only while the command runs (60.690917ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3156.333292
> [bkit] TRUNCATED — kept 1780 of 3510 lines (127 KB of 271 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
