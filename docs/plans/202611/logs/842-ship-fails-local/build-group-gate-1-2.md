
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/165 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

 .bkit/core/.bkit/README.md
 342:1  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/cloud.md
 449:178  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/install.md
 19:1     warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 135:1    warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 353:290  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 361:1    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


 .bkit/core/.bkit/jsonl.md
 196:3    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 265:4    warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 419:106  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/pipeline.md
 144:227  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/providers.md
 47:301   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 177:787  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 184:120  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 186:172  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 448:97   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 824:80   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/templates.md
 504:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 626:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 699:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


 .bkit/core/.bkit/trackers.md
 19:5    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 182:97  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 245:3   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 


 .bkit/core/.bkit/workflows.md
 96:383    warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 101:488   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 138:511   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 164:246   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 620:121   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 859:183   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1036:108  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1144:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1305:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1363:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

✖ 0 errors, 47 warnings and 0 suggestions in 150 files.
passed: true
skipped: null
files: 150

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> bkit ci slop

[bkit-ci] base 75d1d0f1f392daa42dddae7c7a6be73ecfb3ea3d (75d1d0f1f392daa42dddae7c7a6be73ecfb3ea3d) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 75d1d0f1f392daa42dddae7c7a6be73ecfb3ea3d
base: 75d1d0f1f392daa42dddae7c7a6be73ecfb3ea3d
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 3.1 on 10 cores: unit limits 6050ms per test, 12100ms per hook (x1.21)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
      Coverage enabled with v8

 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (257 tests) 1341ms
   ✓ issue-less runs (68)
     ✓ build: fids resolve and steps gate carry --issue in every workflow 304ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (75 tests) 2117ms
   ✓ check — hole classes (26)
     ✓ a tracker-none run that journals every rendered call is CLEAN 301ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (292 tests) 608ms
 ✓ .bkit/core/engine/commands/lib.test.ts (69 tests) 2798ms
   ✓ runGit / runTool output limit (5)
     ✓ runGit names ENOBUFS when output passes the limit 955ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 958ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (100 tests) 220ms
stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 330ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 9649ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 316ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 345ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 20341ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 334ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 711ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 397ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 408ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 354ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 405ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 338ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 310ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 497ms
     ✓ --path records its commit on the run's record, like every other commit mode 479ms
     ✓ a recorded ledger commits only the rows the run appended 713ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 886ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 740ms
     ✓ commitBookkeeping refuses when a recorded path changed 493ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 661ms
     ✓ under --mode=commit counts the squashed paths as something to commit 605ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 403ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 406ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 414ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 453ms
     ✓ a source file in the range: exit 7, path listed 367ms
     ✓ another FID's plan file in the range: exit 7 381ms
     ✓ from not an ancestor of to: exit 7 341ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (115 tests) 36661ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 433ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 304ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 432ms
     ✓ carries extra fields, parsed as JSON when they are JSON 308ms
     ✓ reports a failed commit with exit 8 without writing the row 768ms
     ✓ a failed commit leaves no row staged in the index 1031ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1602ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 1260ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 935ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 1114ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1220ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 301ms
     ✓ --ref exits 3 when the ref does not carry the status file 325ms
     ✓ fails on a placeholder left in the artifact 300ms
     ✓ fails when the row's verdict differs from the artifact's 313ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 419ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 446ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 369ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 496ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 604ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 515ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 516ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 786ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 474ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 466ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 318ms
     ✓ --attempt-of checks the row carries the derived counter 315ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 637ms
     ✓ writeStepRow refuses when a recorded path changed 611ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 319ms
     ✓ writeStepRow appends its commit sha to the record 524ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1868ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (9)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 471ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 482ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 883ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 692ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 346ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1033ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 381ms
     ✓ does not count an artifact the run found committed when it started 450ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 486ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 823ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 39231ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1352ms
     ✓ names each net-new and worsened finding in the log and the JSON 1271ms
     ✓ fails on a net score rise with no net count change 783ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 632ms
     ✓ treats a net score at or below 0.001 as float noise 759ms
     ✓ passes when the change only resolves findings 1204ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1554ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1132ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 402ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1157ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 997ms
     ✓ exits 4 on a dropped net field instead of silently passing 1225ms
     ✓ exits 4 on no summary instead of silently passing 769ms
     ✓ exits 4 on output that is not JSON instead of silently passing 828ms
     ✓ exits 5 when the base worktree cannot be created 313ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1229ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 977ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 960ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 980ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 922ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1720ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 732ms
     ✓ explicit globs can select ignored prose and nested checkout files 539ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 773ms
     ✓ fails (exit 1) when vale reports alerts 1143ms
     ✓ exits 6 on a vale runtime error 996ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 1390ms
     ✓ falls back to vale sync when the main worktree has none 1503ms
     ✓ fails when vale sync cannot restore the required styles 1586ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 321ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 393ms
     ✓ exits 1 naming the code file, whatever the commit message says 355ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 365ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 768ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 418ms
     ✓ exits 1 naming the files outside, whatever the commit message says 371ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 715ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 414ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 375ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 720ms
     ✓ a top-level glob in the setting does not reach into folders 368ms
     ✓ a push that changes no files is not proven a min push 308ms
     ✓ exits 7 when a commit or its base cannot be read 327ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 45373ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1309ms
     ✓ runs code.ts through its declared gate in the built checkout 1497ms
     ✓ runs code.ts through its declared gate in the built checkout 1330ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1155ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1112ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1298ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 726ms
     ✓ runs the full gate for replayed debug code 1064ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1208ms
     ✓ installs local dependencies against the built target tree 1456ms
     ✓ runs the configured frozen install even without root dependencies 1330ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1307ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1383ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1521ms
     ✓ never pushes local dev commits missing from origin/dev 1594ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2950ms
     ✓ dev moved before every push: exhausted, nothing landed 4582ms
     ✓ any other refusal is returned, not retried 2923ms
     ✓ pushToDev replays a commit range onto origin/dev 1538ms
     ✓ a replay retries on the new dev when dev moved 2128ms
     ✓ pushToDev log line names what it lands 1091ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1325ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1600ms
     ✓ a push that fails without a server answer is returned once, never retried 1525ms
     ✓ a failed fetch is returned before anything is built 471ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2213ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1536ms
     ✓ lands from a clone whose fetch refspec omits dev 1645ms
     ✓ build throwing stops the landing and removes the throwaway checkout 541ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (56 tests) 18476ms
   ✓ trackerTarget (3)
     ✓ an explicit --issue wins (# stripped); an issue-less FID gives no issue 307ms
   ✓ github client (7)
     ✓ posts the body as JSON on stdin and returns the comment URL 1366ms
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 1450ms
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1637ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 785ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 553ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 501ms
     ✓ fetches the issue and its comments as GitHub returns them 533ms
   ✓ postCommentOnce (4)
     ✓ records an engine-action row and skips the same key + body on a re-run 475ms
     ✓ a recent identical comment counts as done (the final close comment) 404ms
     ✓ a failed post reports done false with the reason and never leaks a token 535ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 799ms
   ✓ board move (Projects v2) (3)
     ✓ looks up issue, board and Status option, adds the item, sets the option 628ms
     ✓ a board the token cannot see is scope 599ms
     ✓ an HTTP 403 from gh is scope 737ms
   ✓ blockers (4)
     ✓ github: the blocked-by block in the body, each issue's state 1018ms
     ✓ github: no block, no blockers and no further reads 1184ms
   ✓ postCommentOnce: re-runs compare the marker hash, never the rewritten text (5)
     ✓ github: a recent comment carrying the same marker hash is done 757ms
     ✓ a different marker hash posts 878ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 752ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 50271ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1295ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 645ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 918ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 1187ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 756ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 547ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 409ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 689ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 617ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1192ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 1564ms
     ✓ PASS is 0 failures with or without reports 1133ms
     ✓ clears a previous attempt's reports before the gate runs 679ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 1005ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 1155ms
     ✓ a log under the outbox is named main-checkout relative in the record 1180ms
     ✓ a log small enough is copied whole: not clamped, raw null 712ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 810ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 721ms
     ✓ numbers runs within the workflow's active run and per step 606ms
     ✓ without --file no row is written and the output carries row null 624ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 726ms
     ✓ a planned test that passes is a vacuous gap, exit 1 542ms
     ✓ a planned test absent from a loaded report is a missing gap 889ms
     ✓ a file that fails to load is a red of kind red-not-loaded 743ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 668ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1738ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 1108ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 1070ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 2034ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1080ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1092ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 855ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1111ms
     ✓ green: a passed-accepted test is already landed, not a gap 841ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 652ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 726ms
     ✓ green: --group audits only that group's tasks 597ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 1005ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1040ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 1133ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1248ms
     ✓ green: lists each gap kind, with the runner output 1117ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1500ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 485ms
       ✓ green clears an exception-only task from a human commit 333ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (90 tests) 7775ms
   ✓ bkit issues labels --write (5)
     ✓ on a cloud or CI runtime the board is skipped:cloud and never called 833ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 11107ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ keeps each context's own section header and drops every other context's 711ms
     ✓ keeps each context's own section banner and drops every other context's 1704ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 378ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 550ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 321ms
     ✓ --base narrows the range to the commits after a group's start sha 454ms
     ✓ diff from a group start covers only the group's commits 425ms
     ✓ an empty range writes a one-line note and zero numbers 308ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 439ms
     ✓ --reset-log empties the step's clamp log before the record lands 477ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 402ms
     ✓ whole: nothing omitted and no copy kept 307ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 314ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 19106ms
   ✓ bkit fids parse --prompt-file (68)
     ✓ linear with no key configured: a bare key names no issue, with a hint naming bkit.tracker.linear.team 342ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 1131ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 319ms
     ✓ a bare number beside words still mints from the words; tracker none mints from the workflow 344ms
   ✓ bkit fids design --description-file --prompt-file (5)
     ✓ none: no link and no own design doc (exit 1, nulls); a named audit path must exist 350ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
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
> [bkit] TRUNCATED HERE — 772 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 422 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2079ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1176ms
     ✓ freezes explicit workflow run attempt and all failed job pages 993ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1733ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2350ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 570ms
       ✓ a source change past the validated head refuses (17) and names the path 473ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 563ms
       ✓ --validated without --month / --fid is a usage error (2) 407ms
       ✓ a validated sha that is not an ancestor refuses (17) 487ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 341ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 491ms
     ✓ a failed re-trigger push names the cause in the log 1882ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1316ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1387ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 817ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 532ms
     ✓ gh-error: every poll errored 406ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 704ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 664ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 820ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 749ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2437ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2463ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 699ms
     ✓ re-trigger on dev only uses the record of its own FID 722ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 937ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 400ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 527ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 355ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 452ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 547ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 491ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 585ms
     ✓ --file and --step go together 384ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 92ms
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 406ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1423ms
     ✓ a refused dev push is logged, never fails the close 2179ms
     ✓ an unreachable remote is logged, never fails the close 621ms
 ✓ .bkit/core/engine/commands/workflow/status.test.ts (75 tests) 1270ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
> [bkit] TRUNCATED HERE — 103 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1077ms
     ✓ counts files committed since --base 1078ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 1055ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 1082ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1028ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 1100ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1021ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 974ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 724ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 1595ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 1089ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1183ms
     ✓ --file into a missing directory is refused, not created 943ms
> [bkit] TRUNCATED HERE — 62 lines omitted. Dropped content was NOT read.
     ✓ refuses a PR from dev, main, or the base itself 352ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 466ms
     ✓ retries a failed create once, and exits 5 when it fails twice 577ms
     ✓ exits 5 when the open-PR probe errors 433ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 517ms
     ✓ prs open still opens against any other base 435ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 438ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 526ms
     ✓ exits 4 when gh errors and 80 when it needs auth 585ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 460ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 830ms
     ✓ runs no merge when the PR is already MERGED 476ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 1194ms
     ✓ prs merge refuses a PR whose base is main 558ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 1015ms
     ✓ prs merge refuses when the PR base is unknown 1194ms
     ✓ prs merge reads the base from the one pr view it already makes 785ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 919ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 804ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 538ms
     ✓ never reads dev's required checks without --only-if-required 698ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 984ms
     ✓ is not green when a check failed, naming it (exit 1) 1023ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 1033ms
     ✓ is not green on an empty rollup (total 0) 750ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 1022ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 1710ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 930ms
> [bkit] TRUNCATED HERE — 107 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 17190ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2022ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1746ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 328ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1889ms
     ✓ does not fall back through a malformed later success receipt 922ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 566ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 840ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1225ms
     ✓ requires proof even when the pushed increment changes no files 626ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 432ms
     ✓ does not record a committed tree 454ms
     ✓ records no proof for a failed gate or lighter gate 779ms
     ✓ requires integration proof when integration is declared 1006ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1327ms
> [bkit] TRUNCATED HERE — 11 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 997ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 1006ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 958ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 685ms
     ✓ from a worktree, still names the main checkout and its outbox 724ms
   ✓ bkit repo info — the per-run session folder (2)
     ✓ prints a fresh, existing sessionDir under the outbox's sessions/ on every call 926ms
     ✓ prunes session folders older than 7 days and keeps newer ones and foreign names 632ms
   ✓ bkit repo info — where the wired tracker's issues live (12)
     ✓ prints the Linear team and project under linear 777ms
     ✓ prints the Jira site and project under jira 1238ms
     ✓ prints the board under github 1112ms
     ✓ prints the github progress and review states, defaults for a key left unset 1017ms
     ✓ prints the linear progress and review states, defaults for a key left unset 753ms
     ✓ prints the jira progress and review states, defaults for a key left unset 1030ms
     ✓ prints the linear progress and review states, defaults for a key left unset 1027ms
     ✓ prints null progress and review states under none 1024ms
     ✓ prints buildPublishRemote and buildPublishLocal 1106ms
     ✓ prints the publish defaults when package.json omits them 1447ms
     ✓ prints the plan caps from bkit.workflows.tasks, defaults for a key left unset 1301ms
     ✓ prints nulls under github without a board, and for keys left unset 1201ms
   ✓ bkit repo info — whether this repo's bkit is behind the newest release (4)
     ✓ prints the upgrade advisory when the pin is older than the newest release 1503ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 1087ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 999ms
     ✓ an unpinned repo reports nulls and asks no registry 1312ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 1434ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 1648ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 1203ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 1324ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 27ms
(node:21644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:21644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:21644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:21644) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 61ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 15803ms
   ✓ bkit setup protect-main — apply (5)
     ✓ PUTs the policy requiring the default capstone check 803ms
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 1445ms
     ✓ resolves config from the repo root when run from a subdirectory 1030ms
     ✓ exits 6 when the PUT fails 1246ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 922ms
   ✓ bkit setup protect-main — pre-flight (6)
     ✓ exits 4 when the CI workflow file is missing, before any write 1518ms
     ✓ exits 5 when no CI job carries the capstone name — a check nobody reports wedges every PR 818ms
     ✓ asks a human to log in when gh is not authenticated 950ms
     ✓ exits 3 when gh repo view names no repository 1871ms
   ✓ bkit setup protect-main --print (4)
     ✓ returns the current rule and skips the pre-flight 1382ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 1215ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 1166ms
     ✓ exits 6 when the api answer is not JSON 1361ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 34ms
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

 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 120ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 23ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 35ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 12ms
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

 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 42ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
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

 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 9ms
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

 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 91ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 8ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 1843ms
   ✓ renderAntigravityAgentsSkills (3)
     ✓ is idempotent — a second render writes nothing 472ms
   ✓ runAntigravityModule (3)
     ✓ writes plugin.json, hooks.json, both hook scripts, and emits the setup advisory 303ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 33ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 35ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 13ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 28ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 35ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 9ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 15ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 1145ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 86ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 24ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 24ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:94696) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 21718ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 374ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 5635ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 14424ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 438ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (4 tests) 11ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 137ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 16ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 67ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 13ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 11ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 8ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 6812ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 6803ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 16981ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1417ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1702ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1503ms
     ✓ reports excluded intervals as unread even when pagination finishes 1119ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 1165ms
     ✓ reports an unread remainder at the page cap 1371ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1057ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 689ms
     ✓ rejects missing summaries instead of treating them as empty results 635ms
     ✓ reports a failed first page as unavailable 1171ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 387ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 556ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 573ms
     ✓ follows summary cursors even when the first page is shorter than the limit 519ms
     ✓ reports excluded intervals as unread even when pagination finishes 525ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 493ms
     ✓ reports an unread remainder at the page cap 378ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 380ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 418ms
     ✓ rejects missing summaries instead of treating them as empty results 328ms
     ✓ reports a failed first page as unavailable 329ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 13169ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 9038ms
     ✓ every fence parses under zsh -n 4061ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (158 tests) 113101ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 321ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 940ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 307ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 380ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 337ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 347ms
     ✓ aborts a rebase only when one is in progress 528ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 503ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 463ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 480ms
       ✓ counts subagents of an earlier chat the run's session rows name 491ms
       ✓ records no context block, and still closes, outside a Claude Code session 525ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 572ms
     ✓ records ending held and publish false on the workflow-done row 475ms
     ✓ defaults the close row to ending done 545ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 559ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 500ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 503ms
     ✓ always writes the telemetry, whatever the runtime 528ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 404ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 496ms
     ✓ an unwritable stats path is logged and never fails the close 606ms
     ✓ appends the completeness row before the workflow-done row 644ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 570ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 646ms
     ✓ writes one completeness row per close 1035ms
     ✓ leaves out the previous run's rows that share a second with this run's start 590ms
     ✓ still closes when the completeness check throws 674ms
     ✓ still closes when the completeness row write throws 647ms
     ✓ ship: run.pr, size of the squash commit, and coverage 754ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 953ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 693ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 656ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 785ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 859ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 705ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 557ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 635ms
     ✓ --record-step writes the close step's row before workflow-done 459ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 493ms
     ✓ --number without --outbox is a usage error 374ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 609ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 654ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 606ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 598ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 483ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1940ms
     ✓ --flush with nothing to record commits and pushes nothing 1126ms
     ✓ --flush carries the named worktree's logs into the dev commit 2149ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2829ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1936ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2497ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2278ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2740ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2300ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2371ms
     ✓ --push on dev never carries a row whose references name another feature 2190ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 2385ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 4036ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2469ms
     ✓ --push commits in the named worktree, not the checkout it runs from 865ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2126ms
     ✓ preserves unlanded file deletions and ledger additions on close 4692ms
     ✓ preserves dirty work and uncertain branch evidence during close 4123ms
     ✓ preserves a local feature ref changed after its cleanup proof 4173ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1781ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1613ms
     ✓ a close that landed releases the lock 1888ms
     ✓ removes the worktree before it releases the lock 1888ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5164ms
       ✓ closePr refuses when the PR base is unknown 4420ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2156ms
   ✓ bkit workflows promote (7)
     ✓ stamps the anchor from the runtime-resolved base commit 303ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 353ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 350ms
     ✓ names the branch, not the remote-tracking ref, in each URL 345ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 431ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 302ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 756ms
     ✓ record is present after workflows close and before the push 616ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1161ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 366ms
     ✓ puts each --line after the summary, in flag order 303ms
     ✓ --summary prints the file and keeps a copy in --outbox 301ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 309ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (270 tests) 186630ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 480ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 630ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 764ms
     ✓ --file records nothing for a refused rebase 563ms
     ✓ refuses a code conflict and aborts the rebase on the spot 523ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1028ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 454ms
     ✓ produces byte-identical output to merge=union 1071ms
     ✓ restores a trailing newline so the next append starts on its own line 663ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 686ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 939ms
     ✓ refuses a union that leaves a line which is not JSON 526ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 549ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1601ms
     ✓ refuses a lockfile whose regenerate command fails 1214ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 923ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 838ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 899ms
     ✓ refuses and aborts when both sides changed the hand-written region 543ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 546ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 701ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 976ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 582ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 762ms
     ✓ refuses and aborts when a side deleted the install record 571ms
     ✓ refuses a conflicted doc the repo's script does not list 544ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 597ms
     ✓ removes a stale sentinel when the rebase succeeds 812ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1094ms
     ✓ resolves a conflict in each of two replayed commits across rounds 892ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 484ms
       ✓ skips (12) with no anchor 463ms
       ✓ skips (12) when the base is unreachable in this clone 588ms
       ✓ skips (12) when nothing landed since the base 597ms
       ✓ runs (0) with the landed path count once dev moved 993ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 629ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 880ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 486ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 751ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1449ms
     ✓ runs exactly one git push 1776ms
     ✓ --set-upstream records the upstream 488ms
     ✓ refuses with no branch checked out 392ms
     ✓ --mode=dev refuses a feature checkout 434ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1163ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2072ms
     ✓ --require-ci pushes as-is when dev has not moved 947ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1644ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2325ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 593ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1410ms
     ✓ --mode=abort pushes when the branch has no open PR 1207ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1163ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 488ms
     ✓ --open-pr carries the MCP answer and skips gh 724ms
     ✓ --mode=abort on dev pushes plainly without probing 801ms
     ✓ rejects an unknown mode 587ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2314ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1273ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1520ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3352ms
     ✓ skip-ci HEAD on the replay is refused 927ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2597ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3172ms
     ✓ a level local dev is a plain push, recording nothing extra 1070ms
     ✓ a record with no commits pushes nothing 687ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 578ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1974ms
     ✓ a rewritten branch is refused, never forced 748ms
     ✓ refuses dev and main with exit 21 and pushes nothing 510ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1170ms
     ✓ refuses a detached HEAD (exit 5) 473ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1230ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1198ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1002ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1299ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 538ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1098ms
     ✓ an up-to-date branch is a no-op 685ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1181ms
     ✓ a fetch that fails exits 10 519ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 656ms
     ✓ scan-diff still reports a new skip when its test … 606ms
     ✓ scan-diff reports a skip moved onto a different t… 600ms
     ✓ scan-diff does not cancel a skip moved between am… 619ms
     ✓ scan-diff does not spend an unchanged duplicate t… 587ms
     ✓ scan-diff recognizes a renamed test file 602ms
     ✓ scan-diff recognizes a suite moved into a differe… 489ms
     ✓ scan-diff does not let unrelated additions hide a… 480ms
     ✓ scan-diff attributes deletion to its old test ins… 448ms
     ✓ scan-diff consumes each moved assertion once and … 573ms
     ✓ scan-diff does not match identical assertions fro… 558ms
     ✓ scan-diff does not match the same leaf test name … 635ms
     ✓ scan-diff does not match a same-named test with d… 578ms
     ✓ scan-diff does not match a same-named test with c… 526ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 568ms
     ✓ --paths with no match exits 1 469ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 339ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 663ms
     ✓ --marker reads a diff over 1 MiB 676ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 775ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 616ms
     ✓ scan-diff finds an added skip 560ms
     ✓ scan-diff ignores a skip predating the base 478ms
     ✓ scan-diff reports a disabled test with its line 531ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 534ms
     ✓ scan-diff ignores a removed comment in a test file 531ms
     ✓ scan-diff ignores an assertion moved within the file 505ms
     ✓ scan-diff still reports a removed assertion 533ms
     ✓ scan-diff reports an assertion re-added only outside the test file 637ms
     ✓ scan-diff finds an added pytest mark skip 606ms
     ✓ scan-diff finds an added unittest skip 522ms
     ✓ scan-diff finds an added bare skip call 452ms
     ✓ scan-diff ignores a quoted skip in a documentation file 478ms
     ✓ scan-diff ignores a marker literal in a non-test source file 475ms
     ✓ scan-diff ignores an assertion whose expectation changed 555ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 656ms
     ✓ scan-diff reports a deleted test file 707ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 530ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2108ms
     ✓ a title that already carries the marker is left alone 1274ms
     ✓ with no open PR: pushes the marker commit and edits no title 980ms
     ✓ a re-run is deduped: no second marker commit 1028ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 963ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 324ms
     ✓ --title-set skips gh entirely 517ms
   ✓ branches sync feature reconciliation (8)
     ✓ fetches the unseen feature head before classifying the base 925ms
     ✓ fast forwards the feature before either base path is chosen 1910ms
     ✓ merges divergent feature tips without rebasing either side 1028ms
     ✓ continues the feature merge before starting a dev merge 1568ms
     ✓ publishes local code with a CI running head before bookkeeping 1819ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2519ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1613ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1100ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 309ms
     ✓ Path B once dev moved; --head checks a given commit 489ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 478ms
     ✓ --merge-docs merges dev when docs/ is behind 580ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 577ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 791ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 783ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 695ms
     ✓ --merge-docs skips an empty bkit:generate script 592ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 498ms
     ✓ --merge-docs never merges on dev itself 448ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 660ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 658ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 616ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 625ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 344ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 808ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 875ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 968ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 846ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 824ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1029ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 743ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 852ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 596ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 418ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 515ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 791ms
     ✓ a failed install stops ship (16) 711ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 564ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 537ms
     ✓ exits 10 when the fetch fails 408ms
   ✓ branches land (28)
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 303ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1335ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1301ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1330ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1306ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2946ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3472ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 511ms
     ✓ local: names unpushed dev as the cause when the branch carries it 572ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 611ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1532ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1626ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1188ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4857ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1205ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1281ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1163ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 808ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1696ms
     ✓ land removes the worktree when only the copied .env is untracked 1381ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1192ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1294ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2323ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1299ms
     ✓ landPr refuses a main-based PR without retrying 630ms
     ✓ landPr refuses when the PR base is unknown 688ms
     ✓ PR not open (closed): stops (17) at once, no retry 775ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 547ms
     ✓ --attempt names the merge round in a fix commit 502ms
     ✓ commits a rewritten and a deleted tracked file 512ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 426ms
     ✓ reports undeclared and runs nothing with an empty script 307ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 391ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 495ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 307ms

 Test Files  173 passed (173)
      Tests  7300 passed | 2 skipped (7302)
   Start at  20:49:15
   Duration  188.41s (tests 96%, transform 1%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/842-ship-fails-local/build-group-gate-1-2.log.reports/vitest-27358.xml
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.79 |    83.22 |   95.28 |   91.17 |                   
 engine            |   76.44 |    79.79 |      90 |   76.66 |                   
  cli.ts           |   76.44 |    79.79 |      90 |   76.66 | ...1075,1080-1082 
 ...e/checks/after |   90.47 |     85.6 |   95.19 |   94.36 |                   
  auth.ts          |   98.46 |    98.11 |     100 |   97.95 | 69                
  ci-yml.ts        |   90.74 |    82.83 |     100 |   93.01 | ...09,422-424,435 
  github.ts        |   93.15 |    88.61 |     100 |    94.4 | ...76-277,405-407 
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
 engine/commands   |   89.65 |    84.07 |   93.25 |    90.4 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   94.55 |    89.41 |   97.05 |   97.28 | ...49,485,537-540 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.86 |    45.74 |   58.75 |   48.22 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |      20 |     26.5 |      50 |   17.77 | ...42-146,217-613 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.36 |    84.52 |   96.65 |   93.87 |                   
  branches.ts      |   89.45 |    82.91 |    98.8 |   91.06 | ...3144,3169,3312 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.28 |    93.96 |     100 |   98.72 | 217,516           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 195,300,369       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   97.87 |    91.54 |   98.24 |   98.79 | 195,436-437,765   
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   93.75 |    85.91 |   95.45 |   95.49 | ...09-210,379-380 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   91.85 |    89.65 |     100 |   93.28 | ...1303,1319-1320 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.48 |    84.05 |    99.1 |   92.56 | ...2403,2435-2439 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 245,356           
  steps.ts         |   89.89 |    83.04 |   90.82 |   91.09 | ...1952,1957,1959 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...93-499,511,534 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |     75.8 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   92.89 |    73.23 |     100 |   96.73 | ...36,848,931,979 
  workflows.ts     |   93.45 |    82.55 |   97.38 |   95.07 | ...1761,1935,2658 
  worktrees.ts     |   67.36 |    65.93 |   74.62 |   68.75 | ...1341,1344-1345 
 engine/install    |   93.17 |    84.64 |   94.15 |   95.96 |                   
  cloud-env.ts     |    96.9 |     91.3 |     100 |   99.64 | 223               
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.76 |    93.52 |   98.93 |   97.35 |                   
  status.ts        |   98.52 |    98.31 |     100 |     100 | 122,153,266       
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
 engine/tools      |   89.92 |    85.46 |   95.47 |   90.53 |                   
  cli-doc.ts       |   71.42 |       70 |   93.75 |   69.44 | 94-104,109        
  instructions.ts  |   90.64 |    85.96 |   95.62 |    91.4 | ...1713-1795,1800 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.79% ( 18668/20789 )
Branches     : 83.22% ( 13844/16635 )
Functions    : 95.28% ( 3030/3180 )
Lines        : 91.17% ( 16363/17947 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 551 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 345 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 362 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 347 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 350 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 346 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 133 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 362 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 352 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 368 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 362 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 360 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 363 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 360 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1231 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 863 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 23 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 25 ms
ok 19 stub: the response selector is cleared before running its body # in 25 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 42 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 32 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 28 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 23 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 35 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 22 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 50 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 81 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 687 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 498 ms
ok 30 refresh drops a file deleted in the index from the build # in 459 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 654 ms
ok 32 a key removed from the env file is unset on the next run # in 303 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 268 ms
ok 34 non-BKIT_ keys are skipped # in 289 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 286 ms
ok 36 a failed unsetenv is retried on the next run # in 301 ms
ok 37 logs key names only, never values # in 245 ms
ok 38 missing env file exits 0 without calling launchctl # in 44 ms
ok 39 the sweep prints the summary line the lane greps for # in 447 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 17 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (155.840541ms)
✔ shell cancellation waits for SIGTERM cleanup (231.047667ms)
✔ direct cancellation waits for SIGINT cleanup (157.412ms)
✔ shell cancellation waits for SIGINT cleanup (231.725ms)
✔ direct cancellation waits for SIGHUP cleanup (150.795125ms)
✔ shell cancellation waits for SIGHUP cleanup (229.813791ms)
✔ shell cancellation follows a worker orphaned by a nested shell (333.8585ms)
✔ direct cancellation preserves a nested machine-lock owner (541.795583ms)
✔ shell cancellation preserves a nested machine-lock owner (653.028167ms)
✔ nested shell cancellation preserves a nested machine-lock owner (655.428083ms)
✔ a hard process-group timeout reaches a shell command during cleanup (114.719125ms)
✔ ships a command-scoped sleep prevention wrapper (0.186667ms)
✔ preserves arguments, output and nonzero exit status (89.276458ms)
✔ runs an entire shell chain and retains its failure (56.65475ms)
✔ reports a missing command as 127 (54.058667ms)
✔ requires a command (45.23625ms)
✔ non-macOS platform selection runs commands without sleep prevention (76.09175ms)
✔ hard timeout escalation reaches a command that ignores TERM (185.967291ms)
✔ forwards POSIX cancellation to the command and releases the assertion (89.308333ms)
✔ holds a real macOS assertion only while the command runs (111.936041ms)
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4226.19275
> [bkit] TRUNCATED — kept 1641 of 3328 lines (117 KB of 257 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
