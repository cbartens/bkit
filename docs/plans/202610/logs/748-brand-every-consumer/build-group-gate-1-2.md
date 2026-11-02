
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/167 files need formatting

> @cbartens/bkit@6.0.0 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 303:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 132:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 350:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 358:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 154:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 223:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 377:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 149:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 175:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 182:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 446:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 822:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 481:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 601:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 674:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 133:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 159:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 601:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 824:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 993:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1095:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1256:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1314:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-ci-performance.md
 127:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-database.md
 143:224  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/docs/templates/bkit-audit-dependencies.md
 313:16  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/prompts/bkit-utility-update-tracker.md
 123:6  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/shared/docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 361:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 401:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 472:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 361:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 401:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 472:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 46 warnings and 0 suggestions in 149 files.
passed: true
skipped: null
files: 149

> @cbartens/bkit@6.0.0 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> bkit ci slop

[bkit-ci] base db424ac7af6c361b882bd063c74a527a304573a7 (db424ac7af6c361b882bd063c74a527a304573a7) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: db424ac7af6c361b882bd063c74a527a304573a7
base: db424ac7af6c361b882bd063c74a527a304573a7
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 87855ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 1147ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1890ms
     ✓ --file needs --workflow 318ms
     ✓ always writes the marker, even with no plan 2532ms
     ✓ writes the linear marker shape, taking the tracker from package.json 2672ms
     ✓ writes the jira marker shape, taking the tracker from package.json 2540ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 2841ms
     ✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 376ms
     ✓ refuses a github marker with fid "12-x" issue "abc" (exit 2) 388ms
     ✓ refuses a github marker with fid "12-x" issue "13" (exit 2) 342ms
     ✓ refuses a linear marker with fid "12-x" issue "ABC-1" (exit 2) 474ms
     ✓ refuses a linear marker with fid "ab2-1-x" issue "AB2-1" (exit 2) 320ms
     ✓ refuses a jira marker with fid "mba-7-x" issue "mba-7" (exit 2) 1152ms
     ✓ refuses a jira marker with fid "12-x" issue "MBA-7" (exit 2) 448ms
     ✓ refuses a none marker with fid "-x" issue undefined (exit 2) 616ms
     ✓ refuses a title carrying [skip ci] before calling gh (exit 4) 583ms
     ✓ refuses a title carrying [CI SKIP] before calling gh (exit 4) 465ms
     ✓ refuses a title carrying [no ci] before calling gh (exit 4) 354ms
     ✓ refuses a title carrying [skip actions] before calling gh (exit 4) 1036ms
     ✓ refuses a title carrying [actions skip] before calling gh (exit 4) 457ms
     ✓ refuses a PR from dev, main, or the base itself 1137ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 1464ms
     ✓ retries a failed create once, and exits 5 when it fails twice 2188ms
     ✓ exits 5 when the open-PR probe errors 914ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1411ms
     ✓ prs open refuses --base=main 484ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 448ms
     ✓ prs open refuses --base=origin/main, the same branch as main 353ms
     ✓ prs open refuses --base=heads/main, the same branch as main 365ms
     ✓ prs open refuses --base=refs/remotes/origin/main, the same branch as main 471ms
     ✓ prs open still opens against any other base 1176ms
     ✓ exits 6 when the created PR's base is not --base 1400ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 704ms
     ✓ exits 1 with found=false when there is none 1155ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1749ms
     ✓ --number reads one PR, mergeable included 1204ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1953ms
     ✓ exits 4 when gh errors and 80 when it needs auth 1807ms
     ✓ refuses a bad --state or --number 468ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 488ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 423ms
     ✓ flags [no ci] in the landed commit body (exit 1) 458ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 391ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 484ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 453ms
     ✓ passes a token-free body 519ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 697ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 997ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 760ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1105ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1634ms
     ✓ drops the force-build marker from the title subject 1514ms
     ✓ takes an explicit --subject 1508ms
     ✓ runs no merge when the PR is already MERGED 1298ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1995ms
     ✓ prs merge refuses a PR whose base is main 1211ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1682ms
     ✓ prs merge refuses when the PR base is unknown 1325ms
     ✓ prs merge reads the base from the one pr view it already makes 1564ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 1146ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 799ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 950ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 1367ms
     ✓ exits 2 on a bad --number 374ms
     ✓ never reads dev's required checks without --only-if-required 728ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 1132ms
     ✓ updates when a dev ruleset requires status checks 1371ms
     ✓ updates when dev's branch protection requires status checks 1004ms
     ✓ ignores dev rulesets that require no checks 1004ms
     ✓ updates when the repo cannot be resolved 778ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 784ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 643ms
     ✓ is not green when a check failed, naming it (exit 1) 758ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 765ms
     ✓ is not green on an empty rollup (total 0) 851ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 754ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1557ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1139ms
     ✓ is a no-op when the title already says so 980ms
     ✓ strips the marker, with or without its bkit prefix 1201ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1452ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 767ms
     ✓ records a skip token found in the body, then exits 1 667ms
     ✓ exits 8 on an unreadable commit, writing nothing 770ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 820ms
     ✓ needs --scan or --scan-result 483ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 88826ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 860ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 1212ms
     ✓ brand-new untracked ledger is staged and committed 1039ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 854ms
     ✓ path containing a space is staged and committed 814ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 732ms
     ✓ staging failure: exit 4 and no commit is created, no false success 720ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 721ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 582ms
     ✓ --mode=stage stages the sweep but creates no commit 679ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 2020ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 940ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 1106ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 634ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 716ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 697ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 373ms
     ✓ --root defaults to the working directory 1088ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 2405ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 2636ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 1749ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 1341ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 1673ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 905ms
     ✓ a path outside the checkout exits 6 with nothing committed 1172ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 1095ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 705ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 2461ms
     ✓ --path records its commit on the run's record, like every other commit mode 2099ms
     ✓ a recorded ledger commits only the rows the run appended 2917ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 2986ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 2524ms
     ✓ commitBookkeeping refuses when a recorded path changed 1309ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1866ms
     ✓ under --mode=commit counts the squashed paths as something to commit 2326ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 1526ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 961ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 2867ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 1351ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 758ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 1153ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 911ms
     ✓ carries untracked ledgers too 645ms
     ✓ keeps rows on separate lines when the destination has no final newline 658ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 2723ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 2452ms
     ✓ a source file in the range: exit 7, path listed 1581ms
     ✓ another FID's plan file in the range: exit 7 1185ms
     ✓ from not an ancestor of to: exit 7 1943ms
     ✓ unknown commit exits 3; a missing flag exits 2 1249ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 562ms
     ✓ append keeps a row's own repo 431ms
     ✓ append refuses a supplied schema or bkit 384ms
     ✓ append refuses a flat top-level field the top section moved into by 437ms
     ✓ append writes nothing when one row is invalid 304ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 388ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 526ms
     ✓ append bumps a round-second mint 372ms
     ✓ append refuses an empty rows file 310ms
     ✓ append refuses an unknown or issues ledger 451ms
     ✓ append refuses a writer not listed for the kind 694ms
     ✓ append starts a new line when the ledger lacks its final newline 517ms
     ✓ append creates the ledger and its directory 339ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 533ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 708ms
     ✓ append replaces a supplied firstTs / updates with the computed values 527ms
     ✓ append continues the count from a compacted winner 528ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 646ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 781ms
     ✓ triage keeps an own-cycle deferral exempt 683ms
     ✓ triage marks an unjustified deferral lazy 1363ms
     ✓ triage writes an unjustified row with a minted ts 746ms
     ✓ triage writes no row for a closed deferral 589ms
     ✓ triage reports an adjudicated unjustified row outside exempt 652ms
     ✓ triage ignores another feature's deferral rows 790ms
     ✓ triage writes nothing when the FID has no deferral row 554ms
     ✓ triage refuses a plan with no task blocks 1055ms
     ✓ triage refuses a plan whose task blocks do not parse 1024ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 738ms
 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests | 2 failed) 86596ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 263ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 221ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 204ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 286ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 173ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 209ms
     ✓ refuses ["--workflow=build","--month=202610"] 142ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 165ms
     ✓ refuses outside a git repository 50ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 681ms
     ✓ adopts the main checkout even when called from a linked worktree 761ms
     ✓ design refuses to work in place on dev 462ms
     ✓ plan refuses to work in place on dev 410ms
     ✓ build refuses to work in place on dev 492ms
     ✓ ship refuses to work in place on dev 334ms
     ✓ build in place on main is refused 335ms
     ✓ design and plan in place on main are refused 654ms
     ✓ still adopts a cloud session branch whose upstream is main 785ms
     ✓ refuses a detached HEAD 389ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 838ms
     ✓ never in place on main 270ms
     ✓ refuses a detached HEAD before anything else 282ms
     ✓ adopts in place when the session is already on feat/{fid} 524ms
   ❯ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2891ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 3578ms
     × a new run of the same FID rewrites startSha 6358ms
     × a resume of the same FID reuses the record 5945ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 3782ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 2761ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 3332ms
     ✓ a stale record without a lock is replaced 2994ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 2262ms
     ✓ ship names a missing feat branch 1544ms
     ✓ ship on dev refuses with the releases-stay-manual text 563ms
     ✓ refuses dev / main as the ship branch 372ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 2712ms
     ✓ --issue is ship only 261ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 2629ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 1125ms
     ✓ fails with a fetch error when there is no origin to rebase onto 1196ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 1720ms
       ✓ checks no disk when there are no cleanup step files 1099ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 1506ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 2119ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 1942ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 819ms
     ✓ never commits an entry only the main checkout's copy list names 1163ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 368ms
     ✓ resolves the same marker from inside the worktree 731ms
   ✓ bkit worktrees remove (12)
     ✓ answers absent when there is no worktree 676ms
     ✓ leaves a worktree without the marker in place 1048ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 1723ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 920ms
     ✓ tells a caller inside the removed worktree where to cd 851ms
     ✓ fails with its own exit code when git cannot remove a marked path 666ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 2917ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 2347ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 1766ms
       ✓ a branch already gone everywhere is reported deleted 1937ms
       ✓ refuses to delete dev (2) 488ms
       ✓ refuses to delete main (2) 258ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 516ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 2001ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 3740ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (133 tests) 94189ms
   ✓ resolveGate (6)
     ✓ an empty script is not declared: it would run nothing and exit 0 (fix) 344ms
     ✓ no package.json, no scripts, or unparseable -> null 357ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1777ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 2290ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2159ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 2021ms
     ✓ a missing or broken package.json is named, then reads as nothing declared 500ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 2549ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 2565ms
     ✓ --gate and --log are required 487ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 955ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1788ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 959ms
     ✓ PASS is 0 failures with or without reports 653ms
     ✓ clears a previous attempt's reports before the gate runs 661ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 535ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1660ms
     ✓ a log under the outbox is named main-checkout relative in the record 1313ms
     ✓ a log small enough is copied whole: not clamped, raw null 711ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 939ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 863ms
     ✓ numbers runs within the workflow's active run and per step 1342ms
     ✓ without --file no row is written and the output carries row null 625ms
   ✓ judgeRed / judgeGreen — the named test, never the exit code alone (9)
     ✓ green needs every case of the named test to pass 316ms
   ✓ bkit tests plan-check (28)
     ✓ reports a planned test of an open task whose name its file already carries, and never refuses for it 556ms
     ✓ plan-check refuses a task without DONE WHEN 510ms
     ✓ plan-check refuses DEPENDS ON a later group 563ms
     ✓ plan-check refuses an UPDATE symbol missing from its file 692ms
     ✓ plan-check matches a Markdown heading symbol 401ms
     ✓ plan-check matches a heading exactly, in a CRLF file too 429ms
     ✓ plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON 345ms
     ✓ plan-check refuses CREATE without a Reuse Inventory NEW row 459ms
     ✓ plan-check refuses an unmapped matrix row 346ms
     ✓ plan-check refuses a delete with no supersession row 513ms
     ✓ plan-check refuses a matrix row mapped to two tasks 313ms
     ✓ plan-check refuses a task no matrix row maps to 309ms
     ✓ plan-check accepts a matrix that maps every test-bearing task 517ms
     ✓ plan-check refuses a matrix header with no Task column, naming the column to add 333ms
     ✓ plan-check refuses a Task cell naming an undefined task 328ms
     ✓ plan-check accepts a task whose only TEST FIRST is n/a 393ms
     ✓ plan-check refuses a group with 26 planned tests 336ms
     ✓ plan-check accepts 5 tasks and 25 tests in one group 345ms
     ✓ plan-check refuses a task over the per-task caps, naming the task and the cap 316ms
     ✓ plan-check follows bkit.workflows.tasks 809ms
     ✓ plan-check refuses task-like text outside a block and a plan with no task markers 887ms
   ✓ bkit tests red / green (31)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1580ms
     ✓ a planned test that passes is a vacuous gap, exit 1 2041ms
     ✓ a planned test absent from a loaded report is a missing gap 2010ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1818ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 2363ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 1212ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 2561ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1548ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1520ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 523ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 3297ms
     ✓ per-test proof (3)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1929ms
       ✓ a later unproven result never replaces a proven red of the same lines 588ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1907ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1630ms
     ✓ green: a passed-accepted test is already landed, not a gap 1132ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1599ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1368ms
     ✓ green: lists each gap kind, with the runner output 1293ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2112ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 1577ms
       ✓ green clears an exception-only task from a human commit 1038ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (65 tests) 15369ms
   ✓ source derivation (6)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
   ✓ auditStatusJsonl (end-to-end) (10)
     ✓ Path A with engine-action rows interleaved: same report 685ms
     ✓ retry-loop Path B: no holes (failure steps optional) 417ms
   ✓ formatAdvisoryReport (2)
     ✓ includes ADVISORY prefix + fail-open note 339ms
   ✓ CLI main() — advisory exit 0 (4)
     ✓ finds bkit-ship.md from the built dist/ layout, not only from source 618ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 116301ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1422ms
     ✓ names each net-new and worsened finding in the log and the JSON 2215ms
     ✓ fails on a net score rise with no net count change 2926ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 3214ms
     ✓ treats a net score at or below 0.001 as float noise 3290ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 2741ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 1461ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 2440ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1977ms
     ✓ exits 4 on a dropped net field instead of silently passing 2287ms
     ✓ exits 4 on no summary instead of silently passing 2628ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2704ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 6392ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 8679ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 8004ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ a one-level glob does not descend; ** does; each file once across globs 570ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 591ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 1105ms
     ✓ fails (exit 1) when vale reports alerts 884ms
     ✓ exits 6 on a vale runtime error 1071ms
     ✓ skips with exit 0 when no file matches 651ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1212ms
     ✓ falls back to vale sync when the main worktree has none 1063ms
     ✓ fails when vale sync cannot restore the required styles 951ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 1280ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 884ms
     ✓ is a usage error when the commit cannot be read 722ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 1369ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 1386ms
     ✓ exits 1 naming the files outside, whatever the commit message says 1203ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 3158ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1578ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 1092ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 32619ms
   ✓ trackerTarget (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 597ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 861ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 851ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 694ms
     ✓ fetches the issue and its comments as GitHub returns them 1212ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 618ms
     ✓ no key -> auth, and fetch is never called 341ms
     ✓ GraphQL errors map by code; DNS failure is network 454ms
     ✓ fetches title, url, state, labels, description and comments 391ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 356ms
     ✓ splits a body over 32,767 characters into consecutive comments 394ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 333ms
     ✓ fetches through getJiraIssue (evidence view) and pages listJiraIssueComments 311ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 1188ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1234ms
     ✓ a recent identical comment counts as done (the final close comment) 1449ms
     ✓ a failed post reports done false with the reason and never leaks a token 1219ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1732ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 314ms
     ✓ a different marker hash posts 988ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1309ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ fetchIssue pages comments past the first page 309ms
   ✓ jira: HTML comment pages and non-string bodies (2)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ build-group-start records parentSha and group 342ms
     ✓ carries extra fields, parsed as JSON when they are JSON 721ms
     ✓ rejects ["--verdict=FAIL","--failures=0"] 337ms
     ✓ rejects ["--verdict=MAYBE"] 301ms
     ✓ rejects ["--strategy=YOLO"] 332ms
     ✓ needs a message unless --commit=none 304ms
     ✓ reports a failed commit with exit 8 without writing the row 2952ms
     ✓ a failed commit leaves no row staged in the index 3413ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 4289ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1797ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2004ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 2657ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1877ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 459ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ no marker artifact exits 2 653ms
     ✓ disallowed artifact exits 3 450ms
     ✓ bad failures artifact exits 4 565ms
     ✓ a required field that is absent is invalid (re-prompt) 549ms
     ✓ takes the allowed values from the subagent's own prompt, or from --allowed 374ms
     ✓ only reads above the marker 421ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 1096ms
     ✓ fails when no row was written for the step 482ms
     ✓ --ref reads the status file as committed on that ref, not from disk 1136ms
     ✓ --ref exits 3 when the ref does not carry the status file 1509ms
     ✓ fails on a placeholder left in the artifact 1051ms
     ✓ fails when the row's verdict differs from the artifact's 864ms
     ✓ fails when the row does not list the artifact, or carries another attempt 993ms
     ✓ fails on a missing artifact 789ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 955ms
     ✓ refuses a negative or non-integer attempt (2) 400ms
     ✓ records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set 376ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 469ms
     ✓ the ship timeout row keeps its snake_case timeout_s key 350ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 404ms
     ✓ passes attempt 0, and gate --attempt=0 matches it 598ms
     ✓ fails a diagnose row missing its strategy, passes with it 1209ms
     ✓ fails a run-tests row missing its scope, and an empty scope 1372ms
     ✓ names every missing field at once 600ms
     ✓ asks nothing of a step that writes none of them 682ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ re-asks (exit 6) when a field the prompt declares is missing 1123ms
     ✓ refuses (exit 1) a row that would miss a field its gate requires, writing nothing 615ms
     ✓ pairs agents with artifacts by position: worst verdict, failures summed 807ms
     ✓ a true | false header field is true when any agent sets it true 455ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 856ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 2847ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 3233ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 2100ms
     ✓ --post needs --number; without --post there is no tracker key 1208ms
   ✓ bkit steps stub (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ checks the FID's shape for the wired tracker 1351ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 1116ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 508ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1896ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1491ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 1159ms
       ✓ gate --issue="" under none keeps today's check 480ms
     ✓ --attempt-of checks the row carries the derived counter 1026ms
> [bkit] TRUNCATED HERE — 43 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (106 tests) 50872ms
   ✓ bkit context clamp (#427 T1) (22)
     ✓ keeps both ends of a long failing run under debug-evidence 454ms
     ✓ never drops a signal line buried in the middle 458ms
     ✓ keeps every signal line when they are scattered throughout 521ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section banner and drops every other context's 12345ms
     ✓ a ci artifact keeps a section header that carries none of the base signal words 445ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 2231ms
   ✓ untouched originals (keepRaw) (4)
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 376ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 366ms
     ✓ removes a stale failure file once every recipe succeeds 504ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 574ms
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 27076ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 387ms
     ✓ merged drops every phase label and bkit:failed; refuses --failed=on with it 504ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 919ms
     ✓ refuses an unknown phase or on/off value 312ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ summary: artifact link at --ref, then the artifact verbatim 389ms
     ✓ raw lines follow the links (Fetch Context's not-configured line) 323ms
     ✓ failure: step, sub-step, error, and the last 20 stderr lines fenced 424ms
     ✓ failure: --error-file carries the error text, trailing newlines dropped; a missing file exits 3 302ms
     ✓ a stderr capture holding backticks cannot close its fence 312ms
   ✓ bkit issues comment --post (6)
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
   ✓ bkit issues labels --write (5)
     ✓ reads the labels itself, writes the transition and the state, prints tracker done 470ms
     ✓ a failed read prints done false and the transition of the given --label set 557ms
     ✓ a malformed board target is refused before any label is written 304ms
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 2165ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 657ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 401ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1593ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1134ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1020ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1174ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1230ms
     ✓ --file into a missing directory is refused, not created 1670ms
> [bkit] TRUNCATED HERE — 130 lines omitted. Dropped content was NOT read.
     ✓ runs repo steps from the checkout top, then machine steps from the home folder 303ms
     ✓ --scope runs only that file's steps 301ms
     ✓ a failing or throwing step is reported and the next step still runs 322ms
   ✓ bkit disk prune — lock (9)
     ✓ does not run while a live sweep holds the lock 329ms
> [bkit] TRUNCATED HERE — 806 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 415 lines omitted. Dropped content was NOT read.
     ✓ --fetch refreshes origin/<branch> before gating 1417ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 306ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 412ms
     ✓ tells an API error (20) from no run (10) 436ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 605ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ --event (5)
       ✓ --event push selects the green push run beside an in-flight pull_request run 925ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 402ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 1139ms
       ✓ a run still in progress whose capstone already passed passes 598ms
       ✓ a capstone still running is in progress (11) 876ms
       ✓ a failed capstone fails (12) even when every other job passed 596ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 782ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 759ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 1839ms
       ✓ a source change past the validated head refuses (17) and names the path 3141ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 2196ms
       ✓ --validated equal to --head is the plain head check 345ms
       ✓ --validated without --month / --fid is a usage error (2) 1380ms
       ✓ a validated sha that is not an ancestor refuses (17) 1864ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 3050ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1803ms
     ✓ CLI: a failed gh workflow run exits 5 1377ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 3173ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 1331ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 2171ms
     ✓ a failed re-trigger push names the cause in the log 3670ms
     ✓ a failed re-trigger push leaves no orphan commit behind 3804ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 6829ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 3164ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 2479ms
     ✓ gh-error: every poll errored 1850ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2413ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 2683ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 3663ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 3565ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 6845ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 6132ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 2175ms
     ✓ re-trigger on dev only uses the record of its own FID 2284ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 2541ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1649ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1325ms
     ✓ a refused capstone records FAIL with its reason 757ms
     ✓ an unreadable PR is an API error (20) with no head 989ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1816ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 4110ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1958ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 2115ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1799ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 4260ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2760ms
     ✓ --file and --step go together 2497ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 354ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ a reopened task that is ticked done after round 2 is not appended again on a re-run 376ms
     ✓ deferred counts the rows written 313ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 475ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 303ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 1479ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 2832ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 1023ms
     ✓ challenge gate exits 5 when --base names no commit 509ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 7095ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ refuses while the holder's run stepped in the last 30 minutes 373ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 309ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 890ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 345ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 443ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1867ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 3199ms
     ✓ a refused dev push is logged, never fails the close 2822ms
     ✓ an unreachable remote is logged, never fails the close 1827ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).
> [bkit] TRUNCATED HERE — 54 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1772ms
     ✓ passes every rule on a clean head 1130ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 1310ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 47342ms
   ✓ splitSlug (6)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1515ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 834ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1659ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 917ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 1062ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 942ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 986ms
     ✓ an unpinned repo reports nulls and asks no registry 1266ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 703ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 682ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1038ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1013ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ ship gate against the template's job names (2)
     ✓ finds the capstone among the template's jobs and passes when it is green 716ms
     ✓ refuses when the template's capstone job fails 497ms
   ✓ the capability-register step runs on pull_request (3)
     ✓ flags an event filter on the job, a missing pull_request trigger and a renamed step 759ms
> [bkit] TRUNCATED HERE — 72 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 1525ms
     ✓ source file is not treated as gate config 2572ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ null args object is ignored — no throw 505ms
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 1483ms
     ✓ non-edit tool (bash) is ignored 693ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 618ms
     ✓ resolves config from the repo root when run from a subdirectory 1000ms
     ✓ exits 6 when the PUT fails 793ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 539ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 731ms
     ✓ asks a human to log in when gh is not authenticated 965ms
     ✓ is a missing-dependency error when gh is not installed 2351ms
     ✓ exits 3 when gh repo view names no repository 933ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 917ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 589ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 450ms
     ✓ exits 6 when the api answer is not JSON 455ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 378ms
> [bkit] TRUNCATED HERE — 127 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1328ms
       ✓ falls back to event.before when gh prints unparseable output 873ms
       ✓ reports last-green-run as the source when the green head is an ancestor 1017ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1305ms
         ✓ tests ancestry against --head, not HEAD 984ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 1098ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 6094ms
   ✓ .bkit/templates/context/ (74)
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 712ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 25ms
 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests | 1 failed) 9858ms
   ✓ checkCoverage (10)
     ✓ the fixture passes 184ms
     ✓ a standing line no entry matches fails and prints the entry to add 39ms
     ✓ a local entry whose text left its file fails 4ms
     ✓ a listed verbatim carrier without the text fails 9ms
     ✓ a condensed carrier without a tagged local line fails 0ms
     ✓ a clause tagged with the rule backs a condensed carrier 0ms
     ✓ a tag naming no rule fails instead of pointing at another rule 11ms
     ✓ a clause rule or tag naming no rule fails 1ms
     ✓ two entries 80% alike are flagged 2ms
     ✓ a drift excerpt not on its cited line fails 1ms
   ✓ checkCarry (5)
     ✓ a carry line naming each prompt that holds the whole rule passes 1ms
     ✓ a carry line naming a prompt without the whole rule fails 1ms
     ✓ a prompt holding a bkit rule its carry line does not name fails 2ms
     ✓ sync rewrites a copy of the rule's retired text in a carrying prompt's block 143ms
     ✓ a prompt that carries no rule is listed 1ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a drift item without a kept reason is open 1ms
   ❯ the repo (7)
     × has no coverage findings 6894ms
     ✓ has no unreviewed near-alike entries 1110ms
     ✓ every fit tag matches its target or records why it stays 15ms
> [bkit] TRUNCATED HERE — 33 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 959ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1225ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 733ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 983ms
     ✓ runs from the checkout top even when called from a subfolder 787ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2040ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2079ms
     ✓ a push that fails without a server answer is returned once, never retried 2301ms
     ✓ a failed fetch is returned before anything is built 1046ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2941ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3227ms
     ✓ lands from a clone whose fetch refspec omits dev 2857ms
     ✓ build throwing stops the landing and removes the throwaway checkout 2294ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1385ms
     ✓ counts files committed since --base 1510ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 747ms
     ✓ runs nothing and exits 0 when no file changed 764ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1236ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 400ms
     ✓ is null when pnpm fails or prints something that is not a version 692ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 199ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 5407ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 656ms
     ✓ passes when only another key changed, such as a branch's upstream 632ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 1815ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 1960ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 780ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 25ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 4318ms
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
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 90ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 533ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 578ms
   ✓ disk prune step-file templates (7)
     ✓ both copy into place and load as valid steps of both modes 531ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1873ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ is idempotent — a second render writes nothing 631ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 388ms
     ✓ stays silent about the overlap when Codex is absent 494ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 142ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 130ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 187ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 17ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 514ms
   ✓ textOmit audit (12)
     ✓ no workflow or prompt code span reads an omitted key 436ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 2134ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 2126ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (3 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 172ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 55ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 12ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 72ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 114ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 25ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 622ms
   ✓ floor (1)
     ✓ canonical clause and rule text stays at or above the floor 610ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 35ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 23ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 487ms
   ✓ clampLogPath (2)
     ✓ lives under tmp/ of the checkout the cwd sits in, attempt suffixed when given 338ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 47ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 45ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 433ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 103ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 37ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 18ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 28045ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 27999ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 326061ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 1264ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2885ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 626ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 536ms
     ✓ writes no limits for a workflow with no ask point 512ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 482ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 793ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 673ms
       ✓ a new run in the same chat gets its own session row 537ms
       ✓ writes none outside Claude Code 473ms
     ✓ opens the next run after a finished one, and after another workflow's run 494ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 1017ms
     ✓ design / plan / build / debug book in the current worktree 829ms
     ✓ refuses when the lock is live, writing no row 865ms
     ✓ --lock-held checks the lock is ours 1261ms
     ✓ rejects an unknown workflow 564ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 1635ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 2082ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 1546ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 1042ms
     ✓ an OPEN decision of an earlier run never resurfaces 1142ms
     ✓ an OPEN decision mid-build prints its header fields 837ms
     ✓ reads Test attempt from a tests pause 1425ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 2106ms
     ✓ writes no row when status.jsonl does not exist 1194ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 1046ms
     ✓ aborts a rebase only when one is in progress 2668ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1922ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1861ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 1276ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 1221ms
     ✓ --max-exceeded says a handover is due without any sentinel 933ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 686ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1145ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 1042ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 642ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 418ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 611ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 518ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 884ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 1304ms
     ✓ a debug run in SOAK mode always needs a handover 875ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 2102ms
       ✓ counts subagents of an earlier chat the run's session rows name 3738ms
       ✓ records no context block, and still closes, outside a Claude Code session 3493ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 2729ms
     ✓ records ending held and publish false on the workflow-done row 3864ms
     ✓ defaults the close row to ending done 2678ms
     ✓ refuses an unknown ending 1224ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 3608ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 2561ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 2509ms
     ✓ always writes the telemetry, whatever the runtime 2987ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 2434ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 2454ms
     ✓ an unwritable stats path is logged and never fails the close 2493ms
     ✓ appends the completeness row before the workflow-done row 2448ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 2304ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1933ms
     ✓ writes one completeness row per close 3801ms
     ✓ leaves out the previous run's rows that share a second with this run's start 2177ms
     ✓ still closes when the completeness check throws 2555ms
     ✓ still closes when the completeness row write throws 1909ms
     ✓ refuses without status.jsonl and writes nothing 1136ms
     ✓ ship: run.pr, size of the squash commit, and coverage 3062ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 3446ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 2488ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 2548ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 2652ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 2425ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 3152ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 2525ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 2357ms
     ✓ --record-step writes the close step's row before workflow-done 1500ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1596ms
     ✓ --number without --outbox is a usage error 1856ms
     ✓ --flush is ship only 1029ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 2373ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 2934ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 2662ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 3381ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 2037ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 1138ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 921ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3981ms
     ✓ --flush with nothing to record commits and pushes nothing 2397ms
     ✓ --flush carries the named worktree's logs into the dev commit 3358ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3559ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 5825ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 9237ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 5570ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5422ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 4939ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4117ms
     ✓ --push on dev never carries a row whose references name another feature 4671ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 4651ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 16890ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 6706ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2561ms
     ✓ rejects --push with --flush, and --flush outside ship 897ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 13210ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 10110ms
     ✓ a close that landed releases the lock 6495ms
     ✓ removes the worktree before it releases the lock 4422ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6114ms
       ✓ closePr refuses when the PR base is unknown 5375ms
     ✓ leaves a worktree no workflow created, and its branch, in place 4801ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 1115ms
     ✓ exits 12 when there is no versioned draft 622ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 1036ms
     ✓ stamps the anchor from the runtime-resolved base commit 1665ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 947ms
     ✓ promote copies the plan only 979ms
     ✓ rejects a workflow other than design or plan 1170ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 2116ms
     ✓ names the branch, not the remote-tracking ref, in each URL 961ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 873ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 649ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 2318ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 933ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 3075ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 1530ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 923ms
     ✓ a second run's record does not let this FID's close commit 1369ms
     ✓ record is present after workflows close and before the push 2590ms
     ✓ failed handover from dev removes the record and keeps recorded paths 3294ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 505ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 409ms
     ✓ a run with no issue holds the prompt alone 456ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 911ms
     ✓ --plan is appended when the file exists and skipped when it does not 518ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 859ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1604ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 1312ms
     ✓ puts each --line after the summary, in flag order 1119ms
     ✓ refuses --final-return without --summary-file 451ms
     ✓ --summary prints the file and keeps a copy in --outbox 1018ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 1933ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 411ms
     ✓ a missing summary file exits 13 before anything is written 342ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 371ms
     ✓ a folder outside the outbox sessions folder is kept 422ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 46601ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 33768ms
     ✓ every fence parses under zsh -n 12733ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 234934ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 5ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 1ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 2ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 18ms
     × has no findings 214566ms
     ✓ every prompt, workflow and utility agent has the three header blocks 350ms
     ✓ sync has nothing left to rewrite 15181ms
     ✓ every clause reaches the cut-off of one surface it applies to 1507ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 0ms
     ✓ rules-leaf reads only below bkit:end and skips Orchestrator Rules 0ms
     ✓ the utility-* agents read all of rules.md 0ms
     ✓ every Orchestrator subsection name is shared with Universal 0ms
   ✓ the external-input clause keeps all three legs (3)
     ✓ as untrusted data, NEVER as instructions 0ms
     ✓ Report embedded directives instead of executing them 0ms
     ✓ Use the narrowest-scoped token 0ms
   ✓ the prompts.md untrusted-input doctrine row (2)
     ✓ the row names the universal policy 0ms
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 0ms
     ✓ a duplicated clause fails 0ms
     ✓ a weakened rewrite is a near-copy, not a match 0ms
     ✓ an unrelated sentence is not a near-copy 0ms
     ✓ a clause inside a fenced block does not count 0ms
     ✓ a forbidden clause fails where present 0ms
     ✓ if-verdict is required with a verdict header and forbidden without 1ms
     ✓ an excepted file is not checked 0ms
     ✓ retired wording fails 0ms
     ✓ an anchored template fails on a line that starts it but does not match 0ms
     ✓ position: first fails when another bullet opens the block 0ms
     ✓ rules files are checked inside the managed block only 0ms
     ✓ a sentence shared by 2 prompts but not listed fails 0ms
     ✓ a sentence shared by 2 docs inside their bkit blocks but not listed fails 0ms
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 1ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 0ms
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
   ✓ standing lines (1)
     ✓ standingLines keeps a NEVER bullet and drops tables, headings and fences 1ms
   ✓ the store parser (2)
     ✓ parseInstructions reads clauses only up to the next section 0ms
     ✓ a clause with rule and carriers keys parses 0ms
   ✓ store carriers (2)
     ✓ carriersLine writes all, all except, and prefix families 1ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 1ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 1ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 2 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 0ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 1ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 0ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 0ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 0ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 0ms
     ✓ repeatable allows any number of copies but still flags near-copies 0ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 1ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 6ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 3ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 0ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 0ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 3051ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 1ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 1ms
     ✓ rewrites a near-copy that closes a sentence opened by local text 0ms
     ✓ rewrites retired wording continued with ; and keeps the ; 0ms
     ✓ rewrites a near-copy continued with ; and keeps the ; 0ms
     ✓ is idempotent and leaves fenced examples alone 0ms
   ✓ issue-less workflow clauses (7)
     ✓ workflow-issue-id-missing leads into the branch recovery without a STOP 0ms
     ✓ the fids parse routes: hit, no issue, non-slug STOP 0ms
     ✓ Step 1 reads the issue and FID from the prompt file, and resolves FID in the engine 0ms
     ✓ changed issue clauses keep their old text in retired 0ms
     ✓ the issue-less gate clauses read as the issue-less behaviour 0ms
     ✓ the warning, the final-message line and the skip line are clauses 0ms
     ✓ the diff reaches each reader as a file written just before its step, not a guard rule 0ms
   ✓ the Template Instructions tables match the prompts (2)
     ✓ every row's bullet is byte-identical across its carriers 109ms
     ✓ every label's rows list exactly the prompts that carry it 101ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 415020ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1859ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1850ms
     ✓ --file records nothing for a refused rebase 1182ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1307ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 3316ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1059ms
     ✓ produces byte-identical output to merge=union 3839ms
     ✓ restores a trailing newline so the next append starts on its own line 3459ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 3417ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 4661ms
     ✓ refuses a union that leaves a line which is not JSON 2585ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 2742ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 3803ms
     ✓ refuses a lockfile whose regenerate command fails 3504ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1324ms
     ✓ removes a stale sentinel when the rebase succeeds 2124ms
     ✓ exits 4 when no rebase is in progress 522ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 3020ms
     ✓ resolves a conflict in each of two replayed commits across rounds 3042ms
   ✓ branches anchor-stamp (19)
     ✓ records the bkit release, and warns visibly under the block when it is outdated 398ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 1074ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 880ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 385ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 621ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 612ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 507ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 327ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 2470ms
       ✓ skips (12) with no anchor 1641ms
       ✓ skips (12) when the base is unreachable in this clone 2967ms
       ✓ skips (12) when nothing landed since the base 2627ms
       ✓ runs (0) with the landed path count once dev moved 4070ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 2537ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 3644ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 2660ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 3408ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 5138ms
     ✓ runs exactly one git push 3116ms
     ✓ --set-upstream records the upstream 2379ms
     ✓ refuses with no branch checked out 1525ms
     ✓ --mode=dev refuses a feature checkout 1885ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 4344ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 7934ms
     ✓ --require-ci pushes as-is when dev has not moved 2794ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 4880ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 6903ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1980ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2587ms
     ✓ --mode=abort pushes when the branch has no open PR 2385ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 3344ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 1471ms
     ✓ --open-pr carries the MCP answer and skips gh 2363ms
     ✓ --mode=abort on dev pushes plainly without probing 2095ms
     ✓ rejects an unknown mode 1806ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 5021ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 4010ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 3927ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 6562ms
     ✓ skip-ci HEAD on the replay is refused 2162ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3213ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 7367ms
     ✓ a level local dev is a plain push, recording nothing extra 5989ms
     ✓ a record with no commits pushes nothing 3489ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1924ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2570ms
     ✓ a rewritten branch is refused, never forced 2046ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1636ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 4029ms
     ✓ refuses a detached HEAD (exit 5) 1537ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2770ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 3274ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 3055ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 4163ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 5728ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 7567ms
     ✓ an up-to-date branch is a no-op 3139ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 6277ms
     ✓ a fetch that fails exits 10 1744ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1736ms
     ✓ --paths with no match exits 1 2319ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1272ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 10573ms
     ✓ --marker reads a diff over 1 MiB 4408ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 7650ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 2172ms
     ✓ scan-diff finds an added skip 2511ms
     ✓ scan-diff ignores a skip predating the base 1788ms
     ✓ scan-diff reports a disabled test with its line 1713ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1791ms
     ✓ scan-diff ignores a removed comment in a test file 1873ms
     ✓ scan-diff ignores an assertion moved within the file 2397ms
     ✓ scan-diff still reports a removed assertion 1643ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1578ms
     ✓ scan-diff finds an added pytest mark skip 2083ms
     ✓ scan-diff finds an added unittest skip 1879ms
     ✓ scan-diff finds an added bare skip call 1651ms
     ✓ scan-diff ignores a quoted skip in a documentation file 2779ms
     ✓ scan-diff ignores a marker literal in a non-test source file 3887ms
     ✓ scan-diff ignores an assertion whose expectation changed 3369ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 3038ms
     ✓ scan-diff reports a deleted test file 1644ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1420ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 3497ms
     ✓ a title that already carries the marker is left alone 2384ms
     ✓ with no open PR: pushes the marker commit and edits no title 2116ms
     ✓ a re-run is deduped: no second marker commit 2862ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 3142ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 1297ms
     ✓ --title-set skips gh entirely 1747ms
     ✓ refuses dev and main (exit 21) 733ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 1151ms
     ✓ Path B once dev moved; --head checks a given commit 2175ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 2028ms
     ✓ --merge-docs merges dev when docs/ is behind 3176ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1954ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 5581ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2009ms
     ✓ --merge-docs skips an empty bkit:generate script 1252ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 913ms
     ✓ --merge-docs never merges on dev itself 802ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1165ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1151ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1390ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 1296ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 717ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1916ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1686ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2001ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1647ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 1913ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1231ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 914ms
     ✓ exits 10 when the fetch fails 859ms
     ✓ refuses --merge-docs with --head, and an unknown --head 828ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1267ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1210ms
     ✓ a failed install stops ship (16) 950ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 870ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 948ms
     ✓ exits 10 when the fetch fails 1046ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 511ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 584ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1721ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1735ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1788ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2071ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3180ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4575ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 917ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1375ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1620ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2343ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2595ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 2047ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2608ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1783ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1615ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 917ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2229ms
     ✓ land removes the worktree when only the copied .env is untracked 1366ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1370ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1623ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2165ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1557ms
     ✓ landPr refuses a main-based PR without retrying 795ms
     ✓ landPr refuses when the PR base is unknown 656ms
     ✓ PR not open (closed): stops (17) at once, no retry 817ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 748ms
     ✓ --attempt names the merge round in a fix commit 1005ms
     ✓ commits a rewritten and a deleted tracked file 971ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 661ms
     ✓ reports undeclared and runs nothing with no scripts 342ms
     ✓ reports undeclared and runs nothing with an empty script 304ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 374ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 446ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions-coverage.test.ts > the repo > has no coverage findings
AssertionError: expected [ …(2) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/prompts/bkit-build-plan-tests.md:80: no entry — add under #### bkit-build-plan-tests: Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.",
+   "bkit-build-plan-tests: local entry no longer in the file: Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.",
+ ]

 ❯ .bkit/core/engine/tools/instructions-coverage.test.ts:278:42
    276| describe("the repo", () => {
    277|   it("has no coverage findings", { timeout: 60_000 }, () => {
    278|     expect(checkCoverage(STORE, CORPUS)).toEqual([]);
       |                                          ^
    279|   });
    280|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 166919ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:213:3
    211|   });
    212|
    213|   it("has no findings", CORPUS_CASE, () => {
       |   ^
    214|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    215|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > a new run of the same FID rewrites startSha
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:309:3
    307|   });
    308|
    309|   it("a new run of the same FID rewrites startSha", async () => {
       |   ^
    310|     const cwd = shared();
    311|     await setup(cwd, "debug");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug in place on dev shares the checkout > a resume of the same FID reuses the record
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:319:3
    317|   });
    318|
    319|   it("a resume of the same FID reuses the record", async () => {
       |   ^
    320|     const cwd = shared();
    321|     await setup(cwd, "debug");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  3 failed | 163 passed (166)
      Tests  4 failed | 6949 passed | 2 skipped (6955)
   Start at  12:21:17
   Duration  419.74s (tests 92%, transform 2%, setup 2%, import 2%, worker 1%)

    Isolate  166 workers spawned · ~992ms startup each (spawn + environment, per file)
             at least ~17.31s faster with isolate: false — reuses workers across files instead of one per file

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/748-brand-every-consumer/build-group-gate-1-2.log.reports/vitest-56708.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.73 |    82.71 |   95.01 |   91.03 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.78 |     85.8 |      95 |   94.61 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.54 |    82.68 |     100 |   92.83 | ...09,422-424,435 
  github.ts        |   96.42 |    90.42 |     100 |   96.84 | 333-335           
  index.ts         |   85.71 |    71.84 |     100 |   97.15 | ...99,319,414-415 
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
 engine/commands   |   89.97 |    83.96 |   92.25 |   90.71 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   93.79 |    87.74 |   95.31 |   97.08 | ...03,439,490-493 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   96.49 |    86.95 |   87.27 |   97.42 |                   
  ci.ts            |   97.71 |    86.32 |   94.73 |   98.88 | 268,686,835       
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
 ...mmands/install |    47.9 |    45.74 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.55 |    84.18 |   96.45 |   94.02 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.36 |    86.99 |      98 |   97.28 | ...1622,1793,1882 
  counters.ts      |   98.26 |    94.38 |     100 |    98.7 | 203,502           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   95.31 |    88.73 |     100 |   97.29 | 128,379-380       
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   92.97 |    84.37 |     100 |   94.41 | ...1938,1970-1974 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.39 |    95.19 |     100 |    98.7 | 117,228,468       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 321               
  steps.ts         |   89.43 |    82.35 |    91.3 |   90.34 | ...1711,1716,1718 
  summary.ts       |   95.06 |    86.69 |   91.66 |   93.82 | ...99,407-413,441 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests-changed.ts |    93.1 |       75 |     100 |   94.23 | 64-65,68          
  tests.ts         |   97.18 |     89.2 |   97.17 |   98.12 | ...2083,2179-2181 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.38 |    82.47 |   97.29 |   95.03 | ...1747,1921,2642 
  worktrees.ts     |   59.49 |     56.7 |   64.81 |   60.25 | ...1074,1077-1078 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.87 |    92.78 |   98.87 |   97.24 |                   
  status.ts        |     100 |    97.29 |     100 |     100 | 122,128           
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1777,1820,2266 
 engine/render     |   90.67 |    82.42 |   98.33 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.43 |    97.15 |     100 |     100 |                   
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
Statements   : 89.73% ( 17318/19298 )
Branches     : 82.71% ( 12256/14818 )
Functions    : 95.01% ( 2822/2970 )
Lines        : 91.03% ( 15133/16623 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1938 of 4171 lines (132 KB of 312 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
