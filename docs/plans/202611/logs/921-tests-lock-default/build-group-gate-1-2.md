
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'


> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/156 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'

[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring

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
 525:148  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 647:50   warning  Don't start a sentence with 'There is'.  write-good.ThereIs 
 730:116  warning  Don't start a sentence with 'There is'.  write-good.ThereIs 


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
 384:137  warning  Don't start a sentence with 'There are'.  write-good.ThereIs 
 424:189  warning  Don't start a sentence with 'There is'.   write-good.ThereIs 
 495:31   warning  Don't start a sentence with 'There are'.  write-good.ThereIs 

✖ 0 errors, 47 warnings and 0 suggestions in 152 files.
passed: true
skipped: null
files: 152

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> bkit ci slop

[bkit-ci] base 5cf3981e367bd9a382ee3bcba6e67da623d7953f (5cf3981e367bd9a382ee3bcba6e67da623d7953f) vs working tree
[bkit-ci] added 1, resolved 1, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: 5cf3981e367bd9a382ee3bcba6e67da623d7953f
base: 5cf3981e367bd9a382ee3bcba6e67da623d7953f
added: 1
resolved: 1
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (131 tests) 32148ms
   ✓ bkit steps done (24)
     ✓ --attempt=next advances with each row, so the next parentSha differs 389ms
     ✓ reports a failed commit with exit 8 without writing the row 630ms
     ✓ a failed commit leaves no row staged in the index 1061ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 664ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 568ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 703ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 461ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 800ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 363ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 372ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 339ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 427ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 570ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 430ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 500ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 773ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 493ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 478ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 362ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 709ms
     ✓ writeStepRow refuses when a recorded path changed 825ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 373ms
     ✓ writeStepRow appends its commit sha to the record 699ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 876ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (12)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 532ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 508ms
     ✓ skips a red record for a test name the plan no longer holds, and still locks the planned test 522ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 752ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 541ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 374ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 602ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ does not count an artifact the run found committed when it started 397ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ commits a package.json change outside bkit.workflows 308ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 533ms
 ✓ .bkit/core/engine/commands/workflow/runs.test.ts (202 tests) 62188ms
   ✓ rejects fork verification runs that shadow a red selected workflow at the same head 985ms
   ✓ preserves the requested event for selected-workflow verification 838ms
   ✓ requires selected other-workflow success at the exact pushed head 1613ms
   ✓ bkit runs locate (15)
     ✓ locates CI evidence using prompt saved issue and local precedence 2004ms
     ✓ saves the failed job count without the capstone job 542ms
     ✓ counts the capstone job when it is the only failed job 538ms
     ✓ saves no failed job count when no job failed 697ms
     ✓ filters branch and PR discovery by configured workflow and exact head 985ms
     ✓ freezes explicit workflow run attempt and all failed job pages 606ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1241ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1610ms
     ✓ rejects malformed empty workflow result count -1 without selecting local 458ms
     ✓ rejects malformed empty workflow result count 0.5 without selecting local 463ms
     ✓ rejects malformed empty workflow result count 1 without selecting local 462ms
     ✓ rejects a workflow result count smaller than its returned records 466ms
     ✓ validates normalized fallback evidence against the requested identity 318ms
   ✓ bkit runs gate (74)
     ✓ refuses green CI when dev advanced beyond the validated code head 1225ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1573ms
     ✓ checks the named repository base and fails closed on missing evidence 812ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 730ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 815ms
     ✓ rejects MCP capstone jobs belonging to another run 1068ms
     ✓ --fetch refreshes origin/<branch> before gating 500ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 421ms
       ✓ a source change past the validated head refuses (17) and names the path 354ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 404ms
       ✓ a validated sha that is not an ancestor refuses (17) 311ms
   ✓ bkit runs mirror (18)
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 802ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 430ms
   ✓ bkit runs wait (10)
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1100ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 358ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 683ms
     ✓ a failed re-trigger push names the cause in the log 970ms
     ✓ a failed re-trigger push leaves no orphan commit behind 716ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1204ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 697ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 422ms
     ✓ gh-error: every poll errored 355ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 710ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 583ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 698ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 593ms
     ✓ CLI: verdict JSON, body scan, exit codes 565ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 391ms
     ✓ CLI: --poll-result is validated, --attempts needs it 320ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 893ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 1840ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 1880ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2082ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 584ms
     ✓ re-trigger on dev only uses the record of its own FID 532ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 411ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 549ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 311ms
   ✓ bkit runs revalidate (7)
     ✓ --repo scopes every gh call (3)
       ✓ without --repo no call gains a --repo flag 321ms
     ✓ requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse 1458ms
   ✓ bkit runs context (12)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 340ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 334ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 400ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 499ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 456ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 518ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 612ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 533ms
     ✓ --file and --step go together 427ms
   ✓ bkit runs handoff (1)
     ✓ derives handoff decisions from persisted poll observations and target identity 2661ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-bvEf7T/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 111ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (154 tests) 30060ms
   ✓ CI evidence test rounds (4)
     ✓ runs local gates only after current-generation remediation or soak 816ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 499ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 301ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 306ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 311ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 324ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 332ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 434ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 340ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 416ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 306ms
     ✓ PASS is 0 failures with or without reports 375ms
     ✓ clears a previous attempt's reports before the gate runs 500ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 448ms
     ✓ a log under the outbox is named main-checkout relative in the record 356ms
     ✓ a log small enough is copied whole: not clamped, raw null 366ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 342ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 470ms
     ✓ numbers runs within the workflow's active run and per step 697ms
     ✓ without --file no row is written and the output carries row null 301ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 819ms
     ✓ a planned test that passes is a vacuous gap, exit 1 458ms
     ✓ a planned test absent from a loaded report is a missing gap 425ms
     ✓ a file that fails to load is a red of kind red-not-loaded 734ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 600ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 685ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 392ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 437ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 761ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 528ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 683ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 610ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 924ms
     ✓ green: a passed-accepted test is already landed, not a gap 542ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 568ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 646ms
     ✓ green: --group audits only that group's tasks 548ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 667ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 677ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 538ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 719ms
     ✓ green: lists each gap kind, with the runner output 530ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 995ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 367ms
 ✓ .bkit/core/engine/checks/status-holes.test.ts (77 tests) 1737ms
stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ✓ .bkit/core/engine/ledgers/telemetry.test.ts (301 tests) 579ms
 ✓ .bkit/core/engine/commands/lib.test.ts (73 tests) 4148ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1330ms
     ✓ runGit names ENOBUFS when output passes the limit 753ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 749ms
   ✓ explicit invocation context (2)
     ✓ rejects stale cross-worktree invocation and conflicting overrides 303ms
 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (115 tests) 27417ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 613ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 532ms
     ✓ always writes the marker, even with no plan 392ms
     ✓ writes the linear marker shape, taking the tracker from package.json 366ms
     ✓ writes the jira marker shape, taking the tracker from package.json 378ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 371ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 388ms
     ✓ retries a failed create once, and exits 5 when it fails twice 445ms
     ✓ exits 5 when the open-PR probe errors 326ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 431ms
     ✓ prs open still opens against any other base 371ms
     ✓ exits 6 when the created PR's base is not --base 355ms
   ✓ bkit prs probe ship entry (3)
     ✓ does not adopt a merged PR when the feature has newer work 1604ms
     ✓ refuses merged entry when current feature evidence cannot be read 592ms
     ✓ qualifies MCP merged PR facts against newer feature work without gh 644ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 434ms
     ✓ exits 1 with found=false when there is none 360ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 406ms
     ✓ --number reads one PR, mergeable included 311ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 390ms
     ✓ exits 4 when gh errors and 80 when it needs auth 512ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 416ms
     ✓ classifies a refused merge with a new dev conflict as integration 344ms
     ✓ returns an explicit terminal reason for other merge refusals 525ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 339ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 457ms
     ✓ drops the force-build marker from the title subject 333ms
     ✓ takes an explicit --subject 329ms
     ✓ runs no merge when the PR is already MERGED 309ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 457ms
     ✓ prs merge refuses a PR whose base is main 310ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 359ms
     ✓ prs merge refuses when the PR base is unknown 301ms
     ✓ prs merge reads the base from the one pr view it already makes 315ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 341ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 328ms
     ✓ updates when a dev ruleset requires status checks 314ms
     ✓ updates when dev's branch protection requires status checks 306ms
     ✓ ignores dev rulesets that require no checks 603ms
     ✓ updates when the repo cannot be resolved 580ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 331ms
   ✓ bkit prs checks (7)
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 307ms
     ✓ is not green on an empty rollup (total 0) 554ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 362ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 679ms
   ✓ bkit prs verbose-ci (4)
     ✓ strips the marker, with or without its bkit prefix 347ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 469ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (108 tests) 36357ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 22276ms
     ✓ every prompt, workflow and utility agent has the three header blocks 345ms
     ✓ sync has nothing left to rewrite 11688ms
     ✓ every clause reaches the cut-off of one surface it applies to 1524ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (171 tests) 107462ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 718ms
   ✓ bkit workflows start — resume facts (11)
     ✓ workflows start reports the status of a reopened DECIDED decision file in openDecision 415ms
   ✓ bkit workflows fail (24)
     ✓ writes workflow-failed, releases its lock, and reports no handover 303ms
     ✓ aborts a rebase only when one is in progress 495ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 448ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 485ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 304ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 307ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 322ms
     ✓ bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares 340ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 622ms
       ✓ counts subagents of an earlier chat the run's session rows name 615ms
       ✓ records no context block, and still closes, outside a Claude Code session 594ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 598ms
     ✓ records ending held and publish false on the workflow-done row 588ms
     ✓ defaults the close row to ending done 587ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 606ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 581ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 586ms
     ✓ always writes the telemetry, whatever the runtime 555ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 451ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 538ms
     ✓ an unwritable stats path is logged and never fails the close 502ms
     ✓ appends the completeness row before the workflow-done row 603ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 551ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 574ms
     ✓ writes one completeness row per close 892ms
     ✓ leaves out the previous run's rows that share a second with this run's start 506ms
     ✓ still closes when the completeness check throws 558ms
     ✓ still closes when the completeness row write throws 569ms
     ✓ ship: run.pr, size of the squash commit, and coverage 638ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 885ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 515ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 461ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 638ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 472ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 578ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 557ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 610ms
     ✓ --record-step writes the close step's row before workflow-done 359ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 418ms
     ✓ --number without --outbox is a usage error 457ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 702ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 560ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 637ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 669ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 512ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1809ms
     ✓ --flush with nothing to record commits and pushes nothing 804ms
     ✓ --flush carries the named worktree's logs into the dev commit 1405ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2224ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1767ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2114ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1945ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1900ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1728ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1693ms
     ✓ --push on dev never carries a row whose references name another feature 1672ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1943ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3736ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1992ms
     ✓ --push commits in the named worktree, not the checkout it runs from 948ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 2035ms
     ✓ preserves unlanded file deletions and ledger additions on close 4420ms
     ✓ preserves dirty work and uncertain branch evidence during close 4446ms
     ✓ preserves a local feature ref changed after its cleanup proof 4392ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2382ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1766ms
     ✓ a close that landed releases the lock 2250ms
     ✓ removes the worktree before it releases the lock 2184ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ closePr refuses when the PR base is unknown 2623ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1620ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 557ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 335ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ a second run's record does not let this FID's close commit 485ms
     ✓ record is present after workflows close and before the push 885ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1614ms
   ✓ bkit workflows input (7)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 322ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 26485ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 707ms
     ✓ names each net-new and worsened finding in the log and the JSON 487ms
     ✓ fails on a net score rise with no net count change 476ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 539ms
     ✓ treats a net score at or below 0.001 as float noise 474ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 514ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 360ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 484ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 484ms
     ✓ exits 4 on a dropped net field instead of silently passing 494ms
     ✓ exits 4 on no summary instead of silently passing 519ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 722ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 726ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 701ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 694ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 394ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 339ms
     ✓ fails (exit 1) when vale reports alerts 336ms
     ✓ exits 6 on a vale runtime error 337ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 396ms
     ✓ falls back to vale sync when the main worktree has none 332ms
     ✓ fails when vale sync cannot restore the required styles 335ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 1 naming the code file, whatever the commit message says 311ms
> [bkit] TRUNCATED HERE — 1 line omitted. Dropped content was NOT read.
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 483ms
   ✓ bkit ci min-push (22)
     ✓ checks every --ref: one code ref among min-push refs fails the push 494ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 315ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 529ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set 307ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 305ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 305ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 378ms
     ✓ fetches the issue and its comments as GitHub returns them 391ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 409ms
     ✓ invalidates missing corrupt and unsupported progress cache 754ms
     ✓ contains cache read and write failures as standalone degradation 395ms
     ✓ uses legacy receipts and contains receipt failures 378ms
     ✓ records an engine-action row and skips the same key + body on a re-run 378ms
     ✓ a recent identical comment counts as done (the final close comment) 319ms
     ✓ a failed post reports done false with the reason and never leaks a token 324ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 380ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 338ms
     ✓ a different marker hash posts 332ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 391ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (74 tests) 26690ms
   ✓ bkit worktrees setup — debug (5)
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/commands/workflow/context.test.ts (107 tests) 8743ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
> [bkit] TRUNCATED HERE — 136 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 450ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1265ms
     ✓ a refused dev push is logged, never fails the close 1444ms
     ✓ an unreachable remote is logged, never fails the close 493ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 23ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 2010ms
> [bkit] TRUNCATED HERE — 657 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 326 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 532ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 355ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 754ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 541ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 379ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 370ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 382ms
     ✓ an unpinned repo reports nulls and asks no registry 368ms
   ✓ bkit repo preflight (4)
     ✓ reports the Actions permissions read is available, advisory false 465ms
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 372ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 361ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 361ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 366ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 378ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 344ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 353ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 358ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 350ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 106ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 83ms
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests) 17099ms
   ✓ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 1732ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1658ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1745ms
     ✓ does not fall back through a malformed later success receipt 1002ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 589ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 608ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 922ms
     ✓ a full-gate receipt carries an audit template's project-section increment to the minimum gate 1112ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 420ms
     ✓ does not record a committed tree 451ms
     ✓ records no proof for a failed gate or lighter gate 752ms
     ✓ requires integration proof when integration is declared 917ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 1396ms
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
     ✓ reads bkit.testing.ciCapstone and bkit.testing.ciWorkflow from package.json 319ms
     ✓ resolves config from the repo root when run from a subdirectory 354ms
     ✓ exits 6 when the PUT fails 318ms
   ✓ bkit setup protect-main — dry run (2)
     ✓ checks everything and reports the payload without writing 337ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/workflows/catalog-parity.test.ts (11 tests) 201ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 35ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (17 tests) 109ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 11ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 38ms
> [bkit] TRUNCATED HERE — 126 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 962ms
     ✓ counts files committed since --base 426ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 692ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 409ms
     ✓ runs the --fallback gate even when no file changed, as it did before 394ms
> [bkit] TRUNCATED HERE — 50 lines omitted. Dropped content was NOT read.
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 36ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 176ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 123ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 24ms
 ✓ .bkit/core/engine/commands/land.test.ts (45 tests) 37420ms
   ✓ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1167ms
     ✓ runs code.ts through its declared gate in the built checkout 1267ms
     ✓ runs code.ts through its declared gate in the built checkout 1263ms
     ✓ runs docs/audits/202611/logs.md through its declared gate in the built checkout 1179ms
     ✓ runs an audit template's project-section change through bkit:gate:min 1545ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 990ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1012ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1019ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 584ms
     ✓ runs the full gate for replayed debug code 922ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1129ms
     ✓ installs local dependencies against the built target tree 1301ms
     ✓ runs the configured frozen install even without root dependencies 1070ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 914ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1061ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1148ms
     ✓ never pushes local dev commits missing from origin/dev 1167ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2261ms
     ✓ dev moved before every push: exhausted, nothing landed 3089ms
     ✓ any other refusal is returned, not retried 1092ms
     ✓ pushToDev replays a commit range onto origin/dev 1248ms
     ✓ a replay retries on the new dev when dev moved 2171ms
     ✓ pushToDev log line names what it lands 1151ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1087ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1078ms
     ✓ a push that fails without a server answer is returned once, never retried 855ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 1436ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1102ms
     ✓ lands from a clone whose fetch refspec omits dev 1345ms
     ✓ build throwing stops the landing and removes the throwaway checkout 485ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 20ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (6 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 17ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 35ms
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 9238ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 556ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 613ms
     ✓ follows summary cursors even when the first page is shorter than the limit 448ms
     ✓ reports excluded intervals as unread even when pagination finishes 374ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 695ms
     ✓ reports an unread remainder at the page cap 521ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 403ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 610ms
     ✓ reports a failed first page as unavailable 365ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 340ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 701ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 371ms
     ✓ follows summary cursors even when the first page is shorter than the limit 344ms
     ✓ reports excluded intervals as unread even when pagination finishes 348ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 393ms
     ✓ reports an unread remainder at the page cap 357ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 361ms
     ✓ rejects missing summaries instead of treating them as empty results 332ms
     ✓ reports a failed first page as unavailable 311ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 114ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 99ms
 ✓ .bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts (12 tests) 1383ms
 ✓ .bkit/core/engine/render/parts.test.ts (9 tests) 764ms
   ✓ shipped hook templates (5)
     ✓ every generated hook parses: node --check for JS, bash -n for shell 741ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 14ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 16ms
(node:70571) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:70571) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:70571) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:70571) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 43ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 6ms
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

 ✓ .bkit/core/engine/install/modules/antigravity.test.ts (7 tests) 297ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 32ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 88ms
 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 19ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 18ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/tests-base.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 23ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/json-parse-owner.test.ts (4 tests) 4923ms
   ✓ JSON.parse inside a try statement belongs to shared/json.ts (4)
     ✓ no engine source parses JSON inside its own try 4913ms
 ✓ .bkit/core/engine/audits/repo/ledger-read-idiom.test.ts (11 tests) 790ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 18ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 20ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 22ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/tests-jump.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 6ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 9ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 58ms
 ✓ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests) 1422ms
   ✓ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 305ms
     ✓ limits execSync and execFileSync the same way 606ms
     ✓ stops a child that ignores SIGTERM at the remaining time 302ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 11ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 8ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 86ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 8ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 27ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 6ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 9ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 6ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 10ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 15037ms
   ✓ workflow shell fences (4)
     ✓ every fence parses under bash -n 10640ms
     ✓ every fence parses under zsh -n 4341ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (277 tests) 232184ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 309ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 461ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 572ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 407ms
     ✓ a refused --continue carries git's own reason 491ms
     ✓ --file records nothing for a refused rebase 397ms
     ✓ refuses a code conflict and aborts the rebase on the spot 477ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1408ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 451ms
     ✓ produces byte-identical output to merge=union 1071ms
     ✓ restores a trailing newline so the next append starts on its own line 579ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 612ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 825ms
     ✓ refuses a union that leaves a line which is not JSON 525ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 687ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1061ms
     ✓ refuses a lockfile whose regenerate command fails 734ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 969ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 908ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 922ms
     ✓ refuses and aborts when both sides changed the hand-written region 546ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 626ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 752ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 945ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 538ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 671ms
     ✓ refuses and aborts when a side deleted the install record 557ms
     ✓ refuses a conflicted doc the repo's script does not list 503ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 475ms
     ✓ removes a stale sentinel when the rebase succeeds 639ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 863ms
     ✓ resolves a conflict in each of two replayed commits across rounds 739ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 409ms
       ✓ skips (12) with no anchor 399ms
       ✓ skips (12) when the base is unreachable in this clone 454ms
       ✓ skips (12) when nothing landed since the base 430ms
       ✓ runs (0) with the landed path count once dev moved 820ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 449ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 863ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 488ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 636ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1045ms
     ✓ runs exactly one git push 1241ms
     ✓ --set-upstream records the upstream 510ms
     ✓ refuses with no branch checked out 364ms
     ✓ --mode=dev refuses a feature checkout 392ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1041ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1511ms
     ✓ --require-ci pushes as-is when dev has not moved 635ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1205ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1897ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 433ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 780ms
     ✓ --mode=abort pushes when the branch has no open PR 786ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 654ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 457ms
     ✓ --open-pr carries the MCP answer and skips gh 559ms
     ✓ --mode=abort on dev pushes plainly without probing 421ms
     ✓ rejects an unknown mode 388ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1731ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 915ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1180ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2862ms
     ✓ skip-ci HEAD on the replay is refused 668ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1760ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2355ms
     ✓ a level local dev is a plain push, recording nothing extra 876ms
     ✓ a record with no commits pushes nothing 637ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 500ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1211ms
     ✓ a rewritten branch is refused, never forced 844ms
     ✓ refuses dev and main with exit 21 and pushes nothing 545ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1217ms
     ✓ refuses a detached HEAD (exit 5) 482ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1021ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 953ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 980ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1126ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 445ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1028ms
     ✓ an up-to-date branch is a no-op 741ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1180ms
     ✓ a fetch that fails exits 10 485ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 641ms
     ✓ scan-diff still reports a new skip when its test … 638ms
     ✓ scan-diff reports a skip moved onto a different t… 612ms
     ✓ scan-diff does not cancel a skip moved between am… 625ms
     ✓ scan-diff does not spend an unchanged duplicate t… 649ms
     ✓ scan-diff recognizes a renamed test file 678ms
     ✓ scan-diff recognizes a suite moved into a differe… 646ms
     ✓ scan-diff does not let unrelated additions hide a… 589ms
     ✓ scan-diff attributes deletion to its old test ins… 618ms
     ✓ scan-diff consumes each moved assertion once and … 657ms
     ✓ scan-diff does not match identical assertions fro… 618ms
     ✓ scan-diff does not match the same leaf test name … 604ms
     ✓ scan-diff does not match a same-named test with d… 607ms
     ✓ scan-diff does not match a same-named test with c… 617ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 629ms
     ✓ --paths with no match exits 1 583ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 460ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 830ms
     ✓ --marker reads a diff over 1 MiB 655ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 763ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 672ms
     ✓ scan-diff finds an added skip 687ms
     ✓ scan-diff ignores a skip predating the base 593ms
     ✓ scan-diff reports a disabled test with its line 695ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 610ms
     ✓ scan-diff ignores a removed comment in a test file 595ms
     ✓ scan-diff ignores an assertion moved within the file 609ms
     ✓ scan-diff still reports a removed assertion 595ms
     ✓ scan-diff reports an assertion re-added only outside the test file 615ms
     ✓ scan-diff finds an added pytest mark skip 607ms
     ✓ scan-diff finds an added unittest skip 537ms
     ✓ scan-diff finds an added bare skip call 543ms
     ✓ scan-diff ignores a quoted skip in a documentation file 545ms
     ✓ scan-diff ignores a marker literal in a non-test source file 481ms
     ✓ scan-diff ignores an assertion whose expectation changed 407ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 430ms
     ✓ scan-diff reports a deleted test file 541ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 434ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1377ms
     ✓ a title that already carries the marker is left alone 1273ms
     ✓ with no open PR: pushes the marker commit and edits no title 990ms
     ✓ a re-run is deduped: no second marker commit 1255ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1200ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 419ms
     ✓ --title-set skips gh entirely 657ms
     ✓ refuses dev and main (exit 21) 334ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1414ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2437ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1418ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3011ms
     ✓ continues only the explicitly recorded target through the public merge command 2090ms
     ✓ fetches the unseen feature head before classifying the base 1401ms
     ✓ fast forwards the feature before either base path is chosen 3068ms
     ✓ merges divergent feature tips without rebasing either side 1817ms
     ✓ continues the feature merge before starting a dev merge 2802ms
     ✓ publishes local code with a CI running head before bookkeeping 3250ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4278ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2792ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2059ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 579ms
     ✓ Path B once dev moved; --head checks a given commit 848ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 921ms
     ✓ --merge-docs merges dev when docs/ is behind 1053ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 980ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1523ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1611ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1260ms
     ✓ --merge-docs skips an empty bkit:generate script 1111ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 897ms
     ✓ --merge-docs never merges on dev itself 810ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1234ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1380ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1109ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1127ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 557ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1543ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1456ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1918ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1365ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1416ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1837ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1298ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1456ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1069ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 679ms
     ✓ exits 10 when the fetch fails 392ms
     ✓ refuses --merge-docs with --head, and an unknown --head 450ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 839ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1363ms
     ✓ a failed install stops ship (16) 1173ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 879ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 859ms
     ✓ exits 10 when the fetch fails 621ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 454ms
     ✓ preserves unlanded file type changes in the shared landed comparison 417ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 308ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 488ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2424ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2370ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2398ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2179ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4240ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4937ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 864ms
     ✓ local: names unpushed dev as the cause when the branch carries it 982ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 996ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2816ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2331ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1823ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6637ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1924ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2167ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1951ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1154ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3224ms
     ✓ land removes the worktree when only the copied .env is untracked 2221ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1959ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1661ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2627ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1708ms
     ✓ landPr refuses a main-based PR without retrying 764ms
     ✓ landPr refuses when the PR base is unknown 692ms
     ✓ PR not open (closed): stops (17) at once, no retry 874ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 692ms
     ✓ --attempt names the merge round in a fix commit 629ms
     ✓ commits a rewritten and a deleted tracked file 638ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 572ms
     ✓ reports undeclared and runs nothing with no scripts 402ms
     ✓ reports undeclared and runs nothing with an empty script 393ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 503ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 586ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 399ms

 Test Files  178 passed (178)
      Tests  7726 passed | 2 skipped (7728)
   Start at  21:48:21
   Duration  233.53s (tests 97%, import 1%, setup 1%, transform 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/921-tests-lock-default/build-group-gate-1-2.log.reports/vitest-61783.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   88.59 |    82.35 |   94.55 |   90.07 |                   
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
 ...mands/workflow |   90.15 |    82.98 |   95.33 |   91.69 |                   
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
  locks.ts         |   94.01 |    87.71 |   96.15 |    95.8 | ...91-292,461-462 
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
Statements   : 88.59% ( 20957/23654 )
Branches     : 82.35% ( 16270/19755 )
Functions    : 94.55% ( 3354/3547 )
Lines        : 90.07% ( 18379/20403 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 540 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 346 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 344 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 331 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 353 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 328 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 121 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 383 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 370 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 362 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 374 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 353 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 365 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 391 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 1150 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 822 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 27 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 29 ms
ok 19 stub: the response selector is cleared before running its body # in 29 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 36 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 37 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 30 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 27 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 34 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 25 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 58 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 85 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 781 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 536 ms
ok 30 refresh drops a file deleted in the index from the build # in 498 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 467 ms
ok 32 a key removed from the env file is unset on the next run # in 279 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 249 ms
ok 34 non-BKIT_ keys are skipped # in 231 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 237 ms
ok 36 a failed unsetenv is retried on the next run # in 269 ms
ok 37 logs key names only, never values # in 229 ms
ok 38 missing env file exits 0 without calling launchctl # in 41 ms
ok 39 the sweep prints the summary line the lane greps for # in 472 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 16 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (170.268625ms)
✔ shell cancellation waits for SIGTERM cleanup (221.532833ms)
✔ direct cancellation waits for SIGINT cleanup (148.429125ms)
✔ shell cancellation waits for SIGINT cleanup (222.947041ms)
✔ direct cancellation waits for SIGHUP cleanup (145.842542ms)
✔ shell cancellation waits for SIGHUP cleanup (220.057917ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (506.968917ms)
✔ shell cancellation follows a worker orphaned by a nested shell (322.139292ms)
✔ direct cancellation preserves a nested machine-lock owner (616.538333ms)
✔ shell cancellation preserves a nested machine-lock owner (637.53625ms)
✔ nested shell cancellation preserves a nested machine-lock owner (640.030583ms)
✔ a hard process-group timeout reaches a shell command during cleanup (113.788166ms)
✔ ships a command-scoped sleep prevention wrapper (0.130958ms)
✔ preserves arguments, output and nonzero exit status (84.260041ms)
✔ runs an entire shell chain and retains its failure (52.371917ms)
✔ reports a missing command as 127 (49.172834ms)
✔ requires a command (44.12975ms)
✔ non-macOS platform selection runs commands without sleep prevention (72.435458ms)
✔ hard timeout escalation reaches a command that ignores TERM (184.3185ms)
✔ forwards POSIX cancellation to the command and releases the assertion (88.447ms)
✔ holds a real macOS assertion only while the command runs (113.589041ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4710.195958
> [bkit] TRUNCATED — kept 1643 of 3147 lines (113 KB of 244 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
