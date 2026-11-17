
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'


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
 513:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 635:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
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
 1157:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1318:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1376:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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
 255:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/templates/context/bkit-serena.md
 6:78  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/deployments.md
 126:74  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 docs/testing.md
 255:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> bkit ci slop

[bkit-ci] base af0f02ba0b6c5a735e9ee1b5747e731085663c0a (af0f02ba0b6c5a735e9ee1b5747e731085663c0a) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: af0f02ba0b6c5a735e9ee1b5747e731085663c0a
base: af0f02ba0b6c5a735e9ee1b5747e731085663c0a
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 6.0 on 10 cores: unit limits 7500ms per test, 15000ms per hook (x1.50)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 41772ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1034ms
     ✓ names each net-new and worsened finding in the log and the JSON 1135ms
     ✓ fails on a net score rise with no net count change 850ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 881ms
     ✓ treats a net score at or below 0.001 as float noise 1099ms
     ✓ passes when the change only resolves findings 1050ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1579ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 357ms
     ✓ skips (exit 0) when the base resolves to HEAD 489ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1282ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 567ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 350ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 954ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1157ms
     ✓ exits 4 on a dropped net field instead of silently passing 758ms
     ✓ exits 4 on no summary instead of silently passing 1092ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1580ms
     ✓ exits 5 when the base worktree cannot be created 514ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1490ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1917ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1051ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1044ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 969ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1693ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 918ms
     ✓ explicit globs can select ignored prose and nested checkout files 611ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 610ms
     ✓ fails (exit 1) when vale reports alerts 621ms
     ✓ exits 6 on a vale runtime error 615ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 580ms
     ✓ falls back to vale sync when the main worktree has none 638ms
     ✓ fails when vale sync cannot restore the required styles 446ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 529ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 416ms
     ✓ is a usage error when the commit cannot be read 476ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 515ms
     ✓ exits 1 naming the code file, whatever the commit message says 555ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 557ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 381ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1023ms
     ✓ exits 7 when a commit cannot be read 366ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 461ms
     ✓ exits 1 naming the files outside, whatever the commit message says 491ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 849ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 639ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 448ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 910ms
     ✓ a top-level glob in the setting does not reach into folders 485ms
     ✓ a push that changes no files is not proven a min push 455ms
     ✓ exits 7 when a commit or its base cannot be read 509ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 43684ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 606ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1449ms
     ✓ always writes the marker, even with no plan 660ms
     ✓ writes the linear marker shape, taking the tracker from package.json 865ms
     ✓ writes the jira marker shape, taking the tracker from package.json 937ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 963ms
     ✓ refuses a PR from dev, main, or the base itself 453ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 581ms
     ✓ retries a failed create once, and exits 5 when it fails twice 864ms
     ✓ exits 5 when the open-PR probe errors 886ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 901ms
     ✓ prs open still opens against any other base 740ms
     ✓ exits 6 when the created PR's base is not --base 732ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 3332ms
     ✓ refuses merged entry when current feature evidence cannot be read 892ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 1679ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 1018ms
     ✓ exits 1 with found=false when there is none 356ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 412ms
     ✓ --number reads one PR, mergeable included 301ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 437ms
     ✓ exits 4 when gh errors and 80 when it needs auth 472ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 369ms
     ✓ classifies a refused merge with a new dev conflict as integration 380ms
     ✓ returns an explicit terminal reason for other merge refusals 655ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 354ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 992ms
     ✓ drops the force-build marker from the title subject 482ms
     ✓ takes an explicit --subject 528ms
     ✓ runs no merge when the PR is already MERGED 606ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 561ms
     ✓ prs merge refuses a PR whose base is main 470ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 382ms
     ✓ prs merge refuses when the PR base is unknown 585ms
     ✓ prs merge reads the base from the one pr view it already makes 420ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 775ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 487ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 493ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 505ms
     ✓ never reads dev's required checks without --only-if-required 354ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 438ms
     ✓ updates when a dev ruleset requires status checks 428ms
     ✓ updates when dev's branch protection requires status checks 563ms
     ✓ ignores dev rulesets that require no checks 632ms
     ✓ updates when the repo cannot be resolved 397ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 414ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 395ms
     ✓ is not green when a check failed, naming it (exit 1) 366ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 465ms
     ✓ is not green on an empty rollup (total 0) 489ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 360ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 689ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 871ms
     ✓ is a no-op when the title already says so 362ms
     ✓ strips the marker, with or without its bkit prefix 604ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 823ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 47472ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 831ms
     ✓ may debug in place on dev 476ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1108ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1086ms
     ✓ a new run of the same FID rewrites startSha 2419ms
     ✓ a resume of the same FID reuses the record 1614ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1045ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 787ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1333ms
     ✓ a stale record without a lock is replaced 2507ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1432ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4841ms
     ✓ names inherited commits and ship recovery in the refusal 947ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1230ms
     ✓ ship names a missing feat branch 488ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 969ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 410ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 401ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 397ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 485ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 418ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 390ms
     ✓ never commits an entry only the main checkout's copy list names 383ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 549ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 358ms
     ✓ tells a caller inside the removed worktree where to cd 631ms
     ✓ fails with its own exit code when git cannot remove a marked path 354ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1340ms
       ✓ preserves staged-only mode during landed cleanup 1386ms
       ✓ preserves staged-only type during landed cleanup 1206ms
       ✓ preserves staged-only deletion during landed cleanup 1249ms
       ✓ removes landed staged content when both index and working contents are on dev 1332ms
       ✓ deletes the proved local and remote branch at their landed tips 1512ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2040ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 802ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 645ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 391ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 689ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1157ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 49927ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1246ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 505ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 839ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 485ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 833ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 940ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 1108ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 820ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 472ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 728ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1280ms
     ✓ PASS is 0 failures with or without reports 843ms
     ✓ clears a previous attempt's reports before the gate runs 838ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 729ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 721ms
     ✓ a log under the outbox is named main-checkout relative in the record 820ms
     ✓ a log small enough is copied whole: not clamped, raw null 766ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 948ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 685ms
     ✓ numbers runs within the workflow's active run and per step 2000ms
     ✓ without --file no row is written and the output carries row null 900ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1190ms
     ✓ a planned test that passes is a vacuous gap, exit 1 528ms
     ✓ a planned test absent from a loaded report is a missing gap 540ms
     ✓ a file that fails to load is a red of kind red-not-loaded 788ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 817ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 356ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1027ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 708ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 581ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1518ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 814ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1059ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1061ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1202ms
     ✓ green: a passed-accepted test is already landed, not a gap 880ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 633ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 888ms
     ✓ green: --group audits only that group's tasks 675ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 884ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1068ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 982ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1033ms
     ✓ green: lists each gap kind, with the runner output 800ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1544ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 738ms
       ✓ green clears an exception-only task from a human commit 486ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 50667ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 509ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 347ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 535ms
     ✓ reports a failed commit with exit 8 without writing the row 1291ms
     ✓ a failed commit leaves no row staged in the index 1301ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1202ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1116ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1078ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 854ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1262ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 423ms
     ✓ --ref reads the status file as committed on that ref, not from disk 798ms
     ✓ --ref exits 3 when the ref does not carry the status file 819ms
     ✓ fails on a placeholder left in the artifact 734ms
     ✓ fails when the row's verdict differs from the artifact's 497ms
     ✓ fails when the row does not list the artifact, or carries another attempt 421ms
     ✓ fails on a missing artifact 488ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 653ms
     ✓ records a create-PR row's URL in artifacts, not a prUrl field 590ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 363ms
     ✓ fails a run-tests row missing its scope, and an empty scope 510ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 535ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 468ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 323ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 647ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 930ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 533ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 604ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1112ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 653ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 376ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 687ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 557ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 332ms
     ✓ --attempt-of checks the row carries the derived counter 581ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1278ms
     ✓ writeStepRow refuses when a recorded path changed 1435ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 573ms
     ✓ writeStepRow appends its commit sha to the record 1101ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1284ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 399ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 825ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 739ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 461ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1368ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 1087ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 930ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 550ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1555ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 594ms
     ✓ does not count an artifact the run found committed when it started 763ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 419ms
     ✓ commits a package.json change outside bkit.workflows 708ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1496ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 67912ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1381ms
     ✓ runs code.ts through its declared gate in the built checkout 1427ms
     ✓ runs code.ts through its declared gate in the built checkout 1460ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1367ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1990ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 2156ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1041ms
     ✓ runs the full gate for replayed debug code 1462ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1916ms
     ✓ installs local dependencies against the built target tree 3448ms
     ✓ runs the configured frozen install even without root dependencies 2910ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1831ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2081ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2055ms
     ✓ never pushes local dev commits missing from origin/dev 1879ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3522ms
     ✓ dev moved before every push: exhausted, nothing landed 6143ms
     ✓ any other refusal is returned, not retried 2477ms
     ✓ pushToDev replays a commit range onto origin/dev 2377ms
     ✓ a replay retries on the new dev when dev moved 4556ms
     ✓ pushToDev log line names what it lands 2329ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2739ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2459ms
     ✓ a push that fails without a server answer is returned once, never retried 2171ms
     ✓ a failed fetch is returned before anything is built 696ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 3714ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2219ms
     ✓ lands from a clone whose fetch refspec omits dev 3122ms
     ✓ build throwing stops the landing and removes the throwaway checkout 960ms
[feat/test efea582] gate
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 37798ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 355ms
     ✓ continues after friction and diagnostic writes fail without recursion 336ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 526ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3115ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 429ms
     ✓ starts only new source after overflow or missing source 370ms
     ✓ uses exact new comment after a failed eligibility read 340ms
   ✓ bounded nonfatal publication (10)
     ✓ falls back to a new comment after failed or uncertain append 338ms
     ✓ recognizes append success within budget without unnecessary resend 300ms
     ✓ preserves a human correction after lost append recognition and a later report 489ms
     ✓ contains exhausted append and create failures without fabricated success 431ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 414ms
     ✓ reserves new comment opportunity within total delivery budget 1177ms
     ✓ contains preparation state lock and reconciliation exceptions 339ms
     ✓ attempts independent attention after routine uncertainty 482ms
     ✓ seals an acknowledged segment after a postflight intervening comment 358ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 499ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 479ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 487ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 514ms
     ✓ fetches the issue and its comments as GitHub returns them 535ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 662ms
     ✓ invalidates missing corrupt and unsupported progress cache 1413ms
     ✓ contains cache read and write failures as standalone degradation 701ms
     ✓ uses legacy receipts and contains receipt failures 613ms
     ✓ skips issue-less runs and tracker none 327ms
     ✓ records an engine-action row and skips the same key + body on a re-run 602ms
     ✓ a recent identical comment counts as done (the final close comment) 488ms
     ✓ a failed post reports done false with the reason and never leaks a token 488ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 570ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 477ms
     ✓ a different marker hash posts 658ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 527ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 36321ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 574ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 483ms
     ✓ staging failure: exit 4 and no commit is created, no false success 461ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 620ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 406ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 424ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 353ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 991ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 34951ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3406ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3259ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 548ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 499ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 695ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4178ms
     ✓ does not fall back through a malformed later success receipt 2189ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1326ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1347ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2432ms
     ✓ requires proof even when the pushed increment changes no files 1350ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 885ms
     ✓ does not record a committed tree 921ms
     ✓ records no proof for a failed gate or lighter gate 1423ms
     ✓ requires integration proof when integration is declared 1847ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3136ms
> [bkit] TRUNCATED HERE — 44 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 568ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1630ms
     ✓ freezes explicit workflow run attempt and all failed job pages 1014ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2344ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 3013ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1668ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2356ms
     ✓ checks the named repository base and fails closed on missing evidence 1014ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 995ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1127ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 681ms
       ✓ a source change past the validated head refuses (17) and names the path 591ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 709ms
       ✓ --validated without --month / --fid is a usage error (2) 475ms
       ✓ a validated sha that is not an ancestor refuses (17) 659ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 688ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1174ms
     ✓ a failed re-trigger push names the cause in the log 1501ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1389ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2339ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1159ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 690ms
     ✓ gh-error: every poll errored 651ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1075ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1131ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1496ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1309ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3603ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3754ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1047ms
     ✓ re-trigger on dev only uses the record of its own FID 1201ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1240ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 420ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 725ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 468ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 493ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 581ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 699ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 623ms
     ✓ --file and --step go together 562ms
 ✓ .bkit/core/engine/commands/workflow/roadmap.test.ts (44 tests) 17891ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 848ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2134ms
     ✓ a refused dev push is logged, never fails the close 3126ms
     ✓ an unreachable remote is logged, never fails the close 732ms
(node:79500) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 21441ms
   ✓ bkit runtime detect — the table (17)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1301ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 658ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 1095ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1172ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 792ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 919ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 793ms
     ✓ --file into a missing directory is refused, not created 667ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 890ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 624ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1300ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 857ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 792ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 689ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 772ms
     ✓ an unpinned repo reports nulls and asks no registry 626ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 410ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 510ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 563ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 544ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1372ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 966ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1492ms
     ✓ reports excluded intervals as unread even when pagination finishes 1387ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 823ms
     ✓ reports an unread remainder at the page cap 898ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 537ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 541ms
     ✓ rejects missing summaries instead of treating them as empty results 819ms
     ✓ reports a failed first page as unavailable 501ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 526ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 770ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 550ms
     ✓ follows summary cursors even when the first page is shorter than the limit 647ms
     ✓ reports excluded intervals as unread even when pagination finishes 544ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 584ms
     ✓ reports an unread remainder at the page cap 517ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 488ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 339ms
     ✓ rejects missing summaries instead of treating them as empty results 470ms
     ✓ reports a failed first page as unavailable 429ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 343ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 65153ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 705ms
     ✓ keeps each context's own section banner and drops every other context's 1734ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 344ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 417ms
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 888ms
     ✓ counts files committed since --base 836ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 700ms
     ✓ runs nothing and exits 0 when no file changed 334ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1056ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 317ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1357ms
     ✓ runGit names ENOBUFS when output passes the limit 1068ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1013ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 685ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1471ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 492ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 8186ms
 ✓ .bkit/core/engine/commands/comply.test.ts (44 tests) 3779ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 830ms
     ✓ passes every rule on a clean head 342ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 421ms
 ✓ .bkit/core/engine/commands/workflow/tasks.test.ts (20 tests) 3193ms
   ✓ bkit tasks currency (6)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 384ms
     ✓ resolves config from the repo root when run from a subdirectory 339ms
     ✓ exits 6 when the PUT fails 392ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 372ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 392ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 373ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 395ms
     ✓ exits 6 when the api answer is not JSON 409ms
 ✓ .bkit/core/engine/commands/workflow/step-table.test.ts (47 tests) 3171ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ releases only its delivery token on every exit 381ms
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims a finished (DONE or FAILED) run's old lock 317ms
   ✓ bkit locks release (5)
     ✓ locks release removes the FID shared-checkout record 393ms
> [bkit] TRUNCATED HERE — 20 lines omitted. Dropped content was NOT read.
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 301ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 408ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 462ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 605ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (75 tests) 2544ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 3006ms
> [bkit] TRUNCATED HERE — 148 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 534 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 307 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 201 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 135ms
 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 571ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-r6VpgR/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 264ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 289ms
 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 221ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 279ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 177ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 242ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 186ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 310ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 237ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-LMUqYH/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 397ms
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

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 195ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 279ms
 ✓ .bkit/core/engine/commands/conventions.test.ts (16 tests) 1023ms
   ✓ registered commands (3)
     ✓ follow the conventions, and list every exit code their source can return 741ms
(node:70007) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:70007) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:70007) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:70007) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 167ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 109ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 89ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 173ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 258ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (61 tests) 138ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 229ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 96ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 139ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 83ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 106ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 95ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 118ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 187ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 114ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 81ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 144ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 161ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 97ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 166ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 171ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 108ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 105ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 107ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 76ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 91ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 73ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 76ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 70ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 61ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 80ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 54ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 60ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794387485628.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794387485637.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794387485639.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794387485659.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 57ms
(node:72660) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:72660) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 194ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 76ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 74ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 67ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 32ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 81ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 55ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 41ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 37ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 40ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 50ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 58ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 38ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 187ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 85ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 39ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 29ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 35ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 17ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 28ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 32ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 49ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 14ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 14ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 11ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 25ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 43ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 23ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 13ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 13ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (158 tests) 162263ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 377ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1102ms
     ✓ opens the next run after a finished one, and after another workflow's run 379ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 427ms
     ✓ design / plan / build / debug book in the current worktree 308ms
     ✓ --lock-held checks the lock is ours 378ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 407ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 543ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 379ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 486ms
     ✓ an OPEN decision of an earlier run never resurfaces 492ms
     ✓ an OPEN decision mid-build prints its header fields 403ms
     ✓ reads Test attempt from a tests pause 453ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 696ms
     ✓ writes no row when status.jsonl does not exist 348ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 318ms
     ✓ aborts a rebase only when one is in progress 840ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 707ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 498ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 317ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 350ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 649ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 913ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 436ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 487ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 342ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 307ms
     ✓ a debug run in SOAK mode always needs a handover 453ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 1769ms
       ✓ counts subagents of an earlier chat the run's session rows name 975ms
       ✓ records no context block, and still closes, outside a Claude Code session 880ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 798ms
     ✓ records ending held and publish false on the workflow-done row 743ms
     ✓ defaults the close row to ending done 789ms
     ✓ refuses an unknown ending 358ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 780ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 919ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 771ms
     ✓ always writes the telemetry, whatever the runtime 629ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 632ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 699ms
     ✓ an unwritable stats path is logged and never fails the close 771ms
     ✓ appends the completeness row before the workflow-done row 810ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 844ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 810ms
     ✓ writes one completeness row per close 1547ms
     ✓ leaves out the previous run's rows that share a second with this run's start 817ms
     ✓ still closes when the completeness check throws 936ms
     ✓ still closes when the completeness row write throws 943ms
     ✓ ship: run.pr, size of the squash commit, and coverage 975ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1298ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 863ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 759ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1104ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1036ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1305ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1273ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1221ms
     ✓ --record-step writes the close step's row before workflow-done 834ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 977ms
     ✓ --number without --outbox is a usage error 857ms
     ✓ --flush is ship only 381ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1450ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1328ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1556ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1316ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1071ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 567ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 539ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3433ms
     ✓ --flush with nothing to record commits and pushes nothing 1830ms
     ✓ --flush carries the named worktree's logs into the dev commit 3342ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3773ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3488ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4198ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3471ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 4151ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 3702ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3561ms
     ✓ --push on dev never carries a row whose references name another feature 3818ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2958ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4699ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3093ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1439ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3941ms
     ✓ preserves unlanded file deletions and ledger additions on close 7391ms
     ✓ preserves dirty work and uncertain branch evidence during close 7479ms
     ✓ preserves a local feature ref changed after its cleanup proof 9133ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 5187ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3794ms
     ✓ a close that landed releases the lock 2124ms
     ✓ removes the worktree before it releases the lock 1274ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 2160ms
       ✓ closePr refuses when the PR base is unknown 1745ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1089ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 455ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 653ms
     ✓ a second run's record does not let this FID's close commit 351ms
     ✓ record is present after workflows close and before the push 641ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1147ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 407ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 346ms
     ✓ puts each --line after the summary, in flag order 341ms
     ✓ --summary prints the file and keeps a copy in --outbox 329ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 334ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 236614ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 538ms
     ✓ rejects missing explicit and ambiguous existing branch selections 399ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 748ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 745ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 447ms
     ✓ a refused --continue carries git's own reason 628ms
     ✓ --file records nothing for a refused rebase 651ms
     ✓ refuses a code conflict and aborts the rebase on the spot 568ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1561ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 883ms
     ✓ produces byte-identical output to merge=union 2139ms
     ✓ restores a trailing newline so the next append starts on its own line 927ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 809ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1121ms
     ✓ refuses a union that leaves a line which is not JSON 564ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1075ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 2250ms
     ✓ refuses a lockfile whose regenerate command fails 1436ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 2465ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1424ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1229ms
     ✓ refuses and aborts when both sides changed the hand-written region 768ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 925ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1226ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1225ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 787ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 934ms
     ✓ refuses and aborts when a side deleted the install record 777ms
     ✓ refuses a conflicted doc the repo's script does not list 695ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 650ms
     ✓ removes a stale sentinel when the rebase succeeds 944ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1559ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1232ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 611ms
       ✓ skips (12) with no anchor 579ms
       ✓ skips (12) when the base is unreachable in this clone 668ms
       ✓ skips (12) when nothing landed since the base 629ms
       ✓ runs (0) with the landed path count once dev moved 1181ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 641ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1326ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 895ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1279ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1702ms
     ✓ runs exactly one git push 1588ms
     ✓ --set-upstream records the upstream 1098ms
     ✓ refuses with no branch checked out 830ms
     ✓ --mode=dev refuses a feature checkout 807ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2320ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3295ms
     ✓ --require-ci pushes as-is when dev has not moved 1355ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2354ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3697ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 898ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1416ms
     ✓ --mode=abort pushes when the branch has no open PR 1411ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1217ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 762ms
     ✓ --open-pr carries the MCP answer and skips gh 1077ms
     ✓ --mode=abort on dev pushes plainly without probing 1085ms
     ✓ rejects an unknown mode 756ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3361ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1973ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2271ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4222ms
     ✓ skip-ci HEAD on the replay is refused 1554ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3742ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4905ms
     ✓ a level local dev is a plain push, recording nothing extra 1804ms
     ✓ a record with no commits pushes nothing 1235ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 934ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1996ms
     ✓ a rewritten branch is refused, never forced 1000ms
     ✓ refuses dev and main with exit 21 and pushes nothing 632ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1565ms
     ✓ refuses a detached HEAD (exit 5) 624ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1306ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1578ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1510ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1922ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 912ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2087ms
     ✓ an up-to-date branch is a no-op 1120ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1918ms
     ✓ a fetch that fails exits 10 850ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1061ms
     ✓ scan-diff still reports a new skip when its test … 1069ms
     ✓ scan-diff reports a skip moved onto a different t… 997ms
     ✓ scan-diff does not cancel a skip moved between am… 875ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1050ms
     ✓ scan-diff recognizes a renamed test file 1182ms
     ✓ scan-diff recognizes a suite moved into a differe… 1084ms
     ✓ scan-diff does not let unrelated additions hide a… 1147ms
     ✓ scan-diff attributes deletion to its old test ins… 1099ms
     ✓ scan-diff consumes each moved assertion once and … 1103ms
     ✓ scan-diff does not match identical assertions fro… 1109ms
     ✓ scan-diff does not match the same leaf test name … 1214ms
     ✓ scan-diff does not match a same-named test with d… 1348ms
     ✓ scan-diff does not match a same-named test with c… 1181ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1652ms
     ✓ --paths with no match exits 1 1386ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 1007ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1709ms
     ✓ --marker reads a diff over 1 MiB 1329ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1654ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1330ms
     ✓ scan-diff finds an added skip 1525ms
     ✓ scan-diff ignores a skip predating the base 1188ms
     ✓ scan-diff reports a disabled test with its line 1185ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 451ms
     ✓ scan-diff ignores a removed comment in a test file 394ms
     ✓ scan-diff ignores an assertion moved within the file 348ms
     ✓ scan-diff still reports a removed assertion 332ms
     ✓ scan-diff reports an assertion re-added only outside the test file 346ms
     ✓ scan-diff finds an added pytest mark skip 383ms
     ✓ scan-diff finds an added unittest skip 375ms
     ✓ scan-diff finds an added bare skip call 378ms
     ✓ scan-diff ignores a quoted skip in a documentation file 391ms
     ✓ scan-diff ignores a marker literal in a non-test source file 384ms
     ✓ scan-diff ignores an assertion whose expectation changed 353ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 315ms
     ✓ scan-diff reports a deleted test file 334ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 911ms
     ✓ a title that already carries the marker is left alone 660ms
     ✓ with no open PR: pushes the marker commit and edits no title 626ms
     ✓ a re-run is deduped: no second marker commit 802ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 926ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 376ms
     ✓ --title-set skips gh entirely 512ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 991ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1769ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 982ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2061ms
     ✓ continues only the explicitly recorded target through the public merge command 1318ms
     ✓ fetches the unseen feature head before classifying the base 694ms
     ✓ fast forwards the feature before either base path is chosen 1573ms
     ✓ merges divergent feature tips without rebasing either side 1458ms
     ✓ continues the feature merge before starting a dev merge 2172ms
     ✓ publishes local code with a CI running head before bookkeeping 1698ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2287ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1599ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 988ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 397ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 402ms
     ✓ --merge-docs merges dev when docs/ is behind 484ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 461ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 684ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 698ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 601ms
     ✓ --merge-docs skips an empty bkit:generate script 517ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 425ms
     ✓ --merge-docs never merges on dev itself 384ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 592ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 625ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 545ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 575ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 309ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 718ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 727ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 886ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 727ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 693ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 950ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 711ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 821ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 549ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 382ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 452ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 637ms
     ✓ a failed install stops ship (16) 569ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 471ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 438ms
     ✓ exits 10 when the fetch fails 335ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 338ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1211ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1136ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1169ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1195ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2272ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2680ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 432ms
     ✓ local: names unpushed dev as the cause when the branch carries it 568ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 604ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2968ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1536ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1408ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5506ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1004ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1157ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1070ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 753ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1957ms
     ✓ land removes the worktree when only the copied .env is untracked 1631ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1554ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1161ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1928ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1304ms
     ✓ landPr refuses a main-based PR without retrying 579ms
     ✓ landPr refuses when the PR base is unknown 650ms
     ✓ PR not open (closed): stops (17) at once, no retry 724ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 428ms
     ✓ --attempt names the merge round in a fix commit 383ms
     ✓ commits a rewritten and a deleted tracked file 411ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 370ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 402ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 494ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 314ms

 Test Files  173 passed (173)
      Tests  7418 passed | 2 skipped (7420)
   Start at  18:55:43
   Duration  237.64s (tests 96%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/916-tests-lock-waiting/build-group-gate-2-1.log.reports/vitest-54538.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.62 |    83.38 |   95.12 |   91.02 |                   
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
 ...mmands/install |   47.51 |    44.92 |   58.75 |   47.93 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.13 |    30.65 |   33.33 |   33.33 | 354-382,564-1072  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.06 |    84.75 |   96.44 |   93.55 |                   
  branches.ts      |   89.58 |    83.48 |   98.81 |   91.23 | ...3256,3281,3424 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.38 |    94.69 |     100 |    98.8 | 240,557           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 206,311,380       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   92.09 |    86.44 |   92.59 |   94.03 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.01 |    88.42 |     100 |   93.01 | ...1444,1460-1461 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |      92 |    85.07 |   99.16 |   93.12 | ...2597,2629-2633 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    89.9 |    83.04 |   90.82 |    91.1 | ...1963,1968,1970 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   67.34 |     65.7 |   75.36 |   68.82 | ...1376,1379-1380 
 engine/install    |   91.47 |    82.52 |   92.94 |   94.53 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |   58.53 |    38.46 |      40 |   65.62 | ...18-134,147-164 
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
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1718-1800,1805 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.62% ( 19296/21529 )
Branches     : 83.38% ( 14696/17624 )
Functions    : 95.12% ( 3082/3240 )
Lines        : 91.02% ( 16940/18610 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 470 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 212 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 205 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 207 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 193 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 197 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 73 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 226 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 198 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 197 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 196 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 186 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 202 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 229 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 896 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 502 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 16 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 17 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 18 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 20 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 48 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 577 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 350 ms
ok 30 refresh drops a file deleted in the index from the build # in 313 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 394 ms
ok 32 a key removed from the env file is unset on the next run # in 163 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 144 ms
ok 34 non-BKIT_ keys are skipped # in 134 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 146 ms
ok 36 a failed unsetenv is retried on the next run # in 183 ms
ok 37 logs key names only, never values # in 140 ms
ok 38 missing env file exits 0 without calling launchctl # in 26 ms
ok 39 the sweep prints the summary line the lane greps for # in 261 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 9 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (88.046917ms)
✔ shell cancellation waits for SIGTERM cleanup (160.549583ms)
✔ direct cancellation waits for SIGINT cleanup (86.602417ms)
✔ shell cancellation waits for SIGINT cleanup (158.359042ms)
✔ direct cancellation waits for SIGHUP cleanup (89.09175ms)
✔ shell cancellation waits for SIGHUP cleanup (159.825459ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (367.49225ms)
✔ shell cancellation follows a worker orphaned by a nested shell (228.605833ms)
✔ direct cancellation preserves a nested machine-lock owner (464.893166ms)
✔ shell cancellation preserves a nested machine-lock owner (485.337208ms)
✔ nested shell cancellation preserves a nested machine-lock owner (565.025584ms)
✔ a hard process-group timeout reaches a shell command during cleanup (88.117167ms)
✔ ships a command-scoped sleep prevention wrapper (0.09325ms)
✔ preserves arguments, output and nonzero exit status (80.205375ms)
✔ runs an entire shell chain and retains its failure (155.517375ms)
✔ reports a missing command as 127 (51.735792ms)
✔ requires a command (38.669ms)
✔ non-macOS platform selection runs commands without sleep prevention (74.67625ms)
✔ hard timeout escalation reaches a command that ignores TERM (184.908333ms)
✔ forwards POSIX cancellation to the command and releases the assertion (83.788708ms)
✔ holds a real macOS assertion only while the command runs (104.300583ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3752.99375
> [bkit] TRUNCATED — kept 1807 of 3603 lines (128 KB of 277 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
