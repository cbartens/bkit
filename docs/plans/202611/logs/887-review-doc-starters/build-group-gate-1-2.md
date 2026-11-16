
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 887-review-doc-starters build-group-gate-1 is waiting for tests (up to 1200s), 3rd in line: in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/928-tests-lock-hung (pid 86129, since 14:34:46), last run took 7m40s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 887-review-doc-starters build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s), 2nd in line: in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode (pid 45011, since 14:38:49), last run took 3m19s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 887-review-doc-starters build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s), 2nd in line: in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode (pid 45011, since 14:38:49), last run took 3m19s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 887-review-doc-starters build-group-gate-1 is waiting for tests (still, 3 min so far) (up to 1200s), 2nd in line: in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode (pid 45011, since 14:38:49), last run took 3m19s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 887-review-doc-starters build-group-gate-1 is waiting for tests (still, 4 min so far) (up to 1200s), 2nd in line: in use by bkit tests run bkit:gate:static-unit — /Users/christian/Documents/GitHub/bkit/.worktrees/803-close-codex-opencode (pid 45011, since 14:38:49), last run took 3m19s

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
 254:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 345:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 396:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 467:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


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

[test-timeout-budget] load average 7.6 on 10 cores: unit limits 8300ms per test, 16600ms per hook (x1.66)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 33277ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ design and plan in place on main are refused 336ms
     ✓ still adopts a cloud session branch whose upstream is main 300ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 958ms
     ✓ may debug in place on dev 448ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 854ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 700ms
     ✓ a new run of the same FID rewrites startSha 1211ms
     ✓ a resume of the same FID reuses the record 1401ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 607ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 620ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 828ms
     ✓ a stale record without a lock is replaced 685ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 720ms
     ✓ refuses inherited unpublished dev commits in every ship mode 2448ms
     ✓ names inherited commits and ship recovery in the refusal 730ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 976ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 995ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 400ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 414ms
       ✓ checks no disk when there are no cleanup step files 473ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 391ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 404ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 343ms
     ✓ never commits an entry only the main checkout's copy list names 377ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 436ms
     ✓ tells a caller inside the removed worktree where to cd 317ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 986ms
       ✓ preserves staged-only mode during landed cleanup 966ms
       ✓ preserves staged-only type during landed cleanup 906ms
       ✓ preserves staged-only deletion during landed cleanup 926ms
       ✓ removes landed staged content when both index and working contents are on dev 861ms
       ✓ deletes the proved local and remote branch at their landed tips 965ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2254ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 388ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 367ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 406ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 527ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 39343ms
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 374ms
     ✓ finishes a CI round only with its own failed job count 374ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 388ms
     ✓ done --group writes group on the row 394ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 502ms
     ✓ carries extra fields, parsed as JSON when they are JSON 303ms
     ✓ reports a failed commit with exit 8 without writing the row 697ms
     ✓ a failed commit leaves no row staged in the index 818ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 985ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 950ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1140ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1110ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1288ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 345ms
     ✓ fails a run-tests row missing its scope, and an empty scope 383ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 330ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 349ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 337ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 640ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 760ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 575ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 662ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1009ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 670ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 322ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 571ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 408ms
     ✓ --attempt-of checks the row carries the derived counter 331ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 824ms
     ✓ writeStepRow refuses when a recorded path changed 818ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 413ms
     ✓ writeStepRow appends its commit sha to the record 627ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1548ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 527ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 500ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 510ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 310ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 782ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 571ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 442ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 402ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 855ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ does not count an artifact the run found committed when it started 344ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 420ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 802ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (103 tests) 44006ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 26693ms
     ✓ every prompt, workflow and utility agent has the three header blocks 712ms
     ✓ sync has nothing left to rewrite 14180ms
     ✓ every clause reaches the cut-off of one surface it applies to 1883ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 46971ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 934ms
     ✓ names each net-new and worsened finding in the log and the JSON 1113ms
     ✓ fails on a net score rise with no net count change 854ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 874ms
     ✓ treats a net score at or below 0.001 as float noise 927ms
     ✓ passes when the change only resolves findings 799ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1134ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 843ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 592ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1457ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 712ms
     ✓ exits 4 on a dropped net field instead of silently passing 1305ms
     ✓ exits 4 on no summary instead of silently passing 1152ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1520ms
     ✓ exits 5 when the base worktree cannot be created 324ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1537ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1046ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1024ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 2320ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1022ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1812ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1241ms
     ✓ explicit globs can select ignored prose and nested checkout files 1010ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 836ms
     ✓ fails (exit 1) when vale reports alerts 1011ms
     ✓ exits 6 on a vale runtime error 979ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1425ms
     ✓ falls back to vale sync when the main worktree has none 1034ms
     ✓ fails when vale sync cannot restore the required styles 1045ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 301ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 377ms
     ✓ exits 1 naming the code file, whatever the commit message says 354ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 517ms
   ✓ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 335ms
     ✓ exits 1 naming the files outside, whatever the commit message says 346ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 657ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 432ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 422ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 838ms
     ✓ a top-level glob in the setting does not reach into folders 407ms
     ✓ a push that changes no files is not proven a min push 395ms
     ✓ exits 7 when a commit or its base cannot be read 472ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 392ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 373ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 425ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 423ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 460ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 414ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 417ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 450ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 548ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 465ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 400ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 621ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 627ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 53016ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 528ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1466ms
     ✓ always writes the marker, even with no plan 604ms
     ✓ writes the linear marker shape, taking the tracker from package.json 850ms
     ✓ writes the jira marker shape, taking the tracker from package.json 458ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 804ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 721ms
     ✓ retries a failed create once, and exits 5 when it fails twice 714ms
     ✓ exits 5 when the open-PR probe errors 685ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 1061ms
     ✓ prs open still opens against any other base 979ms
     ✓ exits 6 when the created PR's base is not --base 1127ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 2049ms
     ✓ refuses merged entry when current feature evidence cannot be read 1731ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 662ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 922ms
     ✓ exits 1 with found=false when there is none 801ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 730ms
     ✓ --number reads one PR, mergeable included 558ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 558ms
     ✓ exits 4 when gh errors and 80 when it needs auth 500ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 446ms
     ✓ classifies a refused merge with a new dev conflict as integration 890ms
     ✓ returns an explicit terminal reason for other merge refusals 556ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 682ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 1004ms
     ✓ drops the force-build marker from the title subject 885ms
     ✓ takes an explicit --subject 828ms
     ✓ runs no merge when the PR is already MERGED 642ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1136ms
     ✓ prs merge refuses a PR whose base is main 1005ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1232ms
     ✓ prs merge refuses when the PR base is unknown 1011ms
     ✓ prs merge reads the base from the one pr view it already makes 1468ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 756ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 1461ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 1080ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 907ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 401ms
     ✓ updates when a dev ruleset requires status checks 513ms
     ✓ updates when dev's branch protection requires status checks 671ms
     ✓ ignores dev rulesets that require no checks 369ms
     ✓ updates when the repo cannot be resolved 517ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 1285ms
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 676ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 1175ms
     ✓ is not green when a check failed, naming it (exit 1) 529ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 716ms
     ✓ is not green on an empty rollup (total 0) 350ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 538ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1020ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 685ms
     ✓ is a no-op when the title already says so 847ms
     ✓ strips the marker, with or without its bkit prefix 1547ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 1229ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 55381ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 1118ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 527ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 797ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 507ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 618ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 457ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 668ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 884ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 509ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 311ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 805ms
     ✓ PASS is 0 failures with or without reports 1222ms
     ✓ clears a previous attempt's reports before the gate runs 881ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1126ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1223ms
     ✓ a log under the outbox is named main-checkout relative in the record 1129ms
     ✓ a log small enough is copied whole: not clamped, raw null 1331ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 929ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1204ms
     ✓ numbers runs within the workflow's active run and per step 801ms
     ✓ without --file no row is written and the output carries row null 524ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1148ms
     ✓ a planned test that passes is a vacuous gap, exit 1 930ms
     ✓ a planned test absent from a loaded report is a missing gap 994ms
     ✓ a file that fails to load is a red of kind red-not-loaded 1168ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1102ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1630ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1153ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1219ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 2203ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1372ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1249ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 952ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1086ms
     ✓ green: a passed-accepted test is already landed, not a gap 1125ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 1382ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 848ms
     ✓ green: --group audits only that group's tasks 854ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 959ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1196ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1515ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1305ms
     ✓ green: lists each gap kind, with the runner output 1147ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1507ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 466ms
       ✓ green clears an exception-only task from a human commit 372ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (107 tests) 26897ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 332ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 388ms
     ✓ brand-new untracked ledger is staged and committed 342ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 367ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 843ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 486ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 422ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 306ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 304ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 499ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 564ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 391ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 387ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 645ms
     ✓ --path records its commit on the run's record, like every other commit mode 510ms
     ✓ a recorded ledger commits only the rows the run appended 1039ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1089ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1010ms
     ✓ commitBookkeeping refuses when a recorded path changed 589ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 567ms
     ✓ under --mode=commit counts the squashed paths as something to commit 499ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 398ms
     ✓ another FID's plan file in the range: exit 7 301ms
     ✓ from not an ancestor of to: exit 7 303ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit ledgers append --operation (3)
     ✓ keeps ledger operation intents and receipts out of committed book paths 573ms
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 19489ms
   ✓ bkit fids parse --prompt-file (68)
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 781ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1398ms
     ✓ a refused dev push is logged, never fails the close 2227ms
     ✓ an unreachable remote is logged, never fails the close 595ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 10745ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 676 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 305 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2077ms
     ✓ saves the failed job count without the capstone job 780ms
     ✓ counts the capstone job when it is the only failed job 1289ms
     ✓ saves no failed job count when no job failed 963ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1387ms
     ✓ freezes explicit workflow run attempt and all failed job pages 957ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1910ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2416ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1550ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1832ms
     ✓ checks the named repository base and fails closed on missing evidence 938ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 727ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 838ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 367ms
       ✓ a source change past the validated head refuses (17) and names the path 371ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 439ms
       ✓ --validated without --month / --fid is a usage error (2) 389ms
       ✓ a validated sha that is not an ancestor refuses (17) 448ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 543ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 997ms
     ✓ a failed re-trigger push names the cause in the log 1701ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1772ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1886ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 964ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 571ms
     ✓ gh-error: every poll errored 450ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 651ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 559ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 628ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 782ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2410ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2684ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 584ms
     ✓ re-trigger on dev only uses the record of its own FID 569ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 661ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 352ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 476ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 326ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 321ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 410ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 680ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 469ms
     ✓ --file and --step go together 494ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1057ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 510ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1204ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 775ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 665ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 905ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 945ms
     ✓ an unpinned repo reports nulls and asks no registry 1104ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 920ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 932ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1457ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 525ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 44707ms
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 302ms
     ✓ continues after friction and diagnostic writes fail without recursion 337ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 460ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 1954ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 935ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 997ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 1238ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 730ms
     ✓ fetches the issue and its comments as GitHub returns them 1255ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 1012ms
     ✓ invalidates missing corrupt and unsupported progress cache 1277ms
     ✓ contains cache read and write failures as standalone degradation 866ms
     ✓ uses legacy receipts and contains receipt failures 848ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1117ms
     ✓ a recent identical comment counts as done (the final close comment) 1371ms
     ✓ a failed post reports done false with the reason and never leaks a token 1031ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 582ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1050ms
     ✓ a different marker hash posts 972ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 776ms
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 23767ms
   ✓ bkit runtime detect — the table (17)
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 902ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 943ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 889ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 1026ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 925ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 724ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 401ms
     ✓ --file into a missing directory is refused, not created 824ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 5174ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1327ms
     ✓ runGit names ENOBUFS when output passes the limit 858ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1333ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 683ms
     ✓ passes every rule on a clean head 322ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 343ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 279ms
 ✓ .bkit/core/engine/render/trackers.test.ts (107 tests) 337ms
> [bkit] TRUNCATED HERE — 84 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 789ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 400ms
     ✓ follows summary cursors even when the first page is shorter than the limit 644ms
     ✓ reports excluded intervals as unread even when pagination finishes 667ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 435ms
     ✓ reports an unread remainder at the page cap 775ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 415ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 425ms
     ✓ rejects missing summaries instead of treating them as empty results 466ms
     ✓ reports a failed first page as unavailable 360ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 412ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 735ms
     ✓ follows summary cursors even when the first page is shorter than the limit 463ms
     ✓ reports excluded intervals as unread even when pagination finishes 438ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 652ms
     ✓ reports an unread remainder at the page cap 561ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 712ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 596ms
     ✓ rejects missing summaries instead of treating them as empty results 695ms
     ✓ reports a failed first page as unavailable 682ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 684ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 50ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 132 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 7334ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 735ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 552ms
     ✓ resolves config from the repo root when run from a subdirectory 746ms
     ✓ exits 6 when the PUT fails 822ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 1070ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 351ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 562ms
     ✓ asks a human to log in when gh is not authenticated 540ms
     ✓ exits 3 when gh repo view names no repository 523ms
   ✓ bkit setup protect-main --print (4)
     ✓ exits 6 on any other api failure instead of calling main unprotected 369ms
     ✓ exits 6 when the api answer is not JSON 396ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 40ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 58ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 130ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 310ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 189ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 161ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 48ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 64ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 91ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 95ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 74ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 41ms
 ✓ .bkit/core/engine/audits/templates/context-github-ci-block.test.ts (4 tests) 5041ms
   ✓ GitHub selected-evidence context blocks (4)
     ✓ fetches pinned attempts without branch discovery and filters unpinned discovery 1773ms
     ✓ emits complete receipts only after all selected job logs succeed 1809ms
     ✓ ends pinned diffs at selected commits with ancestral same-workflow baselines 1455ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794631490288.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794631490291.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794631490292.md — skipping (expected exactly one of each)

 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 61ms
stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794631490302.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (39 tests) 44ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 60ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 10ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 49ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 57ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 82ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 266ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (16 tests) 58ms
(node:57013) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:57013) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:57013) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:57013) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 152ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 60ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (36 tests) 182ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1290ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 1265ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 173ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 857ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-BXjdAg/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xb4bAh/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 120ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 53ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-TQDhtL/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 55ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-iieSsT/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-UDccqZ/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 61ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-sMqzfS/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 915ms
 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 444ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 71ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 29101ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 2272ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2506ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 400ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 384ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 406ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 426ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3319ms
     ✓ does not fall back through a malformed later success receipt 1873ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1254ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1052ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2176ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1715ms
     ✓ requires proof even when the pushed increment changes no files 1084ms
     ✓ ignores malformed receipts 952ms
     ✓ does not record a tracked tree 482ms
     ✓ does not record a untracked tree 583ms
     ✓ does not record a mutated tree 894ms
     ✓ does not record a committed tree 697ms
     ✓ records no proof for a failed gate or lighter gate 986ms
     ✓ requires integration proof when integration is declared 1615ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2378ms
     ✓ invalidates proof when the gate definition changes 1041ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 603ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 53ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 33ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 30ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 130ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 67ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 2615ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 491ms
     ✓ is undefined outside a repo 309ms
   ✓ guardRepoConfig (6)
     ✓ passes when only another key changed, such as a branch's upstream 308ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 329ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 410ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 79ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 22ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1313ms
   ✓ documented read-only ledger helper (11)
     ✓ rejects string timestamps instead of reporting a successful read 311ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 5838ms
   ✓ changedFiles (2)
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 557ms
   ✓ tests changed (10)
     ✓ runs bkit:gate:changed with the changed files as its arguments 568ms
     ✓ counts files committed since --base 814ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 567ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 808ms
     ✓ runs the --fallback gate even when no file changed, as it did before 534ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 420ms
     ✓ exits 4 when the gate could not run 711ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 15ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 14ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 96ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1450ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 317ms
     ✓ limits execSync and execFileSync the same way 616ms
     ✓ stops a child that ignores SIGTERM at the remaining time 303ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 47ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 14ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 101ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 13ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 100ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 8491ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 8481ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 20131ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 14045ms
     ✓ every fence parses under zsh -n 5946ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 54989ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1812ms
     ✓ runs code.ts through its declared gate in the built checkout 1706ms
     ✓ runs code.ts through its declared gate in the built checkout 1637ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1849ms
     ✓ runs an audit template's project-section change through bkit:gate:min 2074ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1751ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1510ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1799ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 918ms
     ✓ runs the full gate for replayed debug code 1732ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2147ms
     ✓ installs local dependencies against the built target tree 1727ms
     ✓ runs the configured frozen install even without root dependencies 1663ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1791ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2012ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2151ms
     ✓ never pushes local dev commits missing from origin/dev 1924ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3681ms
     ✓ dev moved before every push: exhausted, nothing landed 5372ms
     ✓ any other refusal is returned, not retried 1972ms
     ✓ pushToDev replays a commit range onto origin/dev 1350ms
     ✓ a replay retries on the new dev when dev moved 2364ms
     ✓ pushToDev log line names what it lands 1097ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1297ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1401ms
     ✓ a push that fails without a server answer is returned once, never retried 1050ms
     ✓ a failed fetch is returned before anything is built 356ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1799ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1284ms
     ✓ lands from a clone whose fetch refspec omits dev 1133ms
     ✓ build throwing stops the landing and removes the throwaway checkout 610ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 132949ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 913ms
     ✓ writes no limits for a workflow with no ask point 307ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 310ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 344ms
       ✓ writes none outside Claude Code 330ms
     ✓ opens the next run after a finished one, and after another workflow's run 360ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 302ms
     ✓ design / plan / build / debug book in the current worktree 319ms
     ✓ --lock-held checks the lock is ours 353ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 347ms
   ✓ bkit workflows start — resume facts (11)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 596ms
     ✓ workflows start does not report openDecision for a DECIDED decision file that a build-decision row names 386ms
   ✓ bkit workflows fail (24)
     ✓ aborts a rebase only when one is in progress 444ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 440ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 454ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 337ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 597ms
       ✓ counts subagents of an earlier chat the run's session rows name 704ms
       ✓ records no context block, and still closes, outside a Claude Code session 622ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 571ms
     ✓ records ending held and publish false on the workflow-done row 725ms
     ✓ defaults the close row to ending done 696ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 948ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 947ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 908ms
     ✓ always writes the telemetry, whatever the runtime 691ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 592ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 668ms
     ✓ an unwritable stats path is logged and never fails the close 573ms
     ✓ appends the completeness row before the workflow-done row 805ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 681ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 567ms
     ✓ writes one completeness row per close 1031ms
     ✓ leaves out the previous run's rows that share a second with this run's start 585ms
     ✓ still closes when the completeness check throws 521ms
     ✓ still closes when the completeness row write throws 606ms
     ✓ ship: run.pr, size of the squash commit, and coverage 649ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 817ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 511ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 502ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 712ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 672ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 673ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 619ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 687ms
     ✓ --record-step writes the close step's row before workflow-done 594ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 475ms
     ✓ --number without --outbox is a usage error 453ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 770ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 802ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 937ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1052ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 768ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 418ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 320ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2105ms
     ✓ --flush with nothing to record commits and pushes nothing 1101ms
     ✓ --flush carries the named worktree's logs into the dev commit 2289ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3181ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1842ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2671ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2458ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2599ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2454ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1893ms
     ✓ --push on dev never carries a row whose references name another feature 2095ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1845ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3882ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2769ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1318ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 3023ms
     ✓ preserves unlanded file deletions and ledger additions on close 5623ms
     ✓ preserves dirty work and uncertain branch evidence during close 6494ms
     ✓ preserves a local feature ref changed after its cleanup proof 5940ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3149ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 2496ms
     ✓ a close that landed releases the lock 3364ms
     ✓ removes the worktree before it releases the lock 3520ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 4555ms
       ✓ closePr refuses when the PR base is unknown 3916ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1768ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 441ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 553ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1049ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 416ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 382ms
     ✓ a second run's record does not let this FID's close commit 692ms
     ✓ record is present after workflows close and before the push 862ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1810ms
   ✓ bkit workflows input (7)
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 376ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 519ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 421ms
     ✓ puts each --line after the summary, in flag order 644ms
     ✓ --summary prints the file and keeps a copy in --outbox 431ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 377ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 207500ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 402ms
     ✓ rejects missing explicit and ambiguous existing branch selections 365ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 639ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 920ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 549ms
     ✓ a refused --continue carries git's own reason 699ms
     ✓ --file records nothing for a refused rebase 517ms
     ✓ refuses a code conflict and aborts the rebase on the spot 549ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1030ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 428ms
     ✓ produces byte-identical output to merge=union 1123ms
     ✓ restores a trailing newline so the next append starts on its own line 974ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 553ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 757ms
     ✓ refuses a union that leaves a line which is not JSON 426ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 660ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1865ms
     ✓ refuses a lockfile whose regenerate command fails 1538ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 972ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1087ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 906ms
     ✓ refuses and aborts when both sides changed the hand-written region 686ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 718ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1008ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1279ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 720ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 886ms
     ✓ refuses and aborts when a side deleted the install record 674ms
     ✓ refuses a conflicted doc the repo's script does not list 545ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 583ms
     ✓ removes a stale sentinel when the rebase succeeds 823ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 882ms
     ✓ resolves a conflict in each of two replayed commits across rounds 837ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 395ms
       ✓ skips (12) with no anchor 411ms
       ✓ skips (12) when the base is unreachable in this clone 389ms
       ✓ skips (12) when nothing landed since the base 450ms
       ✓ runs (0) with the landed path count once dev moved 768ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 381ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 827ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 539ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 649ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 2011ms
     ✓ runs exactly one git push 1756ms
     ✓ --set-upstream records the upstream 612ms
     ✓ refuses with no branch checked out 504ms
     ✓ --mode=dev refuses a feature checkout 509ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1452ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2268ms
     ✓ --require-ci pushes as-is when dev has not moved 847ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1486ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2428ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 641ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1307ms
     ✓ --mode=abort pushes when the branch has no open PR 1619ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1198ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 419ms
     ✓ --open-pr carries the MCP answer and skips gh 605ms
     ✓ --mode=abort on dev pushes plainly without probing 792ms
     ✓ rejects an unknown mode 573ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2398ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1297ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1347ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4300ms
     ✓ skip-ci HEAD on the replay is refused 832ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2145ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3113ms
     ✓ a level local dev is a plain push, recording nothing extra 1139ms
     ✓ a record with no commits pushes nothing 846ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 539ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1784ms
     ✓ a rewritten branch is refused, never forced 863ms
     ✓ refuses dev and main with exit 21 and pushes nothing 479ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1644ms
     ✓ refuses a detached HEAD (exit 5) 596ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1397ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1355ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1018ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1520ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 555ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1668ms
     ✓ an up-to-date branch is a no-op 927ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1786ms
     ✓ a fetch that fails exits 10 588ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 833ms
     ✓ scan-diff still reports a new skip when its test … 1006ms
     ✓ scan-diff reports a skip moved onto a different t… 762ms
     ✓ scan-diff does not cancel a skip moved between am… 923ms
     ✓ scan-diff does not spend an unchanged duplicate t… 876ms
     ✓ scan-diff recognizes a renamed test file 987ms
     ✓ scan-diff recognizes a suite moved into a differe… 802ms
     ✓ scan-diff does not let unrelated additions hide a… 833ms
     ✓ scan-diff attributes deletion to its old test ins… 1019ms
     ✓ scan-diff consumes each moved assertion once and … 740ms
     ✓ scan-diff does not match identical assertions fro… 710ms
     ✓ scan-diff does not match the same leaf test name … 946ms
     ✓ scan-diff does not match a same-named test with d… 732ms
     ✓ scan-diff does not match a same-named test with c… 814ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 829ms
     ✓ --paths with no match exits 1 896ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 566ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1095ms
     ✓ --marker reads a diff over 1 MiB 964ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1029ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 913ms
     ✓ scan-diff finds an added skip 989ms
     ✓ scan-diff ignores a skip predating the base 770ms
     ✓ scan-diff reports a disabled test with its line 881ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1132ms
     ✓ scan-diff ignores a removed comment in a test file 887ms
     ✓ scan-diff ignores an assertion moved within the file 871ms
     ✓ scan-diff still reports a removed assertion 903ms
     ✓ scan-diff reports an assertion re-added only outside the test file 851ms
     ✓ scan-diff finds an added pytest mark skip 829ms
     ✓ scan-diff finds an added unittest skip 993ms
     ✓ scan-diff finds an added bare skip call 707ms
     ✓ scan-diff ignores a quoted skip in a documentation file 696ms
     ✓ scan-diff ignores a marker literal in a non-test source file 811ms
     ✓ scan-diff ignores an assertion whose expectation changed 529ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 558ms
     ✓ scan-diff reports a deleted test file 503ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 569ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1208ms
     ✓ a title that already carries the marker is left alone 956ms
     ✓ with no open PR: pushes the marker commit and edits no title 899ms
     ✓ a re-run is deduped: no second marker commit 1401ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1413ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 422ms
     ✓ --title-set skips gh entirely 684ms
     ✓ refuses dev and main (exit 21) 326ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1532ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2308ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1341ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2141ms
     ✓ continues only the explicitly recorded target through the public merge command 1411ms
     ✓ fetches the unseen feature head before classifying the base 832ms
     ✓ fast forwards the feature before either base path is chosen 2096ms
     ✓ merges divergent feature tips without rebasing either side 1264ms
     ✓ continues the feature merge before starting a dev merge 1757ms
     ✓ publishes local code with a CI running head before bookkeeping 2008ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2818ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1773ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1048ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 628ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 484ms
     ✓ --merge-docs merges dev when docs/ is behind 501ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 636ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 745ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 720ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 888ms
     ✓ --merge-docs skips an empty bkit:generate script 647ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 642ms
     ✓ --merge-docs never merges on dev itself 550ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 693ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 888ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 632ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 761ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 550ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 886ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 987ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1035ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1070ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 775ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1128ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 702ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1017ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 546ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 363ms
     ✓ exits 10 when the fetch fails 367ms
     ✓ refuses --merge-docs with --head, and an unknown --head 319ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 506ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1024ms
     ✓ a failed install stops ship (16) 637ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 479ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 442ms
     ✓ exits 10 when the fetch fails 557ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1432ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1419ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1619ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1312ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2400ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2415ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 357ms
     ✓ local: names unpushed dev as the cause when the branch carries it 408ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 430ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1054ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1089ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 861ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3652ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 801ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 963ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 899ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 603ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1209ms
     ✓ land removes the worktree when only the copied .env is untracked 967ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 836ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1189ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1812ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 919ms
     ✓ landPr refuses a main-based PR without retrying 529ms
     ✓ landPr refuses when the PR base is unknown 515ms
     ✓ PR not open (closed): stops (17) at once, no retry 644ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 392ms
     ✓ --attempt names the merge round in a fix commit 401ms
     ✓ commits a rewritten and a deleted tracked file 825ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 722ms
     ✓ reports undeclared and runs nothing with no scripts 435ms
     ✓ reports undeclared and runs nothing with an empty script 346ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 348ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 359ms

 Test Files  178 passed (178)
      Tests  7711 passed | 2 skipped (7713)
   Start at  14:43:04
   Duration  208.48s (tests 96%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/887-review-doc-starters/build-group-gate-1-2.log.reports/vitest-18547.xml
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
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 234 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 188 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 187 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 196 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 192 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 203 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 76 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 222 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 200 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 201 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 186 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 196 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 200 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 199 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 881 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 495 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 17 ms
ok 19 stub: the response selector is cleared before running its body # in 15 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 22 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 18 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 15 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 21 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 14 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 32 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 48 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 354 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 354 ms
ok 30 refresh drops a file deleted in the index from the build # in 320 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 182 ms
ok 32 a key removed from the env file is unset on the next run # in 164 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 150 ms
ok 34 non-BKIT_ keys are skipped # in 138 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 150 ms
ok 36 a failed unsetenv is retried on the next run # in 167 ms
ok 37 logs key names only, never values # in 146 ms
ok 38 missing env file exits 0 without calling launchctl # in 39 ms
ok 39 the sweep prints the summary line the lane greps for # in 297 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 10 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (110.119459ms)
✔ shell cancellation waits for SIGTERM cleanup (159.473042ms)
✔ direct cancellation waits for SIGINT cleanup (113.863125ms)
✔ shell cancellation waits for SIGINT cleanup (157.047125ms)
✔ direct cancellation waits for SIGHUP cleanup (111.377709ms)
✔ shell cancellation waits for SIGHUP cleanup (155.186875ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (369.696375ms)
✔ shell cancellation follows a worker orphaned by a nested shell (218.705083ms)
✔ direct cancellation preserves a nested machine-lock owner (418.341083ms)
✔ shell cancellation preserves a nested machine-lock owner (461.515166ms)
✔ nested shell cancellation preserves a nested machine-lock owner (455.74225ms)
✔ a hard process-group timeout reaches a shell command during cleanup (86.46075ms)
✔ ships a command-scoped sleep prevention wrapper (0.101042ms)
✔ preserves arguments, output and nonzero exit status (49.443042ms)
✔ runs an entire shell chain and retains its failure (27.729875ms)
✔ reports a missing command as 127 (28.161917ms)
✔ requires a command (23.892791ms)
✔ non-macOS platform selection runs commands without sleep prevention (42.474458ms)
✔ hard timeout escalation reaches a command that ignores TERM (147.349834ms)
✔ forwards POSIX cancellation to the command and releases the assertion (52.966458ms)
✔ holds a real macOS assertion only while the command runs (67.29475ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3292.143417
> [bkit] TRUNCATED — kept 1730 of 3295 lines (132 KB of 256 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
