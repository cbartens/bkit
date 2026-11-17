
> @cbartens/bkit@6.0.0 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats


> @cbartens/bkit@6.0.0 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta


> @cbartens/bkit@6.0.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.0.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.0.0 lint /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.0.0 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.0.0 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.0.0 lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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

> @cbartens/bkit@6.0.0 slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
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

> @cbartens/bkit@6.0.0 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 23150ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1667ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 332ms
     ✓ 3. a FID logged for the issue on origin/dev, even when the working tree lacks it 386ms
     ✓ 3. several FIDs logged for the issue exit 4 and list them 316ms
     ✓ 4. mints from the title file; a JSON file with a title key also works 378ms
     ✓ 4. a stopword-only title falls back to the prompt; non-ASCII titles fold 512ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 578ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ a plan issue's Workstreams line lists the workstreams the plan covers 356ms
     ✓ none: no link and no own design doc (exit 1, nulls); a named audit path must exist 651ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (64 tests) 29284ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 315ms
     ✓ adopts the main checkout even when called from a linked worktree 322ms
     ✓ design and plan in place on main are refused 377ms
     ✓ still adopts a cloud session branch whose upstream is main 316ms
   ✓ bkit worktrees setup — debug (4)
     ✓ may debug in place on dev 431ms
     ✓ adopts in place when the session is already on feat/{fid} 360ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1075ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 929ms
     ✓ a new run of the same FID rewrites startSha 1456ms
     ✓ a resume of the same FID reuses the record 1264ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1036ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 746ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 846ms
     ✓ a stale record without a lock is replaced 1058ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 772ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 952ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 610ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 382ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 368ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 413ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 448ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 357ms
     ✓ never commits an entry only the main checkout's copy list names 494ms
   ✓ bkit worktrees remove (12)
     ✓ removes a marked worktree with uncommitted changes and clears the marker 460ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 379ms
     ✓ tells a caller inside the removed worktree where to cd 354ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 1426ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 704ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 652ms
       ✓ a branch already gone everywhere is reported deleted 472ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 971ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 2969ms
 ✓ .bkit/core/engine/commands/workflow/repo.test.ts (44 tests) 31185ms
   ✓ bkit repo info (11)
     ✓ takes owner/repo from gh when it answers 934ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r.git 914ms
     ✓ parses the origin remote when gh is unavailable: git@github.com:o/r.git 647ms
     ✓ parses the origin remote when gh is unavailable: https://github.com/o/r 637ms
     ✓ parses the origin remote when gh is unavailable: http://local_proxy@127.0.0.1:18080/git/o/r 887ms
     ✓ neither gh nor a remote -> exit 3, nothing emitted 704ms
     ✓ a detached HEAD -> exit 4 with branch null; --allow-detached makes it ok 859ms
     ✓ counts commits behind origin/dev and the divergence age 1055ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 806ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1709ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 613ms
     ✓ from a worktree, still names the main checkout and its outbox 1381ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 1370ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 1109ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 1181ms
     ✓ prints the Jira site and project under jira 1105ms
     ✓ prints the board under github 1138ms
     ✓ prints the github progress and review states, defaults for a key left unset 896ms
     ✓ prints the linear progress and review states, defaults for a key left unset 586ms
     ✓ prints the jira progress and review states, defaults for a key left unset 537ms
     ✓ prints the linear progress and review states, defaults for a key left unset 570ms
     ✓ prints null progress and review states under none 563ms
     ✓ prints buildPublishRemote and buildPublishLocal 571ms
     ✓ prints the publish defaults when package.json omits them 529ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 923ms
     ✓ prints nulls under github without a board, and for keys left unset 1193ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 778ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 735ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 861ms
     ✓ an unpinned repo reports nulls and asks no registry 1137ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 860ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 554ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 996ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 658ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 47761ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 677ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 683ms
     ✓ always writes the marker, even with no plan 835ms
     ✓ writes the linear marker shape, taking the tracker from package.json 660ms
     ✓ writes the jira marker shape, taking the tracker from package.json 647ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 655ms
     ✓ refuses a PR from dev, main, or the base itself 343ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 688ms
     ✓ retries a failed create once, and exits 5 when it fails twice 942ms
     ✓ exits 5 when the open-PR probe errors 752ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1030ms
     ✓ prs open still opens against any other base 650ms
     ✓ exits 6 when the created PR's base is not --base 1362ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1257ms
     ✓ exits 1 with found=false when there is none 1210ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 1448ms
     ✓ --number reads one PR, mergeable included 823ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 1248ms
     ✓ exits 4 when gh errors and 80 when it needs auth 948ms
     ✓ refuses a bad --state or --number 321ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 769ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 685ms
     ✓ drops the force-build marker from the title subject 491ms
     ✓ takes an explicit --subject 474ms
     ✓ runs no merge when the PR is already MERGED 771ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1010ms
     ✓ prs merge refuses a PR whose base is main 893ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 813ms
     ✓ prs merge refuses when the PR base is unknown 1101ms
     ✓ prs merge reads the base from the one pr view it already makes 627ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 913ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 561ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 893ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 826ms
     ✓ never reads dev's required checks without --only-if-required 514ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 917ms
     ✓ updates when a dev ruleset requires status checks 794ms
     ✓ updates when dev's branch protection requires status checks 596ms
     ✓ ignores dev rulesets that require no checks 782ms
     ✓ updates when the repo cannot be resolved 451ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 802ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 557ms
     ✓ is not green when a check failed, naming it (exit 1) 1004ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 780ms
     ✓ is not green on an empty rollup (total 0) 621ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1403ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 829ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 652ms
     ✓ is a no-op when the title already says so 513ms
     ✓ strips the marker, with or without its bkit prefix 921ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 940ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 302ms
     ✓ needs --scan or --scan-result 309ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (132 tests) 51110ms
   ✓ bkit tests run (10)
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 1122ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 678ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 649ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 646ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 572ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 678ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 597ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 441ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 650ms
     ✓ PASS is 0 failures with or without reports 697ms
     ✓ clears a previous attempt's reports before the gate runs 840ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1191ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 555ms
     ✓ a log under the outbox is named main-checkout relative in the record 632ms
     ✓ a log small enough is copied whole: not clamped, raw null 1295ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 1243ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1268ms
     ✓ numbers runs within the workflow's active run and per step 1300ms
     ✓ without --file no row is written and the output carries row null 924ms
   ✓ bkit tests plan-check (28)
     ✓ plan-check accepts 5 tasks and 25 tests in one group 436ms
   ✓ bkit tests red / green (31)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 611ms
     ✓ a planned test that passes is a vacuous gap, exit 1 705ms
     ✓ a planned test absent from a loaded report is a missing gap 899ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1273ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1087ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 871ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1349ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 777ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1410ms
     ✓ a ticked task is skipped, and a plan with no task markers is refused 410ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1670ms
     ✓ per-test proof (3)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1159ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1363ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1002ms
     ✓ green: a passed-accepted test is already landed, not a gap 1253ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1233ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 403ms
     ✓ green refuses a plan with no task markers 369ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1000ms
     ✓ green: --group audits only that group's tasks 896ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 943ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 866ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 633ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 769ms
     ✓ green: lists each gap kind, with the runner output 631ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1260ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 790ms
       ✓ green clears an exception-only task from a human commit 719ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (108 tests) 53902ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 643ms
     ✓ done --group writes group on the row 422ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 577ms
     ✓ carries extra fields, parsed as JSON when they are JSON 383ms
     ✓ reports a failed commit with exit 8 without writing the row 964ms
     ✓ a failed commit leaves no row staged in the index 696ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1143ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1060ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1103ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 946ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1283ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 370ms
     ✓ --ref exits 3 when the ref does not carry the status file 376ms
     ✓ fails when the row does not list the artifact, or carries another attempt 300ms
     ✓ fails on a missing artifact 353ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a row missing its attempt 442ms
     ✓ fails a run-tests row missing its scope, and an empty scope 449ms
   ✓ bkit steps finish (15)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 473ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 535ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 434ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 716ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 889ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 1139ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 838ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1168ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 693ms
     ✓ --post needs --number; without --post there is no tracker key 558ms
   ✓ bkit steps stub (3)
     ✓ copies the prior version under a PENDING header 569ms
     ✓ --strip-header drops the prior version's own header 414ms
     ✓ exits 4 when the prior version is missing or empty 356ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ checks held placeholders without a status file (Step 1) 417ms
     ✓ checks the FID's shape for the wired tracker 404ms
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 950ms
       ✓ gate --issue="" passes the fid check for dev-ci-failures under github 462ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1385ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 1539ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 552ms
     ✓ --attempt-of checks the row carries the derived counter 620ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1585ms
     ✓ writeStepRow refuses when a recorded path changed 1538ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 597ms
     ✓ writeStepRow appends its commit sha to the record 1260ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 2546ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (8)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 549ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 1011ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 601ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1452ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1074ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 684ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1590ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 642ms
     ✓ does not count an artifact the run found committed when it started 941ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 552ms
     ✓ commits a package.json change outside bkit.workflows 927ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1655ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 24305ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 1125ms
     ✓ keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 899ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 389ms
     ✓ emits investigation checklist on a write to an EXISTING file 429ms
     ✓ emits investigation checklist on first edit to a file 496ms
     ✓ dedups: second write to the same file in the same session emits nothing 513ms
     ✓ warns again for a different file in the same session 704ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 390ms
     ✓ allows retry (second call is a no-op after dedup marked) 364ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 355ms
     ✓ orchestrator session gets the advisory too — same treatment either way 438ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 354ms
     ✓ flags vitest.config.ts as gate config 337ms
     ✓ flags eslint.config.mjs as gate config 326ms
     ✓ flags .prettierrc as gate config 437ms
     ✓ flags slop-scan.config.json as gate config 482ms
     ✓ flags .vale.ini as gate config 529ms
     ✓ flags .lintstagedrc.json as gate config 352ms
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 499ms
     ✓ source file is not treated as gate config 383ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 383ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1397ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 1310ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 1328ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 1344ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 1381ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 689ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 853ms
     ✓ V1 driver reads the real 1.x arg key `filePath` 512ms
     ✓ deny mode blocks the first touch on BOTH drivers 790ms
   ✓ gateguard plugin — docs/*.md density advisory (#422) (6)
     ✓ appends the density advisory for a docs/ markdown file 558ms
     ✓ does NOT match a Documents/ ancestor (segment match, not substring) 362ms
     ✓ excludes docs/plans/ (plan template governs those, not the docs register) 939ms
     ✓ does NOT match docs/knowledge.jsonl (gated on .md) 844ms
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 361ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 4879ms
   ✓ appendComplianceRows (5)
     ✓ appends to an existing file rather than truncating it 342ms
   ✓ gradeCompliance — the grade bkit workflows close runs before its report (7)
     ✓ appends one compliance row per rule and returns the violations 437ms
     ✓ stamps HEAD as run.parentSha and close-gate as by.step by default 436ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 923ms
     ✓ passes every rule on a clean head 374ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 596ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 4873ms
   ✓ repo facts on a real repository (4)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ passes actionlint 430ms
   ✓ ship gate against the template's job names (2)
     ✓ refuses when the template's capstone job fails 407ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 709ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 1104ms
     ✓ staging failure: exit 4 and no commit is created, no false success 1036ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 1087ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 766ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 668ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 431ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1067ms
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 2163ms
     ✓ keeps each context's own section banner and drops every other context's 2627ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 400ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 465ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (60 tests) 50245ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 2064ms
     ✓ names each net-new and worsened finding in the log and the JSON 1616ms
     ✓ fails on a net score rise with no net count change 1352ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 983ms
     ✓ treats a net score at or below 0.001 as float noise 863ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 817ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 333ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 887ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 859ms
     ✓ exits 4 on a dropped net field instead of silently passing 902ms
     ✓ exits 4 on no summary instead of silently passing 1185ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1247ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1580ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 2710ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1435ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit ci prose — gate (5)
     ✓ runs vale on exactly the selected files and passes on its exit 0 753ms
     ✓ fails (exit 1) when vale reports alerts 850ms
     ✓ exits 6 on a vale runtime error 845ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 685ms
     ✓ falls back to vale sync when the main worktree has none 908ms
     ✓ fails when vale sync cannot restore the required styles 777ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 677ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 478ms
     ✓ is a usage error when the commit cannot be read 366ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 692ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 910ms
     ✓ exits 1 naming the files outside, whatever the commit message says 904ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1451ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 770ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 681ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 1121ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1893ms
     ✓ a refused dev push is logged, never fails the close 2918ms
     ✓ an unreachable remote is logged, never fails the close 1304ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (37 tests) 7727ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 1096ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1950ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 594ms
 ✓ .bkit/core/engine/commands/land.test.ts (30 tests) 34658ms
   ✓ pushToDev (16)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ runs no git hooks in the throwaway checkout, and says so 1533ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2053ms
     ✓ a push that fails without a server answer is returned once, never retried 1142ms
     ✓ a failed fetch is returned before anything is built 1265ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2953ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2579ms
     ✓ lands from a clone whose fetch refspec omits dev 2636ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1186ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ is all zero for an empty range 347ms
   ✓ restateOutcome (3)
     ✓ ending is close-failed when the dispatch is unresolved 337ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (19 tests) 6909ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 431ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 395ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 339ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 408ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1509ms
     ✓ counts files committed since --base 1249ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1036ms
     ✓ runs nothing and exits 0 when no file changed 705ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1918ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 711ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 794ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 572ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 690ms
     ✓ fetches the issue and its comments as GitHub returns them 813ms
     ✓ github fetch marks a closed issue terminal and an open one not 1355ms
   ✓ linear client (6)
     ✓ GraphQL errors map by code; DNS failure is network 302ms
   ✓ postCommentOnce (4)
     ✓ skips issue-less runs and tracker none 441ms
     ✓ records an engine-action row and skips the same key + body on a re-run 639ms
     ✓ a recent identical comment counts as done (the final close comment) 702ms
     ✓ a failed post reports done false with the reason and never leaks a token 1205ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 908ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ linear: markdown round-tripped by Linear still dedups on the marker 345ms
     ✓ a different marker hash posts 884ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1057ms
   ✓ linear: errors on a non-2xx answer and comment paging (2)
     ✓ a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code 887ms
   ✓ jira: HTML comment pages and non-string bodies (2)
     ✓ re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML 474ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 562ms
       ✓ a source change past the validated head refuses (17) and names the path 458ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 537ms
       ✓ --validated without --month / --fid is a usage error (2) 472ms
       ✓ a validated sha that is not an ancestor refuses (17) 467ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 1980ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 1209ms
     ✓ CLI: a failed gh workflow run exits 5 1131ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1898ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 638ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1105ms
     ✓ a failed re-trigger push names the cause in the log 1341ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1625ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2197ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 2497ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 1481ms
     ✓ gh-error: every poll errored 952ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 2155ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1251ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1572ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1137ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3283ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3578ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1393ms
     ✓ re-trigger on dev only uses the record of its own FID 1383ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1315ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ --snapshot without --repo leaves its run list unscoped 702ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 749ms
     ✓ a refused capstone records FAIL with its reason 688ms
     ✓ an unreadable PR is an API error (20) with no head 510ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 1271ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1748ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 1171ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 875ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 1808ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 2328ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 2145ms
     ✓ --file and --step go together 1269ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 210ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 494ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests) 19399ms
   ✓ bkit issues labels (25)
     ✓ failed on adds, failed off removes, and a no-op reports changed=false 330ms
     ✓ autoRouteSuffix follows an exact bkit:auto label, with or without a transition 641ms
     ✓ board is null with a reason for {"tracker":{"default":"jira","github":{"project":"https://github.com/orgs/acme/projects/3/views/1"}}} 527ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
   ✓ bkit disk prune — step files (10)
     ✓ min runs only min steps; max runs both 737ms
     ✓ a failing or throwing step is reported and the next step still runs 301ms
   ✓ bkit disk prune — lock (9)
     ✓ renews its lock while a long step runs, so a waiter never takes it over 605ms
> [bkit] TRUNCATED HERE — 802 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 407 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 374ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 405ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 389ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 659ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 570ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 377ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 417ms
     ✓ --file into a missing directory is refused, not created 354ms
> [bkit] TRUNCATED HERE — 100 lines omitted. Dropped content was NOT read.
   ✓ lookupLatestPublished (3)
     ✓ returns the registry's version 482ms
     ✓ is null when pnpm fails or prints something that is not a version 952ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 197ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (29 tests) 45ms
> [bkit] TRUNCATED HERE — 96 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 111 lines omitted. Dropped content was NOT read.
   ✓ Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) (3)
     ✓ handles a file with only malformed lines without throwing 337ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 20ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 13ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (12 tests) 26ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 33ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 80ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 106ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 83ms
 ✓ .bkit/core/engine/tools/instructions-coverage.test.ts (24 tests) 1999ms
   ✓ the repo (7)
     ✓ has no coverage findings 1654ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 977ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (74 tests) 2918ms
   ✓ .bkit/templates/context/ (74)
     ✓ bkit-github.md: github self-skips with no credentials 456ms
     ✓ bkit-playwright.md: playwright self-skips with no credentials 355ms
     ✓ install copies them into .bkit/templates/context/ 1048ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1878ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1727ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 4399ms
   ✓ repoConfigFile (3)
     ✓ names the main checkout's shared config from a linked worktree 408ms
     ✓ answers for the cwd, not an inherited GIT_DIR 750ms
     ✓ is undefined outside a repo 469ms
   ✓ guardRepoConfig (6)
     ✓ passes when nothing changed 603ms
     ✓ passes when only another key changed, such as a branch's upstream 664ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 478ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 544ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 477ms
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

 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (9 tests) 2051ms
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

 ✓ .bkit/core/engine/audits/templates/template-path-refs.test.ts (50 tests) 1205ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 503ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 191ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 406ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 102ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 51ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 94ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (14 tests) 33ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (8 tests) 134ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 41ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 100ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 52ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 54ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 35ms
 ✓ .bkit/core/engine/commands/workflow/skills.test.ts (12 tests) 9764ms
   ✓ bkit skills prune (10)
     ✓ uninstalls unlisted skills from the union of folders and lock keys, never bkit-* 951ms
     ✓ matches whole names only: a listed name inside a longer one does not keep it 958ms
     ✓ treats regex characters in a skill name literally 1251ms
     ✓ prunes by folders alone when skills-lock.json is unreadable, and says so 1118ms
     ✓ reports a skill the CLI failed to uninstall, carries on with the rest, and exits 0 1096ms
     ✓ stops calling a CLI that could not run (127) and lists what is left installed 1376ms
     ✓ runs from the checkout top even when called from a subfolder 1827ms
     ✓ keeps bkit-* skills, from folders or the lock, even when .agents/skills.md does not list them 1012ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 63ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (27 tests) 52ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 13020ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 1105ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 428ms
     ✓ resolves config from the repo root when run from a subdirectory 387ms
     ✓ exits 6 when the PUT fails 511ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 706ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 960ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 1439ms
     ✓ asks a human to log in when gh is not authenticated 972ms
     ✓ exits 3 when gh repo view names no repository 902ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1475ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1646ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1309ms
     ✓ exits 6 when the api answer is not JSON 1011ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (283 tests) 176ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 46ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 454ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 70ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/audits/repo/resolve-push-base.test.ts (17 tests) 12145ms
   ✓ resolve-push-base (17)
     ✓ exit 0 always (7)
       ✓ falls back to event.before when git fails unexpectedly 1642ms
       ✓ falls back to event.before when gh prints unparseable output 1282ms
       ✓ reports last-green-run as the source when the green head is an ancestor 2166ms
       ✓ CI mode: falls back to event.before and says so when the run list is unreadable 1439ms
       ✓ local mode (3)
         ✓ uses the last green run when it is an ancestor of --head, looked up on origin's repo 3006ms
         ✓ tests ancestry against --head, not HEAD 1715ms
         ✓ falls back to origin/dev with the reason on stderr when gh fails 869ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 178ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 54ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 41ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 10ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (5 tests) 1101ms
   ✓ catalog parity — retired plan agents (1)
     ✓ removed plan agents absent 1093ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (7 tests) 12ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 66ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 187ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 13ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 20ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 32ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 168ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 14ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (5 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 26ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 57ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 27ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 8603ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 8588ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (152 tests) 167864ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 516ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1311ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 303ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 316ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 329ms
     ✓ opens the next run after a finished one, and after another workflow's run 321ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 381ms
     ✓ design / plan / build / debug book in the current worktree 392ms
     ✓ --lock-held checks the lock is ours 374ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 405ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 391ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 304ms
     ✓ aborts a rebase only when one is in progress 676ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 637ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 571ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 326ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 321ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 622ms
       ✓ counts subagents of an earlier chat the run's session rows name 628ms
       ✓ records no context block, and still closes, outside a Claude Code session 1112ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 703ms
     ✓ records ending held and publish false on the workflow-done row 692ms
     ✓ defaults the close row to ending done 776ms
     ✓ refuses an unknown ending 368ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 910ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 957ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 840ms
     ✓ always writes the telemetry, whatever the runtime 1104ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 780ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 875ms
     ✓ an unwritable stats path is logged and never fails the close 805ms
     ✓ appends the completeness row before the workflow-done row 1087ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 2185ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 2041ms
     ✓ writes one completeness row per close 2856ms
     ✓ leaves out the previous run's rows that share a second with this run's start 935ms
     ✓ still closes when the completeness check throws 1266ms
     ✓ still closes when the completeness row write throws 1047ms
     ✓ refuses without status.jsonl and writes nothing 318ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1024ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1362ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 1069ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 1167ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1583ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1207ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1170ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1148ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1265ms
     ✓ --record-step writes the close step's row before workflow-done 818ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 922ms
     ✓ --number without --outbox is a usage error 983ms
     ✓ --flush is ship only 549ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1543ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1770ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1902ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1585ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1136ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 656ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 536ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3295ms
     ✓ --flush with nothing to record commits and pushes nothing 2117ms
     ✓ --flush carries the named worktree's logs into the dev commit 2522ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4371ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3808ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4223ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3696ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 5234ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3726ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 4717ms
     ✓ --push on dev never carries a row whose references name another feature 3270ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 3210ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 7113ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3304ms
     ✓ --push commits in the named worktree, not the checkout it runs from 2035ms
     ✓ rejects --push with --flush, and --flush outside ship 442ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3161ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2481ms
     ✓ a close that landed releases the lock 3217ms
     ✓ removes the worktree before it releases the lock 3823ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 7300ms
       ✓ closePr refuses when the PR base is unknown 4353ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2635ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 313ms
     ✓ exits 12 when there is no versioned draft 302ms
     ✓ stamps the anchor from the runtime-resolved base commit 320ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 469ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 421ms
     ✓ names the branch, not the remote-tracking ref, in each URL 409ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 415ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 435ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 939ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 508ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1795ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 894ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 614ms
     ✓ a second run's record does not let this FID's close commit 853ms
     ✓ record is present after workflows close and before the push 1898ms
     ✓ failed handover from dev removes the record and keeps recorded paths 2501ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 633ms
     ✓ --plan is appended when the file exists and skipped when it does not 705ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 773ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 1182ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 937ms
     ✓ puts each --line after the summary, in flag order 1003ms
     ✓ --summary prints the file and keeps a copy in --outbox 840ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 841ms
   ✓ --session-dir on fail / close (3)
     ✓ a folder outside the outbox sessions folder is kept 303ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 32784ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 20839ms
     ✓ every fence parses under zsh -n 11835ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (96 tests | 1 failed) 123612ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 5ms
     ✓ utility agents, the plan template and AGENTS.md load as their own surfaces 1ms
     ✓ loads every shipped doc master with a bkit block as a doc, never an installed copy 4ms
     ✓ checks a doc inside its bkit block only and pools it with the plan template and AGENTS.md 1ms
     × has no findings 85946ms
     ✓ every prompt, workflow and utility agent has the three header blocks 677ms
     ✓ sync has nothing left to rewrite 27626ms
     ✓ every clause reaches the cut-off of one surface it applies to 3457ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 1ms
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
     ✓ a missing required clause fails 1ms
     ✓ a duplicated clause fails 0ms
     ✓ a weakened rewrite is a near-copy, not a match 1ms
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
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 1ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
     ✓ a sentence ending its line and the same sentence continued with ; count as one 1ms
     ✓ one drifted copy does not hide a sentence the other prompts share 1ms
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
     ✓ carriersLine writes all, all except, and prefix families 4ms
     ✓ syncStore rewrites a stale carriers line and keeps a current one 0ms
   ✓ audit templates (6)
     ✓ the store accepts an audit mode 0ms
     ✓ a required clause is checked inside the managed block only 1ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 2 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
   ✓ checkboxes and sibling clauses (3)
     ✓ a gate checkbox is a line prefix, like a list marker 0ms
     ✓ a drifted gate item behind a checkbox is a near-copy 1ms
     ✓ a line carrying one clause verbatim is not a near-copy of its sibling 1ms
   ✓ sentence splitting (3)
     ✓ splits after . and ;, keeps the punctuation, and never splits after e.g. 0ms
     ✓ a clause ending in . matches a line that continues it with ; 0ms
     ✓ a drift that turns the clause's ; into , is still a near-copy 0ms
   ✓ modes (6)
     ✓ reads the tools list in block and inline form, skipping comment lines 0ms
     ✓ if-bash is required with Bash in the tools list and forbidden without 1ms
     ✓ if-search is required with Grep or Bash in the tools list and forbidden without 0ms
     ✓ if-no-search is required without Grep and Bash in the tools list and forbidden with either 1ms
     ✓ lines in a prompt's Rules block are rule copies, never clause carriers 1ms
     ✓ repeatable allows any number of copies but still flags near-copies 1ms
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 1ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 0ms
     ✓ a clause in the wrong block fails 0ms
     ✓ a placed clause in the body fails 0ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 2ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 9ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 6ms
   ✓ fully retired clauses (6)
     ✓ parse with no text block and no surface 0ms
     ✓ reject a text block or a surface 1ms
     ✓ are a record only: their wording in a file is neither flagged nor rewritten 1ms
     ✓ never cover a sentence for the cut-off 0ms
     ✓ the removed prompt clauses stay on record, and the cut-off skips them 0ms
     ✓ output-cap's sentence stays inline in the abort handover prompt 5591ms
   ✓ sync (7)
     ✓ rewrites a near-copy and keeps the list marker 1ms
     ✓ rewrites the text behind a different label when the clause is unlabelled 0ms
     ✓ rewrites retired wording, carrying slot values across 0ms
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
     ✓ every row's bullet is byte-identical across its carriers 124ms
     ✓ every label's rows list exactly the prompts that carry it 107ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (224 tests) 297921ms
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1127ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 911ms
     ✓ --file records nothing for a refused rebase 605ms
     ✓ refuses a code conflict and aborts the rebase on the spot 646ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1162ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 648ms
     ✓ produces byte-identical output to merge=union 1413ms
     ✓ restores a trailing newline so the next append starts on its own line 758ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 749ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1046ms
     ✓ refuses a union that leaves a line which is not JSON 602ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 945ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2127ms
     ✓ refuses a lockfile whose regenerate command fails 1159ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 475ms
     ✓ removes a stale sentinel when the rebase succeeds 723ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1512ms
     ✓ resolves a conflict in each of two replayed commits across rounds 923ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 605ms
       ✓ skips (12) with no anchor 698ms
       ✓ skips (12) when the base is unreachable in this clone 803ms
       ✓ skips (12) when nothing landed since the base 753ms
       ✓ runs (0) with the landed path count once dev moved 1675ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 832ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1461ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1172ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 2705ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 3165ms
     ✓ runs exactly one git push 2097ms
     ✓ --set-upstream records the upstream 1404ms
     ✓ refuses with no branch checked out 936ms
     ✓ --mode=dev refuses a feature checkout 733ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2045ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 4045ms
     ✓ --require-ci pushes as-is when dev has not moved 1301ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2433ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 4038ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 1127ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1284ms
     ✓ --mode=abort pushes when the branch has no open PR 1853ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1230ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 939ms
     ✓ --open-pr carries the MCP answer and skips gh 1186ms
     ✓ --mode=abort on dev pushes plainly without probing 1188ms
     ✓ rejects an unknown mode 1041ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3450ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 2346ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2704ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5300ms
     ✓ skip-ci HEAD on the replay is refused 1816ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3399ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4542ms
     ✓ a level local dev is a plain push, recording nothing extra 2793ms
     ✓ a record with no commits pushes nothing 2417ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1220ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 3869ms
     ✓ a rewritten branch is refused, never forced 2261ms
     ✓ refuses dev and main with exit 21 and pushes nothing 873ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2614ms
     ✓ refuses a detached HEAD (exit 5) 1025ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 2546ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2712ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 3118ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2738ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1000ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2785ms
     ✓ an up-to-date branch is a no-op 1497ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2157ms
     ✓ a fetch that fails exits 10 968ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1280ms
     ✓ --paths with no match exits 1 1017ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 798ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1845ms
     ✓ --marker reads a diff over 1 MiB 1329ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1739ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 2325ms
     ✓ scan-diff finds an added skip 1503ms
     ✓ scan-diff ignores a skip predating the base 1362ms
     ✓ scan-diff reports a disabled test with its line 1520ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1882ms
     ✓ scan-diff ignores a removed comment in a test file 1326ms
     ✓ scan-diff ignores an assertion moved within the file 1369ms
     ✓ scan-diff still reports a removed assertion 1587ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1066ms
     ✓ scan-diff finds an added pytest mark skip 1258ms
     ✓ scan-diff finds an added unittest skip 1114ms
     ✓ scan-diff finds an added bare skip call 999ms
     ✓ scan-diff ignores a quoted skip in a documentation file 981ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1001ms
     ✓ scan-diff ignores an assertion whose expectation changed 845ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 871ms
     ✓ scan-diff reports a deleted test file 1217ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 854ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1767ms
     ✓ a title that already carries the marker is left alone 1951ms
     ✓ with no open PR: pushes the marker commit and edits no title 1643ms
     ✓ a re-run is deduped: no second marker commit 2302ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2646ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 777ms
     ✓ --title-set skips gh entirely 1380ms
     ✓ refuses dev and main (exit 21) 591ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 976ms
     ✓ Path B once dev moved; --head checks a given commit 1267ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1079ms
     ✓ --merge-docs merges dev when docs/ is behind 1247ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1067ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 6627ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 2689ms
     ✓ --merge-docs skips an empty bkit:generate script 1882ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 3260ms
     ✓ --merge-docs never merges on dev itself 1823ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1583ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1199ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1101ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 897ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 429ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1221ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1605ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 3386ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2263ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 2726ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 2393ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 1696ms
     ✓ exits 10 when the fetch fails 945ms
     ✓ refuses --merge-docs with --head, and an unknown --head 1199ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1612ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 3252ms
     ✓ a failed install stops ship (16) 2847ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 2094ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 2216ms
     ✓ exits 10 when the fetch fails 1340ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 1118ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 823ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2245ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1990ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1938ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2198ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4379ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4254ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 702ms
     ✓ local: names unpushed dev as the cause when the branch carries it 750ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 2098ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2603ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 3765ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 3983ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3479ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2400ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1868ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1339ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3757ms
     ✓ land removes the worktree when only the copied .env is untracked 2033ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2121ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2076ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3907ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2378ms
     ✓ landPr refuses a main-based PR without retrying 1122ms
     ✓ landPr refuses when the PR base is unknown 927ms
     ✓ PR not open (closed): stops (17) at once, no retry 1260ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 963ms
     ✓ --attempt names the merge round in a fix commit 733ms
     ✓ commits a rewritten and a deleted tracked file 1468ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 877ms
     ✓ reports undeclared and runs nothing with no scripts 675ms
     ✓ reports undeclared and runs nothing with an empty script 702ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1774ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 2298ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 3301ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > has no findings
Error: Test timed out in 70184ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/tools/instructions.test.ts:213:3
    211|   });
    212|
    213|   it("has no findings", CORPUS_CASE, () => {
       |   ^
    214|     const findings = checkClauses(CLAUSES, CORPUS).map(formatFinding);
    215|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 164 passed (165)
      Tests  1 failed | 6950 passed | 2 skipped (6953)
   Start at  12:02:40
   Duration  300.64s (tests 94%, setup 2%, transform 2%, import 2%, worker 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/719-cloud-variants-add/build-group-gate-1-2.log.reports/vitest-79161.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.74 |    82.72 |   95.01 |   91.02 |                   
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
 ...mands/workflow |   92.55 |    84.18 |    96.4 |   94.01 |                   
  branches.ts      |   89.58 |     82.9 |   97.74 |   90.97 | ...2550,2555,2580 
  challenge.ts     |   96.59 |    83.03 |     100 |      98 | 178,368-370,652   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.36 |    86.99 |      98 |   97.28 | ...1622,1793,1882 
  counters.ts      |   98.26 |    94.38 |     100 |    98.7 | 203,502           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,771   
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
  tests.ts         |   97.36 |    89.36 |   97.15 |   98.22 | ...2069,2165-2167 
  tracker.ts       |   92.96 |    73.63 |     100 |   96.75 | ...53,865,948,996 
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
Statements   : 89.74% ( 17316/19295 )
Branches     : 82.72% ( 12257/14816 )
Functions    : 95.01% ( 2822/2970 )
Lines        : 91.02% ( 15128/16619 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1723 of 3576 lines (118 KB of 271 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
