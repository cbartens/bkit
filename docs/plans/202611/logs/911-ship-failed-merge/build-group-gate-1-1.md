
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 2 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 3 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 4 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 5 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 6 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 7 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 8 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 9 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 10 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 11 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 911-ship-failed-merge build-group-gate-1 is waiting for tests (still, 12 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
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
 631:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 870:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1049:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1161:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1253:74   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1495:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1555:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> bkit ci slop

[bkit-ci] base 1901b02cf1bdd97815a3c7b5963d3d95197097d9 (1901b02cf1bdd97815a3c7b5963d3d95197097d9) vs working tree
[bkit-ci] added 3, resolved 3, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 1901b02cf1bdd97815a3c7b5963d3d95197097d9
base: 1901b02cf1bdd97815a3c7b5963d3d95197097d9
added: 3
resolved: 3
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 7.3 on 10 cores: unit limits 8150ms per test, 16300ms per hook (x1.63)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge
      Coverage enabled with v8

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 1 failed | 2 skipped) 93ms
   ❯ bkit-local-gate-audit (#437) (33)
     ✓ a build close push retry does not repeat workflow close or lose its outputs 7ms
     ✓ every prompt that runs bkit tests changed routes exit 81 to a re-run of the command 2ms
     ✓ no toolchain command is inlined at a call site (2)
       ✓ `pnpm turbo` appears nowhere unexempted — names a task runner instead of a bkit:gate* script 12ms
       ✓ `--filter='...[origin/dev]'` appears nowhere unexempted — turbo affected-selector inlined at a call site 8ms
     ✓ every call site dispatches through a named gate (9)
       ✓ .bkit/templates/.husky/pre-commit runs `pnpm bkit:gate:format` 1ms
       ✓ .bkit/templates/.husky/pre-push runs `bkit ci push-gate --gate=bkit:gate:static-unit` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `bkit ci push-gate --gate=bkit:gate:static` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `bkit ci push-gate --gate=bkit:gate:min` 1ms
       ✓ .bkit/core/prompts/bkit-build-plan-tasks.md runs `--fallback=bkit:gate:static`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-verify.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md runs `pnpm bkit:gate:install-static-unit-build` 0ms
     ✓ every gate a call site names is one install actually seeds 1ms
     ✓ workflows run the local gate only through `bkit tests run` 9ms
     ✓ every tests run call site routes exit 81 to a re-run of its block 18ms
     × every branches push call site routes exit 81 to a re-run of its block 18ms
     ✓ a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt 8ms
     ✓ every `tests run` call site of a workflow is probed 1ms
     ✓ bkit-build.md build-run-tests runs the deepest declared gate (through integration) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-build.md build-group-gate- runs the deepest declared gate (through unit) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-debug.md tests run runs the deepest declared gate (through live) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ✓ routes the engine's gate list where a block passes {GATE_FLAGS} 1ms
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ only debug reaches the live tier, and only its deepest gate carries the `live` word 0ms
     ✓ the seeded gates chain only scripts that exist here or are themselves gates 1ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 41177ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1568ms
     ✓ names each net-new and worsened finding in the log and the JSON 1086ms
     ✓ fails on a net score rise with no net count change 786ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1001ms
     ✓ treats a net score at or below 0.001 as float noise 1168ms
     ✓ passes when the change only resolves findings 761ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 734ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base resolves to HEAD 354ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1287ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 687ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 337ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 918ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1013ms
     ✓ exits 4 on a dropped net field instead of silently passing 1437ms
     ✓ exits 4 on no summary instead of silently passing 807ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1206ms
     ✓ exits 5 when the base worktree cannot be created 360ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1164ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 971ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1073ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1229ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1212ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1730ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1266ms
     ✓ explicit globs can select ignored prose and nested checkout files 523ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 490ms
     ✓ fails (exit 1) when vale reports alerts 523ms
     ✓ exits 6 on a vale runtime error 503ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 544ms
     ✓ falls back to vale sync when the main worktree has none 531ms
     ✓ fails when vale sync cannot restore the required styles 580ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 535ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 477ms
     ✓ is a usage error when the commit cannot be read 304ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 493ms
     ✓ exits 1 naming the code file, whatever the commit message says 534ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 544ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 445ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 1319ms
     ✓ exits 7 when a commit cannot be read 437ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 570ms
     ✓ exits 1 naming the files outside, whatever the commit message says 525ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1107ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 666ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 584ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1069ms
     ✓ a top-level glob in the setting does not reach into folders 495ms
     ✓ a push that changes no files is not proven a min push 524ms
     ✓ exits 7 when a commit or its base cannot be read 488ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 50336ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 665ms
     ✓ adopts the main checkout even when called from a linked worktree 472ms
     ✓ design and plan in place on main are refused 464ms
     ✓ still adopts a cloud session branch whose upstream is main 458ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 1304ms
     ✓ may debug in place on dev 580ms
     ✓ adopts in place when the session is already on feat/{fid} 302ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 1113ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 1002ms
     ✓ a new run of the same FID rewrites startSha 1769ms
     ✓ a resume of the same FID reuses the record 1466ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 1231ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 1016ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 1212ms
     ✓ a stale record without a lock is replaced 1281ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 1226ms
     ✓ refuses inherited unpublished dev commits in every ship mode 4270ms
     ✓ names inherited commits and ship recovery in the refusal 1184ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 1603ms
     ✓ ship names a missing feat branch 406ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 1394ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 398ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 484ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 505ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 510ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 544ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 410ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 307ms
     ✓ never commits an entry only the main checkout's copy list names 500ms
   ✓ bkit worktrees remove (18)
     ✓ preserves a marked worktree with uncommitted changes and its marker 812ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 416ms
     ✓ tells a caller inside the removed worktree where to cd 544ms
     ✓ fails with its own exit code when git cannot remove a marked path 412ms
     ✓ --branch (12)
       ✓ preserves staged-only content during landed cleanup 1323ms
       ✓ preserves staged-only mode during landed cleanup 1439ms
       ✓ preserves staged-only type during landed cleanup 1427ms
       ✓ preserves staged-only deletion during landed cleanup 1348ms
       ✓ removes landed staged content when both index and working contents are on dev 1496ms
       ✓ deletes the proved local and remote branch at their landed tips 1690ms
       ✓ retains the remote branch when origin refuses its conditional deletion 2710ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 638ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 522ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 383ms
   ✓ bkit worktrees setup --detect (3)
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 420ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 1362ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (153 tests) 52756ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 827ms
   ✓ resolveGate (6)
     ✓ no package.json, no scripts, or unparseable -> null 458ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 639ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 958ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 491ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 702ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 507ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 406ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1103ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 546ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1427ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 496ms
     ✓ PASS is 0 failures with or without reports 878ms
     ✓ clears a previous attempt's reports before the gate runs 912ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 950ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 835ms
     ✓ a log under the outbox is named main-checkout relative in the record 1266ms
     ✓ a log small enough is copied whole: not clamped, raw null 925ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 957ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1176ms
     ✓ numbers runs within the workflow's active run and per step 649ms
     ✓ without --file no row is written and the output carries row null 566ms
   ✓ bkit tests plan-check (35)
     ✓ plan-check accepts a matrix that maps every test-bearing task 375ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 1034ms
     ✓ a planned test that passes is a vacuous gap, exit 1 627ms
     ✓ a planned test absent from a loaded report is a missing gap 591ms
     ✓ a file that fails to load is a red of kind red-not-loaded 757ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 969ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 392ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1054ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 857ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 626ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1385ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 991ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1221ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 939ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1153ms
     ✓ green: a passed-accepted test is already landed, not a gap 747ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 982ms
     ✓ green: not enforced (exit 0, report says why) when the test-file script is undeclared 309ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1031ms
     ✓ green: --group audits only that group's tasks 761ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1319ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1101ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 884ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 910ms
     ✓ green: lists each gap kind, with the runner output 920ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1500ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 631ms
       ✓ green clears an exception-only task from a human commit 595ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (128 tests) 57065ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 735ms
   ✓ progress command output (4)
     ✓ finish prints progressLine 311ms
     ✓ done prints progressLine 517ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 573ms
     ✓ done --group writes group on the row 489ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 717ms
     ✓ carries extra fields, parsed as JSON when they are JSON 427ms
     ✓ reports a failed commit with exit 8 without writing the row 1363ms
     ✓ a failed commit leaves no row staged in the index 1476ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1031ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 964ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1189ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 732ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1318ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 362ms
     ✓ --ref reads the status file as committed on that ref, not from disk 441ms
     ✓ --ref exits 3 when the ref does not carry the status file 418ms
     ✓ fails on a placeholder left in the artifact 389ms
     ✓ fails when the row's verdict differs from the artifact's 476ms
     ✓ fails when the row does not list the artifact, or carries another attempt 463ms
     ✓ fails on a missing artifact 402ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 364ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 393ms
     ✓ fails a run-tests row missing its scope, and an empty scope 567ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 576ms
     ✓ text output leaves out the row and passing checks, and prints parentSha 394ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 563ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 392ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 760ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 1046ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 672ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 823ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1227ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 871ms
     ✓ --post needs --number; without --post there is no tracker key 301ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 440ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 1007ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 679ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 482ms
     ✓ --attempt-of checks the row carries the derived counter 466ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1429ms
     ✓ writeStepRow refuses when a recorded path changed 1618ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 604ms
     ✓ writeStepRow appends its commit sha to the record 1207ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1441ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 463ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 877ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 822ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 481ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1138ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 951ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 700ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 579ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1473ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 414ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 590ms
     ✓ does not count an artifact the run found committed when it started 749ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 425ms
     ✓ commits a package.json change outside bkit.workflows 827ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1407ms
   ✓ bkit steps stub --result-file (12)
     ✓ renders and verifies the header of every prompt that declares one 329ms
     ✓ retains special verdict judgments and legacy stub behavior 376ms
     ✓ derives audit IDs totals ledger payloads and coverage from one result 315ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 67580ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2536ms
     ✓ runs code.ts through its declared gate in the built checkout 2135ms
     ✓ runs code.ts through its declared gate in the built checkout 1964ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1543ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1560ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1677ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 917ms
     ✓ runs the full gate for replayed debug code 1697ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1794ms
     ✓ installs local dependencies against the built target tree 2068ms
     ✓ runs the configured frozen install even without root dependencies 1924ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2077ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2127ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2506ms
     ✓ never pushes local dev commits missing from origin/dev 2359ms
     ✓ dev moved: rebuilds on the new dev and pushes again 4017ms
     ✓ dev moved before every push: exhausted, nothing landed 6793ms
     ✓ any other refusal is returned, not retried 2398ms
     ✓ pushToDev replays a commit range onto origin/dev 2502ms
     ✓ a replay retries on the new dev when dev moved 3604ms
     ✓ pushToDev log line names what it lands 2376ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2341ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2675ms
     ✓ a push that fails without a server answer is returned once, never retried 2432ms
     ✓ a failed fetch is returned before anything is built 789ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2934ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1981ms
     ✓ lands from a clone whose fetch refspec omits dev 2855ms
     ✓ build throwing stops the landing and removes the throwaway checkout 969ms
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
     ✓ path containing a space is staged and committed 453ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 417ms
     ✓ staging failure: exit 4 and no commit is created, no false success 345ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 303ms
     ✓ --mode=stage stages the sweep but creates no commit 366ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 518ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 311ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1231ms
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
     ✓ returns durable append receipt and permits a deliberate same-key update 323ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 708ms
 ❯ .bkit/core/engine/tools/instructions.test.ts (103 tests | 1 failed) 95726ms
   ❯ the corpus matches the instructions store (8)
     ✓ finds prompts, workflows, both rules files, and every audit template with its adopted copy 5ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ every prompt, workflow and utility agent has the three header blocks 855ms
     ✓ sync has nothing left to rewrite 26247ms
     × every clause reaches the cut-off of one surface it applies to 2831ms
   ✓ the rule groups the Rules clauses name exist (4)
     ✓ both groups appear once under bkit Rules, Universal first 1ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ the retired scoped policy is not restated as current 0ms
   ✓ the checker rejects what it should (22)
     ✓ a missing required clause fails 1ms
     ✓ a duplicated clause fails 1ms
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
     ✓ a sentence a doc holds below bkit:end never counts toward the doc cut-off 0ms
     ✓ AGENTS.md and the plan template count toward the doc cut-off and take doc modes 0ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ one drifted copy does not hide a sentence the other prompts share 0ms
     ✓ a fragment after ; is its own sentence for the cut-off 0ms
     ✓ a sentence shared by 2 workflows but not listed fails; one workflow fewer passes 0ms
     ✓ each surface keeps its own cut-off: prompts and workflows never pool 0ms
     ✓ headings, HTML comments, and table rows never count toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ a required clause is checked inside the managed block only 0ms
     ✓ a near-copy in an audit template is flagged and sync rewrites the template and its adopted copy alike 1ms
     ✓ a sentence shared by 2 audit templates but not listed fails 0ms
     ✓ an adopted copy never counts twice toward the cut-off 0ms
     ✓ text below `bkit:end` never counts toward the cut-off 0ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
   ✓ templates (3)
     ✓ an anchored line may match any one of several templates 0ms
     ✓ a drifted anchored line fails 0ms
     ✓ a line two overlapping templates both fit counts once 0ms
   ✓ header blocks (7)
     ✓ each clause in its block, in wording-file order, passes; local lines in between allowed 1ms
     ✓ two swapped lines in one block fail 1ms
     ✓ a clause in the wrong block fails 1ms
     ✓ a placed clause in the body fails 1ms
     ✓ a CAUTION box, a missing block and blocks out of order fail 0ms
     ✓ files outside prompts, workflows and repo agents need no blocks 0ms
     ✓ the wording file takes block and position: first, and rejects anything else 2ms
   ✓ rule copies outside the Rules block (2)
     ✓ a rule's copy in Protocol or Contract fails, a cut-short copy included 7ms
     ✓ a line sharing only the rule's label, and the Rules block copy, pass 4ms
   ✓ fully retired clauses (6)
> [bkit] TRUNCATED HERE — 59 lines omitted. Dropped content was NOT read.
   ✓ best effort comment friction (4)
     ✓ records redacted exhausted comment friction with authorized fields 512ms
     ✓ continues after friction and diagnostic writes fail without recursion 427ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 564ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 3500ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 425ms
     ✓ starts only new source after overflow or missing source 372ms
     ✓ uses exact new comment after a failed eligibility read 331ms
   ✓ bounded nonfatal publication (10)
     ✓ recognizes append success within budget without unnecessary resend 311ms
     ✓ preserves a human correction after lost append recognition and a later report 323ms
     ✓ contains exhausted append and create failures without fabricated success 384ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 344ms
     ✓ reserves new comment opportunity within total delivery budget 886ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 438ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 670ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 486ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 995ms
     ✓ fetches the issue and its comments as GitHub returns them 518ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 886ms
     ✓ invalidates missing corrupt and unsupported progress cache 2326ms
     ✓ contains cache read and write failures as standalone degradation 993ms
     ✓ uses legacy receipts and contains receipt failures 1236ms
     ✓ skips issue-less runs and tracker none 470ms
     ✓ records an engine-action row and skips the same key + body on a re-run 1022ms
     ✓ a recent identical comment counts as done (the final close comment) 925ms
     ✓ a failed post reports done false with the reason and never leaks a token 986ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 835ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 1117ms
     ✓ a different marker hash posts 945ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 1749ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (114 tests) 52248ms
   ✓ bkit prs open (36)
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 451ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 607ms
     ✓ retries a failed create once, and exits 5 when it fails twice 602ms
     ✓ exits 5 when the open-PR probe errors 451ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 516ms
     ✓ prs open still opens against any other base 445ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 431ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 806ms
     ✓ exits 4 when gh errors and 80 when it needs auth 667ms
   ✓ bkit prs scan-body (10)
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 320ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 423ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 481ms
     ✓ runs no merge when the PR is already MERGED 621ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1124ms
     ✓ prs merge refuses a PR whose base is main 446ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 720ms
     ✓ prs merge refuses when the PR base is unknown 443ms
     ✓ prs merge reads the base from the one pr view it already makes 764ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 1360ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 466ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 758ms
     ✓ never reads dev's required checks without --only-if-required 1209ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 1385ms
     ✓ is not green when a check failed, naming it (exit 1) 1026ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1016ms
     ✓ is not green on an empty rollup (total 0) 1025ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1062ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 945ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 855ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ rejects ambiguous cross-repository and malformed attempt references 307ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1269ms
     ✓ freezes explicit workflow run attempt and all failed job pages 963ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2149ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2796ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1872ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 2818ms
     ✓ checks the named repository base and fails closed on missing evidence 1360ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 1198ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 1256ms
     ✓ rejects MCP capstone jobs belonging to another run 1788ms
     ✓ --fetch refreshes origin/<branch> before gating 845ms
     ✓ tells an API error (20) from no run (10) 335ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 353ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 721ms
       ✓ a source change past the validated head refuses (17) and names the path 790ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 752ms
       ✓ --validated without --month / --fid is a usage error (2) 539ms
       ✓ a validated sha that is not an ancestor refuses (17) 608ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 595ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1502ms
     ✓ a failed re-trigger push names the cause in the log 1622ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1530ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 2743ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1287ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 767ms
     ✓ gh-error: every poll errored 602ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 1119ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1113ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1301ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1218ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 3335ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3678ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 1340ms
     ✓ re-trigger on dev only uses the record of its own FID 1290ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1093ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 388ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 585ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 400ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 533ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 647ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 665ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 561ms
     ✓ --file and --step go together 512ms
   ✓ bkit runs handoff (1)
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1728ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1005ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 688ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 382ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 497ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 497ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 400ms
     ✓ --file into a missing directory is refused, not created 466ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1874ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 800ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1786ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 790ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 727ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 601ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 871ms
     ✓ an unpinned repo reports nulls and asks no registry 596ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 391ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 469ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 545ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 529ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 809ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2716ms
     ✓ a refused dev push is logged, never fails the close 2603ms
     ✓ an unreachable remote is logged, never fails the close 986ms
 ✓ .bkit/core/engine/commands/workflow/tests-changed.test.ts (12 tests) 6945ms
   ✓ changedFiles (2)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1014ms
     ✓ counts files committed since --base 756ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 672ms
     ✓ runs nothing and exits 0 when no file changed 378ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 640ms
> [bkit] TRUNCATED HERE — 35 lines omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 387ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1359ms
     ✓ runGit names ENOBUFS when output passes the limit 1720ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1750ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 826ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1661ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 462ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (101 tests) 15809ms
   ✓ bkit issues labels (25)
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
   ✓ bkit locks acquire --kind=workflow — a lock already there (7)
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 371ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 341ms
     ✓ with no status log, a lock of any age is reclaimed as orphaned 330ms
   ✓ bkit locks release (5)
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 966ms
     ✓ passes every rule on a clean head 385ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 501ms
 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (299 tests) 1060ms
 ✓ .bkit/core/engine/commands/workflow/run-facts.test.ts (47 tests) 3651ms
> [bkit] TRUNCATED HERE — 698 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 381 lines omitted. Dropped content was NOT read.
     ✓ passes actionlint 307ms
   ✓ ship gate against the template's job names (2)
     ✓ refuses when the template's capstone job fails 447ms
 ✓ .bkit/core/engine/checks/tips/index.test.ts (28 tests) 1944ms
   ✓ tipsBase (4)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 27 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 549ms
     ✓ resolves config from the repo root when run from a subdirectory 373ms
     ✓ exits 6 when the PUT fails 380ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 335ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 390ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 367ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 371ms
     ✓ exits 6 when the api answer is not JSON 540ms
 ✓ .bkit/core/engine/audits/templates/context-templates.test.ts (89 tests) 1500ms
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.

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

 ✓ .bkit/core/engine/install/project-docs.test.ts (14 tests) 163ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 243ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 92ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 63ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 169ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 85ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 76ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests) 16041ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 332ms
     ✓ (V1) keeps the reuse checklist when the write CREATES the file (pre-write snapshot) 418ms
     ✓ dedups: second write to the same file in the same session emits nothing 355ms
     ✓ warns again for a different file in the same session 801ms
   ✓ gateguard opencode plugin — deny mode (2)
     ✓ throws with advisory text on first write (blocks edit) 313ms
     ✓ allows retry (second call is a no-op after dedup marked) 392ms
   ✓ gateguard opencode plugin — subagents are NOT exempt (3)
     ✓ a subagent session editing a file DOES get the advisory (exemption removed) 318ms
     ✓ orchestrator session gets the advisory too — same treatment either way 502ms
   ✓ gateguard opencode plugin — gate-config advisory (9)
     ✓ tsconfig.json triggers config advisory 335ms
     ✓ flags vitest.config.ts as gate config 380ms
     ✓ flags eslint.config.mjs as gate config 470ms
     ✓ flags .prettierrc as gate config 339ms
     ✓ flags slop-scan.config.json as gate config 305ms
     ✓ source file is not treated as gate config 527ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 342ms
   ✓ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 1101ms
     ✓ patch (v1 driver): checks every Add / Update / Move-to / Delete target 1075ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 903ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 804ms
     ✓ deny mode blocks when any patch target is a first touch, and records all of them 764ms
     ✓ deny mode still blocks when only one of several patch targets is new to the session 472ms
   ✓ dual driver shape (OpenCode 1.x server() + 2.0 setup()) (6)
     ✓ both drivers emit the same advisory for the same edit 466ms
     ✓ deny mode blocks the first touch on BOTH drivers 474ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 82ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 28ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 61ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 83ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (52 tests) 52ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 60ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 64ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > repeat harvest of same rows does not duplicate (idempotent)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app/.bkit/friction.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app/.bkit/friction.jsonl — pruned 1 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 1, kept in repos: 0
[bkit-harvest] 1 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app/.bkit/stats.jsonl — copied 1 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app/.bkit/friction.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-yqgpII/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 1, entities after fold: 2, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 42ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > rows with different identity keys are preserved (not over-deduped)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-w6coF5/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/cli.test.ts (151 tests) 193ms
stderr | scripts/harvest/ledgers.test.ts > Harvest dedup by per-kind composite identity (WS4-T2) > store keeps both same-key rows; the fold reads the later one (higher ts)
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/consumer-app/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/consumer-app/.bkit/friction.jsonl — copied 2 rows (malformed: 0)
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-xSKXpz/consumer-app/.bkit/friction.jsonl — pruned 2 harvested row(s)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 1, pruned from repos: 2, kept in repos: 0
[bkit-harvest] 2 row(s) now exist ONLY in harvest/ (gitignored, not backed up by bkit).

stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > skips a half-written trailing line without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/consumer-app/.bkit/stats.jsonl — copied 2 rows (malformed: 1)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-oB92zd/consumer-app/.bkit/stats.jsonl — kept 1 line(s) not in the store (malformed, or appended after the copy)
[bkit-harvest] Done — total rows collected: 2, entities after fold: 2, pruned from repos: 0, kept in repos: 1

 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 31ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles entirely empty .jsonl file without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 0)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-lFPQeN/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 534ms
stderr | scripts/harvest/ledgers.test.ts > Harvest tolerant-tail: half-written tail is skipped+counted (WS4-T2) > handles a file with only malformed lines without throwing
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0
[bkit-harvest] Found 1 consumer(s) in harvest/consumers.md
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit/.bkit/stats.jsonl — not found, skipping
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] Harvesting: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app/.bkit/stats.jsonl — copied 0 rows (malformed: 2)
[bkit-harvest] /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app/.bkit/friction.jsonl — not found, skipping
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/bkit — falling back to path-derived slug "bkit". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] no git remote at /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-harvest-unit-fCrZaN/consumer-app — falling back to path-derived slug "consumer-app". This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.
[bkit-harvest] Done — total rows collected: 0, entities after fold: 0, pruned from repos: 0, kept in repos: 0

 ✓ scripts/harvest/ledgers.test.ts (7 tests) 1084ms
   ✓ Harvest dedup by per-kind composite identity (WS4-T2) (3)
     ✓ repeat harvest of same rows does not duplicate (idempotent) 331ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 52ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
(node:9887) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:9887) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:9887) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:9887) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 117ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 38ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 24ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 1022ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 989ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 131ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 2453ms
   ✓ repoConfigFile (3)
     ✓ answers for the cwd, not an inherited GIT_DIR 435ms
   ✓ guardRepoConfig (6)
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 377ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 387ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 399ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 157ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 38ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 29ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 24ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 14ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 50ms
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:92921) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 17855ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 451ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 8241ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 7791ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 435ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 79ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 44ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 406ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 19ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 13563ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 592ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 509ms
     ✓ follows summary cursors even when the first page is shorter than the limit 718ms
     ✓ reports excluded intervals as unread even when pagination finishes 523ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 593ms
     ✓ reports an unread remainder at the page cap 478ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 877ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 822ms
     ✓ rejects missing summaries instead of treating them as empty results 841ms
     ✓ reports a failed first page as unavailable 424ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 650ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1066ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 697ms
     ✓ follows summary cursors even when the first page is shorter than the limit 596ms
     ✓ reports excluded intervals as unread even when pagination finishes 637ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 561ms
     ✓ reports an unread remainder at the page cap 731ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 541ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 354ms
     ✓ rejects missing summaries instead of treating them as empty results 486ms
     ✓ reports a failed first page as unavailable 518ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 342ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 37ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 33ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 20ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 47ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 12ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 22ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 160ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 32ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1533ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 11ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 159ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 107ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 43ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 11ms
[feat/test 2cbf7be] gate
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 49ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 7ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 18ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 12105ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 12089ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 13291ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 32449ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3518ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2971ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 481ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 585ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 541ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 498ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 3592ms
     ✓ does not fall back through a malformed later success receipt 1734ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1239ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1088ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2097ms
     ✓ requires proof even when the pushed increment changes no files 1404ms
     ✓ ignores malformed receipts 1439ms
     ✓ does not record a tracked tree 771ms
     ✓ does not record a untracked tree 597ms
     ✓ does not record a mutated tree 698ms
     ✓ does not record a committed tree 758ms
     ✓ records no proof for a failed gate or lighter gate 1253ms
     ✓ requires integration proof when integration is declared 1518ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3087ms
     ✓ invalidates proof when the gate definition changes 1645ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 924ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 25456ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 19597ms
     ✓ every fence parses under zsh -n 5772ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (162 tests) 178188ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 557ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 2307ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 423ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 357ms
     ✓ writes no limits for a workflow with no ask point 430ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 378ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 443ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 487ms
       ✓ a new run in the same chat gets its own session row 499ms
       ✓ writes none outside Claude Code 409ms
     ✓ opens the next run after a finished one, and after another workflow's run 433ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 383ms
     ✓ design / plan / build / debug book in the current worktree 410ms
     ✓ refuses when the lock is live, writing no row 318ms
     ✓ --lock-held checks the lock is ours 379ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 581ms
   ✓ bkit workflows start — resume facts (8)
     ✓ a new run has no last step and no open decision 388ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 316ms
     ✓ an OPEN decision of an earlier run never resurfaces 413ms
     ✓ openDecision gate is null without the header 324ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 433ms
     ✓ writes no row when status.jsonl does not exist 343ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 412ms
     ✓ aborts a rebase only when one is in progress 898ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 568ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 700ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 393ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 452ms
     ✓ --max-exceeded says a handover is due without any sentinel 353ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 343ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 409ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 424ms
     ✓ a debug run in SOAK mode always needs a handover 333ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 966ms
       ✓ counts subagents of an earlier chat the run's session rows name 993ms
       ✓ records no context block, and still closes, outside a Claude Code session 926ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 953ms
     ✓ records ending held and publish false on the workflow-done row 1255ms
     ✓ defaults the close row to ending done 1001ms
     ✓ refuses an unknown ending 388ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 1150ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 988ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 1015ms
     ✓ always writes the telemetry, whatever the runtime 893ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 790ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 881ms
     ✓ an unwritable stats path is logged and never fails the close 945ms
     ✓ appends the completeness row before the workflow-done row 1565ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 1178ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 1039ms
     ✓ writes one completeness row per close 1746ms
     ✓ leaves out the previous run's rows that share a second with this run's start 1054ms
     ✓ still closes when the completeness check throws 997ms
     ✓ still closes when the completeness row write throws 1050ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1261ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1572ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 907ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 689ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1145ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1113ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1224ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1609ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1226ms
     ✓ --record-step writes the close step's row before workflow-done 999ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 988ms
     ✓ --number without --outbox is a usage error 1107ms
     ✓ --flush is ship only 680ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1272ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1331ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1297ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1226ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1000ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 490ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 418ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 3158ms
     ✓ --flush with nothing to record commits and pushes nothing 1731ms
     ✓ --flush carries the named worktree's logs into the dev commit 2844ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 3455ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3420ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4646ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3638ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3523ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2752ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2944ms
     ✓ --push on dev never carries a row whose references name another feature 3202ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2159ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6593ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 3166ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1723ms
     ✓ rejects --push with --flush, and --flush outside ship 328ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 4538ms
     ✓ preserves unlanded file deletions and ledger additions on close 8123ms
     ✓ preserves dirty work and uncertain branch evidence during close 7520ms
     ✓ preserves a local feature ref changed after its cleanup proof 7400ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 3737ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3149ms
     ✓ a close that landed releases the lock 3993ms
     ✓ removes the worktree before it releases the lock 3772ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5668ms
       ✓ closePr refuses when the PR base is unknown 2929ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1819ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 660ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 406ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1162ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 489ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 405ms
     ✓ a second run's record does not let this FID's close commit 527ms
     ✓ record is present after workflows close and before the push 863ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1572ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 314ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 312ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 622ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 487ms
     ✓ puts each --line after the summary, in flag order 522ms
     ✓ --summary prints the file and keeps a copy in --outbox 463ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 431ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 259444ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 878ms
     ✓ rejects missing explicit and ambiguous existing branch selections 782ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1179ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1176ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 775ms
     ✓ a refused --continue carries git's own reason 939ms
     ✓ --file records nothing for a refused rebase 696ms
     ✓ refuses a code conflict and aborts the rebase on the spot 642ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1937ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 715ms
     ✓ produces byte-identical output to merge=union 1541ms
     ✓ restores a trailing newline so the next append starts on its own line 822ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 983ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1244ms
     ✓ refuses a union that leaves a line which is not JSON 677ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 989ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1503ms
     ✓ refuses a lockfile whose regenerate command fails 1269ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1483ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1437ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1427ms
     ✓ refuses and aborts when both sides changed the hand-written region 1176ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1041ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1341ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1546ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 886ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1048ms
     ✓ refuses and aborts when a side deleted the install record 907ms
     ✓ refuses a conflicted doc the repo's script does not list 814ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 867ms
     ✓ removes a stale sentinel when the rebase succeeds 1300ms
     ✓ exits 4 when no rebase is in progress 327ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1434ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1288ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 683ms
       ✓ skips (12) with no anchor 677ms
       ✓ skips (12) when the base is unreachable in this clone 722ms
       ✓ skips (12) when nothing landed since the base 624ms
       ✓ runs (0) with the landed path count once dev moved 1451ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 662ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1343ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 754ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 993ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1604ms
     ✓ runs exactly one git push 1390ms
     ✓ --set-upstream records the upstream 1320ms
     ✓ refuses with no branch checked out 819ms
     ✓ --mode=dev refuses a feature checkout 829ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 2188ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 3341ms
     ✓ --require-ci pushes as-is when dev has not moved 1269ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2016ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2993ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 895ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1286ms
     ✓ --mode=abort pushes when the branch has no open PR 1307ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1433ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 688ms
     ✓ --open-pr carries the MCP answer and skips gh 926ms
     ✓ --mode=abort on dev pushes plainly without probing 969ms
     ✓ rejects an unknown mode 714ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3137ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1822ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2692ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4713ms
     ✓ skip-ci HEAD on the replay is refused 1689ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2925ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4280ms
     ✓ a level local dev is a plain push, recording nothing extra 1493ms
     ✓ a record with no commits pushes nothing 1446ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 732ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1877ms
     ✓ a rewritten branch is refused, never forced 884ms
     ✓ refuses dev and main with exit 21 and pushes nothing 677ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2004ms
     ✓ refuses a detached HEAD (exit 5) 954ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1903ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1893ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1483ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2045ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 904ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2112ms
     ✓ an up-to-date branch is a no-op 1477ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2068ms
     ✓ a fetch that fails exits 10 934ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1186ms
     ✓ scan-diff still reports a new skip when its test … 1382ms
     ✓ scan-diff reports a skip moved onto a different t… 1193ms
     ✓ scan-diff does not cancel a skip moved between am… 1056ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1042ms
     ✓ scan-diff recognizes a renamed test file 1048ms
     ✓ scan-diff recognizes a suite moved into a differe… 1147ms
     ✓ scan-diff does not let unrelated additions hide a… 970ms
     ✓ scan-diff attributes deletion to its old test ins… 1393ms
     ✓ scan-diff consumes each moved assertion once and … 933ms
     ✓ scan-diff does not match identical assertions fro… 991ms
     ✓ scan-diff does not match the same leaf test name … 987ms
     ✓ scan-diff does not match a same-named test with d… 936ms
     ✓ scan-diff does not match a same-named test with c… 1097ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1228ms
     ✓ --paths with no match exits 1 905ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 679ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1346ms
     ✓ --marker reads a diff over 1 MiB 1118ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1114ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 975ms
     ✓ scan-diff finds an added skip 1087ms
     ✓ scan-diff ignores a skip predating the base 943ms
     ✓ scan-diff reports a disabled test with its line 944ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1170ms
     ✓ scan-diff ignores a removed comment in a test file 1127ms
     ✓ scan-diff ignores an assertion moved within the file 990ms
     ✓ scan-diff still reports a removed assertion 1222ms
     ✓ scan-diff reports an assertion re-added only outside the test file 960ms
     ✓ scan-diff finds an added pytest mark skip 1049ms
     ✓ scan-diff finds an added unittest skip 1001ms
     ✓ scan-diff finds an added bare skip call 898ms
     ✓ scan-diff ignores a quoted skip in a documentation file 867ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1150ms
     ✓ scan-diff ignores an assertion whose expectation changed 953ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1467ms
     ✓ scan-diff reports a deleted test file 1252ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 1172ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1791ms
     ✓ a title that already carries the marker is left alone 1142ms
     ✓ with no open PR: pushes the marker commit and edits no title 1029ms
     ✓ a re-run is deduped: no second marker commit 1219ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1359ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 483ms
     ✓ --title-set skips gh entirely 819ms
     ✓ refuses dev and main (exit 21) 396ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1748ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2526ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1308ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2806ms
     ✓ continues only the explicitly recorded target through the public merge command 1739ms
     ✓ fetches the unseen feature head before classifying the base 1017ms
     ✓ fast forwards the feature before either base path is chosen 1893ms
     ✓ merges divergent feature tips without rebasing either side 1186ms
     ✓ continues the feature merge before starting a dev merge 1813ms
     ✓ publishes local code with a CI running head before bookkeeping 2030ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2818ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1773ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1280ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 357ms
     ✓ Path B once dev moved; --head checks a given commit 522ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 518ms
     ✓ --merge-docs merges dev when docs/ is behind 638ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 598ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 831ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 820ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 701ms
     ✓ --merge-docs skips an empty bkit:generate script 674ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 562ms
     ✓ --merge-docs never merges on dev itself 497ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 701ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 690ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 642ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 698ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 376ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 901ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 876ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1052ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 941ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 865ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1105ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 818ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 986ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 651ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 456ms
     ✓ refuses --merge-docs with --head, and an unknown --head 316ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 602ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 994ms
     ✓ a failed install stops ship (16) 646ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 574ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 560ms
     ✓ exits 10 when the fetch fails 429ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded file type changes in the shared landed comparison 304ms
   ✓ branches land (28)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1411ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1391ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1381ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1394ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2801ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3253ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 526ms
     ✓ local: names unpushed dev as the cause when the branch carries it 606ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 647ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1640ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1557ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1072ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4892ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1789ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1657ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1399ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 762ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1781ms
     ✓ land removes the worktree when only the copied .env is untracked 1470ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1220ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1573ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2123ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1388ms
     ✓ landPr refuses a main-based PR without retrying 580ms
     ✓ landPr refuses when the PR base is unknown 555ms
     ✓ PR not open (closed): stops (17) at once, no retry 678ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 486ms
     ✓ --attempt names the merge round in a fix commit 507ms
     ✓ commits a rewritten and a deleted tracked file 522ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 474ms
     ✓ reports undeclared and runs nothing with no scripts 331ms
     ✓ reports undeclared and runs nothing with an empty script 345ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 409ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 481ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 329ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/tools/instructions.test.ts > the corpus matches the instructions store > every clause reaches the cut-off of one surface it applies to
AssertionError: expected [ 'workflow-try-again-return', …(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "workflow-try-again-return",
+   "workflow-round-read-back",
+ ]

 ❯ .bkit/core/engine/tools/instructions.test.ts:237:36
    235|     // The cut-off works both ways: a clause used by fewer files belon…
    236|     // those files, not in the store.
    237|     expect(underusedClauseNames()).toEqual([]);
       |                                    ^
    238|   });
    239| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > every branches push call site routes exit 81 to a re-run of its block
AssertionError: bkit-ship.md: expected [ { …(2) }, { …(2) }, { …(2) }, …(3) ] to have a length of 7 but got 6

- Expected
+ Received

- 7
+ 6

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:282:32
    280|       const body = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow),…
    281|       const routes = commandRoutes(body, /\bbranches push\b/);
    282|       expect(routes, workflow).toHaveLength(sites);
       |                                ^
    283|       for (const { block, route } of routes) {
    284|         expectWaitRoute(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  2 failed | 174 passed (176)
      Tests  2 failed | 7589 passed | 2 skipped (7593)
   Start at  17:13:03
   Duration  262.09s (tests 96%, transform 1%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/911-ship-failed-merge/build-group-gate-1-1.log.reports/vitest-4524.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.48 |    82.25 |   94.36 |   89.93 |                   
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
 engine/commands   |    88.6 |    83.33 |   93.29 |    90.1 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |    90.7 |    86.31 |   96.42 |   94.53 | ...18-821,868-883 
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
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 253,364           
  steps.ts         |   88.86 |    81.75 |    92.3 |   90.76 | ...2351,2353,2397 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.03 |    90.27 |    94.2 |   96.33 | ...32-638,661,684 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-base.ts    |   24.39 |    26.61 |   22.22 |    21.8 | 121-130,157-319   
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.82 |    89.88 |   96.53 |    98.2 | ...2240,2336-2338 
  tracker.ts       |   89.49 |    81.22 |   96.77 |   91.56 | ...2159,2185-2190 
  workflows.ts     |   93.49 |    82.77 |    97.4 |    95.1 | ...1773,1947,2679 
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
Statements   : 88.48% ( 20634/23320 )
Branches     : 82.25% ( 16010/19465 )
Functions    : 94.36% ( 3281/3477 )
Lines        : 89.93% ( 18117/20145 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1849 of 3684 lines (141 KB of 283 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
