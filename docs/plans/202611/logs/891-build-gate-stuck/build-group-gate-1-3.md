
> @cbartens/bkit@6.1.1 bkit:gate:static-unit /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'

[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 is waiting for tests (up to 1200s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/app-gether-life/.worktrees/1517-fully-local-e2e (pid 31029, since 22:48:31), last run took 1m7s
[machine-lock] ⏳ bkit tests run bkit:gate:static-unit 891-build-gate-stuck build-group-gate-1 is waiting for tests (still, 1 min so far) (up to 1200s): in use by vitest .bkit/core/engine/audits/hooks .bkit/core/engine/install/modules .bkit/core/engine/render .bkit/core/engine/audits/templates .bkit/core/engine/tools/instructions .bkit/core/engine/checks/after — /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules (pid 73709, since 22:49:10), last run took 1m5s

> @cbartens/bkit@6.1.1 bkit:gate:static /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs --shell "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta"


> @cbartens/bkit@6.1.1 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.1.1 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> tsc -p tsconfig.test.json


> @cbartens/bkit@6.1.1 lint /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine


> @cbartens/bkit@6.1.1 format:check /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> @cbartens/bkit@6.1.1 format:tables:check /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit


0/166 files need formatting

> @cbartens/bkit@6.1.1 bkit:lint:prose /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
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

> @cbartens/bkit@6.1.1 bkit:slop:delta /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> bkit ci slop

[bkit-ci] base d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab (d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab) vs working tree
[bkit-ci] added 0, resolved 0, worsened 0; net findings 0, net score 0.00
[bkit-ci] OK — no net-new or worsened findings (baseline line-shifts ignored).
passed: true
skipped: null
baseRef: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
base: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
added: 0
resolved: 0
worsened: 0
netFindingCount: 0
netScore: 0
findings: []

> @cbartens/bkit@6.1.1 test:coverage:unit /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'

[test-timeout-budget] load average 11.6 on 10 cores: unit limits 10300ms per test, 20600ms per hook (x2.06)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
      Coverage enabled with v8

 ✓ .bkit/core/engine/commands/workflow/prs.test.ts (107 tests) 35561ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 549ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 1524ms
     ✓ always writes the marker, even with no plan 666ms
     ✓ writes the linear marker shape, taking the tracker from package.json 949ms
     ✓ writes the jira marker shape, taking the tracker from package.json 1327ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 1270ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 572ms
     ✓ retries a failed create once, and exits 5 when it fails twice 935ms
     ✓ exits 5 when the open-PR probe errors 819ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 912ms
     ✓ prs open still opens against any other base 949ms
     ✓ exits 6 when the created PR's base is not --base 724ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 758ms
     ✓ exits 1 with found=false when there is none 523ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 646ms
     ✓ --number reads one PR, mergeable included 672ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 650ms
     ✓ exits 4 when gh errors and 80 when it needs auth 970ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 337ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 442ms
     ✓ drops the force-build marker from the title subject 319ms
     ✓ takes an explicit --subject 309ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 720ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 312ms
     ✓ prs merge refuses when the PR base is unknown 306ms
     ✓ prs merge reads the base from the one pr view it already makes 576ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 667ms
   ✓ bkit prs update-branch (5)
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 425ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 555ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 611ms
     ✓ updates when a dev ruleset requires status checks 335ms
     ✓ updates when dev's branch protection requires status checks 919ms
     ✓ ignores dev rulesets that require no checks 1250ms
     ✓ updates when the repo cannot be resolved 565ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 386ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 330ms
     ✓ is not green when a check failed, naming it (exit 1) 318ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 323ms
     ✓ is not green on an empty rollup (total 0) 402ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 314ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 486ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 313ms
     ✓ is a no-op when the title already says so 948ms
     ✓ strips the marker, with or without its bkit prefix 671ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 860ms
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (68 tests) 36649ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1015ms
     ✓ names each net-new and worsened finding in the log and the JSON 1186ms
     ✓ fails on a net score rise with no net count change 827ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 963ms
     ✓ treats a net score at or below 0.001 as float noise 1866ms
     ✓ passes when the change only resolves findings 1782ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 826ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 1194ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 366ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1008ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 674ms
     ✓ exits 4 on a dropped net field instead of silently passing 1111ms
     ✓ exits 4 on no summary instead of silently passing 934ms
     ✓ exits 4 on output that is not JSON instead of silently passing 762ms
     ✓ exits 5 when the base worktree cannot be created 306ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1041ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 986ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 942ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 898ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 807ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1470ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 800ms
     ✓ explicit globs can select ignored prose and nested checkout files 559ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 673ms
     ✓ fails (exit 1) when vale reports alerts 561ms
     ✓ exits 6 on a vale runtime error 566ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 591ms
     ✓ falls back to vale sync when the main worktree has none 899ms
     ✓ fails when vale sync cannot restore the required styles 1266ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 350ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 325ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 414ms
     ✓ exits 1 naming the code file, whatever the commit message says 397ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 454ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 335ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 772ms
   ✓ bkit ci min-push (9)
     ✓ exits 0 when every changed file is a plan log or a ledger 322ms
     ✓ exits 1 naming the files outside, whatever the commit message says 374ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 656ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 441ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 414ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 837ms
     ✓ a top-level glob in the setting does not reach into folders 457ms
     ✓ a push that changes no files is not proven a min push 374ms
     ✓ exits 7 when a commit or its base cannot be read 448ms
 ✓ .bkit/core/engine/commands/workflow/steps.test.ts (116 tests) 38366ms
   ✓ test-round completion evidence (2)
     ✓ finishes validated CI evidence rounds without local clamp records 434ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 377ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 526ms
     ✓ reports a failed commit with exit 8 without writing the row 1557ms
     ✓ a failed commit leaves no row staged in the index 1065ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 1312ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 980ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 887ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 854ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 948ms
   ✓ bkit steps gate (8)
     ✓ --ref exits 3 when the ref does not carry the status file 331ms
     ✓ fails on a placeholder left in the artifact 305ms
     ✓ fails when the row's verdict differs from the artifact's 426ms
     ✓ fails when the row does not list the artifact, or carries another attempt 347ms
     ✓ fails on a missing artifact 352ms
   ✓ status row field names (5)
     ✓ writes attempt 0 rather than dropping it 300ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (7)
     ✓ fails a run-tests row missing its scope, and an empty scope 366ms
   ✓ bkit steps finish (16)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 499ms
     ✓ fills <done> from the artifact's first DONE line, else the fallback 411ms
     ✓ --commit=auto never stages a copied-in worktree.copy file 491ms
     ✓ --docs-only does not count a copied-in worktree.copy file as outside docs/plans/ 639ms
     ✓ --commit=auto commits when a copied-in worktree.copy entry is gitignored (#700) 440ms
   ✓ bkit steps finish --post (4)
     ✓ posts, records the engine-action row before the step row, and commits both 485ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 919ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 470ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
       ✓ gate with --issue=<id> requires the tracker shape and a tracker issue id 471ms
       ✓ gate with --issue absent is unchanged: the tracker shape alone 357ms
   ✓ bkit steps done — a run in place on dev that shares its checkout (5)
     ✓ writeStepRow with a shared-checkout record never commits a recorded path 747ms
     ✓ writeStepRow refuses when a recorded path changed 724ms
     ✓ writeStepRow exits 14 with no row and no commit when the run has no record on dev 305ms
     ✓ writeStepRow appends its commit sha to the record 633ms
     ✓ a hook-refused own-path commit exits without staging a recorded path or writing the row 1174ms
   ✓ bkit steps finish — the tests step touches only tests, the code steps never touch a test (10)
     ✓ derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused 701ms
     ✓ locks the planned test case, not its file: an edit to another test of the file passes 686ms
     ✓ refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row 424ms
     ✓ passes the execute step when every planned test file matches the row, and checks nothing without a row 1021ms
     ✓ applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at 675ms
     ✓ refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11 568ms
     ✓ refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15 378ms
     ✓ allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names 1140ms
   ✓ bkit steps finish — the attempt matches the saved artifacts (3)
     ✓ passes the highest saved attempt, and ignores another group's artifacts 492ms
     ✓ does not count an artifact the run found committed when it started 558ms
   ✓ bkit steps finish — a step commit never changes bkit.workflows (3)
     ✓ refuses (exit 13) a commit that would change a bkit.workflows key, naming it 354ms
     ✓ commits a package.json change outside bkit.workflows 537ms
     ✓ in a shared checkout, a bkit.workflows edit dirty before the run is not the step's 1091ms
 ✓ .bkit/core/engine/tools/instructions.test.ts (101 tests) 41396ms
   ✓ the corpus matches the instructions store (8)
     ✓ has no findings 22684ms
     ✓ every prompt, workflow and utility agent has the three header blocks 392ms
     ✓ sync has nothing left to rewrite 15691ms
     ✓ every clause reaches the cut-off of one surface it applies to 2229ms
 ✓ .bkit/core/engine/commands/workflow/tests.test.ts (146 tests) 42498ms
   ✓ CI evidence test rounds (3)
     ✓ runs local gates only after current-generation remediation or soak 1251ms
   ✓ bkit tests run (16)
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 527ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 907ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 563ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1530ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 1033ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 976ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 755ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 448ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 1052ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 716ms
     ✓ PASS is 0 failures with or without reports 962ms
     ✓ clears a previous attempt's reports before the gate runs 615ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 725ms
   ✓ bkit tests run --artifact (5)
     ✓ copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp 664ms
     ✓ a log under the outbox is named main-checkout relative in the record 756ms
     ✓ a log small enough is copied whole: not clamped, raw null 666ms
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 546ms
   ✓ bkit tests run --file (4)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 1091ms
     ✓ numbers runs within the workflow's active run and per step 570ms
     ✓ without --file no row is written and the output carries row null 325ms
   ✓ bkit tests red / green (32)
     ✓ runs each planned test file once and writes one build-tests-red row with a state and blob per planned test 803ms
     ✓ a planned test that passes is a vacuous gap, exit 1 489ms
     ✓ a planned test absent from a loaded report is a missing gap 435ms
     ✓ a file that fails to load is a red of kind red-not-loaded 685ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 774ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 927ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 989ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 922ms
     ✓ a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row 1150ms
     ✓ per-test proof (4)
       ✓ records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes 711ms
       ✓ an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier 980ms
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 1234ms
     ✓ green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap 897ms
     ✓ green: a passed-accepted test is already landed, not a gap 606ms
     ✓ green: a red state the tests step left as a gap is unproven, naming the state 588ms
     ✓ green: task-like text outside every block is a plan-level gap, and the rest is still audited 637ms
     ✓ green: --group audits only that group's tasks 524ms
     ✓ green: a DELETE still referenced in the tree is a delete-still-referenced gap 723ms
     ✓ green: a file moved to a CREATE of the same name is referenced only by imports of the old path 832ms
     ✓ green with no gaps prints verdict PASS and an empty gaps 560ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 784ms
     ✓ green: lists each gap kind, with the runner output 593ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1097ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 414ms
       ✓ green clears an exception-only task from a human commit 362ms
 ✓ .bkit/core/engine/commands/land.test.ts (43 tests) 46458ms
   ✓ pushToDev (29)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1309ms
     ✓ runs code.ts through its declared gate in the built checkout 1389ms
     ✓ runs code.ts through its declared gate in the built checkout 1287ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 990ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1001ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 975ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 565ms
     ✓ runs the full gate for replayed debug code 1039ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1275ms
     ✓ installs local dependencies against the built target tree 1394ms
     ✓ runs the configured frozen install even without root dependencies 1122ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1306ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1727ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1599ms
     ✓ never pushes local dev commits missing from origin/dev 1796ms
     ✓ dev moved: rebuilds on the new dev and pushes again 2747ms
     ✓ dev moved before every push: exhausted, nothing landed 3985ms
     ✓ any other refusal is returned, not retried 2395ms
     ✓ pushToDev replays a commit range onto origin/dev 1630ms
     ✓ a replay retries on the new dev when dev moved 3122ms
     ✓ pushToDev log line names what it lands 1507ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1816ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 1902ms
     ✓ a push that fails without a server answer is returned once, never retried 1671ms
     ✓ a failed fetch is returned before anything is built 563ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2235ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 1672ms
     ✓ lands from a clone whose fetch refspec omits dev 1832ms
     ✓ build throwing stops the landing and removes the throwaway checkout 596ms
[feat/test b47f7ee] gate
 ✓ .bkit/core/engine/commands/workflow/runtime.test.ts (50 tests) 12873ms
   ✓ bkit runtime detect — the table (17)
     ✓ local (no primitives) -> LOCAL, worktrees and dev pushes 488ms
     ✓ the marker is read from the main checkout even when run inside a linked worktree 979ms
     ✓ BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly 543ms
     ✓ LOCAL -> runtimeHeadless=false 343ms
     ✓ CLOUD_CLAUDE -> runtimeHeadless=false 942ms
     ✓ GITHUB_ACTION -> runtimeHeadless=true 736ms
     ✓ CLOUD_CURSOR -> runtimeHeadless=false 566ms
     ✓ UNKNOWN -> runtimeHeadless=false 563ms
     ✓ the marker outranks CLAUDE_CODE_REMOTE; BKIT_RUNTIME outranks the marker 584ms
   ✓ bkit runtime detect — the gh probe (3)
     ✓ runtimeGithubCli=true when gh auth status succeeds 350ms
     ✓ runtimeGithubCli=false, loudly, with the last non-empty stderr line, when gh auth fails 559ms
   ✓ bkit runtime detect — worktree path and contract (5)
     ✓ worktrees allowed (local) -> mints <root>/.worktrees/<fid> 493ms
     ✓ worktrees not allowed (cloud) -> adopts the repo root 372ms
     ✓ re-derives per call: one run's answer does not leak into the next 496ms
   ✓ bkit runtime row (6)
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 536ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 557ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 412ms
 ✓ .bkit/core/engine/commands/workflow/ledgers.test.ts (97 tests) 23539ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (24)
     ✓ modified ledger under the FID logdir is staged and committed 504ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 463ms
     ✓ brand-new untracked ledger is staged and committed 503ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 414ms
     ✓ path containing a space is staged and committed 368ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 380ms
     ✓ staging failure: exit 4 and no commit is created, no false success 348ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 370ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 308ms
     ✓ --mode=stage stages the sweep but creates no commit 320ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 1004ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 476ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 504ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 301ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 399ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 462ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 414ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 353ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 611ms
     ✓ --path records its commit on the run's record, like every other commit mode 527ms
     ✓ a recorded ledger commits only the rows the run appended 687ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 879ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 783ms
     ✓ commitBookkeeping refuses when a recorded path changed 428ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 542ms
     ✓ under --mode=commit counts the squashed paths as something to commit 563ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 341ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 370ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 349ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 572ms
     ✓ a source file in the range: exit 7, path listed 440ms
     ✓ another FID's plan file in the range: exit 7 509ms
     ✓ from not an ancestor of to: exit 7 348ms
 ✓ .bkit/core/engine/commands/ci/push-gate.test.ts (22 tests) 21889ms
   ✓ verified incremental push gates (22)
     ✓ keeps the later failure when two full gates overlap on the same commit 2480ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 2371ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 320ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 313ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 319ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 346ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 2321ms
     ✓ does not fall back through a malformed later success receipt 1221ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 699ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 780ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 1347ms
     ✓ requires proof even when the pushed increment changes no files 771ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ does not record a mutated tree 468ms
     ✓ does not record a committed tree 598ms
     ✓ records no proof for a failed gate or lighter gate 1144ms
     ✓ requires integration proof when integration is declared 1138ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 2012ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ locates CI evidence using prompt saved issue and local precedence 2659ms
     ✓ filters branch and PR discovery by configured workflow and exact head 881ms
     ✓ freezes explicit workflow run attempt and all failed job pages 901ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1361ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 2223ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 461ms
       ✓ a source change past the validated head refuses (17) and names the path 396ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 490ms
       ✓ --validated without --month / --fid is a usage error (2) 355ms
       ✓ a validated sha that is not an ancestor refuses (17) 375ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 476ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 870ms
     ✓ a failed re-trigger push names the cause in the log 993ms
     ✓ a failed re-trigger push leaves no orphan commit behind 1019ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1530ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 916ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 521ms
     ✓ gh-error: every poll errored 484ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 828ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 883ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 885ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 943ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 2238ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 2050ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 550ms
     ✓ re-trigger on dev only uses the record of its own FID 671ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 660ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 347ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 525ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 316ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 452ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 450ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 515ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 480ms
     ✓ --file and --step go together 400ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests) 22515ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 799ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ fails with a fetch error when there is no origin to rebase onto 409ms
     ✓ low disk (2)
       ✓ checks no disk when there are no cleanup step files 370ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
     ✓ counts commits behind origin/dev and the divergence age 903ms
     ✓ origin/dev unknown -> behindDev null, never a false '0 behind' (fix) 488ms
     ✓ --fetch fetches origin dev first, and a failed fetch is logged, not fatal 1012ms
   ✓ bkit repo info — where bkit, the repo root and the outbox live (2)
     ✓ prints the main checkout, the bkit binary there, and the outbox in the git common dir 461ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ prints the upgrade advisory when the pin is older than the newest release 783ms
     ✓ stays quiet when the pin is current or ahead (the bkit repo's own dev) 544ms
     ✓ an unknown newest release (remembered registry failure) is null, never an error 554ms
     ✓ an unpinned repo reports nulls and asks no registry 573ms
   ✓ bkit repo preflight (4)
     ✓ warns and carries on (exit 0, no MCP route) when the gh api read fails 547ms
     ✓ resolves owner/repo from the origin remote when --owner-repo is absent 393ms
     ✓ exits 3 when owner/repo cannot be resolved, or the flag is malformed 557ms
 ✓ .bkit/core/engine/commands/workflow/tracker.test.ts (104 tests) 31871ms
   ✓ best effort comment friction (4)
     ✓ continues after friction and diagnostic writes fail without recursion 310ms
     ✓ distinguishes fallback attempts from known delivery and lost reports 408ms
     ✓ logs cache receipt lock and reconciliation problems with stable recurrence identity 2394ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 550ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 565ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 365ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 569ms
     ✓ fetches the issue and its comments as GitHub returns them 574ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 863ms
     ✓ invalidates missing corrupt and unsupported progress cache 1026ms
     ✓ contains cache read and write failures as standalone degradation 635ms
     ✓ uses legacy receipts and contains receipt failures 458ms
     ✓ records an engine-action row and skips the same key + body on a re-run 421ms
     ✓ a recent identical comment counts as done (the final close comment) 331ms
     ✓ a failed post reports done false with the reason and never leaks a token 567ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 647ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 684ms
     ✓ a different marker hash posts 568ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 534ms
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/audits/templates/context-vercel-block.test.ts (22 tests) 12181ms
   ✓ Vercel runtime context block (bash) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 416ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 562ms
     ✓ follows summary cursors even when the first page is shorter than the limit 628ms
     ✓ reports excluded intervals as unread even when pagination finishes 533ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 959ms
     ✓ reports an unread remainder at the page cap 479ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 552ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 471ms
     ✓ rejects missing summaries instead of treating them as empty results 457ms
     ✓ reports a failed first page as unavailable 544ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 502ms
   ✓ Vercel runtime context block (/bin/sh) (11)
     ✓ preserves records and reports an unread remainder when no continuation is available 687ms
     ✓ reads wrapped errors with the current query and preserves separate events without IDs 605ms
     ✓ follows summary cursors even when the first page is shorter than the limit 459ms
     ✓ reports excluded intervals as unread even when pagination finishes 397ms
     ✓ retains earlier evidence and reports the unread remainder when a later page fails 464ms
     ✓ reports an unread remainder at the page cap 725ms
     ✓ treats a summary-only result as inconclusive pending a known-hit control 384ms
     ✓ self-skips explicitly for an incompatible installed CLI without attempting logs 447ms
     ✓ rejects missing summaries instead of treating them as empty results 646ms
     ✓ reports a failed first page as unavailable 360ms
     ✓ pins provisioning and refuses an unsupported installed CLI without replacing it 901ms
 ✓ .bkit/core/engine/commands/workflow/fids.test.ts (211 tests) 18325ms
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
     ✓ run from a checkout on dev writes the row once and mirrors nothing 437ms
     ✓ adopt mode on its own branch mirrors the row like a worktree does 1391ms
     ✓ a refused dev push is logged, never fails the close 1683ms
     ✓ an unreachable remote is logged, never fails the close 515ms
 ✓ .bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts (15 tests) 17748ms
   ✓ workflow shell fences (4)
> [bkit] TRUNCATED HERE — 14 lines omitted. Dropped content was NOT read.
   ✓ bkit setup protect-main --print (4)
     ✓ reports an unprotected main (GitHub's 404) as protected: false 538ms
     ✓ exits 6 on any other api failure instead of calling main unprotected 758ms
     ✓ exits 6 when the api answer is not JSON 1646ms
 ✓ .bkit/core/engine/commands/workflow/issues.test.ts (91 tests) 6098ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ runs bkit:gate:changed with the changed files as its arguments 1107ms
     ✓ counts files committed since --base 633ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 595ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 761ms
     ✓ runs the --fallback gate even when no file changed, as it did before 1649ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/lib.test.ts (70 tests) 3883ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1357ms
     ✓ runGit names ENOBUFS when output passes the limit 674ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 896ms
> [bkit] TRUNCATED HERE — 15 lines omitted. Dropped content was NOT read.
     ✓ with a squash sha, grades from the squash's parent so earlier feature commits count 619ms
     ✓ with a squash sha, reads the squash's subject, not the worktree HEAD's 555ms
     ✓ is fail-open: no commits returns null; an unwritable stats file is reported, never thrown 322ms
 ✓ .bkit/core/engine/commands/workflow/context-fetch.test.ts (12 tests) 3082ms
   ✓ selected CI context evidence (3)
> [bkit] TRUNCATED HERE — 12 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 486ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 1042ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 338ms
stdout | .bkit/core/engine/install/modules/antigravity.test.ts > renderAntigravityAgentsSkills > writes plugin prompts + workflow skills, and stamps the managed version
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
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
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
> [bkit] TRUNCATED HERE — 958 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
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

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (94 tests) 250ms
 ✓ .bkit/core/engine/checks/before/mcp.test.ts (49 tests) 228ms
stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/commands/workflow/test-blocks.test.ts (14 tests) 435ms
 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 295ms
 ✓ .bkit/core/engine/audits/templates/tmp-prune.test.ts (19 tests) 263ms
 ✓ .bkit/core/engine/checks/after/index.test.ts (53 tests) 280ms
 ✓ .bkit/core/engine/checks/before/index.test.ts (16 tests) 212ms
 ✓ .bkit/core/engine/install/cloud-env.test.ts (101 tests) 226ms
 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 208ms
 ✓ .bkit/core/engine/checks/after/ci-yml.test.ts (77 tests) 219ms
 ✓ .bkit/core/engine/checks/before/context-fetch.test.ts (101 tests) 175ms
 ✓ .bkit/core/engine/install/placeholders.test.ts (15 tests) 247ms
 ✓ .bkit/core/engine/commands/ci/pins.test.ts (14 tests) 93ms
stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-9OQswD/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (78 tests) 114ms
 ✓ .bkit/core/engine/commands/install/install.test.ts (23 tests) 71ms
(node:35649) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:35649) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (69 tests) 92ms
 ✓ .bkit/core/engine/ledgers/clamp-log.test.ts (5 tests) 123ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 94ms
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
[bkit-upgrade] Template not found: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-upgrade-test-AsVDLA/nonexistent.md — skipping .claude/agents/bkit-foo.md

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

 ✓ .bkit/core/engine/audits/templates/templates.test.ts (252 tests) 118ms
stderr | .bkit/core/engine/commands/install/upgrade.test.ts > P4.T6 — --non-interactive upgrade auto-apply > non-interactive: returns conflicts list with relPath and content
[bkit-upgrade] conflict: .claude/agents/bkit-test.md — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .claude/agents/bkit-test.md

 ✓ .bkit/core/engine/commands/install/upgrade.test.ts (45 tests) 117ms
 ✓ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (285 tests) 112ms
 ✓ .bkit/core/engine/shared/bkit-latest.test.ts (20 tests) 134ms
 ✓ .bkit/core/engine/shared/settings.test.ts (34 tests) 109ms
 ✓ .bkit/core/engine/checks/after/github.test.ts (63 tests) 118ms
 ✓ .bkit/core/engine/audits/templates/disk-prune.test.ts (11 tests) 104ms
 ✓ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests) 100ms
 ✓ .bkit/core/engine/audits/workflows/text-omit-audit.test.ts (12 tests) 64ms
 ✓ .bkit/core/engine/checks/tips/detect.test.ts (35 tests) 65ms
 ✓ .bkit/core/engine/install/modules/core.test.ts (56 tests) 90ms
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

 ✓ .bkit/core/engine/commands/stats.test.ts (12 tests) 49ms
 ✓ .bkit/core/engine/checks/before/files.test.ts (18 tests) 70ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (68 tests) 110ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 68ms
 ✓ .bkit/core/engine/checks/after/auth.test.ts (44 tests) 99ms
(node:37919) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:37919) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(node:37919) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:37919) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 2 skipped) 127ms
 ✓ .bkit/core/engine/commands/workflow/plans.test.ts (14 tests) 76ms
 ✓ .bkit/core/engine/commands/install/doctor.test.ts (9 tests) 57ms
 ✓ .bkit/core/engine/audits/templates/branding.test.ts (6 tests) 73ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (41 tests) 62ms
 ✓ .bkit/core/engine/render/models.test.ts (37 tests) 59ms
 ✓ .bkit/core/engine/audits/templates/template-shape.test.ts (7 tests) 59ms
 ✓ .bkit/core/engine/audits/workflows/prompt-notation.test.ts (9 tests) 64ms
 ✓ .bkit/core/engine/tools/instructions-sources.test.ts (23 tests) 63ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (42 tests) 72ms
 ✓ .bkit/core/engine/checks/before/env.test.ts (34 tests) 62ms
 ✓ .bkit/core/engine/tools/grammar-density.test.ts (6 tests) 78ms
 ✓ .bkit/core/engine/cli.test.ts (151 tests) 62ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 52ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (54 tests) 54ms
 ✓ .bkit/core/engine/checks/after/tools.test.ts (33 tests) 78ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 62ms
 ✓ .bkit/core/engine/commands/launch.test.ts (38 tests) 69ms
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

 ✓ .bkit/core/engine/install/network-allowlist.test.ts (9 tests) 33ms
 ✓ .bkit/core/engine/install/modules/opencode.test.ts (6 tests) 17ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 24ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 39ms
 ✓ .bkit/core/engine/audits/workflows/generated-marker.test.ts (30 tests) 38ms
 ✓ .bkit/core/engine/install/template-notes.test.ts (26 tests) 33ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 37ms
 ✓ .bkit/core/engine/shared/dep-updater.test.ts (21 tests) 27ms
 ✓ .bkit/core/engine/audits/templates/template-no-userpath.test.ts (75 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/plan-versions.test.ts (3 tests) 9ms
 ✓ .bkit/core/engine/shared/package-json.test.ts (23 tests) 28ms
 ✓ .bkit/core/engine/audits/workflows/models-table-parity.test.ts (4 tests) 32ms
 ✓ .bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts (36 tests) 27ms
 ✓ .bkit/core/engine/install/template-copies.test.ts (15 tests) 25ms
 ✓ .bkit/core/engine/tools/cli-doc.test.ts (7 tests) 34ms
 ✓ .bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts (26 tests) 29ms
stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794228756765.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794228756771.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794228756772.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794228756784.js — skipping

 ✓ .bkit/core/engine/checks/before/version.test.ts (9 tests) 25ms
 ✓ .bkit/core/engine/install/managed-block.test.ts (32 tests) 31ms
 ✓ .bkit/core/engine/checks/after/suppression.test.ts (12 tests) 18ms
 ✓ .bkit/core/engine/install/modules/claude.test.ts (12 tests) 35ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (13 tests) 17ms
 ✓ .bkit/core/engine/audits/templates/insert-ignore.test.ts (9 tests) 20ms
 ✓ .bkit/core/engine/install/hosts.test.ts (8 tests) 19ms
 ✓ .bkit/core/engine/audits/workflows/block-locality-audit.test.ts (61 tests) 30ms
 ✓ .bkit/core/engine/install/payload-links.test.ts (13 tests) 26ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (10 tests) 18ms
 ✓ .bkit/core/engine/audits/workflows/auto-fid-guard.test.ts (66 tests) 20ms
 ✓ .bkit/core/engine/audits/workflows/untrusted-fence.test.ts (23 tests) 38ms
 ✓ .bkit/core/engine/audits/templates/template-action-pins.test.ts (6 tests) 20ms
 ✓ .bkit/core/engine/shared/text.test.ts (54 tests) 25ms
 ✓ .bkit/core/engine/audits/workflows/skip-ci-subject-audit.test.ts (23 tests) 30ms
 ✓ .bkit/core/engine/audits/repo/readme-models.test.ts (6 tests) 21ms
 ✓ .bkit/core/engine/audits/workflows/owner-wait-rows.test.ts (9 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/workflow-book-paths.test.ts (20 tests) 26ms
 ✓ .bkit/core/engine/shared/json.test.ts (8 tests) 10ms
 ✓ .bkit/core/engine/commands/install/check.test.ts (5 tests) 19ms
 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/shared/package-roots.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/repo/release-workflow.test.ts (30 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/slash-arg-expansion.test.ts (2 tests) 9ms
 ✓ .bkit/core/engine/audits/repo/version-hashes.test.ts (1 test) 8ms
 ✓ .bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts (22 tests) 17ms
 ✓ .bkit/core/engine/audits/workflows/telemetry-workflow-writers.test.ts (13 tests) 7ms
 ✓ .bkit/core/engine/commands/workflow/junit.test.ts (2 tests) 11ms
 ✓ .bkit/core/engine/install/modules/v6-fixtures.test.ts (8 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/vitest-test-lock.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (8 tests) 7ms
 ✓ .bkit/core/engine/audits/workflows/model-presets-parity.test.ts (7 tests) 9ms
 ✓ .bkit/core/engine/shared/egress.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/shared/package-manager.test.ts (7 tests) 10ms
 ✓ .bkit/core/engine/shared/timeouts.test.ts (3 tests) 6ms
 ✓ .bkit/core/engine/audits/templates/settings-ask-rules.test.ts (2 tests) 8ms
 ✓ .bkit/core/engine/shared/protected-paths.test.ts (12 tests) 8ms
 ✓ .bkit/core/engine/commands/workflow/summary-findings.test.ts (4 tests) 7ms
 ✓ .bkit/core/engine/audits/templates/mcp-toolsets.test.ts (9 tests) 10ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (5 tests) 7ms
 ✓ .bkit/core/engine/shared/branches.test.ts (3 tests) 5ms
 ✓ .bkit/core/engine/audits/templates/context-fetch-contexts.test.ts (1 test) 5ms
 ✓ .bkit/core/engine/audits/repo/dogfood-noop.test.ts (2 tests) 5ms
 ✓ .bkit/core/engine/install/context-ci-workflow.test.ts (9 tests) 8ms
 ✓ .bkit/core/engine/shared/log-prefix.test.ts (2 tests) 4ms
 ✓ .bkit/core/engine/audits/repo/config-keys.test.ts (4 tests) 6ms
 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (154 tests) 101198ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 316ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 1101ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 303ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 359ms
   ✓ bkit workflows fail (19)
     ✓ aborts a rebase only when one is in progress 457ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 441ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 404ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 316ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 320ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 434ms
       ✓ counts subagents of an earlier chat the run's session rows name 469ms
       ✓ records no context block, and still closes, outside a Claude Code session 527ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 518ms
     ✓ records ending held and publish false on the workflow-done row 667ms
     ✓ defaults the close row to ending done 731ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 646ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 623ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 610ms
     ✓ always writes the telemetry, whatever the runtime 663ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 590ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 654ms
     ✓ an unwritable stats path is logged and never fails the close 741ms
     ✓ appends the completeness row before the workflow-done row 621ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 631ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 579ms
     ✓ writes one completeness row per close 872ms
     ✓ leaves out the previous run's rows that share a second with this run's start 658ms
     ✓ still closes when the completeness check throws 539ms
     ✓ still closes when the completeness row write throws 649ms
     ✓ ship: run.pr, size of the squash commit, and coverage 609ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 889ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 612ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 483ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 596ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 514ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 689ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 676ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 804ms
     ✓ --record-step writes the close step's row before workflow-done 636ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 803ms
     ✓ --number without --outbox is a usage error 617ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 827ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 817ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 996ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 1103ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 828ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 402ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 423ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 2475ms
     ✓ --flush with nothing to record commits and pushes nothing 1249ms
     ✓ --flush carries the named worktree's logs into the dev commit 2142ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 2767ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 2130ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 2348ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 2018ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 2615ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 2294ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 2392ms
     ✓ --push on dev never carries a row whose references name another feature 2100ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1717ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 3326ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 2171ms
     ✓ --push commits in the named worktree, not the checkout it runs from 999ms
   ✓ bkit workflows close --flush (ship) (7)
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 2230ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1743ms
     ✓ a close that landed releases the lock 2024ms
     ✓ removes the worktree before it releases the lock 2116ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3851ms
       ✓ closePr refuses when the PR base is unknown 2834ms
     ✓ leaves a worktree no workflow created, and its branch, in place 2393ms
   ✓ bkit workflows promote (7)
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 343ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 370ms
     ✓ names the branch, not the remote-tracking ref, in each URL 341ms
   ✓ --post on fail / links (4)
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 352ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 882ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 569ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 1436ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 663ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 605ms
     ✓ a second run's record does not let this FID's close commit 795ms
     ✓ record is present after workflows close and before the push 1313ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1387ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 323ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (261 tests) 150291ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 455ms
     ✓ rejects missing explicit and ambiguous existing branch selections 384ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 699ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 731ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 444ms
     ✓ a refused --continue carries git's own reason 555ms
     ✓ --file records nothing for a refused rebase 452ms
     ✓ refuses a code conflict and aborts the rebase on the spot 444ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1873ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 375ms
     ✓ produces byte-identical output to merge=union 893ms
     ✓ restores a trailing newline so the next append starts on its own line 596ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 540ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 870ms
     ✓ refuses a union that leaves a line which is not JSON 422ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 602ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1550ms
     ✓ refuses a lockfile whose regenerate command fails 971ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1222ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1099ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 977ms
     ✓ refuses and aborts when both sides changed the hand-written region 602ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 779ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1051ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1143ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 625ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 699ms
     ✓ refuses and aborts when a side deleted the install record 556ms
     ✓ refuses a conflicted doc the repo's script does not list 526ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 564ms
     ✓ removes a stale sentinel when the rebase succeeds 650ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 875ms
     ✓ resolves a conflict in each of two replayed commits across rounds 771ms
   ✓ branches anchor-read (15)
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 405ms
       ✓ skips (12) with no anchor 367ms
       ✓ skips (12) when the base is unreachable in this clone 381ms
       ✓ skips (12) when nothing landed since the base 354ms
       ✓ runs (0) with the landed path count once dev moved 762ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 432ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1021ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 745ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 924ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1555ms
     ✓ runs exactly one git push 1285ms
     ✓ --set-upstream records the upstream 805ms
     ✓ refuses with no branch checked out 637ms
     ✓ --mode=dev refuses a feature checkout 615ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1603ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2468ms
     ✓ --require-ci pushes as-is when dev has not moved 955ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1620ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2294ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 558ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1065ms
     ✓ --mode=abort pushes when the branch has no open PR 892ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 973ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 474ms
     ✓ --open-pr carries the MCP answer and skips gh 647ms
     ✓ --mode=abort on dev pushes plainly without probing 612ms
     ✓ rejects an unknown mode 458ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2128ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1081ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1649ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 3115ms
     ✓ skip-ci HEAD on the replay is refused 1133ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 2145ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2629ms
     ✓ a level local dev is a plain push, recording nothing extra 1052ms
     ✓ a record with no commits pushes nothing 716ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 487ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1174ms
     ✓ a rewritten branch is refused, never forced 845ms
     ✓ refuses dev and main with exit 21 and pushes nothing 569ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 1255ms
     ✓ refuses a detached HEAD (exit 5) 482ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1062ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 930ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 946ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1106ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 495ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 1187ms
     ✓ an up-to-date branch is a no-op 744ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 1067ms
     ✓ a fetch that fails exits 10 521ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 647ms
     ✓ scan-diff still reports a new skip when its test … 613ms
     ✓ scan-diff reports a skip moved onto a different t… 632ms
     ✓ scan-diff does not cancel a skip moved between am… 510ms
     ✓ scan-diff does not spend an unchanged duplicate t… 504ms
     ✓ scan-diff recognizes a renamed test file 581ms
     ✓ scan-diff recognizes a suite moved into a differe… 663ms
     ✓ scan-diff does not let unrelated additions hide a… 736ms
     ✓ scan-diff attributes deletion to its old test ins… 733ms
     ✓ scan-diff consumes each moved assertion once and … 815ms
     ✓ scan-diff does not match identical assertions fro… 752ms
     ✓ scan-diff does not match the same leaf test name … 827ms
     ✓ scan-diff does not match a same-named test with d… 800ms
     ✓ scan-diff does not match a same-named test with c… 843ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 785ms
     ✓ --paths with no match exits 1 698ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 559ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1073ms
     ✓ --marker reads a diff over 1 MiB 886ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 988ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 876ms
     ✓ scan-diff finds an added skip 902ms
     ✓ scan-diff ignores a skip predating the base 717ms
     ✓ scan-diff reports a disabled test with its line 820ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 481ms
     ✓ scan-diff ignores a removed comment in a test file 300ms
     ✓ scan-diff finds an added pytest mark skip 313ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 449ms
     ✓ scan-diff reports a deleted test file 550ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 351ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1117ms
     ✓ a title that already carries the marker is left alone 699ms
     ✓ with no open PR: pushes the marker commit and edits no title 653ms
     ✓ a re-run is deduped: no second marker commit 615ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 654ms
     ✓ --title-set skips gh entirely 356ms
   ✓ branches sync (28)
     ✓ Path B once dev moved; --head checks a given commit 409ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 408ms
     ✓ --merge-docs merges dev when docs/ is behind 516ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 503ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 749ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 744ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 569ms
     ✓ --merge-docs skips an empty bkit:generate script 511ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 392ms
     ✓ --merge-docs never merges on dev itself 333ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 468ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 489ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 446ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 469ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 589ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 869ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 709ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 626ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 587ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 779ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 548ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 657ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 433ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 321ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 377ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 578ms
     ✓ a failed install stops ship (16) 502ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 412ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 385ms
   ✓ branches land (27)
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 930ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 922ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 903ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 920ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1972ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2352ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 360ms
     ✓ local: names unpushed dev as the cause when the branch carries it 417ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 449ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1303ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1135ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 877ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 879ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1001ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 928ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 617ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1141ms
     ✓ land removes the worktree when only the copied .env is untracked 985ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 867ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 910ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1535ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 940ms
     ✓ landPr refuses a main-based PR without retrying 527ms
     ✓ landPr refuses when the PR base is unknown 528ms
     ✓ PR not open (closed): stops (17) at once, no retry 640ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 395ms
     ✓ --attempt names the merge round in a fix commit 352ms
     ✓ commits a rewritten and a deleted tracked file 352ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 314ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 343ms

 Test Files  174 passed (174)
      Tests  7377 passed | 2 skipped (7379)
   Start at  22:51:00
   Duration  150.96s (tests 97%, import 1%, setup 1%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/891-build-gate-stuck/build-group-gate-1-3.log.reports/vitest-22239.xml
[34m % [39m[2mCoverage report from [22m[33mv8[39m
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    89.8 |    83.39 |   95.09 |   91.16 |                   
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
 ...mmands/install |   47.59 |    45.02 |   58.75 |   47.98 |                   
  check.ts         |    9.09 |        0 |   33.33 |    9.09 | 46-62             
  doctor.ts        |   54.47 |    54.16 |      70 |   53.57 | 162-289           
  install.ts       |   18.53 |    22.42 |      50 |   16.57 | ...29-133,204-610 
  uninstall.ts     |   67.79 |    64.46 |      70 |   68.92 | ...1101,1124-1291 
  upgrade.ts       |   32.34 |    30.88 |   33.33 |   33.45 | 350-378,560-1066  
 ...commands/setup |     100 |    94.11 |     100 |     100 |                   
  setup.ts         |     100 |    94.11 |     100 |     100 | 77,80             
 ...mands/workflow |   92.29 |    84.71 |   96.31 |   93.76 |                   
  branches.ts      |   90.41 |    83.62 |   98.22 |   92.29 | ...3028,3053,3196 
  challenge.ts     |   96.95 |    84.84 |     100 |   98.02 | 178,368-370,656   
  completeness.ts  |   89.58 |       80 |   66.66 |    90.9 | 32,39,41,94       
  context.ts       |   96.25 |    87.06 |   98.07 |   97.05 | ...1978,2002,2005 
  counters.ts      |   98.57 |    96.19 |     100 |   98.93 | 240,620           
  decisions.ts     |   95.32 |    80.92 |   97.72 |   98.36 | 207,312,381       
  disk.ts          |   91.89 |    86.89 |   93.22 |   95.16 | ...38,549-557,711 
  fids.ts          |   98.32 |    94.83 |   98.73 |   98.88 | 160,446,927-928   
  issues.ts        |   96.65 |       90 |   96.55 |   97.39 | ...1066,1081-1091 
  junit.ts         |   93.75 |    73.84 |     100 |   93.33 | 35-36,39          
  ledgers.ts       |   91.28 |    80.25 |   97.08 |   95.23 | ...1692-1693,1721 
  locks.ts         |   92.09 |    86.44 |   92.59 |   94.03 | ...04-305,474-475 
  plan-blocks.ts   |   91.22 |    84.05 |     100 |   91.41 | ...79-681,684-685 
  plan-versions.ts |     100 |     90.9 |     100 |     100 | 18                
  plans.ts         |   98.66 |    88.37 |     100 |     100 | 101-124,148,191   
  prs.ts           |   93.07 |    89.65 |     100 |   94.27 | ...1159,1175-1176 
  repo.ts          |    98.9 |     96.2 |     100 |     100 | 72-73,224         
  roadmap.ts       |   96.72 |       92 |     100 |   97.23 | ...01,521-523,527 
  run-facts.ts     |   96.78 |    90.53 |     100 |   98.87 | 489-490           
  runs.ts          |   91.57 |    84.15 |    99.1 |   92.67 | ...2403,2435-2439 
  runtime.ts       |   97.84 |    86.66 |   94.44 |     100 | ...55,301,321-326 
  skills.ts        |     100 |     92.3 |     100 |     100 | 98,103            
  status.ts        |   97.25 |    95.25 |     100 |   98.41 | 119,230,502,630   
  step-table.ts    |   98.79 |    97.89 |     100 |     100 | 263,374           
  steps.ts         |    89.9 |    83.04 |   90.82 |    91.1 | ...1963,1968,1970 
  ...y-findings.ts |   95.89 |    89.79 |     100 |   96.77 | 94,128            
  summary.ts       |   96.11 |    88.92 |   93.44 |   95.19 | ...94-500,512,535 
  tasks.ts         |   83.83 |    66.11 |   86.66 |   87.89 | ...42,359,390,394 
  test-blocks.ts   |   95.59 |    88.46 |   96.96 |   96.77 | 23-24,248-249     
  tests-changed.ts |   92.95 |    77.41 |     100 |   95.31 | 86-87,90          
  tests.ts         |    96.8 |       90 |   96.51 |   98.18 | ...2222,2318-2320 
  tracker.ts       |   89.02 |    80.61 |   96.69 |   91.11 | ...2097,2123-2128 
  workflows.ts     |   93.45 |    82.64 |   97.38 |   95.07 | ...1763,1937,2669 
  worktrees.ts     |   61.38 |    59.06 |   67.85 |   62.53 | ...1128,1131-1132 
 engine/install    |   93.11 |    84.57 |   94.15 |   95.87 |                   
  cloud-env.ts     |   96.66 |     90.9 |     100 |    99.3 | 239,254           
  managed-block.ts |   97.72 |    89.77 |     100 |     100 | ...25,211,233,246 
  manifest.ts      |     100 |    88.23 |     100 |     100 | 596-603           
  placeholders.ts  |     100 |    81.25 |     100 |     100 | 32-33             
  ...ate-copies.ts |    72.3 |    52.63 |      50 |   78.84 | 80-82,116-132     
  version-file.ts  |     100 |    95.65 |     100 |     100 | 71,294            
  write.ts         |    87.5 |    80.41 |   78.26 |   91.16 | ...26-246,270,489 
 engine/ledgers    |   96.68 |    93.48 |   98.95 |   97.38 |                   
  status.ts        |   97.94 |    97.87 |     100 |     100 | 122,153,266,341   
  telemetry.ts     |   96.41 |     92.3 |    98.6 |   96.85 | ...1777,1820,2266 
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
  instructions.ts  |   90.65 |    85.99 |   95.62 |   91.41 | ...1718-1800,1805 
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 89.8% ( 18956/21108 )
Branches     : 83.39% ( 14213/17043 )
Functions    : 95.09% ( 3062/3220 )
Lines        : 91.16% ( 16618/18228 )
================================================================================

> @cbartens/bkit@6.1.1 bkit:test:bats /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output "$BKIT_TEST_REPORT_DIR"} tests/shell/*.bats'

1..40
ok 1 prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login) # in 452 ms
ok 2 prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login # in 204 ms
ok 3 falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set # in 198 ms
ok 4 a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression) # in 198 ms
ok 5 the placeholder diagnosis does not pretend a --with-token login would help (regression) # in 194 ms
ok 6 the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session # in 218 ms
ok 7 gh absent from PATH is stated plainly rather than falling through silently # in 71 ms
ok 8 records RUNTIME_GITHUBCLI=true loudly when gh is authed # in 243 ms
ok 9 records RUNTIME_GITHUBCLI=false loudly when gh is not authed # in 179 ms
ok 10 emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all # in 193 ms
ok 11 does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable) # in 209 ms
ok 12 the hook never hard-stops the session (always exits 0) even on the dual-lane warning path # in 197 ms
ok 13 without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly # in 200 ms
ok 14 without jq, gh still logs in from BKIT_GH_TOKEN # in 204 ms
ok 15 runs each context-fetch:provision recipe below bkit:end through bkit context provision # in 805 ms
ok 16 a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable # in 510 ms
ok 17 stub: a response script keeps argv and exit status through the stable executable # in 15 ms
ok 18 stub: a missing response script fails instead of using the normal fixtures # in 16 ms
ok 19 stub: the response selector is cleared before running its body # in 14 ms
ok 20 stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list # in 19 ms
ok 21 stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted # in 20 ms
ok 22 stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape) # in 16 ms
ok 23 stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path) # in 14 ms
ok 24 stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE) # in 19 ms
ok 25 stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent) # in 13 ms
ok 26 stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers # in 31 ms
ok 27 stub: --paginate emits one document per page; --slurp collapses them into an array # in 46 ms
ok 28 refresh builds the register from the staged files, not HEAD or unstaged edits # in 526 ms
ok 29 refresh rewrites the DETAILS copy of the packages diagram from the new register # in 359 ms
ok 30 refresh drops a file deleted in the index from the build # in 318 ms
ok 31 sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file # in 389 ms
ok 32 a key removed from the env file is unset on the next run # in 165 ms
ok 33 an empty value unsets the key instead of setting an empty string # in 149 ms
ok 34 non-BKIT_ keys are skipped # in 142 ms
ok 35 one failing key does not stop the others and the exit status is non-zero # in 150 ms
ok 36 a failed unsetenv is retried on the next run # in 168 ms
ok 37 logs key names only, never values # in 142 ms
ok 38 missing env file exits 0 without calling launchctl # in 24 ms
ok 39 the sweep prints the summary line the lane greps for # in 243 ms
ok 40 the lane's grep pattern rejects output without the summary line # in 8 ms

> @cbartens/bkit@6.1.1 bkit:test:awake /Users/christian/Documents/GitHub/bkit/.worktrees/891-build-gate-stuck
> node scripts/ci/bkit-test-awake.mjs node --test scripts/ci/bkit-test-awake.test.mjs

✔ direct cancellation waits for SIGTERM cleanup (88.694834ms)
✔ shell cancellation waits for SIGTERM cleanup (138.421625ms)
✔ direct cancellation waits for SIGINT cleanup (86.245833ms)
✔ shell cancellation waits for SIGINT cleanup (136.39775ms)
✔ direct cancellation waits for SIGHUP cleanup (84.010875ms)
✔ shell cancellation waits for SIGHUP cleanup (156.444792ms)
✔ shell cancellation reads complete readiness JSON when publication is interrupted (378.932458ms)
✔ shell cancellation follows a worker orphaned by a nested shell (204.508708ms)
✔ direct cancellation preserves a nested machine-lock owner (399.195333ms)
✔ shell cancellation preserves a nested machine-lock owner (436.3725ms)
✔ nested shell cancellation preserves a nested machine-lock owner (435.387ms)
✔ a hard process-group timeout reaches a shell command during cleanup (68.641333ms)
✔ ships a command-scoped sleep prevention wrapper (0.057125ms)
✔ preserves arguments, output and nonzero exit status (43.484458ms)
✔ runs an entire shell chain and retains its failure (26.436792ms)
✔ reports a missing command as 127 (23.247625ms)
✔ requires a command (21.596ms)
✔ non-macOS platform selection runs commands without sleep prevention (36.540041ms)
✔ hard timeout escalation reaches a command that ignores TERM (142.308167ms)
✔ forwards POSIX cancellation to the command and releases the assertion (52.154ms)
✔ holds a real macOS assertion only while the command runs (58.342708ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3047.526125
> [bkit] TRUNCATED — kept 1740 of 3328 lines (124 KB of 257 KB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
