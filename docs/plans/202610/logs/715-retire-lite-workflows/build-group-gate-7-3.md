
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/164 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


 .bkit/core/.bkit/README.md
 303:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 132:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 349:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 357:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 476:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 596:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 668:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:488    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 133:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 159:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 595:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 817:184   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 983:108   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1083:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1244:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1302:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 362:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 402:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 473:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 245:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 362:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 402:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 473:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 46 warnings and 0 suggestions in 148 files.
passed: true
skipped: null
files: 148

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> bkit ci slop

[bkit-ci] base 2f44b69f1b01c5ef35dd154f705779442e1365aa (2f44b69f1b01c5ef35dd154f705779442e1365aa) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 2f44b69f1b01c5ef35dd154f705779442e1365aa
base: 2f44b69f1b01c5ef35dd154f705779442e1365aa
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (94 tests) 29000ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ modified ledger under the FID logdir is staged and committed 515ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 598ms
     ✓ brand-new untracked ledger is staged and committed 395ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 422ms
     ✓ path containing a space is staged and committed 362ms
     ✓ --mode=stage stages the sweep but creates no commit 354ms
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 856ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 506ms
     ✓ --root defaults to the working directory 487ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 661ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 585ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 391ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 416ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 310ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 635ms
     ✓ --path records its commit on the run's record, like every other commit mode 530ms
     ✓ a recorded ledger commits only the rows the run appended 875ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 949ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 919ms
     ✓ commitBookkeeping refuses when a recorded path changed 547ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 741ms
     ✓ under --mode=commit counts the squashed paths as something to commit 813ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 454ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 337ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 467ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 306ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 566ms
     ✓ a source file in the range: exit 7, path listed 572ms
     ✓ another FID's plan file in the range: exit 7 563ms
     ✓ from not an ancestor of to: exit 7 712ms
     ✓ unknown commit exits 3; a missing flag exits 2 344ms
   ✓ bkit ledgers append (20)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 318ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 368ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 307ms
     ✓ append replaces a supplied firstTs / updates with the computed values 382ms
   ✓ bkit ledgers triage (11)
     ✓ triage marks an unjustified deferral lazy 302ms
     ✓ triage writes an unjustified row with a minted ts 313ms
     ✓ triage refuses a plan with no task blocks 391ms
     ✓ triage refuses a plan whose task blocks do not parse 325ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 29871ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ adopts the main checkout even when called from a linked worktree 376ms
     ✓ design and plan in place on main are refused 305ms
     ✓ still adopts a cloud session branch whose upstream is main 306ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 461ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1111ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1248ms
     ✓ a new run of the same FID rewrites startSha 1644ms
     ✓ a resume of the same FID reuses the record 1393ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 901ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 933ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 960ms
     ✓ a stale record without a lock is replaced 1150ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 924ms
     ✓ ship names a missing feat branch 375ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 992ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 326ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 389ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 339ms
       ✓ checks no disk when there are no cleanup step files 451ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 587ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 523ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 436ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 318ms
     ✓ never commits an entry only the main checkout's copy list names 558ms
   ✓ bkit worktrees remove (12)
     ✓ leaves a worktree without the marker in place 567ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 616ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 397ms
     ✓ tells a caller inside the removed worktree where to cd 392ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1848ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 685ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 798ms
       ✓ a branch already gone everywhere is reported deleted 480ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 696ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1108ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 30920ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 1042ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 1007ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 586ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 590ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 833ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 349ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 1018ms
     ✓ counts commits behind origin/dev and the divergence age 1270ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 947ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1286ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1186ms
     ✓ from a worktree, still names the main checkout and its outbox 976ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1587ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1157ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 848ms
     ✓ prints the Jira site and project under jira 854ms
     ✓ prints the board under github 887ms
     ✓ prints the github progress and review states, defaults for a key left unset 767ms
     ✓ prints the linear progress and review states, defaults for a key left unset 571ms
     ✓ prints the jira progress and review states, defaults for a key left unset 543ms
     ✓ prints the linear progress and review states, defaults for a key left unset 608ms
     ✓ prints null progress and review states under none 781ms
     ✓ prints buildPublishRemote and buildPublishLocal 1138ms
     ✓ prints the publish defaults when package.json omits them 709ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 951ms
     ✓ prints nulls under github without a board, and for keys left unset 1976ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 588ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 735ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 670ms
     ✓ an unpinned repo reports nulls and asks no registry 720ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 515ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 455ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 760ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 661ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 35895ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 646ms
     ✓ done --group writes group on the row 378ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 599ms
     ✓ reports a failed commit with exit 8 without writing the row 562ms
     ✓ a failed commit leaves no row staged in the index 857ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 962ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 957ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1287ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1021ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1442ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 310ms
     ✓ --ref exits 3 when the ref does not carry the status file 371ms
     ✓ fails on a placeholder left in the artifact 362ms
     ✓ fails when the row's verdict differs from the artifact's 359ms
     ✓ fails when the row does not list the artifact, or carries another attempt 335ms
     ✓ fails on a missing artifact 351ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 369ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 327ms
     ✓ fails a run-tests row missing its scope, and an empty scope 522ms
   ✓ bkit steps finish (14)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 472ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 490ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 369ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 816ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1308ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 786ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 774ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1809ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 660ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 439ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 850ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 544ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 476ms
     ✓ --attempt-of checks the row carries the derived counter 390ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1042ms
     ✓ writeStepRow refuses when a recorded path changed 1105ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 627ms
     ✓ writeStepRow appends its commit sha to the record 874ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1433ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 45822ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 720ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1033ms
     ✓ always writes the marker, even with no plan 536ms
     ✓ writes the linear marker shape, taking the tracker from package.json 980ms
     ✓ writes the jira marker shape, taking the tracker from package.json 593ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 595ms
     ✓ refuses a PR from dev, main, or the base itself 453ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 796ms
     ✓ retries a failed create once, and exits 5 when it fails twice 677ms
     ✓ exits 5 when the open-PR probe errors 916ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 668ms
     ✓ prs open still opens against any other base 1218ms
     ✓ exits 6 when the created PR's base is not --base 985ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1457ms
     ✓ exits 1 with found=false when there is none 784ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 953ms
     ✓ --number reads one PR, mergeable included 793ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 980ms
     ✓ exits 4 when gh errors and 80 when it needs auth 743ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 555ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 899ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 960ms
     ✓ drops the force-build marker from the title subject 701ms
     ✓ takes an explicit --subject 980ms
     ✓ runs no merge when the PR is already MERGED 655ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 704ms
     ✓ prs merge refuses a PR whose base is main 527ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 522ms
     ✓ prs merge refuses when the PR base is unknown 656ms
     ✓ prs merge reads the base from the one pr view it already makes 705ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 775ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 569ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 715ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 721ms
     ✓ never reads dev's required checks without --only-if-required 1183ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 805ms
     ✓ updates when a dev ruleset requires status checks 1069ms
     ✓ updates when dev's branch protection requires status checks 1115ms
     ✓ ignores dev rulesets that require no checks 818ms
     ✓ updates when the repo cannot be resolved 884ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 501ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 378ms
     ✓ is not green when a check failed, naming it (exit 1) 691ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1101ms
     ✓ is not green on an empty rollup (total 0) 701ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 737ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 789ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 516ms
     ✓ is a no-op when the title already says so 664ms
     ✓ strips the marker, with or without its bkit prefix 748ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 628ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (125 tests) 50511ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 546ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 862ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 966ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 588ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 674ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 685ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 417ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 654ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 356ms
     ✓ PASS is 0 failures with or without reports 672ms
     ✓ clears a previous attempt's reports before the gate runs 1046ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 622ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 919ms
     ✓ a log under the outbox is named main-checkout relative in the record 989ms
     ✓ a log small enough is copied whole: not clamped, raw null 953ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 982ms
   ✓ bkit tests red / green (38)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 575ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no red row 844ms
     ✓ a red refused as passed notes HEAD and the uncommitted files for green 608ms
     ✓ lints the test before its red when bkit:lint:file is declared; a lint failure records nothing 626ms
     ✓ an undeclared bkit:lint:file is skipped with a note, and the red still runs 526ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 906ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 1011ms
     ✓ a script that cannot run is exit 4, not a rejected red 691ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 735ms
     ✓ green: --group audits only that group's tasks 862ms
     ✓ green: --group naming a group with no tasks is refused 463ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 789ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 849ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 688ms
     ✓ green prints a verdict and a fixable per gap 879ms
     ✓ green verdict is FAIL when a gap is unfixable 600ms
     ✓ green leaves a diff-reading kind fixable null 782ms
     ✓ green prints verdict null when a gap needs a diff read 788ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 1257ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 702ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 1079ms
     ✓ green: every test a task names needs its own red and its own pass 1217ms
     ✓ test order (13)
       ✓ green finds the code commit for DONE — TASK N 2231ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 1241ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 1518ms
       ✓ a test found by name in its file is judged on its own lines and the code it runs (3)
         ✓ another test's edit 820ms
         ✓ its own body's edit 974ms
         ✓ its helper's edit 996ms
       ✓ a red run refused as passed (3)
         ✓ on another task's committed code that shares its file is already landed, not no-red 1376ms
         ✓ with the task's own files uncommitted then stays no-red, naming them 990ms
         ✓ with no other task's code sharing a file stays no-red, saying so 1065ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 704ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1766ms
       ✓ green refuses an exception-only task from a workflow step commit 752ms
       ✓ green clears an exception-only task from a human commit 642ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 23815ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 14431ms
     ✓ every fence parses under zsh -n 9281ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 26256ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ jira with key PROJ2 configured: "Migrate hashing to SHA-256 for PROJ2-7" reads as PROJ2-7 342ms
     ✓ linear with an explicit form: the tag wins whatever the configured team 406ms
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 719ms
     ✓ jira with no key configured: a bare key names no issue, with a hint naming bkit.tracker.jira.project 478ms
     ✓ jira with no key configured: a labelled key still counts 313ms
     ✓ jira with {"site":"https://ACME.atlassian.net","project":"PROJ2"}: "see https://acme.atlassian.net/browse/PROJ2-9 and fix PROJ2-7" reads as "PROJ2-9" 380ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1521ms
   ✓ bkit fids resolve (12)
     ✓ 1. a FID the prompt names wins 445ms
     ✓ 2. the current feat/ branch, when it embeds the issue 381ms
     ✓ 3. a FID logged for the issue on origin/dev, even when the working tree lacks it 415ms
     ✓ 3. several FIDs logged for the issue exit 4 and list them 326ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 417ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 603ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 360ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 306ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 25200ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1148ms
     ✓ never pushes local dev commits missing from origin/dev 1207ms
     ✓ dev moved: rebuilds on the new dev and pushes again 1856ms
     ✓ dev moved before every push: exhausted, nothing landed 3670ms
     ✓ any other refusal is returned, not retried 1503ms
     ✓ pushToDev replays a commit range onto origin/dev 1493ms
     ✓ a replay retries on the new dev when dev moved 2044ms
     ✓ pushToDev log line names what it lands 1405ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1183ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1394ms
     ✓ a push that fails without a server answer is returned once, never retried 802ms
     ✓ a failed fetch is returned before anything is built 566ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1583ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 3176ms
     ✓ lands from a clone whose fetch refspec omits dev 1456ms
     ✓ build throwing stops the landing and removes the throwaway checkout 698ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (102 tests) 14376ms
   ✓ bkit context clamp (#427 T1) (22)
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 503ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 572ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 458ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 461ms
     ✓ fetches the issue and its comments as GitHub returns them 1352ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 636ms
     ✓ a recent identical comment counts as done (the final close comment) 1095ms
     ✓ a failed post reports done false with the reason and never leaks a token 1697ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 1196ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1105ms
     ✓ a different marker hash posts 1686ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 732ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 369ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 10366ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (53 tests) 42205ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1360ms
     ✓ names each net-new and worsened finding in the log and the JSON 1096ms
     ✓ fails on a net score rise with no net count change 1126ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1139ms
     ✓ treats a net score at or below 0.001 as float noise 1029ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 786ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 319ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1286ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 800ms
     ✓ exits 4 on a dropped net field instead of silently passing 1035ms
     ✓ exits 4 on no summary instead of silently passing 1143ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 2110ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1427ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1178ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1263ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ a one-level glob does not descend; ** does; each file once across globs 339ms
   ✓ bkit ci prose — gate (5)
     ✓ fails when vale is not installed 356ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 914ms
     ✓ fails (exit 1) when vale reports alerts 1221ms
     ✓ exits 6 on a vale runtime error 1581ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 992ms
     ✓ falls back to vale sync when the main worktree has none 1218ms
     ✓ fails when vale sync cannot restore the required styles 1172ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 526ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 394ms
     ✓ is a usage error when the commit cannot be read 315ms
   ✓ bkit ci min-push (8)
     ✓ exits 0 when every changed file is a plan log or a ledger 457ms
     ✓ exits 1 naming the files outside, whatever the commit message says 513ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1807ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 873ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 766ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1100ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 984ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 470ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1445ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1110ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1381ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1699ms
     ✓ --file into a missing directory is refused, not created 1219ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 490ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 969ms
     ✓ a refused dev push is logged, never fails the close 2146ms
     ✓ an unreachable remote is logged, never fails the close 749ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 6262ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1910ms
       ✓ falls back to event.before when gh prints unparseable output 1278ms
       ✓ reports last-green-run as the source when the green head is an ancestor 3141ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 3500ms
         ✓ tests ancestry against --head, not HEAD 3000ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 4160ms
 ✓ .bkit/core/engine/commands/workflow/disk.test.ts (35 tests) 3981ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 21846ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1105ms
     ✓ resolves config from the repo root when run from a subdirectory 1427ms
     ✓ exits 6 when the PUT fails 1670ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1262ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 2134ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 2021ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1711ms
     ✓ exits 6 when the api answer is not JSON 1876ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 2522ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1760ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 2143ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1982ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1713ms
     ✓ runs from the checkout top even when called from a subfolder 1889ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 614ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 720ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 434ms
(node:1205) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 310ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 398ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 512ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 405ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (161 tests) 98940ms
   ✓ bkit runs gate (58)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 816ms
       ✓ a source change past the validated head refuses (17) and names the path 693ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 476ms
       ✓ --validated without --month / --fid is a usage error (2) 387ms
       ✓ a validated sha that is not an ancestor refuses (17) 461ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 2170ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1100ms
     ✓ CLI: a failed gh workflow run exits 5 849ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1888ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 607ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1144ms
     ✓ a failed re-trigger push names the cause in the log 1558ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1856ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 3065ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1210ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 737ms
     ✓ gh-error: every poll errored 590ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1024ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 956ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 993ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 861ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2607ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2602ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 741ms
     ✓ re-trigger on dev only uses the record of its own FID 878ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1453ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 774ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1122ms
     ✓ a refused capstone records FAIL with its reason 1218ms
     ✓ an unreadable PR is an API error (20) with no head 1481ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 940ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2562ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1444ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 1568ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1903ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1189ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1259ms
     ✓ --file and --step go together 1083ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (30 tests) 2849ms
> [bkit] TRUNCATED HERE — 966 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 357 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 542ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > warns when Codex is also installed (skill-overlap advisory)
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 2015ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 1037ms
     ✓ is null when pnpm fails or prints something that is not a version 922ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > runAntigravityModule > stays silent about the overlap when Codex is absent
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-1.md
[test] write: .agents/plugins/bkit/agents/bkit-build-challenge-2.md
[test] write: .agents/plugins/bkit/agents/bkit-build-install-skills.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-convert.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-current.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-execute.md
[test] write: .agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 529ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 269ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 288ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 185ms
 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 170ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 303ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-vUBJSD/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/settings.test.ts (31 tests) 180ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 243ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 248ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-lgZ3iy/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 112ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 167ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 114ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 171ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 133ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (25 tests) 1116ms
   ✓ retired lite labels (2)
     ✓ the clause store holds no lite text 1024ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 173ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 55ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 126ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 107ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 91ms
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

 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 69ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 58ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 91ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 119ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 98ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 74ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 98ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 79ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 100ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 92ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 97ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 98ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 89ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 84ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 83ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (38 tests) 97ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 77ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 31ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 51ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 83ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 127ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 63ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 95ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 40ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 38ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (253 tests) 391ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 42ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793499896552.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793499896556.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793499896557.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793499896572.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 38ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 87ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 47ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 152ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 41ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 43ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 41ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 23ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 21ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (26 tests) 27ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 27ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 39ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 19ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 34ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 48ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 25ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 33ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 31ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 45ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 24ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 14ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 12ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests) 116281ms
   ✓ bkit workflows start (13)
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 311ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 443ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 343ms
     ✓ --lock-held checks the lock is ours 355ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 314ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 391ms
   ✓ bkit workflows fail (18)
     ✓ writes workflow-failed, releases its lock, and reports no handover 400ms
     ✓ writes no row when status.jsonl does not exist 312ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 401ms
     ✓ aborts a rebase only when one is in progress 950ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 713ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 391ms
     ✓ --max-exceeded says a handover is due without any sentinel 327ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 375ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 444ms
   ✓ bkit workflows close (19)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 558ms
       ✓ counts subagents of an earlier chat the run's session rows name 526ms
       ✓ records no context block, and still closes, outside a Claude Code session 581ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 664ms
     ✓ records ending held and publish false on the workflow-done row 583ms
     ✓ defaults the close row to ending done 770ms
     ✓ refuses an unknown ending 359ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 685ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 729ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 717ms
     ✓ always writes the telemetry, whatever the runtime 745ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 646ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 742ms
     ✓ an unwritable stats path is logged and never fails the close 1100ms
     ✓ refuses without status.jsonl and writes nothing 340ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1515ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1877ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1329ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 894ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1168ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1063ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1152ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 932ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 782ms
     ✓ --record-step writes the close step's row before workflow-done 514ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 744ms
     ✓ --number without --outbox is a usage error 523ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 886ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 966ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 936ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1354ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 760ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 418ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 426ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2187ms
     ✓ --flush with nothing to record commits and pushes nothing 1783ms
     ✓ --flush carries the named worktree's logs into the dev commit 1809ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2844ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2528ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2880ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1885ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3760ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1968ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1696ms
     ✓ --push on dev never carries a row whose references name another feature 1799ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1934ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4655ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2685ms
     ✓ --push commits in the named worktree, not the checkout it runs from 954ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1700ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1146ms
     ✓ a close that landed releases the lock 2158ms
     ✓ removes the worktree before it releases the lock 2432ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 6131ms
       ✓ closePr refuses when the PR base is unknown 4961ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2055ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 376ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 494ms
     ✓ promote copies the plan only 323ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 481ms
     ✓ names the branch, not the remote-tracking ref, in each URL 577ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 419ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 448ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1053ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 634ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1722ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 807ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 1031ms
     ✓ a second run's record does not let this FID's close commit 1046ms
     ✓ record is present after workflows close and before the push 1899ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2621ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 361ms
     ✓ a run with no issue holds the prompt alone 337ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 696ms
     ✓ --plan is appended when the file exists and skipped when it does not 355ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 357ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 460ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 343ms
     ✓ puts each --line after the summary, in flag order 343ms
     ✓ --summary prints the file and keeps a copy in --outbox 343ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 358ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 69276ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 44133ms
     ✓ every prompt, workflow and utility agent has the three header blocks 709ms
     ✓ sync has nothing left to rewrite 22682ms
     ✓ every clause reaches the cut-off of one surface it applies to 379ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 1209ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (198 tests) 151875ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1008ms
     ✓ refuses a code conflict and aborts the rebase on the spot 601ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1158ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 518ms
     ✓ --hand-resolve resolves the ledger in a mixed stop and leaves the code path conflicted, the rebase in progress 889ms
     ✓ --hand-resolve stops again at each later commit that conflicts 991ms
     ✓ produces byte-identical output to merge=union 1656ms
     ✓ restores a trailing newline so the next append starts on its own line 945ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 693ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1087ms
     ✓ refuses a union that leaves a line which is not JSON 697ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 773ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1965ms
     ✓ refuses a lockfile whose regenerate command fails 1533ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 637ms
     ✓ removes a stale sentinel when the rebase succeeds 936ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1202ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1160ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 705ms
       ✓ skips (12) with no anchor 963ms
       ✓ skips (12) when the base is unreachable in this clone 1282ms
       ✓ skips (12) when nothing landed since the base 827ms
       ✓ runs (0) with the landed path count once dev moved 2213ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 803ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1687ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 977ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1174ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1918ms
     ✓ runs exactly one git push 1510ms
     ✓ --set-upstream records the upstream 744ms
     ✓ refuses with no branch checked out 667ms
     ✓ --mode=dev refuses a feature checkout 559ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1327ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 915ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1556ms
     ✓ --mode=abort pushes when the branch has no open PR 1474ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1165ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 869ms
     ✓ --open-pr carries the MCP answer and skips gh 1036ms
     ✓ --mode=abort on dev pushes plainly without probing 916ms
     ✓ rejects an unknown mode 650ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2296ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1617ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2190ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3713ms
     ✓ skip-ci HEAD on the replay is refused 1423ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2825ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3225ms
     ✓ a level local dev is a plain push, recording nothing extra 1300ms
     ✓ a record with no commits pushes nothing 914ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 690ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2839ms
     ✓ a rewritten branch is refused, never forced 1864ms
     ✓ refuses dev and main with exit 21 and pushes nothing 638ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1331ms
     ✓ refuses a detached HEAD (exit 5) 571ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 913ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 827ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 856ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1043ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 488ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1167ms
     ✓ an up-to-date branch is a no-op 1012ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1635ms
     ✓ a fetch that fails exits 10 784ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1193ms
     ✓ --paths with no match exits 1 804ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 567ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 874ms
     ✓ --marker reads a diff over 1 MiB 590ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 637ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 566ms
     ✓ scan-diff finds an added skip 602ms
     ✓ scan-diff ignores a skip predating the base 641ms
     ✓ scan-diff reports a disabled test with its line 857ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 850ms
     ✓ scan-diff ignores a removed comment in a test file 867ms
     ✓ scan-diff ignores an assertion moved within the file 723ms
     ✓ scan-diff still reports a removed assertion 620ms
     ✓ scan-diff reports an assertion re-added only outside the test file 648ms
     ✓ scan-diff finds an added pytest mark skip 858ms
     ✓ scan-diff finds an added unittest skip 936ms
     ✓ scan-diff finds an added bare skip call 1003ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1038ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1205ms
     ✓ scan-diff ignores an assertion whose expectation changed 1023ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1165ms
     ✓ scan-diff reports a deleted test file 1117ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 786ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2262ms
     ✓ a title that already carries the marker is left alone 1696ms
     ✓ with no open PR: pushes the marker commit and edits no title 1546ms
     ✓ a re-run is deduped: no second marker commit 1953ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2051ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 894ms
     ✓ --title-set skips gh entirely 833ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 454ms
     ✓ Path B once dev moved; --head checks a given commit 654ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 681ms
     ✓ --merge-docs merges dev when docs/ is behind 735ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 711ms
     ✓ --merge-docs never merges on dev itself 552ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 709ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 680ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 632ms
     ✓ exits 10 when the fetch fails 378ms
     ✓ refuses --merge-docs with --head, and an unknown --head 345ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 716ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 948ms
     ✓ a failed install stops ship (16) 826ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 606ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 671ms
     ✓ exits 10 when the fetch fails 500ms
   ✓ branches land (27)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 403ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1048ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 917ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 840ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 803ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1667ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1776ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 405ms
     ✓ local: names unpushed dev as the cause when the branch carries it 518ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 795ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1682ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1553ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 971ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1043ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1202ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 971ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 702ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1522ms
     ✓ land removes the worktree when only the copied .env is untracked 1207ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1069ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1113ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1831ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1194ms
     ✓ landPr refuses a main-based PR without retrying 588ms
     ✓ landPr refuses when the PR base is unknown 561ms
     ✓ PR not open (closed): stops (17) at once, no retry 733ms

 Test Files  162 passed (162)
      Tests  6749 passed | 2 skipped (6751)
   Start at  12:23:06
   Duration  152.75s (tests 97%, setup 1%, import 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/715-retire-lite-workflows/build-group-gate-7-3.log.reports/vitest-24702.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.76 |    82.73 |   95.27 |   91.03 |                   
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
 engine/commands   |   90.67 |     85.5 |   92.25 |   90.32 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   97.46 |    91.11 |     100 |     100 | 87-91,156,162     
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   98.41 |    93.67 |   96.07 |   98.75 | 291-292           
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   96.85 |    86.87 |   87.03 |   97.59 |                   
  ci.ts            |   98.26 |    86.17 |   94.59 |    99.2 | 256,717           
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
 ...mmands/install |    47.9 |    45.74 |   59.49 |   48.26 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.45 |    30.88 |   35.71 |   33.57 | 350-378,560-1064  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.81 |    84.28 |      97 |   94.32 |                   
  branches.ts      |   90.04 |     82.7 |   97.43 |   91.68 | ...2101,2106,2131 
  challenge.ts     |   96.24 |    82.42 |     100 |    97.6 | ...67-369,619,643 
  context.ts       |   96.52 |    86.88 |   98.57 |   97.37 | ...1575,1745,1834 
  counters.ts      |   99.15 |     95.1 |     100 |   99.08 | 142               
  decisions.ts     |   95.26 |    80.52 |   97.72 |   98.34 | 193,296,365       
  disk.ts          |   93.49 |    86.93 |   96.07 |   95.74 | ...48,477-485,638 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.37 |    80.32 |   97.03 |    95.2 | ...1670-1671,1699 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
  plan-blocks.ts   |    90.9 |    83.57 |     100 |   91.04 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.69 |    91.66 |     100 |   97.22 | ...86,506-508,512 
  run-facts.ts     |    96.9 |    90.34 |     100 |   98.92 | 498-499           
  runs.ts          |   93.17 |    84.35 |     100 |   94.46 | ...1876,1908-1912 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.48 |    95.53 |     100 |   98.56 | 103,212,452       
  step-table.ts    |     100 |    98.48 |     100 |     100 | 319               
  steps.ts         |   87.35 |    81.41 |   89.55 |   88.46 | ...1453,1458,1460 
  summary.ts       |   95.02 |     86.8 |    91.3 |   93.71 | ...78-379,387-393 
  tasks.ts         |   83.58 |    66.11 |   85.71 |   87.82 | ...39,356,387,391 
  test-blocks.ts   |   95.39 |    88.23 |   96.55 |   96.61 | 23-24,235-236     
  tests.ts         |   96.15 |     87.2 |   96.93 |   97.69 | ...1804,1809-1810 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.13 |    82.46 |   97.03 |    94.9 | ...1643,1817,2531 
  worktrees.ts     |   65.61 |    62.82 |   76.74 |   65.99 | ...58-961,964-965 
 engine/install    |   93.16 |    84.64 |   94.15 |   95.95 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 587-594           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,293            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.87 |    92.93 |   98.87 |   97.24 |                   
  status.ts        |     100 |    98.68 |     100 |     100 | 122               
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1776,1819,2265 
 engine/render     |   90.67 |    82.42 |   98.33 |   92.72 |                   
  hosts.ts         |   89.62 |     81.2 |   96.15 |   90.74 | ...45-255,587-588 
  models.ts        |   90.06 |    81.11 |     100 |    94.3 | ...80,266,288,322 
  trackers.ts      |     100 |      100 |     100 |     100 |                   
 engine/shared     |   99.42 |    97.09 |     100 |     100 |                   
  package-json.ts  |     100 |    96.77 |     100 |     100 | 65                
  ...ge-manager.ts |     100 |      100 |     100 |     100 |                   
  package-roots.ts |     100 |       75 |     100 |     100 | 42,105            
  ...cted-paths.ts |     100 |      100 |     100 |     100 |                   
  settings.ts      |   99.01 |    98.47 |     100 |     100 | 237,288           
  timeouts.ts      |     100 |      100 |     100 |     100 |                   
 engine/tools      |   89.79 |    85.35 |   95.36 |   90.28 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.53 |    85.85 |    95.5 |   91.16 | ...1671-1753,1758 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.76% ( 16389/18257 )
Branches     : 82.73% ( 11570/13985 )
Functions    : 95.27% ( 2682/2815 )
Lines        : 91.03% ( 14331/15742 )
================================================================================

> @cbartens/bkit@6.0.0 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/*.bats

1..32
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 468 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 234 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 249 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 237 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 230 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 242 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 98 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 258 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 249 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 264 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 284 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 261 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 257 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 273 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 888 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 511 ms
ok 17 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 20 ms
ok 18 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 19 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 17 ms
ok 20 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 21 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 20 ms
ok 22 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 23 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 33 ms
ok 24 stub: --paginate emits one document per page; --slurp collapses them into an array # in 49 ms
ok 25 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 403 ms
ok 26 a key removed from the env file is unset on the next run # in 171 ms
ok 27 an empty value unsets the key instead of setting an empty string # in 147 ms
ok 28 non-BKIT_ keys are skipped # in 139 ms
ok 29 one failing key does not stop the others and the exit status is non-zero # in 154 ms
ok 30 a failed unsetenv is retried on the next run # in 171 ms
ok 31 logs key names only, never values # in 138 ms
ok 32 missing env file exits 0 without calling launchctl # in 24 ms
> [bkit] TRUNCATED — kept 1691 of 3213 lines (114 KB of 246 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
