
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 51542, since 13:16:15), last run took 14m23s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 860-move-deterministic-bookkeeping build-group-gate-3 is waiting for tests (still, 1 min so far) (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs (pid 51542, since 13:16:15), last run took 14m23s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
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
 509:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 631:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 710:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 1153:866  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1314:76   warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 1372:238  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 


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

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> bkit ci slop

[bkit-ci] base da97be3876cf42450f57b335b7aac09629f33a59 (da97be3876cf42450f57b335b7aac09629f33a59) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: da97be3876cf42450f57b335b7aac09629f33a59
base: da97be3876cf42450f57b335b7aac09629f33a59
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 11.1 on 10 cores: unit limits 10050ms per test, 20100ms per hook (x2.01)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/860-move-deterministic-bookkeeping
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (102 tests) 33158ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 724ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 609ms
     ✓ brand-new untracked ledger is staged and committed 530ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 512ms
     ✓ path containing a space is staged and committed 438ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 316ms
     ✓ staging failure: exit 4 and no commit is created, no false success 362ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 338ms
     ✓ --mode=stage stages the sweep but creates no commit 325ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1243ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 682ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 487ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 307ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 454ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 489ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 550ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 445ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 383ms
     ✓ a path outside the checkout exits 6 with nothing committed 304ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 529ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 359ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 1154ms
     ✓ --path records its commit on the run's record, like every other commit mode 802ms
     ✓ a recorded ledger commits only the rows the run appended 1266ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 1547ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 1167ms
     ✓ commitBookkeeping refuses when a recorded path changed 644ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 807ms
     ✓ under --mode=commit counts the squashed paths as something to commit 797ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 584ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 340ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 529ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 425ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 547ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 756ms
     ✓ a source file in the range: exit 7, path listed 457ms
     ✓ another FID's plan file in the range: exit 7 524ms
     ✓ from not an ancestor of to: exit 7 444ms
   ✓ bkit ledgers triage (11)
     ✓ triage refuses a plan with no task blocks 316ms
     ✓ triage refuses a plan whose task blocks do not parse 365ms
   ✓ bkit ledgers append --invocation (2)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 625ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 478ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 39691ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 723ms
     ✓ names each net-new and worsened finding in the log and the JSON 1179ms
     ✓ fails on a net score rise with no net count change 788ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1207ms
     ✓ treats a net score at or below 0.001 as float noise 1155ms
     ✓ passes when the change only resolves findings 749ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1247ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 332ms
     ✓ skips (exit 0) when the base resolves to HEAD 334ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1291ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 599ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 345ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1006ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1261ms
     ✓ exits 4 on a dropped net field instead of silently passing 1189ms
     ✓ exits 4 on no summary instead of silently passing 1237ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1006ms
     ✓ exits 5 when the base worktree cannot be created 461ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1376ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1042ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1080ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1051ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1115ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1543ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 642ms
     ✓ explicit globs can select ignored prose and nested checkout files 772ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 653ms
     ✓ fails (exit 1) when vale reports alerts 559ms
     ✓ exits 6 on a vale runtime error 499ms
     ✓ skips with exit 0 when no file matches 307ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 543ms
     ✓ falls back to vale sync when the main worktree has none 492ms
     ✓ fails when vale sync cannot restore the required styles 494ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 520ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 406ms
     ✓ is a usage error when the commit cannot be read 304ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 489ms
     ✓ exits 1 naming the code file, whatever the commit message says 537ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 483ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 391ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 948ms
     ✓ exits 7 when a commit cannot be read 365ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 450ms
     ✓ exits 1 naming the files outside, whatever the commit message says 470ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 856ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 626ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 575ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 962ms
     ✓ a top-level glob in the setting does not reach into folders 536ms
     ✓ a push that changes no files is not proven a min push 490ms
     ✓ exits 7 when a commit or its base cannot be read 461ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (144 tests) 49631ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 890ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 637ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 634ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 510ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 679ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 506ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 459ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 1128ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 1025ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 971ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 509ms
     ✓ PASS is 0 failures with or without reports 637ms
     ✓ clears a previous attempt's reports before the gate runs 896ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 951ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 962ms
     ✓ a log under the outbox is named main-checkout relative in the record 1090ms
     ✓ a log small enough is copied whole: not clamped, raw null 465ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 427ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 937ms
     ✓ numbers runs within the workflow's active run and per step 713ms
     ✓ without --file no row is written and the output carries row null 1167ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 757ms
     ✓ a planned test that passes is a vacuous gap, exit 1 569ms
     ✓ a planned test absent from a loaded report is a missing gap 602ms
     ✓ a file that fails to load is a red of kind red-not-loaded 741ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 1088ms
     ✓ no bkit:test:file script exits 3 and still records the blobs with enforced false 358ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 1094ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 569ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 626ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1283ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 1227ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 1063ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1020ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 1455ms
     ✓ green: a passed-accepted test is already landed, not a gap 716ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 795ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 1192ms
     ✓ green: --group audits only that group's tasks 932ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 832ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 1111ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 727ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 1307ms
     ✓ green: lists each gap kind, with the runner output 1148ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1641ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 674ms
       ✓ green clears an exception-only task from a human commit 419ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (121 tests) 51884ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 825ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 550ms
     ✓ done --group writes group on the row 449ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 571ms
     ✓ carries extra fields, parsed as JSON when they are JSON 353ms
     ✓ reports a failed commit with exit 8 without writing the row 1412ms
     ✓ a failed commit leaves no row staged in the index 1190ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1058ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 965ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 1204ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 763ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 1178ms
   ✓ bkit steps gate (8)
     ✓ passes after done wrote the row for the artifact 485ms
     ✓ --ref reads the status file as committed on that ref, not from disk 509ms
     ✓ --ref exits 3 when the ref does not carry the status file 442ms
     ✓ fails on a placeholder left in the artifact 562ms
     ✓ fails when the row's verdict differs from the artifact's 370ms
     ✓ fails when the row does not list the artifact, or carries another attempt 410ms
     ✓ fails on a missing artifact 430ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 384ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a diagnose row missing its strategy, passes with it 422ms
     ✓ fails a run-tests row missing its scope, and an empty scope 537ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 702ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 522ms
     ✓ --docs-only refuses a step that wrote outside docs/plans/ (exit 9) 335ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 660ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 849ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 598ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 806ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 1221ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 778ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github 418ms
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 717ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 557ms
       ✓ gate --fid=123-foo --issue=456 fails: the FID embeds another issue 376ms
     ✓ --attempt-of checks the row carries the derived counter 453ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 1017ms
     ✓ writeStepRow refuses when a recorded path changed 1303ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 655ms
     ✓ writeStepRow appends its commit sha to the record 1125ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1361ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files 357ms
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 805ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 769ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 496ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1363ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 918ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 858ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 604ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1263ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ refuses (exit 12) an attempt below the highest saved artifact, writing nothing 451ms
     ✓ passes the highest saved attempt, and ignores another group's artifacts 533ms
     ✓ does not count an artifact the run found committed when it started 644ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 483ms
     ✓ commits a package.json change outside bkit.workflows 647ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1279ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 55749ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 34311ms
     ✓ every prompt, workflow and utility agent has the three header blocks 481ms
     ✓ sync has nothing left to rewrite 18387ms
     ✓ every clause reaches the cut-off of one surface it applies to 1965ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 67746ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 2220ms
     ✓ runs code.ts through its declared gate in the built checkout 1809ms
     ✓ runs code.ts through its declared gate in the built checkout 1962ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1528ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1394ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1698ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 1332ms
     ✓ runs the full gate for replayed debug code 2112ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 2263ms
     ✓ installs local dependencies against the built target tree 2394ms
     ✓ runs the configured frozen install even without root dependencies 1991ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 2212ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 2148ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 2081ms
     ✓ never pushes local dev commits missing from origin/dev 2063ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3829ms
     ✓ dev moved before every push: exhausted, nothing landed 5791ms
     ✓ any other refusal is returned, not retried 2414ms
     ✓ pushToDev replays a commit range onto origin/dev 2462ms
     ✓ a replay retries on the new dev when dev moved 4341ms
     ✓ pushToDev log line names what it lands 2129ms
     ✓ runs no git hooks in the throwaway checkout, and says so 2115ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 2178ms
     ✓ a push that fails without a server answer is returned once, never retried 2007ms
     ✓ a failed fetch is returned before anything is built 695ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 4211ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2229ms
     ✓ lands from a clone whose fetch refspec omits dev 2752ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1358ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 36587ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 497ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 745ms
     ✓ always writes the marker, even with no plan 438ms
     ✓ writes the linear marker shape, taking the tracker from package.json 502ms
     ✓ writes the jira marker shape, taking the tracker from package.json 478ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 499ms
     ✓ refuses a PR from dev, main, or the base itself 398ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 867ms
     ✓ retries a failed create once, and exits 5 when it fails twice 561ms
     ✓ exits 5 when the open-PR probe errors 833ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 522ms
     ✓ prs open still opens against any other base 478ms
     ✓ exits 6 when the created PR's base is not --base 514ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 436ms
     ✓ exits 1 with found=false when there is none 487ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 665ms
     ✓ --number reads one PR, mergeable included 423ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 986ms
     ✓ exits 4 when gh errors and 80 when it needs auth 787ms
     ✓ refuses a bad --state or --number 302ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 425ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 644ms
     ✓ drops the force-build marker from the title subject 435ms
     ✓ takes an explicit --subject 514ms
     ✓ runs no merge when the PR is already MERGED 665ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 800ms
     ✓ prs merge refuses a PR whose base is main 421ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 535ms
     ✓ prs merge refuses when the PR base is unknown 483ms
     ✓ prs merge reads the base from the one pr view it already makes 660ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 686ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 405ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 536ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 580ms
     ✓ never reads dev's required checks without --only-if-required 443ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 759ms
     ✓ updates when a dev ruleset requires status checks 598ms
     ✓ updates when dev's branch protection requires status checks 717ms
     ✓ ignores dev rulesets that require no checks 568ms
     ✓ updates when the repo cannot be resolved 472ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 522ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 392ms
     ✓ is not green when a check failed, naming it (exit 1) 644ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 555ms
     ✓ is not green on an empty rollup (total 0) 497ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 397ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 781ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 429ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 39511ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 333ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 407ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2631ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ rolls over after intervening comments external edits and deletion 541ms
     ✓ starts only new source after overflow or missing source 409ms
     ✓ uses exact new comment after a failed eligibility read 308ms
   ✓ bounded nonfatal publication (10)
     ✓ preserves a human correction after lost append recognition and a later report 371ms
     ✓ contains exhausted append and create failures without fabricated success 314ms
     ✓ keeps multipart loss and duplicate handling bounded and nonfatal 698ms
     ✓ reserves new comment opportunity within total delivery budget 892ms
     ✓ contains preparation state lock and reconciliation exceptions 309ms
     ✓ attempts independent attention after routine uncertainty 377ms
     ✓ seals an acknowledged segment after a postflight intervening comment 391ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 558ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 621ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 546ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 498ms
     ✓ fetches the issue and its comments as GitHub returns them 610ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 955ms
     ✓ invalidates missing corrupt and unsupported progress cache 1842ms
     ✓ contains cache read and write failures as standalone degradation 960ms
     ✓ uses legacy receipts and contains receipt failures 990ms
     ✓ skips issue-less runs and tracker none 326ms
     ✓ records an engine-action row and skips the same key + body on a re-run 784ms
     ✓ a recent identical comment counts as done (the final close comment) 880ms
     ✓ a failed post reports done false with the reason and never leaks a token 552ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 734ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 559ms
     ✓ a different marker hash posts 665ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 768ms
[feat/test 584dcc1] gate
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (190 tests) 85692ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2172ms
     ✓ filters branch and PR discovery by configured workflow and exact head 1221ms
     ✓ freezes explicit workflow run attempt and all failed job pages 784ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 2923ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2685ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ bkit runs gate (68)
     ✓ --fetch refreshes origin/<branch> before gating 803ms
     ✓ tells an API error (20) from no run (10) 312ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 698ms
       ✓ a source change past the validated head refuses (17) and names the path 591ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 723ms
       ✓ --validated without --month / --fid is a usage error (2) 511ms
       ✓ a validated sha that is not an ancestor refuses (17) 581ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 562ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1169ms
     ✓ a failed re-trigger push names the cause in the log 1555ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1363ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1856ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 1037ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 627ms
     ✓ gh-error: every poll errored 540ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 954ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 1067ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 1124ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 1339ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 4602ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 3737ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 939ms
     ✓ re-trigger on dev only uses the record of its own FID 1507ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 1582ms
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 477ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 775ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 523ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 307ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 813ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 745ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 874ms
     ✓ --file and --step go together 580ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 38573ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 347ms
     ✓ fails with a fetch error when there is no origin to rebase onto 619ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 392ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 1085ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 532ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1324ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 628ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 538ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 576ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 534ms
     ✓ an unpinned repo reports nulls and asks no registry 590ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 396ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 373ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 428ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 877ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 37467ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 3729ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 3804ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 500ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 550ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 470ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 4488ms
     ✓ does not fall back through a malformed later success receipt 1997ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 1378ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1507ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2704ms
     ✓ requires proof even when the pushed increment changes no files 1415ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 990ms
     ✓ does not record a committed tree 972ms
     ✓ records no proof for a failed gate or lighter gate 1629ms
     ✓ requires integration proof when integration is declared 2284ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3017ms
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
     ✓ jira with {"project":"PROJ2"}: "see https://any.atlassian.net/browse/PROJ2-9 and fix PROJ2-7" reads as "PROJ2-9" 343ms
     ✓ fidNamed: feat/ and docs/plans paths always count; a bare word only with a log folder 2265ms
     ✓ a missing prompt file exits 7; --prompt-file with --branch is a usage error 375ms
   ✓ bkit fids resolve (12)
     ✓ 2. the current feat/ branch, when it embeds the issue 549ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 952ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 1045ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 577ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 706ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 978ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 402ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 1009ms
     ✓ --file into a missing directory is refused, not created 716ms
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/templates/ci-scripts.test.ts (24 tests) 26066ms
   ✓ bkit-check-dependency-audit (5)
     ✓ rejects an --unreachable value that is neither fail nor warn 427ms
   ✓ shipped copy-and-own test files (6)
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 722ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 738ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 870ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1185ms
     ✓ reports excluded intervals as unread even when pagination finishes 686ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 893ms
     ✓ reports an unread remainder at the page cap 611ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 664ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 673ms
     ✓ rejects missing summaries instead of treating them as empty results 887ms
     ✓ reports a failed first page as unavailable 1786ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 517ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 1152ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 1136ms
     ✓ follows summary cursors even when the first page is shorter than the limit 1425ms
     ✓ reports excluded intervals as unread even when pagination finishes 1067ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 894ms
     ✓ reports an unread remainder at the page cap 1347ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 1209ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 382ms
     ✓ rejects missing summaries instead of treating them as empty results 485ms
     ✓ reports a failed first page as unavailable 500ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 356ms
 ✓ .bkit/core/engine/commands/setup/setup.test.ts (17 tests) 5068ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 371ms
     ✓ resolves config from the repo root when run from a subdirectory 322ms
     ✓ exits 6 when the PUT fails 349ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 387ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ returns the current rule and skips the pre-flight 443ms
     ✓ reports an unprotected main (GitHub's 404) as protected: false 377ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 355ms
     ✓ exits 6 when the api answer is not JSON 409ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (8 tests) 11092ms
 ✓ .bkit/core/engine/commands/workflow/challenge.test.ts (38 tests) 5653ms
   ✓ bkit challenge gate (5)
     ✓ challenge gate writes a challenge-gate row 657ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1377ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 465ms
 ✓ .bkit/core/engine/render/trackers.test.ts (105 tests) 15806ms
   ✓ real workflow sources (37)
> [bkit] TRUNCATED HERE — 30 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 946ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 2342ms
     ✓ a refused dev push is logged, never fails the close 2841ms
     ✓ an unreachable remote is logged, never fails the close 1257ms
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 18794ms
   ✓ bkit context clamp (#427 T1) (22)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ keeps each context's own section header and drops every other context's 1496ms
     ✓ keeps each context's own section banner and drops every other context's 3180ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 303ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ clamps a ci block with the ci profile and a runtime block without it 647ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ whole: nothing omitted and no copy kept 588ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 528ms
 ❯ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (54 tests | 1 failed) 81991ms
   ✓ gateguard opencode plugin — advisory mode (default) (7)
     ✓ emits reuse checklist on first write to a NEW (nonexistent) file 848ms
> [bkit] TRUNCATED HERE — 23 lines omitted. Dropped content was NOT read.
     ✓ BKIT_ALLOW_CONFIG_EDIT=1 downgrades config edit to normal checklist 2932ms
     ✓ source file is not treated as gate config 2760ms
   ✓ gateguard opencode plugin — fail-open cases (4)
     ✓ missing file path (no args.path) is ignored — no throw, no advice 547ms
     ✓ null args object is ignored — no throw 543ms
     ✓ session.get() rejection → fail-open (treats as orchestrator, emits advisory) 2709ms
     ✓ non-edit tool (bash) is ignored 679ms
   ❯ gateguard opencode plugin — multi-file patch tool (13)
     ✓ patch (v2 driver): checks every Add / Update / Move-to / Delete target 10771ms
     × patch (v1 driver): checks every Add / Update / Move-to / Delete target 10992ms
     ✓ apply_patch (v2 driver): checks every Add / Update / Move-to / Delete target 9942ms
     ✓ apply_patch (v1 driver): checks every Add / Update / Move-to / Delete target 6473ms
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
     ✓ matches a nested docs/ tree via segment match (.bkit/shared/docs/architecture.md) 936ms
     ✓ twin parity: isDocsPath + docAuthoringAdvisory are byte-identical between the two hooks 203ms
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts (23 tests | 1 failed) 6023ms
   ❯ publication ownership lock (4)
     × serializes publication for one target and invocation 542ms
     ✓ bounds acquisition and preserves unverifiable owners 330ms
     ✓ reclaims only a proven dead matching process identity 554ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ refuses while the holder's run stepped in the last 30 minutes 175ms
     ✓ reclaims an IN_PROGRESS run idle 30+ minutes 162ms
     ✓ reclaims a finished (DONE or FAILED) run's old lock 365ms
     ✓ reclaims a fresh lock over a finished run: the lock file's age is not checked 206ms
     ✓ reclaims a fresh lock over an IN_PROGRESS run idle 30+ minutes 151ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 814ms
     ✓ counts files committed since --base 900ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 730ms
     ✓ runs nothing and exits 0 when no file changed 357ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 750ms
> [bkit] TRUNCATED HERE — 32 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 872ms
     ✓ passes every rule on a clean head 405ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 452ms
 ✓ .bkit/core/engine/commands/lib.test.ts (72 tests) 6804ms
   ✓ repo facts on a real repository (4)
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ ship: the tree it runs in — the worktree being shipped, or the adopted checkout 337ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1355ms
     ✓ runGit names ENOBUFS when output passes the limit 1673ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 1398ms
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
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ passes when nothing changed 323ms
     ✓ passes when only another key changed, such as a branch's upstream 355ms
     ✓ fails the test whose temp-repo `git init` re-initialised the checkout, and puts core.bare back 384ms
     ✓ fails a fixture identity written through a leaked GIT_DIR, and removes it 481ms
     ✓ fails a write from a test whose cwd is the checkout itself, and restores the old identity 384ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > is idempotent — a second render writes nothing
[test] write: .agents/plugins/bkit/agents/bkit-audit-generate.md
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 28 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 172 lines omitted. Dropped content was NOT read.
     ✓ handles a file with only malformed lines without throwing 392ms
 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (299 tests) 1161ms
 ❯ .bkit/core/engine/ledgers/journal.test.ts (18 tests | 6 failed) 645ms
   ✓ shouldRecordFriction (1)
     ✓ writes no friction row for a declared routing exit 11ms
   ❯ frictionRow (3)
     ✓ never leaves by.step empty 109ms
     ✓ keeps the key under the identity-gated prune's truncation bound 0ms
     × writes a friction row with no run object when parentSha is unresolvable 60ms
   ❯ pauseFrictionRow (2)
     × pauseFrictionRow builds a valid human-confirm row keyed owner-pause/{workflow}.{reason} 73ms
     ✓ pauseFrictionRow keys a reasonless pause owner-pause/{workflow} and clips long keys 81ms
   ❯ appendFrictionRow (5)
     × records a recurrence as an appended same-key row, and folds to the raised count 42ms
     × reopens a CLOSED row that recurs, and keeps a TRIAGED one triaged 44ms
     × finds the same-key row whatever the spacing of its key field 88ms
     × keeps a row another writer appends while a recurrence is recorded 58ms
     ✓ returns a failed result instead of throwing when the row is refused 53ms
   ✓ engineCallRow (1)
     ✓ journals flag names only 1ms
   ✓ appendJournalRow (1)
     ✓ appends one status line and reports a failed write instead of throwing 2ms
   ✓ journalEnabled (1)
     ✓ writes no row when BKIT_ENGINE_JOURNAL is off 0ms
> [bkit] TRUNCATED HERE — 829 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 434ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 339ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 251ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 317ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 389ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 360ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 238ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 278ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-TQTDOp/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 187ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > upgrades a file with no consumer drift (update action)
[bkit-upgrade] upgrade: .claude/agents/bkit-foo.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > reports conflict when consumer drift detected (does NOT overwrite)
[bkit-upgrade] conflict: .claude/agents/bkit-foo.md — consumer drift detected, NOT overwriting

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > creates new files that do not yet exist on disk
[bkit-upgrade] upgrade: .claude/agents/bkit-new.md

stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > dry-run does not write files but reports what would change
[bkit-upgrade] [dry-run] upgrade: .claude/agents/bkit-foo.md

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 239ms
stdout | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] upgrade: .claude/agents/bkit-update.md

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > multiple candidates: mixed update/conflict/skip
[bkit-upgrade] conflict: .claude/agents/bkit-conflict.md — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T5 — runUpgrade diff engine > skips missing template files without throwing
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-NLUDae/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 239ms
 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 226ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 233ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 215ms
(node:75822) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:75822) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 279ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 226ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 150ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 202ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 124ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 186ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 139ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 107ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 84ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 87ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 127ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 166ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 128ms
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 197ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 96ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 94ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 166ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 89ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 153ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 169ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 216ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 146ms
(node:77884) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:77884) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:77884) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:77884) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 141ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 106ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 122ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 78ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 146ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 89ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 104ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 133ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 58ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 63ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 43ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 37ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 46ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 38ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 68ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 34ms
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

 ✓ .bkit/core/engine/ledgers/status.test.ts (14 tests) 30ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 41ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 48ms
 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 49ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 25ms
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

 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 64ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 51ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 95ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 61ms
 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 45ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 28ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 46ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 30ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 33ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 30ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794281488140.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794281488144.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794281488146.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794281488157.js — skipping

 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 34ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 49ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 32ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 28ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 22ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 37ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 38ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 43ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 20ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 22ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 11ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 42ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 15ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 12ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 11ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 14ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 9ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 12ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 16ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 13ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (6 tests) 15ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 23ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 9ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 162978ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 579ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1872ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 334ms
     ✓ writes no limits for a workflow with no ask point 324ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 315ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 347ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 405ms
       ✓ a new run in the same chat gets its own session row 483ms
       ✓ writes none outside Claude Code 347ms
     ✓ opens the next run after a finished one, and after another workflow's run 571ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 434ms
     ✓ design / plan / build / debug book in the current worktree 353ms
     ✓ refuses when the lock is live, writing no row 307ms
     ✓ --lock-held checks the lock is ours 427ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 312ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 456ms
   ✓ bkit workflows start — resume facts (5)
     ✓ an OPEN decision of an earlier run never resurfaces 416ms
     ✓ an OPEN decision mid-build prints its header fields 341ms
     ✓ reads Test attempt from a tests pause 316ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 522ms
     ✓ writes no row when status.jsonl does not exist 360ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 526ms
     ✓ aborts a rebase only when one is in progress 1261ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 797ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 818ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 519ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 569ms
     ✓ --max-exceeded says a handover is due without any sentinel 460ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 433ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 486ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 612ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 305ms
     ✓ a debug run in SOAK mode always needs a handover 375ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 919ms
       ✓ counts subagents of an earlier chat the run's session rows name 917ms
       ✓ records no context block, and still closes, outside a Claude Code session 899ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 1023ms
     ✓ records ending held and publish false on the workflow-done row 827ms
     ✓ defaults the close row to ending done 947ms
     ✓ refuses an unknown ending 341ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 922ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 802ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 878ms
     ✓ always writes the telemetry, whatever the runtime 858ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 633ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 783ms
     ✓ an unwritable stats path is logged and never fails the close 797ms
     ✓ appends the completeness row before the workflow-done row 911ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 888ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 809ms
     ✓ writes one completeness row per close 1381ms
     ✓ leaves out the previous run's rows that share a second with this run's start 699ms
     ✓ still closes when the completeness check throws 828ms
     ✓ still closes when the completeness row write throws 902ms
     ✓ ship: run.pr, size of the squash commit, and coverage 1053ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 1360ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 864ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 733ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 1162ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 1100ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 1101ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 1259ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 1081ms
     ✓ --record-step writes the close step's row before workflow-done 1001ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 921ms
     ✓ --number without --outbox is a usage error 783ms
     ✓ --flush is ship only 379ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 1202ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 1162ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 1191ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1180ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 1091ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 572ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 468ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 4188ms
     ✓ --flush with nothing to record commits and pushes nothing 1731ms
     ✓ --flush carries the named worktree's logs into the dev commit 3125ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 4530ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 3601ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 4817ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 3701ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 3898ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 4001ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 3906ms
     ✓ --push on dev never carries a row whose references name another feature 4203ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 4787ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 6848ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 4037ms
     ✓ --push commits in the named worktree, not the checkout it runs from 1598ms
     ✓ rejects --push with --flush, and --flush outside ship 455ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 4452ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 3138ms
     ✓ a close that landed releases the lock 4173ms
     ✓ removes the worktree before it releases the lock 4099ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 5266ms
       ✓ closePr refuses when the PR base is unknown 4627ms
     ✓ leaves a worktree no workflow created, and its branch, in place 3660ms
   ✓ bkit workflows promote (7)
     ✓ exits 12 when there is no versioned draft 319ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 320ms
     ✓ stamps the anchor from the runtime-resolved base commit 457ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 449ms
     ✓ rejects a workflow other than design or plan 397ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 508ms
     ✓ names the branch, not the remote-tracking ref, in each URL 566ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 564ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 584ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 1355ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 831ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1940ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 467ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 364ms
     ✓ a second run's record does not let this FID's close commit 417ms
     ✓ record is present after workflows close and before the push 712ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1404ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 303ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 434ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 790ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 504ms
     ✓ puts each --line after the summary, in flag order 444ms
     ✓ --summary prints the file and keeps a copy in --outbox 391ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 398ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 221912ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 821ms
     ✓ rejects missing explicit and ambiguous existing branch selections 770ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1058ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 933ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 581ms
     ✓ a refused --continue carries git's own reason 910ms
     ✓ --file records nothing for a refused rebase 763ms
     ✓ refuses a code conflict and aborts the rebase on the spot 586ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1444ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 538ms
     ✓ produces byte-identical output to merge=union 1489ms
     ✓ restores a trailing newline so the next append starts on its own line 1047ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1365ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1466ms
     ✓ refuses a union that leaves a line which is not JSON 886ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1228ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1884ms
     ✓ refuses a lockfile whose regenerate command fails 1239ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1575ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1541ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1364ms
     ✓ refuses and aborts when both sides changed the hand-written region 903ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 967ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1113ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1543ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 808ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1023ms
     ✓ refuses and aborts when a side deleted the install record 842ms
     ✓ refuses a conflicted doc the repo's script does not list 770ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 679ms
     ✓ removes a stale sentinel when the rebase succeeds 1008ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1263ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1080ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 631ms
       ✓ skips (12) with no anchor 611ms
       ✓ skips (12) when the base is unreachable in this clone 765ms
       ✓ skips (12) when nothing landed since the base 633ms
       ✓ runs (0) with the landed path count once dev moved 1203ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 700ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1357ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 905ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1132ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1732ms
     ✓ runs exactly one git push 1844ms
     ✓ --set-upstream records the upstream 1065ms
     ✓ refuses with no branch checked out 838ms
     ✓ --mode=dev refuses a feature checkout 696ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1939ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2918ms
     ✓ --require-ci pushes as-is when dev has not moved 1370ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 3028ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3719ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 957ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 2099ms
     ✓ --mode=abort pushes when the branch has no open PR 1481ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1192ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 731ms
     ✓ --open-pr carries the MCP answer and skips gh 1001ms
     ✓ --mode=abort on dev pushes plainly without probing 1074ms
     ✓ rejects an unknown mode 803ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 3966ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1929ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2193ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4181ms
     ✓ skip-ci HEAD on the replay is refused 1245ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3846ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4441ms
     ✓ a level local dev is a plain push, recording nothing extra 2166ms
     ✓ a record with no commits pushes nothing 1586ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 917ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2339ms
     ✓ a rewritten branch is refused, never forced 1982ms
     ✓ refuses dev and main with exit 21 and pushes nothing 850ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2618ms
     ✓ refuses a detached HEAD (exit 5) 822ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1719ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2168ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2007ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 2139ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1171ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2202ms
     ✓ an up-to-date branch is a no-op 1218ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2095ms
     ✓ a fetch that fails exits 10 731ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 1073ms
     ✓ scan-diff still reports a new skip when its test … 1099ms
     ✓ scan-diff reports a skip moved onto a different t… 1157ms
     ✓ scan-diff does not cancel a skip moved between am… 1375ms
     ✓ scan-diff does not spend an unchanged duplicate t… 1252ms
     ✓ scan-diff recognizes a renamed test file 1217ms
     ✓ scan-diff recognizes a suite moved into a differe… 1215ms
     ✓ scan-diff does not let unrelated additions hide a… 1057ms
     ✓ scan-diff attributes deletion to its old test ins… 1264ms
     ✓ scan-diff consumes each moved assertion once and … 1008ms
     ✓ scan-diff does not match identical assertions fro… 1113ms
     ✓ scan-diff does not match the same leaf test name … 1205ms
     ✓ scan-diff does not match a same-named test with d… 1261ms
     ✓ scan-diff does not match a same-named test with c… 1125ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1110ms
     ✓ --paths with no match exits 1 1093ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 853ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1507ms
     ✓ --marker reads a diff over 1 MiB 1187ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1449ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1269ms
     ✓ scan-diff finds an added skip 1318ms
     ✓ scan-diff ignores a skip predating the base 1227ms
     ✓ scan-diff reports a disabled test with its line 1256ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 1124ms
     ✓ scan-diff ignores a removed comment in a test file 972ms
     ✓ scan-diff ignores an assertion moved within the file 552ms
     ✓ scan-diff still reports a removed assertion 479ms
     ✓ scan-diff reports an assertion re-added only outside the test file 430ms
     ✓ scan-diff finds an added pytest mark skip 497ms
     ✓ scan-diff finds an added unittest skip 441ms
     ✓ scan-diff finds an added bare skip call 445ms
     ✓ scan-diff ignores a quoted skip in a documentation file 473ms
     ✓ scan-diff ignores a marker literal in a non-test source file 527ms
     ✓ scan-diff ignores an assertion whose expectation changed 535ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 608ms
     ✓ scan-diff reports a deleted test file 667ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 412ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1147ms
     ✓ a title that already carries the marker is left alone 771ms
     ✓ with no open PR: pushes the marker commit and edits no title 806ms
     ✓ a re-run is deduped: no second marker commit 1115ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1332ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 384ms
     ✓ --title-set skips gh entirely 595ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 407ms
     ✓ Path B once dev moved; --head checks a given commit 547ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 563ms
     ✓ --merge-docs merges dev when docs/ is behind 730ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 662ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1000ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 937ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 768ms
     ✓ --merge-docs skips an empty bkit:generate script 712ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 649ms
     ✓ --merge-docs never merges on dev itself 482ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 566ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 539ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 526ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 516ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 710ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 736ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 894ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 811ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1001ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1386ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 785ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 966ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 601ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 498ms
     ✓ exits 10 when the fetch fails 374ms
     ✓ refuses --merge-docs with --head, and an unknown --head 369ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 686ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 979ms
     ✓ a failed install stops ship (16) 744ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 509ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 451ms
     ✓ exits 10 when the fetch fails 361ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1689ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1295ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1097ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1141ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2305ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3124ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 410ms
     ✓ local: names unpushed dev as the cause when the branch carries it 498ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 526ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1170ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1198ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 914ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 901ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1018ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 953ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 623ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1246ms
     ✓ land removes the worktree when only the copied .env is untracked 1314ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1176ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1063ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1703ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1033ms
     ✓ landPr refuses a main-based PR without retrying 553ms
     ✓ landPr refuses when the PR base is unknown 542ms
     ✓ PR not open (closed): stops (17) at once, no retry 651ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 378ms
     ✓ --attempt names the merge round in a fix commit 365ms
     ✓ commits a rewritten and a deleted tracked file 372ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 337ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 341ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 514ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 461ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts > gateguard opencode plugin — multi-file patch tool > patch (v1 driver): checks every Add / Update / Move-to / Delete target
Error: Test timed out in 10050ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts:660:3
    658|   it.each(
    659|     ["patch", "apply_patch"].flatMap((tool) => [[tool, "v2"] as const,…
    660|   )("%s (%s driver): checks every Add / Update / Move-to / Delete targ…
       |   ^
    661|     const session = newSession();
    662|     const { hookInput, output } = patchInput(tool, session, PATCH);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > frictionRow > writes a friction row with no run object when parentSha is unresolvable
AssertionError: expected { ok: true, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
    "ok": true,
+   "receipt": {
+     "bytes": 481,
+     "offset": 0,
+   },
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:102:42
    100|     expect(row).not.toHaveProperty("run");
    101|     expect(validate(row)).toEqual({ ok: true });
    102|     expect(appendFrictionRow(root, row)).toEqual({ ok: true });
       |                                          ^
    103|     const line = fs.readFileSync(path.join(root, ".bkit", "friction.js…
    104|     expect(JSON.parse(line)).not.toHaveProperty("run");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > pauseFrictionRow > pauseFrictionRow builds a valid human-confirm row keyed owner-pause/{workflow}.{reason}
AssertionError: expected { ok: true, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
    "ok": true,
+   "receipt": {
+     "bytes": 525,
+     "offset": 0,
+   },
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:131:42
    129|     expect(validate(row)).toEqual({ ok: true });
    130|     expect(writerProblem(row)).toBeUndefined();
    131|     expect(appendFrictionRow(root, row)).toEqual({ ok: true });
       |                                          ^
    132|     const line = fs.readFileSync(path.join(root, ".bkit", "friction.js…
    133|     expect(JSON.parse(line)).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendFrictionRow > records a recurrence as an appended same-key row, and folds to the raised count
AssertionError: expected { ok: true, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
    "ok": true,
+   "receipt": {
+     "bytes": 544,
+     "offset": 0,
+   },
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:160:44
    158|     const root = tmp();
    159|     const first = own(root);
    160|     expect(appendFrictionRow(root, first)).toEqual({ ok: true });
       |                                            ^
    161|     const written = lines(root)[0];
    162|     expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendFrictionRow > reopens a CLOSED row that recurs, and keeps a TRIAGED one triaged
AssertionError: expected { ok: true, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
    "ok": true,
+   "receipt": {
+     "bytes": 544,
+     "offset": 0,
+   },
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:189:46
    187|       const root = tmp();
    188|       const first = own(root);
    189|       expect(appendFrictionRow(root, first)).toEqual({ ok: true });
       |                                              ^
    190|       const winner = JSON.parse(lines(root)[0]!) as Record<string, unk…
    191|       const ts = (winner["ts"] as number) + 1;

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendFrictionRow > finds the same-key row whatever the spacing of its key field
AssertionError: expected { ok: true, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
    "ok": true,
+   "receipt": {
+     "bytes": 574,
+     "offset": 588,
+   },
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:207:48
    205|       `${JSON.stringify({ ...first, recurrenceCount: 4 }, null, 1).rep…
    206|     );
    207|     expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
       |                                                ^
    208|     expect(JSON.parse(lines(root).at(-1)!)).toMatchObject({ recurrence…
    209|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/ledgers/journal.test.ts > appendFrictionRow > keeps a row another writer appends while a recurrence is recorded
AssertionError: expected { ok: true, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
    "ok": true,
+   "receipt": {
+     "bytes": 544,
+     "offset": 0,
+   },
  }

 ❯ .bkit/core/engine/ledgers/journal.test.ts:213:48
    211|   it("keeps a row another writer appends while a recurrence is recorde…
    212|     const root = tmp();
    213|     expect(appendFrictionRow(root, own(root))).toEqual({ ok: true });
       |                                                ^
    214|     const foreign = JSON.stringify(own(root, { step: "build-foreign" }…
    215|     readHook.file = ledger(root);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/commands/workflow/locks.test.ts > publication ownership lock > serializes publication for one target and invocation
AssertionError: expected null not to be null
 ❯ ownedPublication .bkit/core/engine/commands/workflow/locks.test.ts:89:20
     87| }
     88| function ownedPublication(lock: PublicationLock | null): PublicationLo…
     89|   expect(lock).not.toBeNull();
       |                    ^
     90|   if (!lock) throw new Error("expected owned publication lock");
     91|   return lock;
 ❯ .bkit/core/engine/commands/workflow/locks.test.ts:103:25

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  3 failed | 170 passed (173)
      Tests  8 failed | 7388 passed | 2 skipped (7398)
   Start at  13:28:54
   Duration  223.16s (tests 96%, import 2%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/860-move-deterministic-bookkeeping/build-group-gate-3-3.log.reports/vitest-66023.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   89.57 |    83.07 |   95.08 |   90.99 |                   
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
 engine/commands   |   89.12 |     83.6 |   93.64 |   90.67 |                   
  analysis.ts      |     100 |    90.51 |     100 |     100 | ...84,393,461,594 
  comply.ts        |   68.62 |    69.01 |   86.66 |   66.66 | ...18-319,352-397 
  land.ts          |   89.92 |    82.47 |     100 |    92.3 | ...82,195,197,204 
  launch.ts        |     100 |    92.59 |     100 |     100 | 63,66             
  lib.ts           |   92.13 |    87.09 |   97.43 |    96.4 | ...60,663,723-726 
  registry.ts      |     100 |      100 |     100 |     100 |                   
  stats.ts         |   80.95 |    68.75 |   71.42 |      80 | ...18-231,257-258 
  telemetry.ts     |       0 |        0 |       0 |       0 | 14-30             
  tips.ts          |     100 |    66.66 |     100 |     100 | 27                
 ...ne/commands/ci |   95.78 |    86.92 |   90.41 |   97.88 |                   
  ci.ts            |   97.38 |    88.56 |   95.34 |    98.8 | 271,719,798,973   
  pins.ts          |   92.39 |    89.23 |   70.58 |    92.5 | 141-145,163       
  push-gate.ts     |   93.22 |    81.74 |     100 |   99.03 | 210               
 ...mmands/install |   47.59 |    45.02 |   58.75 |   47.98 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   91.89 |    84.23 |   96.28 |   93.38 |                   
  branches.ts      |   90.43 |    83.65 |   98.23 |    92.3 | ...3037,3062,3205 
  challenge.ts     |   96.28 |    85.36 |     100 |   97.43 | ...80,412-414,700 
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.38 |    94.69 |     100 |    98.8 | 240,557           
  decisions.ts     |   95.32 |    80.72 |   97.72 |   98.36 | 206,311,380       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |    93.4 |    85.49 |    97.4 |   95.07 | ...1275,1290-1300 
  ledgers.ts       |    89.3 |    79.02 |   96.15 |   92.28 | ...2099-2100,2128 
  locks.ts         |   92.21 |    87.71 |    92.3 |    94.4 | ...91-292,461-462 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 490-491           
  runs.ts          |   91.57 |    84.15 |    99.1 |   92.67 | ...2403,2435-2439 
  runtime.ts       |   97.82 |    86.66 |   94.11 |     100 | ...55,304,324-329 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |    94.7 |    92.87 |     100 |   95.58 | ...86,695,712,853 
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    88.7 |     81.2 |   92.18 |   90.46 | ...2317,2319,2342 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |   96.65 |    88.76 |   96.73 |   97.94 | ...2340,2436-2438 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.48 |    82.68 |    97.4 |   95.09 | ...1768,1942,2674 
  worktrees.ts     |   61.24 |     59.2 |   66.66 |   62.37 | ...1132,1135-1136 
 engine/install    |   93.11 |    84.57 |   94.15 |   95.87 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   95.57 |    91.98 |   98.15 |   96.49 |                   
  status.ts        |   94.04 |    93.57 |    97.1 |   96.71 | ...50-656,670,690 
  telemetry.ts     |   96.09 |    91.45 |   98.64 |   96.42 | ...1858,2016,2377 
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
Statements   : 89.57% ( 19501/21770 )
Branches     : 83.07% ( 14703/17698 )
Functions    : 95.08% ( 3152/3315 )
Lines        : 90.99% ( 17116/18810 )
================================================================================
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.
> [bkit] TRUNCATED — kept 1859 of 3834 lines (125 KB of 287 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
