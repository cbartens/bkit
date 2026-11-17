
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 is waiting for tests (up to 1200s): in use by vitest .bkit/core/engine/install/template-copies.integration.test.ts .bkit/core/engine/commands/install/upgrade.integration.test.ts .bkit/core/engine/checks/tips/detect.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts .bkit/core/engine/checks/tips — /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit (pid 12916, since 22:19:12), last run took 0m4s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by vitest .bkit/core/engine/install/template-copies.integration.test.ts .bkit/core/engine/commands/install/upgrade.integration.test.ts .bkit/core/engine/checks/tips/detect.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts .bkit/core/engine/audits/templates/templates-content.test.ts .bkit/core/engine/checks/tips — /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit (pid 12916, since 22:19:12), last run took 0m4s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1181-mcp-alert-signals (pid 54343, since 22:21:46), last run took 5m8s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> bkit ci slop

[bkit-ci] base d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab (d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
base: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 8.2 on 10 cores: unit limits 8600ms per test, 17200ms per hook (x1.72)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 37505ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 634ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 800ms
     ✓ brand-new untracked ledger is staged and committed 545ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 580ms
     ✓ path containing a space is staged and committed 557ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 625ms
     ✓ staging failure: exit 4 and no commit is created, no false success 442ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 524ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 339ms
     ✓ --mode=stage stages the sweep but creates no commit 580ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 2183ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 912ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 749ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 335ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 350ms
     ✓ --root defaults to the working directory 392ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 817ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 777ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 655ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 773ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 391ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 741ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 460ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 929ms
     ✓ --path records its commit on the run's record, like every other commit mode 806ms
     ✓ a recorded ledger commits only the rows the run appended 1141ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1692ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1346ms
     ✓ commitBookkeeping refuses when a recorded path changed 634ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 761ms
     ✓ under --mode=commit counts the squashed paths as something to commit 769ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 527ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 348ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 584ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 446ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ carries untracked ledgers too 344ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 552ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 860ms
     ✓ a source file in the range: exit 7, path listed 660ms
     ✓ another FID's plan file in the range: exit 7 598ms
     ✓ from not an ancestor of to: exit 7 549ms
     ✓ unknown commit exits 3; a missing flag exits 2 463ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 325ms
     ✓ triage refuses a plan with no task blocks 366ms
     ✓ triage refuses a plan whose task blocks do not parse 383ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 51614ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 314ms
     ✓ continues after friction and diagnostic writes fail without recursion 369ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 786ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3393ms
   ✓ routine publication policy (8)
     ✓ creates then appends routine sections under explicit invocation ownership 406ms
     ✓ deduplicates known reports using available receipts and bounded markers 386ms
     ✓ appends changed report versions without replacing prior text 700ms
     ✓ classifies attention and terminal reports from structured purpose 454ms
     ✓ rolls over after intervening comments external edits and deletion 786ms
     ✓ starts only new source after overflow or missing source 446ms
     ✓ uses exact new comment after a failed eligibility read 535ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 376ms
     ✓ recognizes append success within budget without unnecessary resend 394ms
     ✓ preserves a human correction after lost append recognition and a later report 371ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 388ms
     ✓ reserves new comment opportunity within total delivery budget 1037ms
     ✓ attempts independent attention after routine uncertainty 727ms
     ✓ seals an acknowledged segment after a postflight intervening comment 403ms
   ✓ trackerTarget (3)
     ✓ linear and jira: the uppercased key from the FID, plus team / site 479ms
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 517ms
   ✓ progress inspection (11)
     ✓ edits by verified comment id through each existing transport 1766ms
     ✓ seals unavailable or unstable representation evidence 1828ms
     ✓ uses accepted final preflight eligibility without provider atomicity 1438ms
     ✓ rejects marker preserving external edits 1260ms
     ✓ preserves generated first line and extracts versioned h6 section markers 1251ms
     ✓ returns owned comment identity and stable representation evidence 1835ms
     ✓ selects newest created comment across complete pages 1493ms
   ✓ github client (8)
     ✓ posts the body as JSON on stdin and returns the comment URL 745ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 451ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 825ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 637ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 486ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 429ms
     ✓ fetches the issue and its comments as GitHub returns them 580ms
     ✓ github fetch marks a closed issue terminal and an open one not 747ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 714ms
     ✓ caches exact engine source with available progress identity 493ms
     ✓ keeps original body identity separate from time and changed output 539ms
     ✓ reuses matching invocation state without adopting foreign ownership 678ms
     ✓ invalidates missing corrupt and unsupported progress cache 1363ms
     ✓ contains cache read and write failures as standalone degradation 694ms
     ✓ uses legacy receipts and contains receipt failures 802ms
     ✓ records an engine-action row and skips the same key + body on a re-run 898ms
     ✓ a recent identical comment counts as done (the final close comment) 1154ms
     ✓ a failed post reports done false with the reason and never leaks a token 1277ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 747ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 1128ms
     ✓ a board the token cannot see is scope 1181ms
     ✓ an HTTP 403 from gh is scope 1285ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 693ms
     ✓ github: no block, no blockers and no further reads 815ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 679ms
     ✓ a different marker hash posts 790ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1011ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 53379ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1493ms
     ✓ names each net-new and worsened finding in the log and the JSON 1518ms
     ✓ fails on a net score rise with no net count change 1690ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1457ms
     ✓ treats a net score at or below 0.001 as float noise 1725ms
     ✓ passes when the change only resolves findings 898ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 930ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 323ms
     ✓ skips (exit 0) when the base resolves to HEAD 345ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1697ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 897ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 411ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1281ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1478ms
     ✓ exits 4 on a dropped net field instead of silently passing 1979ms
     ✓ exits 4 on no summary instead of silently passing 1767ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1692ms
     ✓ exits 5 when the base worktree cannot be created 458ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1905ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1128ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1342ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1554ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 2952ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2485ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1145ms
     ✓ explicit globs can select ignored prose and nested checkout files 645ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 513ms
     ✓ fails (exit 1) when vale reports alerts 839ms
     ✓ exits 6 on a vale runtime error 888ms
     ✓ skips with exit 0 when no file matches 308ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1605ms
     ✓ falls back to vale sync when the main worktree has none 879ms
     ✓ fails when vale sync cannot restore the required styles 846ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 564ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 504ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 533ms
     ✓ exits 1 naming the code file, whatever the commit message says 737ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 549ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 362ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 985ms
     ✓ exits 7 when a commit cannot be read 363ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 513ms
     ✓ exits 1 naming the files outside, whatever the commit message says 506ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 944ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 606ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 447ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 976ms
     ✓ a top-level glob in the setting does not reach into folders 593ms
     ✓ a push that changes no files is not proven a min push 507ms
     ✓ exits 7 when a commit or its base cannot be read 507ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 53227ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 973ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1569ms
     ✓ always writes the marker, even with no plan 518ms
     ✓ writes the linear marker shape, taking the tracker from package.json 1094ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1411ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 835ms
     ✓ refuses a github marker with fid "12-x" issue "13" (exit 2) 374ms
     ✓ refuses a PR from dev, main, or the base itself 456ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 938ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1846ms
     ✓ exits 5 when the open-PR probe errors 861ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1029ms
     ✓ prs open refuses --base=refs/remotes/origin/main, the same branch as main 309ms
     ✓ prs open still opens against any other base 1429ms
     ✓ exits 6 when the created PR's base is not --base 1533ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1326ms
     ✓ exits 1 with found=false when there is none 1418ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1408ms
     ✓ --number reads one PR, mergeable included 1590ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1433ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1058ms
   ✓ bkit prs scan-body (10)
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 336ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 330ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 679ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 704ms
     ✓ drops the force-build marker from the title subject 422ms
     ✓ takes an explicit --subject 389ms
     ✓ runs no merge when the PR is already MERGED 394ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 607ms
     ✓ prs merge refuses a PR whose base is main 791ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 534ms
     ✓ prs merge refuses when the PR base is unknown 446ms
     ✓ prs merge reads the base from the one pr view it already makes 589ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 727ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 523ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 413ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 437ms
     ✓ never reads dev's required checks without --only-if-required 749ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 491ms
     ✓ updates when a dev ruleset requires status checks 942ms
     ✓ updates when dev's branch protection requires status checks 1421ms
     ✓ ignores dev rulesets that require no checks 865ms
     ✓ updates when the repo cannot be resolved 641ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 684ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 769ms
     ✓ is not green when a check failed, naming it (exit 1) 1424ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1154ms
     ✓ is not green on an empty rollup (total 0) 876ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 641ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 883ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 427ms
     ✓ is a no-op when the title already says so 849ms
     ✓ strips the marker, with or without its bkit prefix 1227ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 762ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-dpiDMe/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 149ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 180ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 60283ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 1014ms
   ✓ progress command output (4)
     ✓ done prints progressLine 379ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 804ms
     ✓ done --group writes group on the row 496ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 761ms
     ✓ --commit=none writes the row and leaves it uncommitted 343ms
     ✓ carries extra fields, parsed as JSON when they are JSON 902ms
     ✓ refuses an empty artifact 412ms
     ✓ rejects ["--failures=-1"] 320ms
     ✓ reports a failed commit with exit 8 without writing the row 1229ms
     ✓ a failed commit leaves no row staged in the index 1680ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1758ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1647ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2079ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1513ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1761ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 391ms
     ✓ --ref reads the status file as committed on that ref, not from disk 468ms
     ✓ --ref exits 3 when the ref does not carry the status file 454ms
     ✓ fails on a placeholder left in the artifact 415ms
     ✓ fails when the row's verdict differs from the artifact's 409ms
     ✓ fails when the row does not list the artifact, or carries another attempt 438ms
     ✓ fails on a missing artifact 534ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 464ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 359ms
     ✓ fails a run-tests row missing its scope, and an empty scope 727ms
   ✓ bkit steps finish (16)
     ✓ preserves challenge findings in the event when a later round overwrites the report 341ms
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 770ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 318ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 566ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 377ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 758ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 970ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 784ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 898ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1302ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 810ms
     ✓ --post needs --number; without --post there is no tracker key 441ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 354ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 788ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 646ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 419ms
     ✓ --attempt-of checks the row carries the derived counter 449ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1293ms
     ✓ writeStepRow refuses when a recorded path changed 1655ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 592ms
     ✓ writeStepRow appends its commit sha to the record 1153ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1436ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 411ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 765ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 827ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 559ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1514ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 993ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 811ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 565ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1351ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 501ms
     ✓ does not count an artifact the run found committed when it started 657ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 856ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1282ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 935ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1378ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 654ms
     ✓ the package runner itself missing could not run either (exit 4, 127 in the log) 341ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 905ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1154ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1764ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1129ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 821ms
     ✓ PASS is 0 failures with or without reports 1104ms
     ✓ clears a previous attempt's reports before the gate runs 1110ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1730ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1489ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1604ms
     ✓ numbers runs within the workflow's active run and per step 1066ms
     ✓ without --file no row is written and the output carries row null 700ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 958ms
     ✓ a planned test absent from a loaded report is a missing gap 1275ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1640ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1145ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 361ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1366ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1501ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1051ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 912ms
     ✓ green: lists each gap kind, with the runner output 751ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1435ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 588ms
       ✓ green clears an exception-only task from a human commit 470ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests) 10752ms
   ✓ bkit issues labels (25)
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 344ms
     ✓ trackerState for {"tracker":{"default":"github"}}: phase start null, hand-off null 316ms
   ✓ bkit issues comment (33)
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1460ms
     ✓ keeps each context's own section banner and drops every other context's 2693ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 407ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 311ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 752ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1334ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 362ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 4327ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ design / plan / build / debug: worktree copy when it exists, else the main checkout 305ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1420ms
     ✓ runGit names ENOBUFS when output passes the limit 2078ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1849ms
> [bkit] TRUNCATED HERE — 795 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 401 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 399ms
     ✓ source file is not treated as gate config 352ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 594ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1774ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 475ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 434ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 525ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 824ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 486ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 452ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 340ms
     ✓ --file into a missing directory is refused, not created 818ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 633ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2061ms
     ✓ a refused dev push is logged, never fails the close 2445ms
     ✓ an unreachable remote is logged, never fails the close 945ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (190 tests) 91627ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 2869ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 620ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1992ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1971ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2861ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3936ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 923ms
     ✓ tells an API error (20) from no run (10) 341ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 407ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 695ms
       ✓ a source change past the validated head refuses (17) and names the path 661ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 764ms
       ✓ --validated without --month / --fid is a usage error (2) 495ms
       ✓ a validated sha that is not an ancestor refuses (17) 625ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 618ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1100ms
     ✓ a failed re-trigger push names the cause in the log 1413ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1388ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1836ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1166ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 669ms
     ✓ gh-error: every poll errored 577ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 950ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 950ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1099ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1058ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3436ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2690ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 717ms
     ✓ re-trigger on dev only uses the record of its own FID 1143ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1205ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 473ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 622ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 338ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 495ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 630ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 752ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 793ms
     ✓ --file and --step go together 723ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 2969ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1117ms
     ✓ counts files committed since --base 924ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 961ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1304ms
     ✓ runs the --fallback gate even when no file changed, as it did before 928ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 861ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 586ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 996ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 515ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 552ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 619ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 846ms
     ✓ an unpinned repo reports nulls and asks no registry 506ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 353ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 327ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 399ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 423ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
   ✓ tipsBase (4)
     ✓ returns the worktree's top level when the main repo is bare, never the bare repo's parent 318ms
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests | 1 failed) 4440ms
   ❯ publication ownership lock (4)
     ✓ serializes publication for one target and invocation 358ms
     ✓ bounds acquisition and preserves unverifiable owners 266ms
     × reclaims only a proven dead matching process identity 665ms
     ✓ releases only its delivery token on every exit 261ms
   ✓ bkit locks acquire --kind=workflow — month bucket (5)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses while the holder's run stepped in the last 30 minutes 134ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 120ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 233ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 110ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 114ms
> [bkit] TRUNCATED HERE — 88 lines omitted. Dropped content was NOT read.
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 441ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 387ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 320ms
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 639ms
     ✓ passes every rule on a clean head 336ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 423ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 875ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 285ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ PUTs the policy requiring the default capstone check 518ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 628ms
     ✓ exits 6 when the PUT fails 326ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 312ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 323ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 307ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 322ms
     ✓ exits 6 when the api answer is not JSON 358ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 148ms
> [bkit] TRUNCATED HERE — 82 lines omitted. Dropped content was NOT read.
     ✓ answers for the cwd, not an inherited GIT_DIR 382ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 305ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 314ms
 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 2880ms
[feat/test a536bb5] gate
> [bkit] TRUNCATED HERE — 127 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 875ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 820ms
     ✓ follows summary cursors even when the first page is shorter than the limit 711ms
     ✓ reports excluded intervals as unread even when pagination finishes 1152ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 579ms
     ✓ reports an unread remainder at the page cap 518ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 859ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 926ms
     ✓ rejects missing summaries instead of treating them as empty results 414ms
     ✓ reports a failed first page as unavailable 385ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 303ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 423ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 511ms
     ✓ follows summary cursors even when the first page is shorter than the limit 537ms
     ✓ reports excluded intervals as unread even when pagination finishes 745ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 490ms
     ✓ reports an unread remainder at the page cap 604ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 470ms
     ✓ rejects missing summaries instead of treating them as empty results 372ms
     ✓ reports a failed first page as unavailable 369ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 309ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 31ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 26523ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3059ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2810ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 425ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 443ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 404ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3151ms
     ✓ does not fall back through a malformed later success receipt 1448ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 964ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 884ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1774ms
     ✓ requires proof even when the pushed increment changes no files 1041ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 635ms
     ✓ does not record a committed tree 658ms
     ✓ records no proof for a failed gate or lighter gate 1132ms
     ✓ requires integration proof when integration is declared 1319ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2211ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
No outcome row records a duration.

### Change size vs failures

A run counts as an error when it added failures. Dispatch-size threshold: 1000 lines added.

<!-- prettier-ignore -->
| Lines added | Runs | Errors | Error rate |
| --- | --- | --- | --- |
| XS (0–49) | 1 | 0 | 0.0% |
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.

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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 153ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 63ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 58ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 118ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1229ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1018ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 12ms
(node:88390) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:88390) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:88390) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:88390) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 72ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 45ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 179ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 45ms
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

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 81ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 19ms
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

 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 50ms
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

 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 21ms
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

 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 47ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 4229ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ writes plugin prompts + workflow skills, and stamps the managed version 598ms
     ✓ never writes Codex's `.agents/skills/` 637ms
     ✓ is idempotent — a second render writes nothing 1183ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 676ms
     ✓ warns when Codex is also installed (skill-overlap advisory) 624ms
     ✓ stays silent about the overlap when Codex is absent 486ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 94ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 31ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1153ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 65ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 23ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 54ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 149ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 20ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 12ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 16502ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 12063ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 12051ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 154135ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 882ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2470ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 521ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 363ms
     ✓ writes no limits for a workflow with no ask point 501ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 776ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 644ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 899ms
       ✓ a new run in the same chat gets its own session row 871ms
       ✓ writes none outside Claude Code 552ms
     ✓ opens the next run after a finished one, and after another workflow's run 538ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 458ms
     ✓ design / plan / build / debug book in the current worktree 507ms
     ✓ refuses when the lock is live, writing no row 302ms
     ✓ --lock-held checks the lock is ours 672ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 548ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 739ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 564ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 368ms
     ✓ an OPEN decision of an earlier run never resurfaces 507ms
     ✓ an OPEN decision mid-build prints its header fields 345ms
     ✓ reads Test attempt from a tests pause 742ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 837ms
     ✓ writes no row when status.jsonl does not exist 363ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 449ms
     ✓ aborts a rebase only when one is in progress 850ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 662ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 882ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 529ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 549ms
     ✓ --max-exceeded says a handover is due without any sentinel 485ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 425ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 504ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 453ms
     ✓ a debug run in SOAK mode always needs a handover 391ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 961ms
       ✓ counts subagents of an earlier chat the run's session rows name 1057ms
       ✓ records no context block, and still closes, outside a Claude Code session 1362ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1148ms
     ✓ records ending held and publish false on the workflow-done row 1459ms
     ✓ defaults the close row to ending done 1148ms
     ✓ refuses an unknown ending 451ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 984ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1082ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 937ms
     ✓ always writes the telemetry, whatever the runtime 974ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 848ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 829ms
     ✓ an unwritable stats path is logged and never fails the close 975ms
     ✓ appends the completeness row before the workflow-done row 1145ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 830ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1096ms
     ✓ writes one completeness row per close 1575ms
     ✓ leaves out the previous run's rows that share a second with this run's start 856ms
     ✓ still closes when the completeness check throws 1225ms
     ✓ still closes when the completeness row write throws 1161ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1163ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1417ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 839ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 851ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1238ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1143ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1302ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1071ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1042ms
     ✓ --record-step writes the close step's row before workflow-done 813ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 831ms
     ✓ --number without --outbox is a usage error 817ms
     ✓ --flush is ship only 363ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1211ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1291ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1346ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1258ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 972ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 493ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 427ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3086ms
     ✓ --flush with nothing to record commits and pushes nothing 1600ms
     ✓ --flush carries the named worktree's logs into the dev commit 2291ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3247ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3708ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 3729ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2851ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3659ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3260ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3355ms
     ✓ --push on dev never carries a row whose references name another feature 3079ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2784ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4445ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2645ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1284ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3105ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2825ms
     ✓ a close that landed releases the lock 2882ms
     ✓ removes the worktree before it releases the lock 2771ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4678ms
       ✓ closePr refuses when the PR base is unknown 3850ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2446ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 329ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 361ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 428ms
     ✓ names the branch, not the remote-tracking ref, in each URL 386ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 392ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 366ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 924ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 560ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1484ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 643ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 608ms
     ✓ a second run's record does not let this FID's close commit 842ms
     ✓ record is present after workflows close and before the push 1429ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2644ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 562ms
     ✓ --plan is appended when the file exists and skipped when it does not 305ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 543ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 924ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 733ms
     ✓ puts each --line after the summary, in flag order 793ms
     ✓ --summary prints the file and keeps a copy in --outbox 807ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 614ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 55936ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1946ms
     ✓ runs code.ts through its declared gate in the built checkout 1745ms
     ✓ runs code.ts through its declared gate in the built checkout 1705ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1393ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1681ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1753ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 907ms
     ✓ runs the full gate for replayed debug code 1576ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2016ms
     ✓ installs local dependencies against the built target tree 2394ms
     ✓ runs the configured frozen install even without root dependencies 1774ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1736ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1765ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1958ms
     ✓ never pushes local dev commits missing from origin/dev 1798ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3358ms
     ✓ dev moved before every push: exhausted, nothing landed 4994ms
     ✓ any other refusal is returned, not retried 1998ms
     ✓ pushToDev replays a commit range onto origin/dev 1998ms
     ✓ a replay retries on the new dev when dev moved 3373ms
     ✓ pushToDev log line names what it lands 1741ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1800ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1884ms
     ✓ a push that fails without a server answer is returned once, never retried 1520ms
     ✓ a failed fetch is returned before anything is built 520ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2458ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1553ms
     ✓ lands from a clone whose fetch refspec omits dev 1892ms
     ✓ build throwing stops the landing and removes the throwaway checkout 531ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 20054ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 14478ms
     ✓ every fence parses under zsh -n 5494ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 95516ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 80697ms
     ✓ every prompt, workflow and utility agent has the three header blocks 439ms
     ✓ sync has nothing left to rewrite 12287ms
     ✓ every clause reaches the cut-off of one surface it applies to 1725ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 267650ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1059ms
     ✓ rejects missing explicit and ambiguous existing branch selections 722ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 353ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1273ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1201ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1349ms
     ✓ a refused --continue carries git's own reason 1416ms
     ✓ --file records nothing for a refused rebase 885ms
     ✓ refuses a code conflict and aborts the rebase on the spot 897ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2288ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 897ms
     ✓ produces byte-identical output to merge=union 2072ms
     ✓ restores a trailing newline so the next append starts on its own line 1618ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 996ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1327ms
     ✓ refuses a union that leaves a line which is not JSON 913ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1251ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2254ms
     ✓ refuses a lockfile whose regenerate command fails 1965ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1626ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1584ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1820ms
     ✓ refuses and aborts when both sides changed the hand-written region 1000ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1129ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1321ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1607ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 995ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1128ms
     ✓ refuses and aborts when a side deleted the install record 822ms
     ✓ refuses a conflicted doc the repo's script does not list 824ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 972ms
     ✓ removes a stale sentinel when the rebase succeeds 955ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1352ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1249ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 801ms
       ✓ skips (12) with no anchor 599ms
       ✓ skips (12) when the base is unreachable in this clone 748ms
       ✓ skips (12) when nothing landed since the base 735ms
       ✓ runs (0) with the landed path count once dev moved 1227ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 681ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1252ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 857ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1241ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1673ms
     ✓ runs exactly one git push 1472ms
     ✓ --set-upstream records the upstream 932ms
     ✓ refuses with no branch checked out 789ms
     ✓ --mode=dev refuses a feature checkout 721ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1865ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3009ms
     ✓ --require-ci pushes as-is when dev has not moved 1232ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2085ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3241ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 820ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1446ms
     ✓ --mode=abort pushes when the branch has no open PR 1299ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 837ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 543ms
     ✓ --open-pr carries the MCP answer and skips gh 989ms
     ✓ --mode=abort on dev pushes plainly without probing 1027ms
     ✓ rejects an unknown mode 700ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3392ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1614ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1800ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4085ms
     ✓ skip-ci HEAD on the replay is refused 1264ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3206ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3667ms
     ✓ a level local dev is a plain push, recording nothing extra 1556ms
     ✓ a record with no commits pushes nothing 1094ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 740ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1456ms
     ✓ a rewritten branch is refused, never forced 1034ms
     ✓ refuses dev and main with exit 21 and pushes nothing 622ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1477ms
     ✓ refuses a detached HEAD (exit 5) 616ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1280ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1198ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1242ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1760ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 659ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1523ms
     ✓ an up-to-date branch is a no-op 915ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1634ms
     ✓ a fetch that fails exits 10 705ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 991ms
     ✓ scan-diff still reports a new skip when its test … 940ms
     ✓ scan-diff reports a skip moved onto a different t… 893ms
     ✓ scan-diff does not cancel a skip moved between am… 765ms
     ✓ scan-diff does not spend an unchanged duplicate t… 793ms
     ✓ scan-diff recognizes a renamed test file 734ms
     ✓ scan-diff recognizes a suite moved into a differe… 802ms
     ✓ scan-diff does not let unrelated additions hide a… 771ms
     ✓ scan-diff attributes deletion to its old test ins… 766ms
     ✓ scan-diff consumes each moved assertion once and … 871ms
     ✓ scan-diff does not match identical assertions fro… 896ms
     ✓ scan-diff does not match the same leaf test name … 837ms
     ✓ scan-diff does not match a same-named test with d… 834ms
     ✓ scan-diff does not match a same-named test with c… 818ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 821ms
     ✓ --paths with no match exits 1 725ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 664ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1056ms
     ✓ --marker reads a diff over 1 MiB 810ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1020ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 822ms
     ✓ scan-diff finds an added skip 815ms
     ✓ scan-diff ignores a skip predating the base 931ms
     ✓ scan-diff reports a disabled test with its line 882ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 854ms
     ✓ scan-diff ignores a removed comment in a test file 822ms
     ✓ scan-diff ignores an assertion moved within the file 769ms
     ✓ scan-diff still reports a removed assertion 806ms
     ✓ scan-diff reports an assertion re-added only outside the test file 882ms
     ✓ scan-diff finds an added pytest mark skip 875ms
     ✓ scan-diff finds an added unittest skip 804ms
     ✓ scan-diff finds an added bare skip call 823ms
     ✓ scan-diff ignores a quoted skip in a documentation file 835ms
     ✓ scan-diff ignores a marker literal in a non-test source file 834ms
     ✓ scan-diff ignores an assertion whose expectation changed 846ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 790ms
     ✓ scan-diff reports a deleted test file 822ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 612ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1917ms
     ✓ a title that already carries the marker is left alone 1560ms
     ✓ with no open PR: pushes the marker commit and edits no title 1410ms
     ✓ a re-run is deduped: no second marker commit 1401ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1630ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 635ms
     ✓ --title-set skips gh entirely 775ms
     ✓ refuses dev and main (exit 21) 340ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 646ms
     ✓ Path B once dev moved; --head checks a given commit 784ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 787ms
     ✓ --merge-docs merges dev when docs/ is behind 945ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 852ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1413ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1354ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1129ms
     ✓ --merge-docs skips an empty bkit:generate script 1042ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1052ms
     ✓ --merge-docs never merges on dev itself 1052ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1159ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 864ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 793ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1511ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 704ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1509ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1994ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2463ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2503ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1756ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2837ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 2218ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1820ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1250ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 886ms
     ✓ exits 10 when the fetch fails 573ms
     ✓ refuses --merge-docs with --head, and an unknown --head 556ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1076ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1604ms
     ✓ a failed install stops ship (16) 1333ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1448ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1334ms
     ✓ exits 10 when the fetch fails 1310ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 453ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 740ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 3890ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2648ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2395ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2711ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 5589ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 8729ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1597ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1758ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1359ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2136ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2486ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1840ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2229ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1906ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1273ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 783ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1870ms
     ✓ land removes the worktree when only the copied .env is untracked 2093ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2288ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1876ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2953ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1850ms
     ✓ landPr refuses a main-based PR without retrying 700ms
     ✓ landPr refuses when the PR base is unknown 673ms
     ✓ PR not open (closed): stops (17) at once, no retry 825ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 945ms
     ✓ --attempt names the merge round in a fix commit 778ms
     ✓ commits a rewritten and a deleted tracked file 851ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 723ms
     ✓ reports undeclared and runs nothing with no scripts 560ms
     ✓ reports undeclared and runs nothing with an empty script 574ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 650ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 630ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 403ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > reclaims only a proven dead matching process identity
TypeError: Cannot read properties of null (reading 'owner')
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:152:17
    150|     expect(child.status).toBe(0);
    151|     const dead: PublicationLock = JSON.parse(child.stdout.trim());
    152|     expect(dead.owner.pid).not.toBe(process.pid);
       |                 ^
    153|     const reclaimed = ownedPublication(await api.acquire(cwd, options)…
    154|     expect(reclaimed).not.toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 173 passed (174)
      Tests  1 failed | 7376 passed | 2 skipped (7379)
   Start at  22:23:01
   Duration  270.24s (tests 95%, import 2%, transform 2%, setup 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/891-build-gate-stuck/build-group-gate-1-2.log.reports/vitest-81508.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.78 |    83.37 |   95.09 |   91.14 |                   
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
 ...mands/workflow |   92.25 |    84.67 |   96.31 |   93.73 |                   
  branches.ts      |   90.41 |    83.62 |   98.22 |   92.29 | ...3028,3053,3196 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.57 |    96.19 |     100 |   98.93 | 240,620           
  decisions.ts     |   95.32 |    80.92 |   97.72 |   98.36 | 207,312,381       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   89.26 |    83.05 |   92.59 |   91.39 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.57 |    84.15 |    99.1 |   92.67 | ...2403,2435-2439 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    89.9 |    83.04 |   90.82 |    91.1 | ...1963,1968,1970 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |    96.8 |       90 |   96.51 |   98.18 | ...2222,2318-2320 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.38 |    59.06 |   67.85 |   62.53 | ...1128,1131-1132 
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
 engine/shared     |   99.44 |    97.23 |     100 |     100 |                   
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
Statements   : 89.78% ( 18951/21108 )
Branches     : 83.37% ( 14209/17043 )
Functions    : 95.09% ( 3062/3220 )
Lines        : 91.14% ( 16614/18228 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1741 of 3600 lines (121 KB of 277 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
