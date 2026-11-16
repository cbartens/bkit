
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
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
 518:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 640:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 782:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 203:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 277:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 104:383   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 109:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 146:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 172:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 633:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 872:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1053:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1163:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1255:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1497:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1557:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 373:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 468:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 523:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 602:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> bkit ci slop

[bkit-ci] base dd8b4390c4bbba6cc0bffdd59303832b8dc6d826 (dd8b4390c4bbba6cc0bffdd59303832b8dc6d826) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
base: dd8b4390c4bbba6cc0bffdd59303832b8dc6d826
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 5.4 on 10 cores: unit limits 7200ms per test, 14400ms per hook (x1.44)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 36872ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ github reads "please do #12 today" as issue 12 312ms
     ✓ github reads "<github_issue>12</github_issue>" as issue 12 323ms
     ✓ github reads "GitHub issue: #12" as issue 12 331ms
     ✓ github reads "ISSUE-12 needs work" as issue 12 347ms
     ✓ github reads "see o/r#12" as issue 12 347ms
     ✓ github reads "https://github.com/o/r/issues/12" as issue 12 371ms
     ✓ github reads "(#12)" as issue 12 316ms
     ✓ linear reads "<id>ABC-12</id>" as ABC-12 342ms
     ✓ linear reads "<linear_issue>ABC-12</linear_issue>" as ABC-12 369ms
     ✓ linear reads "Linear issue: ABC-12" as ABC-12 331ms
     ✓ linear reads "ISSUE-ABC-12" as ABC-12 365ms
     ✓ jira reads "issue PROJ2-7" as PROJ2-7 326ms
     ✓ jira reads "<id>PROJ2-7</id>" as PROJ2-7 431ms
     ✓ jira reads "ISSUE-PROJ2-7" as PROJ2-7 304ms
     ✓ jira reads "https://acme.atlassian.net/browse/PROJ2-7" as PROJ2-7 318ms
     ✓ github: "12" names no issue (source none) 300ms
     ✓ github: "fix it in 12 steps" names no issue (source none) 355ms
     ✓ github: "fix ABC-12" names no issue (source none) 346ms
     ✓ jira: "https://github.com/o/r/issues/12" names no issue (source none) 359ms
     ✓ none: "#12 and ABC-12" names no issue (source none) 317ms
     ✓ an explicit form wins over a bare mention, with a warning naming the other 319ms
     ✓ github: "priority #1, then issue #677" reads as issue 677 379ms
     ✓ github: "priority #1, then <id>677</id>" reads as issue 677 340ms
     ✓ github: "priority #1, then https://github.com/o/r/issues/677" reads as issue 677 313ms
     ✓ github: "set color: #123456 for the header, see #677" reads as issue 677 313ms
     ✓ github: "header { background-color: #333; } and fix #677" reads as issue 677 337ms
     ✓ github: "fix #677 (UTF-8 output)" reads as issue 677 323ms
     ✓ github: a 3- or 6-digit #N outside a colour context stays an issue 303ms
     ✓ linear with key ABC configured: "Migrate hashing to SHA-256 for ABC-12" reads as ABC-12 404ms
     ✓ linear with key abc configured: "fix ABC-12 (UTF-8 output)" reads as ABC-12 354ms
     ✓ jira with key PROJ2 configured: "Migrate hashing to SHA-256 for PROJ2-7" reads as PROJ2-7 320ms
     ✓ linear with an explicit form: the tag wins whatever the configured team 405ms
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 619ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 681ms
     ✓ github with origin O/r: "see https://github.com/other/repo/issues/9 and fix #677" reads as "677" 383ms
     ✓ github with origin O/r: "see https://github.com/o/r/issues/9 and fix #677" reads as "9" 491ms
     ✓ github with origin O/r: "see https://github.com/O/R/issues/9 and fix #677" reads as "9" 370ms
     ✓ github with origin O/r: "see other/repo#9 and fix #677" reads as "677" 359ms
     ✓ github with origin O/r: "see other/repo#9" reads as "" 441ms
     ✓ github with origin O/r: "see o/r#9 and fix #677" reads as "9" 395ms
     ✓ github with origin O/r: "see O/R#9" reads as "9" 410ms
     ✓ linear with team ABC: "see https://linear.app/acme/issue/OPS-4/x and fix ABC-12" reads as "ABC-12" 364ms
     ✓ linear with team ABC: "see https://linear.app/acme/issue/OPS-4/x" reads as "" 386ms
     ✓ linear with team ABC: "see https://linear.app/acme/issue/abc-9/x and fix ABC-12" reads as "ABC-9" 337ms
     ✓ jira with {"site":"https://acme.atlassian.net/","project":"PROJ2"}: "see https://other.atlassian.net/browse/PROJ2-9 and fix PROJ2-7" reads as "PROJ2-7" 320ms
     ✓ jira with {"site":"https://acme.atlassian.net","project":"PROJ2"}: "see https://acme.atlassian.net/browse/OPS-9 and fix PROJ2-7" reads as "PROJ2-7" 325ms
     ✓ jira with {"site":"https://ACME.atlassian.net","project":"PROJ2"}: "see https://acme.atlassian.net/browse/PROJ2-9 and fix PROJ2-7" reads as "PROJ2-9" 318ms
     ✓ jira with {"site":"https://acme.atlassian.net"}: "see https://acme.atlassian.net/browse/OPS-9" reads as "OPS-9" 310ms
     ✓ a bare number with no issue prints a hint to write #N 384ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 2122ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 565ms
     ✓ 2. an issue-less run takes any feat/ slug 312ms
     ✓ 3. a FID logged for the issue on origin/dev, even when the working tree lacks it 486ms
     ✓ 3. several FIDs logged for the issue exit 4 and list them 424ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 526ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 569ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 625ms
     ✓ 6. a FID that fails the format check exits 1 360ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 804ms
     ✓ none: no link and no own design doc (exit 1, nulls); a named audit path must exist 404ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 50241ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 846ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 763ms
     ✓ brand-new untracked ledger is staged and committed 678ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 603ms
     ✓ path containing a space is staged and committed 680ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 553ms
     ✓ staging failure: exit 4 and no commit is created, no false success 430ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 442ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 439ms
     ✓ --mode=stage stages the sweep but creates no commit 582ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1644ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 925ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 795ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 546ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 427ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 426ms
     ✓ --root defaults to the working directory 481ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 787ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 833ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 696ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 701ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 466ms
     ✓ a path outside the checkout exits 6 with nothing committed 316ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 530ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 346ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1207ms
     ✓ --path records its commit on the run's record, like every other commit mode 988ms
     ✓ a recorded ledger commits only the rows the run appended 1584ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 2127ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1828ms
     ✓ commitBookkeeping refuses when a recorded path changed 1012ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 1038ms
     ✓ under --mode=commit counts the squashed paths as something to commit 1266ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 791ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 437ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 590ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 490ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 367ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 356ms
     ✓ carries untracked ledgers too 307ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 704ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 721ms
     ✓ a source file in the range: exit 7, path listed 689ms
     ✓ another FID's plan file in the range: exit 7 654ms
     ✓ from not an ancestor of to: exit 7 640ms
     ✓ unknown commit exits 3; a missing flag exits 2 635ms
   ✓ bkit ledgers append (20)
     ✓ append refuses a supplied schema or bkit 301ms
     ✓ append refuses a writer not listed for the kind 373ms
   ✓ bkit ledgers triage (11)
     ✓ triage marks an unjustified deferral lazy 340ms
     ✓ triage writes no row for a closed deferral 315ms
     ✓ triage ignores another feature's deferral rows 369ms
     ✓ triage refuses a plan with no task blocks 344ms
     ✓ triage refuses a plan whose task blocks do not parse 353ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 382ms
   ✓ bkit ledgers append --invocation (5)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 1576ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 781ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 1008ms
     ✓ lands a standalone corrected candidate and reports the spend 672ms
     ✓ issues the same operation for rows whose keys are reordered 560ms
   ✓ bkit ledgers append --operation (3)
     ✓ returns durable append receipt and permits a deliberate same-key update 494ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 912ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 64053ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 464ms
     ✓ adopts the main checkout even when called from a linked worktree 567ms
     ✓ design refuses to work in place on dev 341ms
     ✓ plan refuses to work in place on dev 324ms
     ✓ build refuses to work in place on dev 334ms
     ✓ build in place on main is refused 337ms
     ✓ design and plan in place on main are refused 474ms
     ✓ still adopts a cloud session branch whose upstream is main 387ms
     ✓ refuses a detached HEAD 358ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1863ms
     ✓ may debug in place on dev 771ms
     ✓ adopts in place when the session is already on feat/{fid} 529ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1770ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1537ms
     ✓ a new run of the same FID rewrites startSha 2575ms
     ✓ a resume of the same FID reuses the record 2383ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1526ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1584ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1898ms
     ✓ a stale record without a lock is replaced 2241ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1657ms
     ✓ refuses inherited unpublished dev commits in every ship mode 5721ms
     ✓ names inherited commits and ship recovery in the refusal 1224ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1727ms
     ✓ ship names a missing feat branch 949ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1808ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 507ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 305ms
     ✓ fails with a fetch error when there is no origin to rebase onto 605ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 504ms
       ✓ checks no disk when there are no cleanup step files 495ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 629ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 684ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 479ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 343ms
     ✓ never commits an entry only the main checkout's copy list names 522ms
   ✓ paths (2)
     ✓ resolves the same marker from inside the worktree 379ms
   ✓ bkit worktrees remove (18)
     ✓ answers absent when there is no worktree 307ms
     ✓ leaves a worktree without the marker in place 345ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 849ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 612ms
     ✓ tells a caller inside the removed worktree where to cd 625ms
     ✓ fails with its own exit code when git cannot remove a marked path 503ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1840ms
       ✓ preserves staged-only mode during landed cleanup 1642ms
       ✓ preserves staged-only type during landed cleanup 1502ms
       ✓ preserves staged-only deletion during landed cleanup 1499ms
       ✓ removes landed staged content when both index and working contents are on dev 1433ms
       ✓ deletes the proved local and remote branch at their landed tips 1911ms
       ✓ retains the remote branch when origin refuses its conditional deletion 3037ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 636ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 666ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 363ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 807ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1315ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 67563ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 1005ms
     ✓ finishes a CI round only with its own failed job count 922ms
   ✓ progress command output (4)
     ✓ done prints progressLine 329ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 761ms
     ✓ done --group writes group on the row 578ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 803ms
     ✓ build-group-start records parentSha and group 327ms
     ✓ carries extra fields, parsed as JSON when they are JSON 581ms
     ✓ reports a failed commit with exit 8 without writing the row 994ms
     ✓ a failed commit leaves no row staged in the index 990ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1071ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 957ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1115ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 788ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1107ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 590ms
     ✓ --ref reads the status file as committed on that ref, not from disk 734ms
     ✓ --ref exits 3 when the ref does not carry the status file 566ms
     ✓ fails on a placeholder left in the artifact 591ms
     ✓ fails when the row's verdict differs from the artifact's 591ms
     ✓ fails when the row does not list the artifact, or carries another attempt 749ms
     ✓ fails on a missing artifact 609ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 639ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 354ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ passes attempt 0, and gate --attempt=0 matches it 304ms
     ✓ fails a diagnose row missing its strategy, passes with it 502ms
     ✓ fails a run-tests row missing its scope, and an empty scope 654ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 942ms
     ✓ --attempt=next counts this step's DONE rows; --count-field derives another counter 302ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 700ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 527ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 796ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1060ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 907ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 1336ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1639ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 1117ms
     ✓ --post needs --number; without --post there is no tracker key 429ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 575ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 913ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 738ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 516ms
     ✓ --attempt-of checks the row carries the derived counter 479ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1744ms
     ✓ writeStepRow refuses when a recorded path changed 2124ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 765ms
     ✓ writeStepRow appends its commit sha to the record 1779ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1628ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 497ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 961ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 932ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 804ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 520ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1601ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1200ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 761ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 410ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1262ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 586ms
     ✓ does not count an artifact the run found committed when it started 711ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 489ms
     ✓ commits a package.json change outside bkit.workflows 808ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1512ms
   ✓ bkit steps stub --result-file (12)
     ✓ renders and verifies the header of every prompt that declares one 374ms
     ✓ reads held audit keys from the linked worktree's own ledger 351ms
     ✓ refuses a result file left from an earlier round 322ms
     ✓ audit result render keeps an existing anchored report intact 391ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 19591ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 1254ms
     ✓ keeps each context's own section banner and drops every other context's 2207ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 525ms
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 408ms
     ✓ clamps a ci block with the ci profile and a runtime block without it 612ms
     ✓ finalise derives verdict, artifacts, configured contexts and clamp records 353ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 869ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 509ms
     ✓ --base narrows the range to the commits after a group's start sha 720ms
     ✓ diff from a group start covers only the group's commits 1002ms
     ✓ a base that is not a commit exits 5 and writes nothing 312ms
     ✓ an empty range writes a one-line note and zero numbers 562ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 1291ms
     ✓ --reset-log empties the step's clamp log before the record lands 1087ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 779ms
     ✓ whole: nothing omitted and no copy kept 570ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 672ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 91223ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2743ms
     ✓ runs code.ts through its declared gate in the built checkout 2613ms
     ✓ runs code.ts through its declared gate in the built checkout 2686ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 2575ms
     ✓ runs an audit template's project-section change through bkit:gate:min 3246ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 2258ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 2334ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2350ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1547ms
     ✓ runs the full gate for replayed debug code 2796ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 3006ms
     ✓ installs local dependencies against the built target tree 3033ms
     ✓ runs the configured frozen install even without root dependencies 2529ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2963ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2727ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2642ms
     ✓ never pushes local dev commits missing from origin/dev 3030ms
     ✓ dev moved: rebuilds on the new dev and pushes again 5674ms
     ✓ dev moved before every push: exhausted, nothing landed 6791ms
     ✓ any other refusal is returned, not retried 3393ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 2364ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2988ms
     ✓ a push that fails without a server answer is returned once, never retried 2282ms
     ✓ a failed fetch is returned before anything is built 728ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 4127ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2619ms
     ✓ lands from a clone whose fetch refspec omits dev 3585ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1107ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 59012ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1290ms
     ✓ names each net-new and worsened finding in the log and the JSON 886ms
     ✓ fails on a net score rise with no net count change 945ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 885ms
     ✓ treats a net score at or below 0.001 as float noise 873ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 889ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 561ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 980ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1148ms
     ✓ exits 4 on a dropped net field instead of silently passing 876ms
     ✓ exits 4 on no summary instead of silently passing 933ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1073ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1448ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1833ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1142ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 1014ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 948ms
     ✓ fails (exit 1) when vale reports alerts 963ms
     ✓ exits 6 on a vale runtime error 782ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 820ms
     ✓ falls back to vale sync when the main worktree has none 806ms
     ✓ fails when vale sync cannot restore the required styles 513ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 647ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 521ms
     ✓ is a usage error when the commit cannot be read 355ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 567ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 586ms
     ✓ exits 1 naming the files outside, whatever the commit message says 626ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1063ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 714ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 664ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 468ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 562ms
     ✓ retries a failed create once, and exits 5 when it fails twice 663ms
     ✓ exits 5 when the open-PR probe errors 485ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 698ms
     ✓ prs open still opens against any other base 539ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 446ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 790ms
     ✓ exits 4 when gh errors and 80 when it needs auth 697ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 344ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 333ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 340ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 307ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 477ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 614ms
     ✓ runs no merge when the PR is already MERGED 427ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 778ms
     ✓ prs merge refuses a PR whose base is main 466ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 744ms
     ✓ prs merge refuses when the PR base is unknown 452ms
     ✓ prs merge reads the base from the one pr view it already makes 655ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 419ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 518ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 389ms
     ✓ never reads dev's required checks without --only-if-required 446ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 480ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 544ms
     ✓ is not green when a check failed, naming it (exit 1) 615ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 568ms
     ✓ is not green on an empty rollup (total 0) 407ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 531ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 919ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 685ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 1095ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 903ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 668ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 821ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 454ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 549ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1605ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1252ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1403ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 565ms
     ✓ PASS is 0 failures with or without reports 651ms
     ✓ clears a previous attempt's reports before the gate runs 1023ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1226ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 493ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1180ms
     ✓ numbers runs within the workflow's active run and per step 903ms
     ✓ without --file no row is written and the output carries row null 447ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 675ms
     ✓ a planned test absent from a loaded report is a missing gap 1010ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1191ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1059ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 572ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1657ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 750ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 803ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1367ms
     ✓ green: lists each gap kind, with the runner output 1087ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 2096ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 968ms
       ✓ green clears an exception-only task from a human commit 623ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 20591ms
   ✓ bkit issues labels (25)
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2475ms
     ✓ saves the failed job count without the capstone job 1132ms
     ✓ counts the capstone job when it is the only failed job 958ms
     ✓ saves no failed job count when no job failed 998ms
     ✓ counts fallback evidence jobs without the capstone job 486ms
     ✓ rejects ambiguous cross-repository and malformed attempt references 547ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1516ms
     ✓ freezes explicit workflow run attempt and all failed job pages 845ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2432ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2830ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 2612ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 3054ms
     ✓ checks the named repository base and fails closed on missing evidence 1515ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1374ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1890ms
     ✓ rejects MCP capstone jobs belonging to another run 2409ms
     ✓ --fetch refreshes origin/<branch> before gating 1054ms
     ✓ tells an API error (20) from no run (10) 333ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 383ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 335ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 347ms
       ✓ a run still in progress whose capstone already passed passes 360ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 301ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 936ms
       ✓ a source change past the validated head refuses (17) and names the path 731ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 846ms
       ✓ --validated without --month / --fid is a usage error (2) 555ms
       ✓ a validated sha that is not an ancestor refuses (17) 531ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 536ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1264ms
     ✓ a failed re-trigger push names the cause in the log 2403ms
     ✓ a failed re-trigger push leaves no orphan commit behind 2280ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2892ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1655ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 792ms
     ✓ gh-error: every poll errored 583ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1326ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1346ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1728ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1749ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4400ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 4593ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1103ms
     ✓ re-trigger on dev only uses the record of its own FID 1333ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1346ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 371ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 502ms
     ✓ a refused capstone records FAIL with its reason 526ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 517ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 764ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 670ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 381ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 860ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 989ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 930ms
     ✓ --file and --step go together 751ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 43706ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 3842ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 4606ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 646ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 570ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 562ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 5022ms
     ✓ does not fall back through a malformed later success receipt 3244ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1886ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1573ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 3279ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 3203ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 810ms
     ✓ does not record a committed tree 1004ms
     ✓ records no proof for a failed gate or lighter gate 1367ms
     ✓ requires integration proof when integration is declared 2072ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3096ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1291ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 856ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1932ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 682ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 867ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1027ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 1115ms
     ✓ an unpinned repo reports nulls and asks no registry 983ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 832ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 771ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1045ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1431ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1085ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1196ms
     ✓ follows summary cursors even when the first page is shorter than the limit 912ms
     ✓ reports excluded intervals as unread even when pagination finishes 860ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 830ms
     ✓ reports an unread remainder at the page cap 733ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 743ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 377ms
     ✓ rejects missing summaries instead of treating them as empty results 853ms
     ✓ reports a failed first page as unavailable 1189ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 794ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1185ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1020ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1162ms
     ✓ reports excluded intervals as unread even when pagination finishes 1237ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1504ms
     ✓ reports an unread remainder at the page cap 935ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1137ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 1352ms
     ✓ rejects missing summaries instead of treating them as empty results 1233ms
     ✓ reports a failed first page as unavailable 1027ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 898ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (38 tests) 6449ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 927ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1660ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 772ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 8007ms
   ✓ repo facts on a real repository (4)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 355ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1384ms
     ✓ runGit names ENOBUFS when output passes the limit 2014ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 2002ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 899ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1075ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 891ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 960ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1053ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 938ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1197ms
     ✓ --file into a missing directory is refused, not created 1046ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 693ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2634ms
     ✓ a refused dev push is logged, never fails the close 3475ms
     ✓ an unreachable remote is logged, never fails the close 1220ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 5044ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1077ms
     ✓ passes every rule on a clean head 449ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 662ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 14807ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1243ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1002ms
     ✓ resolves config from the repo root when run from a subdirectory 1432ms
     ✓ exits 6 when the PUT fails 1435ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1021ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 1041ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1015ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1236ms
     ✓ exits 6 when the api answer is not JSON 625ms
(node:50496) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
> [bkit] TRUNCATED HERE — 49 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1499ms
     ✓ counts files committed since --base 1091ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1056ms
     ✓ runs nothing and exits 0 when no file changed 505ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 850ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 438ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 471ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 616ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 415ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (22 tests) 4393ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 828ms
     ✓ continues after friction and diagnostic writes fail without recursion 562ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 824ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3515ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 484ms
     ✓ starts only new source after overflow or missing source 429ms
     ✓ uses exact new comment after a failed eligibility read 392ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 368ms
     ✓ recognizes append success within budget without unnecessary resend 335ms
     ✓ preserves a human correction after lost append recognition and a later report 326ms
     ✓ contains exhausted append and create failures without fabricated success 340ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 398ms
     ✓ reserves new comment opportunity within total delivery budget 1223ms
     ✓ contains preparation state lock and reconciliation exceptions 329ms
     ✓ attempts independent attention after routine uncertainty 380ms
     ✓ seals an acknowledged segment after a postflight intervening comment 393ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1379ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 1062ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1883ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 1226ms
     ✓ fetches the issue and its comments as GitHub returns them 1365ms
     ✓ github fetch marks a closed issue terminal and an open one not 1311ms
   ✓ linear client (6)
     ✓ GraphQL errors map by code; DNS failure is network 329ms
   ✓ postCommentOnce (11)
     ✓ reuses original section time without changing duplicate identity 1370ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1184ms
     ✓ invalidates missing corrupt and unsupported progress cache 1591ms
     ✓ contains cache read and write failures as standalone degradation 742ms
     ✓ uses legacy receipts and contains receipt failures 724ms
     ✓ skips issue-less runs and tracker none 429ms
     ✓ records an engine-action row and skips the same key + body on a re-run 658ms
     ✓ a recent identical comment counts as done (the final close comment) 733ms
     ✓ a failed post reports done false with the reason and never leaks a token 550ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 803ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker 318ms
     ✓ a different marker hash posts 725ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 678ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1479ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 330ms
     ✓ limits execSync and execFileSync the same way 612ms
     ✓ stops a child that ignores SIGTERM at the remaining time 305ms
> [bkit] TRUNCATED HERE — 620 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 319 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/checks/after/index.test.ts (55 tests) 675ms
 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1152ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 784ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 523ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 506ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 646ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 303ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 360ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 332ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 167ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 255ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 384ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 348ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 914ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 716ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 131ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 376ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-FX58PZ/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (69 tests) 189ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 195ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 376ms
 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 313ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-7dpXBk/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 279ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 205ms
(node:24576) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:24576) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:24576) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:24576) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 247ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 170ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 308ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (52 tests) 511ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 423ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 147ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 267ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 137ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 161ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 151ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 174ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 134ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 90ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 208ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 324ms
   ✓ floor (1)
     ✓ canonical clause and rule text stays at or above the floor 313ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 289ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (57 tests) 273ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 75ms
(node:26327) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:26327) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 249ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 71ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 105ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 144ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 135ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 213ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 190ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 138ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 39ms
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

 ✓ .bkit/core/engine/install/project-docs.test.ts (32 tests) 123ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 171ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 159ms
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

 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 46ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 82ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 184ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 252ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 63ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 33ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 209ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 39ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (65 tests) 132ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 54ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794645577502.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794645577505.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794645577507.md — skipping (expected exactly one of each)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > is idempotent — a second run changes nothing
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > dry-run writes nothing but records the same write set (the `bkit check` drift signal)
[test] [dry-run] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > regenerates a hand-edited file whole
[test] core: .bkit/allowlist.json

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794645577553.js — skipping

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > picks up consumer allowed-domains from .agents/context.md
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > removes the retired copy bkit recorded and records the removal
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 83ms
stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > dry-run keeps the retired copy but reports the removal
[test] [dry-run] core: .bkit/allowlist.json
[test] [dry-run] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > leaves a .cursor/allowlist.json bkit never recorded alone
[test] core: .bkit/allowlist.json

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4) > is idempotent — a second run finds nothing to migrate
[test] core: .bkit/allowlist.json
[test] core: removed .cursor/allowlist.json (moved to .bkit/allowlist.json)

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 76ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 60ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 29ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 44ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 34ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 43ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 161ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 129ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 136ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 42ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 79ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 78ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 51ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 119ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 16ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 17ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 48ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 14ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 67ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 14ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 38ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 48ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 10ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 216529ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 601ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2449ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 609ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 525ms
     ✓ writes no limits for a workflow with no ask point 400ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 378ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 538ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 717ms
       ✓ a new run in the same chat gets its own session row 616ms
       ✓ writes none outside Claude Code 500ms
     ✓ opens the next run after a finished one, and after another workflow's run 582ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 667ms
     ✓ design / plan / build / debug book in the current worktree 629ms
     ✓ refuses when the lock is live, writing no row 462ms
     ✓ --lock-held checks the lock is ours 712ms
     ✓ rejects an unknown workflow 318ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 501ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 822ms
   ✓ bkit workflows start — resume facts (11)
     ✓ a new run has no last step and no open decision 497ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 455ms
     ✓ an OPEN decision of an earlier run never resurfaces 517ms
     ✓ an OPEN decision mid-build prints its header fields 504ms
     ✓ openDecision carries the Gate header 442ms
     ✓ workflows start reports openDecision for a DECIDED decision file that no build-decision row names 426ms
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 842ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 438ms
     ✓ openDecision gate is null without the header 453ms
     ✓ openDecision gate ignores a Gate line below the header 580ms
     ✓ reads Test attempt from a tests pause 474ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 686ms
     ✓ writes no row when status.jsonl does not exist 598ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 576ms
     ✓ aborts a rebase only when one is in progress 1165ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1093ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1074ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 822ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 747ms
     ✓ --max-exceeded says a handover is due without any sentinel 686ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 514ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 610ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 876ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 376ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 419ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 414ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 386ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 326ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 377ms
     ✓ bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep 398ms
     ✓ bkit workflows fail refuses a multi-line, non-/bkit- or markdown-carrying --next-step before any write 464ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 675ms
     ✓ bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit 466ms
     ✓ bkit workflows fail treats an empty --next-step as absent 320ms
     ✓ a debug run in SOAK mode always needs a handover 535ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1161ms
       ✓ counts subagents of an earlier chat the run's session rows name 1316ms
       ✓ records no context block, and still closes, outside a Claude Code session 1515ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1407ms
     ✓ records ending held and publish false on the workflow-done row 1177ms
     ✓ defaults the close row to ending done 1255ms
     ✓ refuses an unknown ending 413ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1183ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 1098ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1340ms
     ✓ always writes the telemetry, whatever the runtime 1428ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 1232ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 1149ms
     ✓ an unwritable stats path is logged and never fails the close 1346ms
     ✓ appends the completeness row before the workflow-done row 1384ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1113ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1038ms
     ✓ writes one completeness row per close 1493ms
     ✓ leaves out the previous run's rows that share a second with this run's start 968ms
     ✓ still closes when the completeness check throws 1154ms
     ✓ still closes when the completeness row write throws 1237ms
     ✓ ship: run.pr, size of the squash commit, and coverage 953ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1440ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 997ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1024ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1459ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1296ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1594ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1639ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1478ms
     ✓ --record-step writes the close step's row before workflow-done 840ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 980ms
     ✓ --number without --outbox is a usage error 1023ms
     ✓ --flush is ship only 390ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1285ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1632ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1572ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1440ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1094ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 658ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 743ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 4433ms
     ✓ --flush with nothing to record commits and pushes nothing 2153ms
     ✓ --flush carries the named worktree's logs into the dev commit 3680ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4882ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3954ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 5934ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 4783ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5456ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 4221ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3668ms
     ✓ --push on dev never carries a row whose references name another feature 3573ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3194ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5703ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4560ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1611ms
     ✓ rejects --push with --flush, and --flush outside ship 362ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3807ms
     ✓ preserves unlanded file deletions and ledger additions on close 9186ms
     ✓ preserves dirty work and uncertain branch evidence during close 9667ms
     ✓ preserves a local feature ref changed after its cleanup proof 9005ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4516ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3231ms
     ✓ a close that landed releases the lock 4240ms
     ✓ removes the worktree before it releases the lock 3820ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4808ms
       ✓ closePr refuses when the PR base is unknown 2744ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2112ms
   ✓ bkit workflows promote (7)
     ✓ exits 12 when there is no versioned draft 321ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 331ms
     ✓ stamps the anchor from the runtime-resolved base commit 336ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 315ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 328ms
     ✓ names the branch, not the remote-tracking ref, in each URL 302ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 675ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 406ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1025ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 436ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 459ms
     ✓ a second run's record does not let this FID's close commit 525ms
     ✓ record is present after workflows close and before the push 1006ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1908ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 389ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 358ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 810ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 606ms
     ✓ puts each --line after the summary, in flag order 629ms
     ✓ --summary prints the file and keeps a copy in --outbox 614ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 606ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 320359ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1028ms
     ✓ rejects missing explicit and ambiguous existing branch selections 982ms
   ✓ branches rebase: classification (31)
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 323ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1418ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1262ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 1000ms
     ✓ a refused --continue carries git's own reason 1341ms
     ✓ --file records nothing for a refused rebase 918ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1002ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1520ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 890ms
     ✓ produces byte-identical output to merge=union 2213ms
     ✓ restores a trailing newline so the next append starts on its own line 1289ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1246ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1861ms
     ✓ refuses a union that leaves a line which is not JSON 1239ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1351ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2082ms
     ✓ refuses a lockfile whose regenerate command fails 1506ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2080ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 2127ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1831ms
     ✓ refuses and aborts when both sides changed the hand-written region 1008ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1199ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1504ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 2175ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1276ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1304ms
     ✓ refuses and aborts when a side deleted the install record 1112ms
     ✓ refuses a conflicted doc the repo's script does not list 806ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 928ms
     ✓ removes a stale sentinel when the rebase succeeds 1193ms
     ✓ exits 4 when no rebase is in progress 304ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 2006ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1551ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 964ms
       ✓ skips (12) with no anchor 845ms
       ✓ skips (12) when the base is unreachable in this clone 767ms
       ✓ skips (12) when nothing landed since the base 892ms
       ✓ runs (0) with the landed path count once dev moved 1438ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 719ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1393ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 961ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1376ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1881ms
     ✓ runs exactly one git push 2045ms
     ✓ --set-upstream records the upstream 1112ms
     ✓ refuses with no branch checked out 1042ms
     ✓ --mode=dev refuses a feature checkout 794ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2328ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3787ms
     ✓ --require-ci pushes as-is when dev has not moved 1354ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2420ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3806ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 864ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1384ms
     ✓ --mode=abort pushes when the branch has no open PR 1705ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1277ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 962ms
     ✓ --open-pr carries the MCP answer and skips gh 1503ms
     ✓ --mode=abort on dev pushes plainly without probing 1406ms
     ✓ rejects an unknown mode 1041ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4098ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2393ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2394ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4756ms
     ✓ skip-ci HEAD on the replay is refused 1793ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 4871ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 5386ms
     ✓ a level local dev is a plain push, recording nothing extra 2183ms
     ✓ a record with no commits pushes nothing 1513ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1087ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2042ms
     ✓ a rewritten branch is refused, never forced 1282ms
     ✓ refuses dev and main with exit 21 and pushes nothing 836ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2104ms
     ✓ refuses a detached HEAD (exit 5) 796ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1801ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1617ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1626ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1831ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 741ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2128ms
     ✓ an up-to-date branch is a no-op 1049ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1972ms
     ✓ a fetch that fails exits 10 1278ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1290ms
     ✓ scan-diff still reports a new skip when its test … 1318ms
     ✓ scan-diff reports a skip moved onto a different t… 1184ms
     ✓ scan-diff does not cancel a skip moved between am… 1073ms
     ✓ scan-diff does not spend an unchanged duplicate t… 947ms
     ✓ scan-diff recognizes a renamed test file 1062ms
     ✓ scan-diff recognizes a suite moved into a differe… 1306ms
     ✓ scan-diff does not let unrelated additions hide a… 1139ms
     ✓ scan-diff attributes deletion to its old test ins… 1167ms
     ✓ scan-diff consumes each moved assertion once and … 1365ms
     ✓ scan-diff does not match identical assertions fro… 1355ms
     ✓ scan-diff does not match the same leaf test name … 1544ms
     ✓ scan-diff does not match a same-named test with d… 1245ms
     ✓ scan-diff does not match a same-named test with c… 1538ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1171ms
     ✓ --paths with no match exits 1 1079ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 915ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1588ms
     ✓ --marker reads a diff over 1 MiB 1270ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 2132ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1401ms
     ✓ scan-diff finds an added skip 1474ms
     ✓ scan-diff ignores a skip predating the base 1630ms
     ✓ scan-diff reports a disabled test with its line 1474ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1143ms
     ✓ scan-diff ignores a removed comment in a test file 1280ms
     ✓ scan-diff ignores an assertion moved within the file 1135ms
     ✓ scan-diff still reports a removed assertion 1261ms
     ✓ scan-diff reports an assertion re-added only outside the test file 971ms
     ✓ scan-diff finds an added pytest mark skip 1242ms
     ✓ scan-diff finds an added unittest skip 1064ms
     ✓ scan-diff finds an added bare skip call 1116ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1080ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1108ms
     ✓ scan-diff ignores an assertion whose expectation changed 1267ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 891ms
     ✓ scan-diff reports a deleted test file 1163ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 767ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2249ms
     ✓ a title that already carries the marker is left alone 1656ms
     ✓ with no open PR: pushes the marker commit and edits no title 4164ms
     ✓ a re-run is deduped: no second marker commit 1316ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1500ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 450ms
     ✓ --title-set skips gh entirely 824ms
     ✓ refuses dev and main (exit 21) 498ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1953ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 3294ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1556ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3399ms
     ✓ continues only the explicitly recorded target through the public merge command 2344ms
     ✓ fetches the unseen feature head before classifying the base 1647ms
     ✓ fast forwards the feature before either base path is chosen 3475ms
     ✓ merges divergent feature tips without rebasing either side 1952ms
     ✓ continues the feature merge before starting a dev merge 2750ms
     ✓ publishes local code with a CI running head before bookkeeping 2921ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3544ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2306ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1654ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 439ms
     ✓ Path B once dev moved; --head checks a given commit 673ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 676ms
     ✓ --merge-docs merges dev when docs/ is behind 817ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 796ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1092ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1097ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 920ms
     ✓ --merge-docs skips an empty bkit:generate script 803ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 716ms
     ✓ --merge-docs never merges on dev itself 637ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 891ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 896ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 839ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 855ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 481ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1137ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1385ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1382ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1101ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1122ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1499ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1051ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1265ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 890ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 611ms
     ✓ exits 10 when the fetch fails 378ms
     ✓ refuses --merge-docs with --head, and an unknown --head 422ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 723ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1040ms
     ✓ a failed install stops ship (16) 840ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 779ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 867ms
     ✓ exits 10 when the fetch fails 602ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 393ms
     ✓ preserves unlanded file type changes in the shared landed comparison 396ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 502ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1815ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1780ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1759ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1745ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3738ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4335ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 674ms
     ✓ local: names unpushed dev as the cause when the branch carries it 753ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 809ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2310ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2061ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1436ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6578ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1740ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1683ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1482ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 993ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2381ms
     ✓ land removes the worktree when only the copied .env is untracked 1973ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1696ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1855ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2873ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1874ms
     ✓ landPr refuses a main-based PR without retrying 958ms
     ✓ landPr refuses when the PR base is unknown 775ms
     ✓ PR not open (closed): stops (17) at once, no retry 1283ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 836ms
     ✓ --attempt names the merge round in a fix commit 645ms
     ✓ commits a rewritten and a deleted tracked file 654ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 542ms
     ✓ reports undeclared and runs nothing with no scripts 396ms
     ✓ reports undeclared and runs nothing with an empty script 401ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 524ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 605ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 412ms

 Test Files  178 passed (178)
      Tests  7729 passed | 2 skipped (7731)
   Start at  18:36:32
   Duration  321.92s (tests 96%, import 1%, setup 1%, transform 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/887-review-doc-starters/build-group-gate-3-2.log.reports/vitest-63915.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.58 |    82.35 |   94.53 |   90.07 |                   
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
 engine/commands   |    88.6 |    83.24 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...81,194,196,203 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.13 |   96.42 |   94.53 | ...20-823,870-885 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |      96 |    87.42 |    90.9 |   98.16 |                   
  ci.ts            |   97.35 |    88.36 |   95.74 |   98.89 | 273,769,849,1026  
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   94.06 |    84.12 |     100 |     100 | ...19,171,173,212 
 ...mmands/install |    47.2 |    44.69 |   57.14 |   47.59 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.35 |    22.15 |      50 |   16.48 | ...30-134,205-616 
  uninstall.ts     |    67.6 |    64.34 |   67.56 |   68.58 | ...1081,1104-1271 
  upgrade.ts       |   32.02 |    30.65 |   33.33 |   33.21 | 355-383,565-1078  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   90.14 |    82.98 |   95.28 |   91.67 |                   
  branches.ts      |    89.6 |     83.5 |   98.82 |   91.24 | ...3265,3290,3433 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.47 |    95.98 |     100 |   99.11 | 314,735           
  decisions.ts     |   94.61 |    83.89 |   98.07 |   97.31 | ...82,387,464,653 
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   94.11 |    86.99 |   97.43 |   95.62 | ...1300,1320-1330 
  junit.ts         |   94.23 |    73.84 |     100 |   93.75 | 47-48,51          
  ledgers.ts       |   88.42 |    79.07 |   95.26 |   91.36 | ...2357-2358,2386 
  locks.ts         |   92.81 |    87.71 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.08 |    88.35 |     100 |   93.07 | ...1454,1470-1471 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 494-495           
  runs.ts          |      82 |    74.49 |   92.64 |   83.42 | ...3088,3120-3124 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   94.73 |    92.96 |     100 |   95.61 | ...87,703,720,861 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |    88.9 |    81.86 |    92.3 |    90.8 | ...2359,2361,2405 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   95.67 |    90.07 |   95.18 |   96.77 | ...05-711,734,757 
  tasks.ts         |   83.82 |     66.4 |   86.66 |   88.27 | ...47,364,395,399 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests-jump.ts    |   94.73 |    68.18 |     100 |     100 | 17-25,34-36       
  tests.ts         |   96.84 |    90.03 |   96.59 |   98.21 | ...2262,2358-2360 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.87 |    83.43 |   98.71 |    95.5 | ...1741,1971,2720 
  worktrees.ts     |   67.22 |    65.59 |   74.28 |   68.69 | ...1391,1394-1395 
 engine/install    |   92.05 |    83.16 |   93.95 |   95.17 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.52 |    90.06 |     100 |     100 | ...35,340,346-347 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |   89.14 |    80.57 |    87.5 |   92.96 | ...26-346,370,589 
 engine/ledgers    |   95.44 |    91.86 |   98.29 |   96.89 |                   
  status.ts        |   94.08 |    92.71 |    97.7 |   97.92 | 855,881-887,921   
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1849,2007,2368 
 engine/render     |   90.63 |    82.85 |   98.36 |   92.74 |                   
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
 engine/tools      |   89.88 |    85.41 |   95.85 |   90.67 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.56 |    85.89 |   96.01 |    91.5 | ...1806-1891,1896 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 88.58% ( 20955/23654 )
Branches     : 82.35% ( 16270/19755 )
Functions    : 94.53% ( 3353/3547 )
Lines        : 90.07% ( 18377/20403 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 472 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 344 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 331 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 338 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 330 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 319 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 133 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 332 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 324 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 338 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 419 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 449 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 356 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 345 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1121 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 873 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 35 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 32 ms
ok 19 stub: the response selector is cleared before running its body # in 32 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 36 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 37 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 31 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 28 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 37 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 25 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 59 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 89 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 780 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 577 ms
ok 30 refresh drops a file deleted in the index from the build # in 516 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 442 ms
ok 32 a key removed from the env file is unset on the next run # in 414 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 281 ms
ok 34 non-BKIT_ keys are skipped # in 309 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 379 ms
ok 36 a failed unsetenv is retried on the next run # in 395 ms
ok 37 logs key names only, never values # in 676 ms
ok 38 missing env file exits 0 without calling launchctl # in 46 ms
ok 39 the sweep prints the summary line the lane greps for # in 504 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 20 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (159.922541ms)
✔ shell cancellation waits for SIGTERM cleanup (205.964333ms)
✔ direct cancellation waits for SIGINT cleanup (142.77175ms)
✔ shell cancellation waits for SIGINT cleanup (221.205416ms)
✔ direct cancellation waits for SIGHUP cleanup (151.129583ms)
✔ shell cancellation waits for SIGHUP cleanup (206.692625ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (494.339292ms)
✔ shell cancellation follows a worker orphaned by a nested shell (289.36075ms)
✔ direct cancellation preserves a nested machine-lock owner (578.446333ms)
✔ shell cancellation preserves a nested machine-lock owner (624.361916ms)
✔ nested shell cancellation preserves a nested machine-lock owner (628.0115ms)
✔ a hard process-group timeout reaches a shell command during cleanup (114.649208ms)
✔ ships a command-scoped sleep prevention wrapper (0.128958ms)
✔ preserves arguments, output and nonzero exit status (82.541333ms)
✔ runs an entire shell chain and retains its failure (49.319292ms)
✔ reports a missing command as 127 (45.417083ms)
✔ requires a command (43.165958ms)
✔ non-macOS platform selection runs commands without sleep prevention (72.330834ms)
✔ hard timeout escalation reaches a command that ignores TERM (185.522625ms)
✔ forwards POSIX cancellation to the command and releases the assertion (80.75125ms)
✔ holds a real macOS assertion only while the command runs (103.386292ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4551.420834
> [bkit] TRUNCATED — kept 1926 of 3661 lines (137 KB of 281 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
