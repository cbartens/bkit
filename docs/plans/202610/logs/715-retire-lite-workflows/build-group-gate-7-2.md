
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

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (94 tests) 14587ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (23)
     ✓ top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full 505ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 338ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 344ms
     ✓ --path records its commit on the run's record, like every other commit mode 318ms
     ✓ a recorded ledger commits only the rows the run appended 463ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 609ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 486ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 339ms
     ✓ under --mode=commit counts the squashed paths as something to commit 358ms
   ✓ bkit ledgers only-bookkeeping (5)
     ✓ another FID's plan file in the range: exit 7 303ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 15028ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 551ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 593ms
     ✓ a new run of the same FID rewrites startSha 978ms
     ✓ a resume of the same FID reuses the record 870ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 519ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 448ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 607ms
     ✓ a stale record without a lock is replaced 644ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 493ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 523ms
   ✓ bkit worktrees remove (12)
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 624ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 358ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 374ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 371ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 636ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (93 tests) 18685ms
   ✓ bkit steps done (24)
     ✓ reports a failed commit with exit 8 without writing the row 645ms
     ✓ a failed commit leaves no row staged in the index 583ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 603ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 459ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 666ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 594ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 868ms
   ✓ bkit steps finish (14)
     ✓ --commit=auto never stages a copied-in worktree.copy file 355ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 496ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 412ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 373ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 547ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 328ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 476ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 486ms
     ✓ writeStepRow refuses when a recorded path changed 570ms
     ✓ writeStepRow appends its commit sha to the record 444ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 884ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (53 tests) 23624ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1232ms
     ✓ names each net-new and worsened finding in the log and the JSON 905ms
     ✓ fails on a net score rise with no net count change 735ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 604ms
     ✓ treats a net score at or below 0.001 as float noise 559ms
     ✓ passes when the change only resolves findings 482ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 671ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1017ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1031ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 806ms
     ✓ exits 4 on a dropped net field instead of silently passing 666ms
     ✓ exits 4 on no summary instead of silently passing 559ms
     ✓ exits 4 on output that is not JSON instead of silently passing 572ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 713ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 737ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 745ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 715ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 692ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1256ms
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 949ms
     ✓ fails (exit 1) when vale reports alerts 812ms
     ✓ exits 6 on a vale runtime error 471ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 937ms
     ✓ falls back to vale sync when the main worktree has none 482ms
     ✓ fails when vale sync cannot restore the required styles 888ms
   ✓ bkit ci min-push (8)
     ✓ checks every --ref: one code ref among min-push refs fails the push 440ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 308ms
     ✓ reads bkit.testing.minPushPaths from package.json; an explicit [] turns it off 501ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 12161ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 643ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 13066ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 741ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 995ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 808ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 475ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 794ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 475ms
     ✓ fetches the issue and its comments as GitHub returns them 911ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 631ms
     ✓ a recent identical comment counts as done (the final close comment) 468ms
     ✓ a failed post reports done false with the reason and never leaks a token 382ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 540ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 630ms
     ✓ an HTTP 403 from gh is scope 692ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 408ms
     ✓ github: no block, no blockers and no further reads 452ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 487ms
     ✓ a different marker hash posts 501ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 495ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 10875ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 7071ms
     ✓ every fence parses under zsh -n 3767ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 31550ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 888ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 857ms
     ✓ always writes the marker, even with no plan 516ms
     ✓ writes the linear marker shape, taking the tracker from package.json 644ms
     ✓ writes the jira marker shape, taking the tracker from package.json 353ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 344ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 455ms
     ✓ retries a failed create once, and exits 5 when it fails twice 712ms
     ✓ exits 5 when the open-PR probe errors 905ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 575ms
     ✓ prs open still opens against any other base 788ms
     ✓ exits 6 when the created PR's base is not --base 681ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 683ms
     ✓ exits 1 with found=false when there is none 540ms
     ✓ exits 4 when gh errors and 80 when it needs auth 511ms
   ✓ bkit prs merge (11)
     ✓ appends the auto-route marker on an exact bkit:auto label only 505ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 340ms
     ✓ prs merge refuses a PR whose base is main 451ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 900ms
     ✓ prs merge refuses when the PR base is unknown 648ms
     ✓ prs merge reads the base from the one pr view it already makes 818ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 505ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 865ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 783ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 791ms
     ✓ never reads dev's required checks without --only-if-required 491ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 507ms
     ✓ updates when a dev ruleset requires status checks 374ms
     ✓ updates when dev's branch protection requires status checks 507ms
     ✓ ignores dev rulesets that require no checks 695ms
     ✓ updates when the repo cannot be resolved 366ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 608ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 473ms
     ✓ is not green when a check failed, naming it (exit 1) 368ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 531ms
     ✓ is not green on an empty rollup (total 0) 525ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 379ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 632ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 700ms
     ✓ is a no-op when the title already says so 668ms
     ✓ strips the marker, with or without its bkit prefix 1308ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 864ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (125 tests) 34503ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1213ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 633ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 528ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 341ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 362ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ PASS is 0 failures with or without reports 462ms
     ✓ clears a previous attempt's reports before the gate runs 330ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 668ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1037ms
     ✓ a log under the outbox is named main-checkout relative in the record 860ms
     ✓ a log small enough is copied whole: not clamped, raw null 755ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 656ms
   ✓ bkit tests red / green (38)
     ✓ records a red: the named test failed; row, log and test snapshot written, path passed whole 305ms
     ✓ refuses a run that is not a red: exit 1, reason printed, no red row 380ms
     ✓ a red refused as passed notes HEAD and the uncommitted files for green 317ms
     ✓ lints the test before its red when bkit:lint:file is declared; a lint failure records nothing 535ms
     ✓ a red already recorded for the unchanged test stands on resume; a changed test runs again 509ms
     ✓ refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2) 319ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 544ms
     ✓ green: --group audits only that group's tasks 527ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 883ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 807ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 424ms
     ✓ green prints a verdict and a fixable per gap 987ms
     ✓ green verdict is FAIL when a gap is unfixable 920ms
     ✓ green leaves a diff-reading kind fixable null 824ms
     ✓ green prints verdict null when a gap needs a diff read 822ms
     ✓ green: lists each gap kind, with the diff for a test changed since its red 363ms
     ✓ green: a red recorded for a different test than the plan names is a red-mismatch 474ms
     ✓ green: a planned test that moved is a red-mismatch saying whether the recorded test passes now 387ms
     ✓ green: every test a task names needs its own red and its own pass 622ms
     ✓ test order (13)
       ✓ green finds the code commit for DONE — TASK N 1219ms
       ✓ a red recorded before the task's code commit stands, across a resumed execute 713ms
       ✓ a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked 640ms
       ✓ a test found by name in its file is judged on its own lines and the code it runs (3)
         ✓ another test's edit 412ms
         ✓ its own body's edit 512ms
         ✓ its helper's edit 504ms
       ✓ a red run refused as passed (3)
         ✓ on another task's committed code that shares its file is already landed, not no-red 1132ms
         ✓ with the task's own files uncommitted then stays no-red, naming them 1478ms
         ✓ with no other task's code sharing a file stays no-red, saying so 1280ms
       ✓ green emits a test-changed gap for a red whose test gained added lines only 1146ms
       ✓ green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green 1185ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 10449ms
   ✓ pushToDev (16)
     ✓ lands the commit on origin/dev and leaves the main checkout alone 583ms
     ✓ never pushes local dev commits missing from origin/dev 501ms
     ✓ dev moved: rebuilds on the new dev and pushes again 707ms
     ✓ dev moved before every push: exhausted, nothing landed 1198ms
     ✓ any other refusal is returned, not retried 1482ms
     ✓ pushToDev replays a commit range onto origin/dev 517ms
     ✓ a replay retries on the new dev when dev moved 812ms
     ✓ pushToDev log line names what it lands 422ms
     ✓ runs no git hooks in the throwaway checkout, and says so 444ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 470ms
     ✓ a push that fails without a server answer is returned once, never retried 351ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 781ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1016ms
     ✓ lands from a clone whose fetch refspec omits dev 622ms
     ✓ build throwing stops the landing and removes the throwaway checkout 307ms
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:39308) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (29 tests) 14848ms
   ✓ shipped copy-and-own test files (5)
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 14125ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 23648ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 476ms
     ✓ GITHUB_ACTIONS=true -> GITHUB_ACTION, fully capable 496ms
     ✓ CI=true -> GITHUB_ACTION 364ms
     ✓ CLAUDE_CODE_REMOTE=true -> CLOUD_CLAUDE, neither capability 487ms
     ✓ explicit falsy primitives (GITHUB_ACTIONS=false, CI=false) mean absence -> LOCAL 309ms
     ✓ a primitive neither truthy nor falsy (CI=banana) -> UNKNOWN, least-capable, loud 514ms
     ✓ the .bkit/.runtime-cursor marker -> CLOUD_CURSOR with GITHUB_ACTION-equivalent capability 495ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 507ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 827ms
     ✓ LOCAL -> runtimeHeadless=false 1349ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 847ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 1132ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 1269ms
     ✓ UNKNOWN -> runtimeHeadless=false 1030ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 1043ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1347ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1020ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 977ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 1028ms
     ✓ re-derives per call: one run's answer does not leak into the next 1093ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1669ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1267ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1460ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1033ms
     ✓ --file into a missing directory is refused, not created 833ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 14506ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1407ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 811ms
     ✓ resolves config from the repo root when run from a subdirectory 1011ms
     ✓ exits 6 when the PUT fails 1025ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1343ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1226ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1685ms
     ✓ asks a human to log in when gh is not authenticated 930ms
     ✓ exits 3 when gh repo view names no repository 1454ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1048ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 857ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1030ms
     ✓ exits 6 when the api answer is not JSON 628ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 13592ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 2499ms
       ✓ falls back to event.before when gh prints unparseable output 1676ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2411ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1340ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 1600ms
         ✓ tests ancestry against --head, not HEAD 1808ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 2252ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (102 tests) 8126ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 318ms
     ✓ keeps each context's own section banner and drops every other context's 742ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 519ms
   ✓ bkit context diff (10)
     ✓ diff from a group start covers only the group's commits 338ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 760ms
     ✓ --reset-log empties the step's clamp log before the record lands 576ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 437ms
     ✓ whole: nothing omitted and no copy kept 429ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ treats regex characters in a skill name literally 1286ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 867ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1765ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1167ms
     ✓ runs from the checkout top even when called from a subfolder 1668ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 505ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1171ms
     ✓ a refused dev push is logged, never fails the close 2282ms
     ✓ an unreachable remote is logged, never fails the close 779ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (139 tests) 62096ms
   ✓ bkit workflows fail (18)
     ✓ aborts a rebase only when one is in progress 411ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 431ms
   ✓ bkit workflows close (19)
     ✓ context peaks (3)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 303ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 335ms
     ✓ an unwritable stats path is logged and never fails the close 438ms
     ✓ ship: run.pr, size of the squash commit, and coverage 516ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 775ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 506ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 431ms
   ✓ bkit workflows close — commit, outbox, comment (9)
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 454ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 430ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 731ms
     ✓ --flush with nothing to record commits and pushes nothing 693ms
     ✓ --flush carries the named worktree's logs into the dev commit 854ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 847ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 737ms
     ✓ a close that landed releases the lock 854ms
     ✓ removes the worktree before it releases the lock 919ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 3251ms
     ✓ leaves a worktree no workflow created, and its branch, in place 789ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 420ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 440ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 661ms
     ✓ record is present after workflows close and before the push 1504ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2179ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 315ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 580ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1102ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 406ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 2934ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 679ms
     ✓ passes every rule on a clean head 322ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 388ms
 ✓ .bkit/core/engine/commands/lib.test.ts (62 tests) 3494ms
   ✓ runGit / runTool output limit (5)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 305ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 393ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (19 tests) 2235ms
   ✓ bkit tasks currency (5)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 349ms
       ✓ a source change past the validated head refuses (17) and names the path 353ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 374ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 663ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1453ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 689ms
     ✓ CLI: a failed gh workflow run exits 5 676ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1566ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 361ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 651ms
     ✓ a failed re-trigger push names the cause in the log 857ms
     ✓ a failed re-trigger push leaves no orphan commit behind 682ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1163ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 552ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 306ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 399ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 416ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 456ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 426ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1244ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1114ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 378ms
     ✓ re-trigger on dev only uses the record of its own FID 491ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 590ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 1268ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 1027ms
     ✓ a refused capstone records FAIL with its reason 1025ms
     ✓ an unreadable PR is an API error (20) with no head 1317ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1581ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 2183ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1243ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 749ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1302ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 1297ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 1237ms
     ✓ --file and --step go together 1382ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 3290ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 986ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 993ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1460ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 1267ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 882ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 584ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 917ms
     ✓ an unpinned repo reports nulls and asks no registry 1118ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 369ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 752ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 464ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1019ms
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 519 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 312 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
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
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

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
[bkit-uninstall-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-test] absent: docs/testing.md (file not found — nothing to do)

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 1278ms
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 413ms
     ✓ is null when pnpm fails or prints something that is not a version 806ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 642ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 319ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 749ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 566ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 308ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 419ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 259ms
 ✓ .bkit/core/engine/audits/workflows/question-option-format.test.ts (22 tests) 938ms
   ✓ question option format: one layout across the corpus (12)
     ✓ counts the option lines found per directory 678ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 495ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 196ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 253ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/trackers.test.ts (102 tests) 299ms
 ✓ .bkit/core/engine/render/hosts.test.ts (125 tests) 175ms
 ✓ .bkit/core/engine/checks/tips/catalogue.test.ts (53 tests) 361ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 133ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 345ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-qc5mdX/architecture.md — skipping (expected exactly one start/end)

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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-QzNQKP/nonexistent.md — skipping .claude/agents/bkit-foo.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > runUpgrade — skippedSeedable (#459) > block-merge skip is seedable even though disk carries consumer prose outside the block
[bkit-upgrade] upgrade (merge): docs/foo.md

 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests) 364ms
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

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 236ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 218ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 212ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 116ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 71ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 310ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (25 tests) 2194ms
   ✓ retired lite labels (2)
     ✓ the clause store holds no lite text 1916ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 98ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 139ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (41 tests) 120ms
 ✓ .bkit/core/engine/shared/settings.test.ts (31 tests) 197ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (23 tests) 203ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (51 tests) 215ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 280ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 81ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (33 tests) 149ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 236ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 119ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 146ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (37 tests) 109ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 366ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 63ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 153ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (38 tests) 104ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 147ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 27ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 184ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 103ms
 ✓ .bkit/core/engine/install/manifest.test.ts (48 tests) 127ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 158ms
 ✓ .bkit/core/engine/cli.test.ts (149 tests) 119ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 95ms
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (65 tests) 62ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 86ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 138ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 48ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (26 tests) 27ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 55ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793499273183.md — skipping

stdout | .bkit/core/engine/install/network-allowlist.test.ts > writeNetworkAllowlist — .bkit/allowlist.json > writes the file when absent and records the write
[test] core: .bkit/allowlist.json

 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (253 tests) 935ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 91ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793499273304.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1793499273323.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1793499273333.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 163ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 164ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 98ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 99ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (28 tests | 2 skipped) 122ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 83ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 267ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 186ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 108ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 50ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 72ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 108ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 86ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 26ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (60 tests) 43ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 38ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 43ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (32 tests) 22ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 124ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 50ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 103ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 15ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 44ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 13ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 60ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 84ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 134ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 27ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 41ms
 ❯ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests | 1 failed) 20ms
   ❯ bkit-rules-sync — managed block byte-equality gate (WS7-T1, D3) (5)
     ✓ both .agents/rules.md and .bkit/core/.agents/rules.md exist 3ms
     × managed bkit:start→bkit:end block is byte-identical between .agents/rules.md and the template 11ms
     ✓ the external-content invariant is present in the managed block 1ms
     ✓ the docs/security.md threat-model section exists in both the repo doc and the template 1ms
     ✓ the template ships NO project rules below bkit:end — only the empty group scaffold 1ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 7ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (96 tests) 60242ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 19692ms
     ✓ every prompt, workflow and utility agent has the three header blocks 329ms
     ✓ sync has nothing left to rewrite 37615ms
     ✓ every clause reaches the cut-off of one surface it applies to 623ms
   ✓ fully retired clauses (6)
     ✓ output-cap's sentence stays inline in the abort handover prompt 1779ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (198 tests) 125106ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 476ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1193ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 314ms
     ✓ --hand-resolve resolves the ledger in a mixed stop and leaves the code path conflicted, the rebase in progress 468ms
     ✓ --hand-resolve stops again at each later commit that conflicts 621ms
     ✓ produces byte-identical output to merge=union 814ms
     ✓ restores a trailing newline so the next append starts on its own line 513ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 455ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 615ms
     ✓ refuses a union that leaves a line which is not JSON 315ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 403ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 908ms
     ✓ refuses a lockfile whose regenerate command fails 715ms
     ✓ removes a stale sentinel when the rebase succeeds 471ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 595ms
     ✓ resolves a conflict in each of two replayed commits across rounds 571ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 365ms
       ✓ skips (12) with no anchor 337ms
       ✓ skips (12) when the base is unreachable in this clone 437ms
       ✓ skips (12) when nothing landed since the base 416ms
       ✓ runs (0) with the landed path count once dev moved 823ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 397ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 821ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 494ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 672ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1273ms
     ✓ runs exactly one git push 1056ms
     ✓ --set-upstream records the upstream 461ms
     ✓ refuses with no branch checked out 321ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 690ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 339ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1129ms
     ✓ --mode=abort pushes when the branch has no open PR 1006ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 770ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 366ms
     ✓ --open-pr carries the MCP answer and skips gh 449ms
     ✓ --mode=abort on dev pushes plainly without probing 529ms
     ✓ rejects an unknown mode 315ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1032ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 782ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 927ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2512ms
     ✓ skip-ci HEAD on the replay is refused 467ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 856ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2062ms
     ✓ a level local dev is a plain push, recording nothing extra 584ms
     ✓ a record with no commits pushes nothing 418ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1523ms
     ✓ a rewritten branch is refused, never forced 432ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 632ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 541ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 486ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 466ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 470ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 567ms
     ✓ an up-to-date branch is a no-op 346ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 596ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 307ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 430ms
     ✓ --marker reads a diff over 1 MiB 315ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 408ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 327ms
     ✓ scan-diff finds an added skip 350ms
     ✓ scan-diff ignores a skip predating the base 313ms
     ✓ scan-diff reports a disabled test with its line 368ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 370ms
     ✓ scan-diff ignores a removed comment in a test file 376ms
     ✓ scan-diff ignores an assertion moved within the file 354ms
     ✓ scan-diff still reports a removed assertion 360ms
     ✓ scan-diff reports an assertion re-added only outside the test file 427ms
     ✓ scan-diff finds an added pytest mark skip 429ms
     ✓ scan-diff finds an added unittest skip 469ms
     ✓ scan-diff finds an added bare skip call 445ms
     ✓ scan-diff ignores a quoted skip in a documentation file 647ms
     ✓ scan-diff ignores a marker literal in a non-test source file 477ms
     ✓ scan-diff ignores an assertion whose expectation changed 585ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 943ms
     ✓ scan-diff reports a deleted test file 712ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 722ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2519ms
     ✓ a title that already carries the marker is left alone 2358ms
     ✓ with no open PR: pushes the marker commit and edits no title 1846ms
     ✓ a re-run is deduped: no second marker commit 2554ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1901ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 759ms
     ✓ --title-set skips gh entirely 925ms
     ✓ refuses dev and main (exit 21) 551ms
   ✓ branches sync (11)
     ✓ Path A when origin/dev is an ancestor of HEAD 889ms
     ✓ Path B once dev moved; --head checks a given commit 1506ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1734ms
     ✓ --merge-docs merges dev when docs/ is behind 1451ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1390ms
     ✓ --merge-docs never merges on dev itself 1267ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1634ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1782ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1699ms
     ✓ exits 10 when the fetch fails 690ms
     ✓ refuses --merge-docs with --head, and an unknown --head 689ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1346ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2056ms
     ✓ a failed install stops ship (16) 1595ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1047ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1191ms
     ✓ exits 10 when the fetch fails 854ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 388ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 637ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1803ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1631ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1458ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1440ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2568ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3264ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 604ms
     ✓ local: names unpushed dev as the cause when the branch carries it 755ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 824ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1617ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1880ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1527ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1521ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1435ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1064ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 811ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1825ms
     ✓ land removes the worktree when only the copied .env is untracked 1516ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1322ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1314ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2194ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1388ms
     ✓ landPr refuses a main-based PR without retrying 629ms
     ✓ landPr refuses when the PR base is unknown 569ms
     ✓ PR not open (closed): stops (17) at once, no retry 786ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/rules-sync.test.ts > bkit-rules-sync — managed block byte-equality gate (WS7-T1, D3) > managed bkit:start→bkit:end block is byte-identical between .agents/rules.md and the template
AssertionError: expected '<!-- bkit:start -->\n\n<!-- bkit:mana…' to be '<!-- bkit:start -->\n\n<!-- bkit:mana…' // Object.is equality

- Expected
+ Received

@@ -74,12 +74,12 @@
  - **Deferred work:** Record each deferral instead of dropping it silently: append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item. Every row MUST carry a `reason` from the closed enum; a deferral with no valid reason is not a deferral, so finish the work.
  - **Discovered bugs:** Record each discovered bug instead of dropping it silently: append one row per bug to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
  - **Flaky tests:** For each test that passes only on retry or fails intermittently, append one row per test to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
  - **Tracker issue creation:** Suggest issues instead of creating them, and create one ONLY after explicit human confirmation; write the body per `.bkit/trackers.md` § Issue shapes.
  - **Tracker issue settings:** Keep the title to at most 70 characters, or two lines on mobile. Set labels, project, project status, priority, size, milestone, parent, and every open blocking issue as blocked-by. Set priority and size per `docs/templates/bkit-audit-issues.md` § Ranking Rules and § Size Scale, not by label alone. Blocked-by MUST use the machine-read form per `.bkit/trackers.md` § Issue shapes, not prose alone. Check similar issues when unclear.
- - **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
- - **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow. They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
+ - **Tracker next labels:** An issue without a workflow label MUST carry exactly one of the `next:design|next:plan|next:build|next:debug|next:ship` labels, with `:lite` appended for the lite workflow (`next:build:lite`) per `.bkit/lite.md` § When to use. Do not put a `next:*` label alongside a workflow label. Standing audit parents are excepted.
+ - **Tracker workflow labels:** Add one of the `bkit:design|bkit:plan|bkit:build|bkit:debug|bkit:ship` labels only when the issue starts that workflow (full or lite). They are mutually exclusive: the next workflow start drops the previous one, and the `/bkit-ship` close swaps `bkit:ship` → `bkit:merged`. To signal intent, use a `next:*` label, not a workflow label added by hand.
  - **Tracker failure label:** On any workflow Failure Path, add `bkit:failed` alongside the workflow label.
  - **Tracker issue mentions:** Mention an issue ID only together with its title and URL.
  - **Tracker work comments:** For any issue worked on outside `/bkit-*` workflows, post one comment per related issue at the end of every major turn (files changed, commit, PR, finding or blocked stop) with the work done, the outcome and links. Skip turns with no work (Q&A, clarifying questions). Describe the change instead of pasting diffs or restating code, and do not mention @claude or @cursor in the comment body.
  - **Tracker context cut:** Put `###### bkit:ignore-earlier` on its own line in an issue body or comment to drop all earlier content from workflow inputs. Without it, earlier content stays, and the newer text wins where two disagree. Add the marker ONLY with human confirmation, never unprompted in any output.
  - **Tracker MCPs:** Do tracker reads / writes via `bkit` verbs; use the configured tracker MCP only when a verb prints `tracker.done: false` or exits 80.

 ❯ .bkit/core/engine/audits/repo/rules-sync.test.ts:69:25
     67|     const templateBlock = extractManagedBlock(templateRulesPath, templ…
     68|
     69|     expect(agentsBlock).toBe(templateBlock);
       |                         ^
     70|   });
     71|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 161 passed (162)
      Tests  1 failed | 6748 passed | 2 skipped (6751)
   Start at  12:13:13
   Duration  125.87s (tests 94%, setup 2%, import 2%, worker 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/715-retire-lite-workflows/build-group-gate-7-2.log.reports/vitest-89405.xml
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
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1698 of 3039 lines (121 KB of 235 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
