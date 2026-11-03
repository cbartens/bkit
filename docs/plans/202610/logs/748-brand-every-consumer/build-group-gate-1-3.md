
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

 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 39823ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1063ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 878ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 1020ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 1257ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 1076ms
     ✓ gh not on PATH at all also falls back to the remote 430ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 596ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1178ms
     ✓ counts commits behind origin/dev and the divergence age 1424ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1063ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 2417ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1085ms
     ✓ from a worktree, still names the main checkout and its outbox 1583ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1046ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1356ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1477ms
     ✓ prints the Jira site and project under jira 1180ms
     ✓ prints the board under github 755ms
     ✓ prints the github progress and review states, defaults for a key left unset 1082ms
     ✓ prints the linear progress and review states, defaults for a key left unset 757ms
     ✓ prints the jira progress and review states, defaults for a key left unset 806ms
     ✓ prints the linear progress and review states, defaults for a key left unset 813ms
     ✓ prints null progress and review states under none 1001ms
     ✓ prints buildPublishRemote and buildPublishLocal 1579ms
     ✓ prints the publish defaults when package.json omits them 1437ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 698ms
     ✓ prints nulls under github without a board, and for keys left unset 1789ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 985ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1610ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 732ms
     ✓ an unpinned repo reports nulls and asks no registry 596ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 873ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 757ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 860ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1044ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 50315ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 686ms
     ✓ adopts the main checkout even when called from a linked worktree 756ms
     ✓ design refuses to work in place on dev 419ms
     ✓ plan refuses to work in place on dev 422ms
     ✓ build refuses to work in place on dev 616ms
     ✓ ship refuses to work in place on dev 811ms
     ✓ build in place on main is refused 715ms
     ✓ design and plan in place on main are refused 634ms
     ✓ still adopts a cloud session branch whose upstream is main 615ms
     ✓ refuses a detached HEAD 391ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 826ms
     ✓ never in place on main 383ms
     ✓ refuses a detached HEAD before anything else 341ms
     ✓ adopts in place when the session is already on feat/{fid} 693ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 2752ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 2463ms
     ✓ a new run of the same FID rewrites startSha 3605ms
     ✓ a resume of the same FID reuses the record 3826ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 2425ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1711ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1861ms
     ✓ a stale record without a lock is replaced 2507ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1594ms
     ✓ ship names a missing feat branch 404ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1286ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 526ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 343ms
     ✓ fails with a fetch error when there is no origin to rebase onto 570ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 508ms
       ✓ checks no disk when there are no cleanup step files 810ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 695ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 574ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 496ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 541ms
     ✓ never commits an entry only the main checkout's copy list names 678ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 333ms
     ✓ resolves the same marker from inside the worktree 453ms
   ✓ bkit worktrees remove (12)
     ✓ removes a marked worktree with uncommitted changes and clears the marker 533ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 407ms
     ✓ tells a caller inside the removed worktree where to cd 393ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1165ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 716ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 724ms
       ✓ a branch already gone everywhere is reported deleted 852ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 1376ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1425ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 52058ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 903ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 739ms
     ✓ brand-new untracked ledger is staged and committed 834ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 953ms
     ✓ path containing a space is staged and committed 1005ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 1191ms
     ✓ staging failure: exit 4 and no commit is created, no false success 984ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 594ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 599ms
     ✓ --mode=stage stages the sweep but creates no commit 575ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 2325ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 1485ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 1217ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 685ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 640ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 860ms
     ✓ --root defaults to the working directory 799ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 959ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 1642ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 1526ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 1030ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 566ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 402ms
     ✓ a path outside the checkout exits 6 with nothing committed 626ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 805ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 539ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1322ms
     ✓ --path records its commit on the run's record, like every other commit mode 1021ms
     ✓ a recorded ledger commits only the rows the run appended 1553ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 2402ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1662ms
     ✓ commitBookkeeping refuses when a recorded path changed 625ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 876ms
     ✓ under --mode=commit counts the squashed paths as something to commit 1160ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 644ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 466ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 931ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 499ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 387ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 357ms
     ✓ keeps rows on separate lines when the destination has no final newline 321ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 898ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 1223ms
     ✓ a source file in the range: exit 7, path listed 585ms
     ✓ another FID's plan file in the range: exit 7 627ms
     ✓ from not an ancestor of to: exit 7 538ms
     ✓ unknown commit exits 3; a missing flag exits 2 347ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 353ms
     ✓ triage keeps an own-cycle deferral exempt 641ms
     ✓ triage marks an unjustified deferral lazy 533ms
     ✓ triage ignores another feature's deferral rows 375ms
     ✓ triage writes nothing when the FID has no deferral row 306ms
     ✓ triage refuses a plan with no task blocks 501ms
     ✓ triage refuses a plan whose task blocks do not parse 506ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 515ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 54123ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 878ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 947ms
     ✓ always writes the marker, even with no plan 726ms
     ✓ writes the linear marker shape, taking the tracker from package.json 657ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1061ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1187ms
     ✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 478ms
     ✓ refuses a PR from dev, main, or the base itself 785ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 955ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1178ms
     ✓ exits 5 when the open-PR probe errors 799ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 904ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 351ms
     ✓ prs open refuses --base=heads/main, the same branch as main 333ms
     ✓ prs open refuses --base=refs/remotes/origin/main, the same branch as main 351ms
     ✓ prs open still opens against any other base 769ms
     ✓ exits 6 when the created PR's base is not --base 1128ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 916ms
     ✓ exits 1 with found=false when there is none 922ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1158ms
     ✓ --number reads one PR, mergeable included 691ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1206ms
     ✓ exits 4 when gh errors and 80 when it needs auth 885ms
     ✓ refuses a bad --state or --number 621ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 341ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 444ms
     ✓ flags [no ci] in the landed commit body (exit 1) 419ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 510ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 390ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 323ms
     ✓ passes a token-free body 408ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 354ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 326ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 1294ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1644ms
     ✓ drops the force-build marker from the title subject 1140ms
     ✓ takes an explicit --subject 1001ms
     ✓ runs no merge when the PR is already MERGED 693ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1223ms
     ✓ prs merge refuses a PR whose base is main 840ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 788ms
     ✓ prs merge refuses when the PR base is unknown 1107ms
     ✓ prs merge reads the base from the one pr view it already makes 806ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 935ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 825ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 828ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 685ms
     ✓ exits 2 on a bad --number 339ms
     ✓ never reads dev's required checks without --only-if-required 567ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 910ms
     ✓ updates when a dev ruleset requires status checks 494ms
     ✓ updates when dev's branch protection requires status checks 545ms
     ✓ ignores dev rulesets that require no checks 516ms
     ✓ updates when the repo cannot be resolved 458ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 551ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 469ms
     ✓ is not green when a check failed, naming it (exit 1) 576ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 469ms
     ✓ is not green on an empty rollup (total 0) 524ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 499ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1129ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 1024ms
     ✓ is a no-op when the title already says so 606ms
     ✓ strips the marker, with or without its bkit prefix 810ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1157ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 401ms
     ✓ needs --scan or --scan-result 329ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 56282ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1439ms
     ✓ names each net-new and worsened finding in the log and the JSON 1201ms
     ✓ fails on a net score rise with no net count change 1222ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 2249ms
     ✓ treats a net score at or below 0.001 as float noise 1107ms
     ✓ passes when the change only resolves findings 1086ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1111ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 635ms
     ✓ skips (exit 0) when the base resolves to HEAD 803ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1511ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 1243ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 660ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1683ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1511ms
     ✓ exits 4 on a dropped net field instead of silently passing 1732ms
     ✓ exits 4 on no summary instead of silently passing 1848ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1723ms
     ✓ exits 5 when the base worktree cannot be created 963ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1699ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1571ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1407ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1899ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1387ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2925ms
   ✓ bkit ci prose — file selection (3)
     ✓ a one-level glob does not descend; ** does; each file once across globs 350ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 985ms
     ✓ fails (exit 1) when vale reports alerts 805ms
     ✓ exits 6 on a vale runtime error 776ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1593ms
     ✓ falls back to vale sync when the main worktree has none 1249ms
     ✓ fails when vale sync cannot restore the required styles 852ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 657ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 441ms
     ✓ is a usage error when the commit cannot be read 379ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 556ms
     ✓ exits 1 naming the code file, whatever the commit message says 630ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 666ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 416ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1407ms
     ✓ exits 7 when a commit cannot be read 657ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 1149ms
     ✓ exits 1 naming the files outside, whatever the commit message says 597ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1540ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 1065ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 654ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1350ms
     ✓ a top-level glob in the setting does not reach into folders 758ms
     ✓ a push that changes no files is not proven a min push 603ms
     ✓ exits 7 when a commit or its base cannot be read 595ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 18745ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 768ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 514ms
     ✓ CI=true -> GITHUB_ACTION 819ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 357ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 742ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 995ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 593ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 901ms
     ✓ classifyAt reads the marker from the main checkout inside a linked worktree 561ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 658ms
     ✓ LOCAL -> runtimeHeadless=false 1001ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 375ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 508ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 726ms
     ✓ UNKNOWN -> runtimeHeadless=false 476ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 556ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 456ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 405ms
     ✓ gh not on PATH -> exit 127, 'gh not found on PATH' 678ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 594ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 536ms
     ✓ re-derives per call: one run's answer does not leak into the next 519ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 700ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 570ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 412ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 647ms
     ✓ --file into a missing directory is refused, not created 456ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 697ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 765ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 856ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 576ms
     ✓ fetches the issue and its comments as GitHub returns them 1145ms
   ✓ linear client (4)
     ✓ posts through GraphQL commentCreate with the API key as Authorization 427ms
     ✓ no key -> auth, and fetch is never called 645ms
     ✓ GraphQL errors map by code; DNS failure is network 590ms
     ✓ fetches title, url, state, labels, description and comments 344ms
   ✓ jira client (MCP over HTTP) (5)
     ✓ initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA 380ms
     ✓ a tool error maps to a reason; HTTP 401 on initialize is auth 324ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 1102ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1000ms
     ✓ a recent identical comment counts as done (the final close comment) 614ms
     ✓ a failed post reports done false with the reason and never leaks a token 781ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 731ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 710ms
     ✓ a different marker hash posts 658ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 738ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 348ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ rejects ["--verdict=MAYBE"] 315ms
     ✓ needs a message unless --commit=none 334ms
     ✓ reports a failed commit with exit 8 without writing the row 972ms
     ✓ a failed commit leaves no row staged in the index 1297ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1877ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1320ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 2260ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1505ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 2189ms
   ✓ bkit steps verdict (10)
     ✓ returns the verdict and every header field 356ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 856ms
     ✓ fails when no row was written for the step 389ms
     ✓ --ref reads the status file as committed on that ref, not from disk 751ms
     ✓ --ref exits 3 when the ref does not carry the status file 783ms
     ✓ fails on a placeholder left in the artifact 517ms
     ✓ fails when the row's verdict differs from the artifact's 530ms
     ✓ fails when the row does not list the artifact, or carries another attempt 596ms
     ✓ fails on a missing artifact 651ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 1079ms
     ✓ refuses a negative or non-integer attempt (2) 330ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 547ms
     ✓ fails a run-tests row missing its scope, and an empty scope 810ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 580ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 1232ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1372ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 696ms
     ✓ --post needs --number; without --post there is no tracker key 351ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 430ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 952ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 935ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 871ms
       ✓ gate --issue without --fid is a usage error 404ms
     ✓ --attempt-of checks the row carries the derived counter 549ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 541ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 534ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 523ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 527ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 474ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 583ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 449ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 504ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 528ms
     ✓ PASS is 0 failures with or without reports 568ms
     ✓ clears a previous attempt's reports before the gate runs 440ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 675ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 988ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 526ms
     ✓ numbers runs within the workflow's active run and per step 470ms
     ✓ without --file no row is written and the output carries row null 742ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 963ms
     ✓ a planned test absent from a loaded report is a missing gap 705ms
     ✓ a file that fails to load is a red of kind red-not-loaded 816ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 882ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 454ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 864ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 667ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 725ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 830ms
     ✓ green: lists each gap kind, with the runner output 709ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1846ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 641ms
       ✓ green clears an exception-only task from a human commit 545ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 40950ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 95 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 348ms
     ✓ source file is not treated as gate config 371ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 425ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1386ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1526ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1531ms
     ✓ a push that fails without a server answer is returned once, never retried 1080ms
     ✓ a failed fetch is returned before anything is built 778ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2021ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2383ms
     ✓ lands from a clone whose fetch refspec omits dev 1675ms
     ✓ build throwing stops the landing and removes the throwaway checkout 807ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 18469ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1719ms
       ✓ falls back to event.before when gh prints unparseable output 961ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2602ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 2779ms
         ✓ tests ancestry against --head, not HEAD 4256ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 3648ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 14937ms
   ✓ bkit skills prune (10)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1583ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 2056ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 2189ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1890ms
     ✓ runs from the checkout top even when called from a subfolder 1430ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 2442ms
     ✓ counts files committed since --base 2182ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1881ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1876ms
     ✓ runs the --fallback gate even when no file changed, as it did before 2571ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1277ms
     ✓ resolves config from the repo root when run from a subdirectory 2196ms
     ✓ exits 6 when the PUT fails 1624ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1624ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 2116ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 757ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1020ms
     ✓ exits 6 when the api answer is not JSON 462ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 10978ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 934ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1716ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 511ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (38 tests) 8766ms
   ✓ bkit disk prune — step files (10)
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 496ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 531ms
     ✓ exit 12 failed steps (10)
       ✓ bkit.testing.ciGenerated adds steps to the floor 321ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 350ms
     ✓ tells an API error (20) from no run (10) 688ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 461ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 364ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 720ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 534ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 408ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 530ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 2336ms
       ✓ a source change past the validated head refuses (17) and names the path 1335ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 1461ms
       ✓ --validated without --month / --fid is a usage error (2) 1083ms
       ✓ a validated sha that is not an ancestor refuses (17) 911ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2322ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1085ms
     ✓ CLI: a failed gh workflow run exits 5 722ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 2000ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 851ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1312ms
     ✓ a failed re-trigger push names the cause in the log 2336ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1611ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2625ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1221ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 790ms
     ✓ gh-error: every poll errored 615ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1416ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1820ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1710ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1644ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3566ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3536ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1264ms
     ✓ re-trigger on dev only uses the record of its own FID 1631ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1455ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1108ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 979ms
     ✓ a refused capstone records FAIL with its reason 1281ms
     ✓ an unreadable PR is an API error (20) with no head 635ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1700ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 4363ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 2076ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1637ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1396ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1569ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1665ms
     ✓ --file and --step go together 1723ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 14929ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 371ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 459ms
     ✓ trackerState for {"tracker":{"default":"linear"}}: phase start "started", hand-off "In Review" 438ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ refuses while the holder's run stepped in the last 30 minutes 305ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 423ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 376ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 432ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 1184ms
     ✓ passes every rule on a clean head 564ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 857ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 16736ms
   ✓ bkit roadmap mirror (8)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1322ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2451ms
     ✓ a refused dev push is logged, never fails the close 2590ms
     ✓ an unreachable remote is logged, never fails the close 1507ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (31 tests) 5243ms
   ✓ bkit status resume (31)
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 380ms
     ✓ passes when only another key changed, such as a branch's upstream 361ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 397ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 847ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 531ms
 ✓ .bkit/core/engine/commands/workflow/counters.test.ts (58 tests) 4361ms
   ✓ bkit counters route --point (7)
> [bkit] TRUNCATED HERE — 124 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 541ms
     ✓ is null when pnpm fails or prints something that is not a version 968ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
> [bkit] TRUNCATED HERE — 689 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 168 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 152 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 225 lines omitted. Dropped content was NOT read.
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
[test] write: .agents/plugins/bkit/agents/bkit-utility-update-tracker.md
[test] write: .agents/plugins/bkit/skills/bkit-auto/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-build/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-debug/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-design/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-plan/SKILL.md
[test] write: .agents/plugins/bkit/skills/bkit-ship/SKILL.md

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 853ms
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

 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1354ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 1244ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 808ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ writes plugin prompts + workflow skills, and stamps the managed version 301ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 466ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-UYmdx9/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 308ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 452ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 412ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 233ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 534ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 277ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 499ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 213ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 410ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 172ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 169ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 340ms
 ✓ .bkit/core/engine/audits/templates/template-ci-yml.test.ts (16 tests) 1153ms
   ✓ template bkit-ci.yml, filled in (2)
     ✓ passes actionlint 307ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-i2hQul/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 37ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 211ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 135ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 172ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 97ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 172ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 747ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 127ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 78ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 94ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 129ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 148ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 128ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 175ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 100ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 184ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 109ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 108ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 137ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 110ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 102ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (40 tests) 92ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 79ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 341ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 56ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 71ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 123ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 86ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (49 tests) 84ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 92ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 61ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 43ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 40ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 47ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 56ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 29ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 34ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 52ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 27ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 47ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 16ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 106ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 62ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793587863548.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793587863552.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793587863553.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793587863574.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 55ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 43ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 51ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (105 tests) 88ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 23ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 22ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 34ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 83ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 46ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 54ms
 ✓ .bkit/core/engine/install/manifest.test.ts (49 tests) 65ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 44ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 25ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 42ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 51ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 12ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 168165ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 602ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2797ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 797ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 1152ms
     ✓ writes no limits for a workflow with no ask point 764ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 471ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 583ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 614ms
       ✓ a new run in the same chat gets its own session row 579ms
       ✓ writes none outside Claude Code 599ms
     ✓ opens the next run after a finished one, and after another workflow's run 730ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 1047ms
     ✓ design / plan / build / debug book in the current worktree 686ms
     ✓ refuses when the lock is live, writing no row 776ms
     ✓ --lock-held checks the lock is ours 816ms
     ✓ rejects an unknown workflow 481ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 829ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 1133ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 550ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 521ms
     ✓ an OPEN decision of an earlier run never resurfaces 577ms
     ✓ an OPEN decision mid-build prints its header fields 583ms
     ✓ reads Test attempt from a tests pause 967ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 1431ms
     ✓ writes no row when status.jsonl does not exist 1082ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 605ms
     ✓ aborts a rebase only when one is in progress 1639ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 1408ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 1238ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 549ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 555ms
     ✓ --max-exceeded says a handover is due without any sentinel 642ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 448ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 1087ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 710ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 345ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 370ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 367ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 318ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 459ms
     ✓ a debug run in SOAK mode always needs a handover 461ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 836ms
       ✓ counts subagents of an earlier chat the run's session rows name 943ms
       ✓ records no context block, and still closes, outside a Claude Code session 1156ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1344ms
     ✓ records ending held and publish false on the workflow-done row 1151ms
     ✓ defaults the close row to ending done 1032ms
     ✓ refuses an unknown ending 609ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1492ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 990ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 987ms
     ✓ always writes the telemetry, whatever the runtime 889ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 746ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 850ms
     ✓ an unwritable stats path is logged and never fails the close 1175ms
     ✓ appends the completeness row before the workflow-done row 1830ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1122ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1569ms
     ✓ writes one completeness row per close 2092ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1270ms
     ✓ still closes when the completeness check throws 1241ms
     ✓ still closes when the completeness row write throws 1511ms
     ✓ refuses without status.jsonl and writes nothing 753ms
     ✓ ship: run.pr, size of the squash commit, and coverage 2007ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 3401ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 2521ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1392ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1869ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1612ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1704ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1357ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1606ms
     ✓ --record-step writes the close step's row before workflow-done 1173ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 1101ms
     ✓ --number without --outbox is a usage error 844ms
     ✓ --flush is ship only 497ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1734ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1504ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1394ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1396ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1082ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 649ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 639ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2260ms
     ✓ --flush with nothing to record commits and pushes nothing 1829ms
     ✓ --flush carries the named worktree's logs into the dev commit 2405ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3278ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2501ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2742ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2001ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2216ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1830ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2986ms
     ✓ --push on dev never carries a row whose references name another feature 3330ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3020ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 5681ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3492ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2443ms
     ✓ rejects --push with --flush, and --flush outside ship 716ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3977ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2840ms
     ✓ a close that landed releases the lock 3682ms
     ✓ removes the worktree before it releases the lock 3603ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5567ms
       ✓ closePr refuses when the PR base is unknown 3446ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1468ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 335ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 312ms
     ✓ names the branch, not the remote-tracking ref, in each URL 448ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 307ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 538ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 324ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 870ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 409ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 420ms
     ✓ a second run's record does not let this FID's close commit 525ms
     ✓ record is present after workflows close and before the push 893ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1514ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 346ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 340ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 589ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 450ms
     ✓ puts each --line after the summary, in flag order 467ms
     ✓ --summary prints the file and keeps a copy in --outbox 426ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 406ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 70321ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 53640ms
     ✓ every prompt, workflow and utility agent has the three header blocks 429ms
     ✓ sync has nothing left to rewrite 13416ms
     ✓ every clause reaches the cut-off of one surface it applies to 966ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 1688ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 233550ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1516ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 2029ms
     ✓ --file records nothing for a refused rebase 1996ms
     ✓ refuses a code conflict and aborts the rebase on the spot 1399ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 2039ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 1226ms
     ✓ produces byte-identical output to merge=union 3478ms
     ✓ restores a trailing newline so the next append starts on its own line 2081ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1655ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 3786ms
     ✓ refuses a union that leaves a line which is not JSON 1283ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 2314ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2461ms
     ✓ refuses a lockfile whose regenerate command fails 1487ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 1502ms
     ✓ removes a stale sentinel when the rebase succeeds 1289ms
     ✓ exits 4 when no rebase is in progress 412ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1457ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1318ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 1104ms
       ✓ skips (12) with no anchor 880ms
       ✓ skips (12) when the base is unreachable in this clone 952ms
       ✓ skips (12) when nothing landed since the base 1021ms
       ✓ runs (0) with the landed path count once dev moved 2094ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 839ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1669ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 989ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1546ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2646ms
     ✓ runs exactly one git push 2203ms
     ✓ --set-upstream records the upstream 1209ms
     ✓ refuses with no branch checked out 1171ms
     ✓ --mode=dev refuses a feature checkout 957ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2598ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 6706ms
     ✓ --require-ci pushes as-is when dev has not moved 2517ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3108ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4268ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1265ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1727ms
     ✓ --mode=abort pushes when the branch has no open PR 1877ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1580ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 961ms
     ✓ --open-pr carries the MCP answer and skips gh 1176ms
     ✓ --mode=abort on dev pushes plainly without probing 1030ms
     ✓ rejects an unknown mode 830ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2558ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1895ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2392ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5153ms
     ✓ skip-ci HEAD on the replay is refused 1662ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2501ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4294ms
     ✓ a level local dev is a plain push, recording nothing extra 1171ms
     ✓ a record with no commits pushes nothing 1037ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 713ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3285ms
     ✓ a rewritten branch is refused, never forced 1656ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1086ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2746ms
     ✓ refuses a detached HEAD (exit 5) 937ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2395ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2102ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2519ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 3156ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1326ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 3064ms
     ✓ an up-to-date branch is a no-op 1798ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2482ms
     ✓ a fetch that fails exits 10 1175ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1384ms
     ✓ --paths with no match exits 1 1261ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1124ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1806ms
     ✓ --marker reads a diff over 1 MiB 1515ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 2122ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1542ms
     ✓ scan-diff finds an added skip 1614ms
     ✓ scan-diff ignores a skip predating the base 1328ms
     ✓ scan-diff reports a disabled test with its line 1248ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 635ms
     ✓ scan-diff ignores a removed comment in a test file 597ms
     ✓ scan-diff ignores an assertion moved within the file 667ms
     ✓ scan-diff still reports a removed assertion 656ms
     ✓ scan-diff reports an assertion re-added only outside the test file 751ms
     ✓ scan-diff finds an added pytest mark skip 905ms
     ✓ scan-diff finds an added unittest skip 664ms
     ✓ scan-diff finds an added bare skip call 555ms
     ✓ scan-diff ignores a quoted skip in a documentation file 541ms
     ✓ scan-diff ignores a marker literal in a non-test source file 545ms
     ✓ scan-diff ignores an assertion whose expectation changed 532ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 568ms
     ✓ scan-diff reports a deleted test file 606ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 431ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1606ms
     ✓ a title that already carries the marker is left alone 1090ms
     ✓ with no open PR: pushes the marker commit and edits no title 977ms
     ✓ a re-run is deduped: no second marker commit 1149ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1187ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 399ms
     ✓ --title-set skips gh entirely 646ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 401ms
     ✓ Path B once dev moved; --head checks a given commit 604ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 578ms
     ✓ --merge-docs merges dev when docs/ is behind 737ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 848ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 3030ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 770ms
     ✓ --merge-docs skips an empty bkit:generate script 770ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 731ms
     ✓ --merge-docs never merges on dev itself 645ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1416ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 686ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 570ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 671ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 719ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1866ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1593ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1889ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 937ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 2121ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1050ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 717ms
     ✓ exits 10 when the fetch fails 384ms
     ✓ refuses --merge-docs with --head, and an unknown --head 358ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 519ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 668ms
     ✓ a failed install stops ship (16) 583ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 517ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 888ms
     ✓ exits 10 when the fetch fails 2174ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 989ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 718ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2114ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1122ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 901ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1054ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3517ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2578ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 529ms
     ✓ local: names unpushed dev as the cause when the branch carries it 689ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 739ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1166ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1303ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1137ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 823ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1392ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1126ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 714ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1653ms
     ✓ land removes the worktree when only the copied .env is untracked 1207ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 870ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 989ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1618ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 888ms
     ✓ landPr refuses a main-based PR without retrying 560ms
     ✓ landPr refuses when the PR base is unknown 613ms
     ✓ PR not open (closed): stops (17) at once, no retry 661ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 480ms
     ✓ --attempt names the merge round in a fix commit 397ms
     ✓ commits a rewritten and a deleted tracked file 409ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 368ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 388ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 505ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 350ms

 Test Files  166 passed (166)
      Tests  6953 passed | 2 skipped (6955)
   Start at  12:48:32
   Duration  235.31s (tests 96%, setup 1%, import 1%, transform 1%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/748-brand-every-consumer/build-group-gate-1-3.log.reports/vitest-39057.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.73 |    82.71 |   95.01 |   91.02 |                   
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
 engine/commands   |    90.1 |    84.32 |    92.9 |   90.71 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.13 |    88.53 |   96.87 |   97.08 | ...03,439,490-493 
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
 ...mands/workflow |   92.53 |    84.16 |    96.4 |      94 |                   
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
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
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
 engine/ledgers    |   96.87 |    92.91 |   98.87 |   97.24 |                   
  status.ts        |     100 |    98.64 |     100 |     100 | 122               
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
Statements   : 89.73% ( 17317/19298 )
Branches     : 82.71% ( 12257/14818 )
Functions    : 95.01% ( 2822/2970 )
Lines        : 91.02% ( 15131/16623 )
================================================================================

> @cbartens/bkit@6.0.0 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/*.bats

1..36
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 470 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 217 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 216 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 212 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 206 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 203 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 72 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 235 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 205 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 206 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 207 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 214 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 215 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 213 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 912 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 522 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 21 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 16 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 21 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 35 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 49 ms
ok 25 refresh builds the register from the staged files, not HEAD or unstaged edits # in 545 ms
ok 26 refresh drops a file deleted in the index from the build # in 318 ms
ok 27 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 413 ms
ok 28 a key removed from the env file is unset on the next run # in 183 ms
ok 29 an empty value unsets the key instead of setting an empty string # in 155 ms
ok 30 non-BKIT_ keys are skipped # in 144 ms
ok 31 one failing key does not stop the others and the exit status is non-zero # in 157 ms
ok 32 a failed unsetenv is retried on the next run # in 176 ms
ok 33 logs key names only, never values # in 145 ms
ok 34 missing env file exits 0 without calling launchctl # in 24 ms
ok 35 the sweep prints the summary line the lane greps for # in 266 ms
ok 36 the lane's grep pattern rejects output without the summary line # in 8 ms
> [bkit] TRUNCATED — kept 1795 of 3605 lines (122 KB of 275 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
